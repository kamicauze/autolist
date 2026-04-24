import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { SELLER_PACKAGE_PLANS } from "@/lib/data/membership";
import type { UserRole } from "@/lib/constants/marketplace";

type QaDealerStatus = "PENDING" | "APPROVED" | "REJECTED";

const QA_ROLES = new Set<UserRole>(["buyer", "seller", "dealer"]);
const DEALER_STATUSES = new Set<QaDealerStatus>(["PENDING", "APPROVED", "REJECTED"]);

function isQaToolsEnabled() {
  return process.env.QA_TOOLS_ENABLED === "true";
}

function isAuthorized(request: Request) {
  const secret = process.env.QA_TOOLS_SECRET;
  if (!secret) return false;

  const headerSecret = request.headers.get("x-qa-secret");
  const authorization = request.headers.get("authorization");
  const bearerSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  return headerSecret === secret || bearerSecret === secret;
}

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient();
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === normalizedEmail
    );
    if (user) return user;
    if (data.users.length < 100) return null;
  }

  return null;
}

function getPlan(planId: string) {
  return SELLER_PACKAGE_PLANS.find((plan) => plan.id === planId) || SELLER_PACKAGE_PLANS[1];
}

export async function POST(request: Request) {
  if (!isQaToolsEnabled()) {
    return NextResponse.json({ error: "QA tools are disabled." }, { status: 404 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  const name = typeof payload?.name === "string" ? payload.name.trim() : "QA User";
  const role = QA_ROLES.has(payload?.role) ? (payload.role as UserRole) : "seller";
  const dealerStatus = DEALER_STATUSES.has(payload?.dealerStatus)
    ? (payload.dealerStatus as QaDealerStatus)
    : "PENDING";
  const grantPackage = payload?.grantPackage !== false && role !== "buyer";
  const plan = getPlan(typeof payload?.planId === "string" ? payload.planId : "professional");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const existingUser = await findAuthUserByEmail(email);
  let userId = existingUser?.id ?? null;
  let authAction: "created" | "updated" = "updated";

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        full_name: name,
        intended_role: role,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        intended_role: role,
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Failed to create QA user." },
        { status: 500 }
      );
    }

    userId = data.user.id;
    authAction = "created";
  }

  if (!userId) {
    return NextResponse.json({ error: "Auth user id is missing." }, { status: 500 });
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: name,
      role,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  let dealerId: string | null = null;
  if (role === "dealer") {
    const now = new Date().toISOString();
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .upsert(
        {
          profile_id: userId,
          name,
          business_name: `${name} QA Dealership`,
          status: dealerStatus,
          address: "QA staging address",
          city: "Nairobi",
          location: "Westlands",
          mobile: "+254700000000",
          email,
          whatsapp: "+254700000000",
          website: null,
          logo_url: null,
          about_text: "QA dealer account for staging verification flows.",
          social_links: null,
          contact_person: {
            name,
            role: "QA Contact",
            mobile: "+254700000000",
            email,
          },
          doc_incorporation_key: null,
          doc_id_key: null,
          verified_at: dealerStatus === "APPROVED" ? now : null,
          rejection_reason: dealerStatus === "REJECTED" ? "QA rejected dealer state." : null,
        },
        { onConflict: "profile_id" }
      )
      .select("id")
      .single<{ id: string }>();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: dealerError?.message || "Failed to create QA dealer." },
        { status: 500 }
      );
    }

    dealerId = dealer.id;
  }

  if (grantPackage) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + 12);

    const { error: cancelError } = await supabase
      .from("seller_package_entitlements")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "active");

    if (cancelError) {
      return NextResponse.json({ error: cancelError.message }, { status: 500 });
    }

    const { error: entitlementError } = await supabase
      .from("seller_package_entitlements")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        status: "active",
        listing_limit: plan.listingLimit,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        auto_renew: false,
        metadata: {
          source: "qa-tools",
        },
      });

    if (entitlementError) {
      return NextResponse.json({ error: entitlementError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    email,
    password,
    name,
    role,
    dealerStatus: role === "dealer" ? dealerStatus : null,
    dealerId,
    planId: grantPackage ? plan.id : null,
    authAction,
    next:
      role === "dealer" && dealerStatus !== "APPROVED"
        ? "/dashboard/verification"
        : "/dashboard/listings/new",
  });
}
