import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDealerPublicProfileUpdate,
  buildSellerProfileUpdate,
  canUpdateDealerPublicProfile,
  profileUpdateSchema,
} from "./profile-update";

const input = profileUpdateSchema.parse({
  fullName: "  Ridgeway Motors  ",
  publicEmail: " sales@ridgeway.example ",
  phone: "+254 700 000 111",
  whatsapp: "+254 711 000 222",
  bio: "  Four-wheel-drive specialists.  ",
  city: " Nairobi ",
  address: " Waiyaki Way ",
  location: " Westlands ",
  website: "https://ridgeway.example",
  facebook: "",
  twitter: "https://x.com/ridgeway",
  instagram: "https://instagram.com/ridgeway",
  linkedin: "https://linkedin.com/company/ridgeway",
  tiktok: "",
  otherSocial: "",
});

test("maps the shared seller profile fields without dealer-only data", () => {
  assert.deepEqual(buildSellerProfileUpdate(input), {
    full_name: "Ridgeway Motors",
    phone: "+254700000111",
    whatsapp: "+254711000222",
    bio: "Four-wheel-drive specialists.",
    city: "Nairobi",
    address: "Waiyaki Way",
    website: "https://ridgeway.example",
    facebook_url: null,
    twitter_url: "https://x.com/ridgeway",
    instagram_url: "https://instagram.com/ridgeway",
  });
});

test("maps public dealer fields and preserves unrelated dealer metadata", () => {
  assert.deepEqual(
    buildDealerPublicProfileUpdate(input, {
      facebook: "https://facebook.com/old-page",
      business_hours: { monday: "08:00-17:00" },
    }),
    {
      name: "Ridgeway Motors",
      email: "sales@ridgeway.example",
      mobile: "+254700000111",
      whatsapp: "+254711000222",
      about_text: "Four-wheel-drive specialists.",
      city: "Nairobi",
      address: "Waiyaki Way",
      location: "Westlands",
      website: "https://ridgeway.example",
      social_links: {
        business_hours: { monday: "08:00-17:00" },
        x: "https://x.com/ridgeway",
        instagram: "https://instagram.com/ridgeway",
        linkedin: "https://linkedin.com/company/ridgeway",
      },
    }
  );
});

test("allows only the approved dealer owner to update the public dealer row", () => {
  const approvedDealer = {
    profile_id: "owner-1",
    status: "APPROVED",
  };

  assert.equal(
    canUpdateDealerPublicProfile({
      viewerId: "owner-1",
      profileRole: "dealer",
      dealer: approvedDealer,
    }),
    true
  );
  assert.equal(
    canUpdateDealerPublicProfile({
      viewerId: "agent-1",
      profileRole: "sales_agent",
      dealer: approvedDealer,
    }),
    false
  );
  assert.equal(
    canUpdateDealerPublicProfile({
      viewerId: "owner-1",
      profileRole: "dealer",
      dealer: { ...approvedDealer, status: "PENDING" },
    }),
    false
  );
});
