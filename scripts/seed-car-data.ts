/**
 * Seed script — populates car_makes, car_models, car_trims, car_variants
 * from the static car-data.ts catalogue.
 *
 * Usage:
 *   npx tsx scripts/seed-car-data.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";
import { CAR_MAKES_DATA } from "../lib/constants/car-data";

// ── helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const POPULAR_MAKES = new Set([
  "Toyota",
  "Nissan",
  "Mazda",
  "Subaru",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Land Rover",
  "Honda",
  "Mitsubishi",
  "Ford",
  "Suzuki",
  "Porsche",
  "Lexus",
  "Hyundai",
  "Kia",
  "Volvo",
  "Jeep",
  "Isuzu",
]);

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log(`\nSeeding ${CAR_MAKES_DATA.length} makes…\n`);

  let totalModels = 0;
  let totalTrims = 0;
  let totalVariants = 0;

  for (const makeData of CAR_MAKES_DATA) {
    // ── Insert make ──────────────────────────────────────────────────────
    const { data: make, error: makeError } = await supabase
      .from("car_makes")
      .upsert(
        {
          name: makeData.name,
          slug: toSlug(makeData.name),
          is_popular: POPULAR_MAKES.has(makeData.name),
        },
        { onConflict: "name" }
      )
      .select("id")
      .single();

    if (makeError) {
      console.error(`  ✗ Make "${makeData.name}":`, makeError.message);
      continue;
    }

    const makeId = make.id;

    // ── Insert models ────────────────────────────────────────────────────
    for (const modelData of makeData.models) {
      const { data: model, error: modelError } = await supabase
        .from("car_models")
        .upsert(
          {
            make_id: makeId,
            name: modelData.name,
            slug: toSlug(modelData.name),
          },
          { onConflict: "make_id,slug" }
        )
        .select("id")
        .single();

      if (modelError) {
        console.error(
          `  ✗ Model "${makeData.name} ${modelData.name}":`,
          modelError.message
        );
        continue;
      }

      totalModels++;

      // ── Insert variants ──────────────────────────────────────────────
      if (modelData.variants && modelData.variants.length > 0) {
        const variantRows = modelData.variants.map((v, i) => ({
          model_id: model.id,
          name: v,
          sort_order: i,
        }));

        const { error: varError } = await supabase
          .from("car_variants")
          .upsert(variantRows, { onConflict: "model_id,name" });

        if (varError) {
          console.error(
            `  ✗ Variants for "${makeData.name} ${modelData.name}":`,
            varError.message
          );
        } else {
          totalVariants += variantRows.length;
        }
      }
    }

    // ── Insert trims ─────────────────────────────────────────────────────
    if (makeData.trims.length > 0) {
      const trimRows = makeData.trims.map((t, i) => ({
        make_id: makeId,
        name: t,
        sort_order: i,
      }));

      const { error: trimError } = await supabase
        .from("car_trims")
        .upsert(trimRows, { onConflict: "make_id,name" });

      if (trimError) {
        console.error(
          `  ✗ Trims for "${makeData.name}":`,
          trimError.message
        );
      } else {
        totalTrims += trimRows.length;
      }
    }

    console.log(
      `  ✓ ${makeData.name} — ${makeData.models.length} models, ${makeData.trims.length} trims`
    );
  }

  console.log(`\n── Done ──`);
  console.log(`  Makes:    ${CAR_MAKES_DATA.length}`);
  console.log(`  Models:   ${totalModels}`);
  console.log(`  Trims:    ${totalTrims}`);
  console.log(`  Variants: ${totalVariants}`);
  console.log();
}

main().catch(console.error);
