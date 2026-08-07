import assert from "node:assert/strict";
import test from "node:test";
import { LISTING_WIZARD_STEPS } from "@/lib/constants/marketplace";
import { TRUCK_CATEGORIES } from "@/lib/constants/vehicle-taxonomy";
import {
  buildDraftAfterCategoryChange,
  DEFAULT_DRAFT,
  DETAIL_FIELDS_BY_CATEGORY,
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
      category: "category",
      details: "details",
      basics: "basics",
      features: "features",
      description: "description",
      media: "media",
      seller: "seller",
      priceIntelligence: "intelligence",
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
