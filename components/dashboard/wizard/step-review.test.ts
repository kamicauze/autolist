import assert from "node:assert/strict";
import test from "node:test";
import { LISTING_WIZARD_STEPS } from "@/lib/constants/marketplace";
import { TRUCK_CATEGORIES } from "@/lib/constants/vehicle-taxonomy";
import {
  buildDraftAfterCategoryChange,
  buildFreshDraft,
  buildGalleryDraftAfterFilesChange,
  buildSellerAccountDefaults,
  DEFAULT_DRAFT,
  DETAIL_FIELDS_BY_CATEGORY,
  formatDetailSummaryValue,
  resolveSubmissionListingId,
} from "./wizard-context";
import { REVIEW_SECTION_STEPS } from "./step-review";

test("review section edit controls target the originating wizard steps", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(REVIEW_SECTION_STEPS).map(([section, stepIndex]) => [
        section,
        LISTING_WIZARD_STEPS[stepIndex]?.id,
      ])
    ),
    {
      vehicle: "vehicle",
      features: "features",
      media: "media",
    }
  );
});

test("farm and plant add/edit details use category taxonomy instead of body type", () => {
  for (const category of ["farm_agricultural", "plant_construction"] as const) {
    const fields = DETAIL_FIELDS_BY_CATEGORY[category];
    const fieldKeys = fields.map((field) => field.key);
    const fieldLabels = fields.map((field) => field.label);

    assert.deepEqual(fieldKeys.slice(0, 2), ["taxonomyCategory", "subcategory"]);
    assert.deepEqual(fieldLabels.slice(0, 2), ["Category", "Subcategory"]);
    assert.equal(fieldKeys.includes("bodyType"), false);
    assert.equal(fieldKeys.includes("bodyStyle"), false);
  }
});

test("truck listing taxonomy includes trailers", () => {
  assert.deepEqual(TRUCK_CATEGORIES, ["Rigid Trucks", "Tractor Units", "Trailers"]);
  assert.ok(
    DETAIL_FIELDS_BY_CATEGORY.truck[0]?.options?.some(
      (option) => option.value === "Trailers" && option.label === "Trailers"
    )
  );
});

test("changing an unfinished farm draft to truck starts a clean listing", () => {
  const farmDraft = {
    ...DEFAULT_DRAFT,
    category: "farm_agricultural" as const,
    title: "2019 Massey Ferguson MF 385",
    priceKes: "2500000",
    cityTown: "Nairobi",
    locationArea: "Industrial Area",
    description: "Previous tractor description",
    selectedFeatureIds: ["farm_gps"],
    coverImageName: "tractor-cover.jpg",
    galleryImageNames: ["tractor-side.jpg"],
    documentNames: ["tractor-logbook.pdf"],
    videoUrl: "https://example.com/tractor-video",
    sellerType: "dealer" as const,
    useDealerAutoFill: true,
    contactName: "Yvonne Karimi",
    phoneNumber: "0712345678",
    whatsappEnabled: true,
    whatsappNumber: "0712345678",
    details: {
      ...DEFAULT_DRAFT.details,
      taxonomyCategory: "Tractors",
      subcategory: "Medium Tractor",
      make: "Massey Ferguson",
      model: "MF 385",
      operatingHours: "1200",
    },
  };

  const truckDraft = buildDraftAfterCategoryChange(farmDraft, "truck");

  assert.equal(truckDraft.category, "truck");
  assert.equal(truckDraft.title, "");
  assert.equal(truckDraft.priceKes, "");
  assert.equal(truckDraft.cityTown, "");
  assert.equal(truckDraft.locationArea, "");
  assert.equal(truckDraft.description, "");
  assert.deepEqual(truckDraft.details, DEFAULT_DRAFT.details);
  assert.deepEqual(truckDraft.selectedFeatureIds, []);
  assert.equal(truckDraft.coverImageName, null);
  assert.deepEqual(truckDraft.galleryImageNames, []);
  assert.deepEqual(truckDraft.documentNames, []);
  assert.equal(truckDraft.videoUrl, "");

  assert.equal(truckDraft.sellerType, "dealer");
  assert.equal(truckDraft.useDealerAutoFill, true);
  assert.equal(truckDraft.contactName, "Yvonne Karimi");
  assert.equal(truckDraft.phoneNumber, "0712345678");
  assert.equal(truckDraft.whatsappNumber, "0712345678");
});

test("a failed submission retry continues the draft created by the first attempt", () => {
  assert.equal(resolveSubmissionListingId(null, null), null);
  assert.equal(
    resolveSubmissionListingId(null, "listing-created-on-first-attempt"),
    "listing-created-on-first-attempt"
  );
  assert.equal(
    resolveSubmissionListingId("listing-being-edited", "listing-created-on-first-attempt"),
    "listing-being-edited"
  );
});

test("new listings require the seller to choose a condition", () => {
  assert.equal(DEFAULT_DRAFT.condition, "");
});

test("reordering photos keeps the selected cover when another photo moves into its position", () => {
  const photos = ["front.jpg", "side.jpg", "rear.jpg"].map((name) => new File([name], name));

  for (const [from, to] of [[2, 1], [0, 1], [1, 2], [1, 0]]) {
    const reordered = [...photos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const result = buildGalleryDraftAfterFilesChange(photos, reordered, 1);

    assert.equal(reordered[result.coverFromGalleryIndex!], photos[1]);
    assert.deepEqual(result.galleryImageNames, reordered.map((photo) => photo.name));
  }
});

test("removing photos preserves the selected cover until that photo is removed", () => {
  const photos = ["front.jpg", "side.jpg", "rear.jpg"].map((name) => new File([name], name));
  const remaining = photos.filter((photo) => photo !== photos[0]);
  const result = buildGalleryDraftAfterFilesChange(photos, remaining, 1);

  assert.equal(remaining[result.coverFromGalleryIndex!], photos[1]);
  assert.deepEqual(result.galleryImageNames, ["side.jpg", "rear.jpg"]);
  assert.equal(buildGalleryDraftAfterFilesChange(photos, [photos[0], photos[2]], 1).coverFromGalleryIndex, 0);
  assert.equal(buildGalleryDraftAfterFilesChange(photos, [], 1).coverFromGalleryIndex, null);
  assert.equal(buildGalleryDraftAfterFilesChange(photos, remaining, null).coverFromGalleryIndex, null);
});

test("cover selection tracks the actual file when filenames are the same", () => {
  const photos = [new File(["front"], "photo.jpg"), new File(["side"], "photo.jpg")];
  const reordered = [photos[1], photos[0]];
  const result = buildGalleryDraftAfterFilesChange(photos, reordered, 1);

  assert.equal(result.coverFromGalleryIndex, 0);
  assert.equal(reordered[result.coverFromGalleryIndex!], photos[1]);
});

test("dealer account defaults fall back to profile contact details", () => {
  const defaults = buildSellerAccountDefaults({
    profile: {
      full_name: "Amina Mwangi",
      role: "dealer",
      phone: "+254712345678",
      whatsapp: "+254733456789",
    },
    dealer: {
      status: "APPROVED",
      mobile: null,
      whatsapp: null,
      contact_person: null,
    },
  });

  assert.equal(defaults.sellerType, "dealer");
  assert.equal(defaults.phoneNumber, "+254712345678");
  assert.equal(defaults.whatsappNumber, "+254733456789");
});


test("starting a new listing retains registered private-seller contact and clears vehicle details", () => {
  const defaults = buildSellerAccountDefaults({
    profile: {
      full_name: "Amina Mwangi",
      role: "seller",
      phone: "+254712345678",
      whatsapp: null,
    },
    dealer: null,
  });
  const fresh = buildFreshDraft(defaults);

  assert.equal(fresh.sellerType, "individual");
  assert.equal(fresh.contactName, "Amina Mwangi");
  assert.equal(fresh.phoneNumber, "+254712345678");
  assert.equal(fresh.whatsappNumber, "+254712345678");
  assert.equal(fresh.category, "");
  assert.equal(fresh.title, "");
  assert.deepEqual(fresh.galleryImageNames, []);
  assert.deepEqual(fresh.details, DEFAULT_DRAFT.details);
  assert.notEqual(fresh.details, DEFAULT_DRAFT.details);
});

test("car and van engine suggestions include every 100 cc from 3000 to 7000", () => {
  const expected = Array.from({ length: 41 }, (_, index) => 3000 + index * 100);
  for (const category of ["car", "van"] as const) {
    const field = DETAIL_FIELDS_BY_CATEGORY[category].find(({ key }) => key === "engineCapacity");
    const inRange = field?.options?.map(({ value }) => Number(value))
      .filter((value) => value >= 3000 && value <= 7000);
    assert.deepEqual(inRange, expected);
  }
});

test("mileage summary includes separators and units", () => {
  const field = DETAIL_FIELDS_BY_CATEGORY.car.find(({ key }) => key === "mileage");
  assert.ok(field);
  assert.equal(formatDetailSummaryValue(field, "21000"), "21,000 km");
  assert.equal(formatDetailSummaryValue(field, "0"), "0 km");
});

test("an incomplete dealership can use its registered name and phone for a listing", () => {
  const defaults = buildSellerAccountDefaults({
    profile: { full_name: null, role: "dealer", phone: "+254700000001", whatsapp: null },
    dealer: {
      status: "INCOMPLETE", name: "Sample Motors", city: "Nairobi", address: "Sample Road",
      mobile: "+254700000001", whatsapp: null, contact_person: null,
    },
  });

  assert.equal(defaults.contactName, "Sample Motors");
  assert.equal(defaults.phoneNumber, "+254700000001");
  assert.equal(defaults.whatsappEnabled, false);
  assert.deepEqual(defaults.dealerLocation, { cityTown: "Nairobi", locationArea: "Sample Road" });
});
