import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
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
  restoreSavedListingDraft,
  type ListingDraft,
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

const savedPhotos = ["front.jpg", "side.jpg", "rear.jpg"].map((name) => ({
  name, r2_key: `listings/sample-listing/media/image/${name}`, alt_text: name,
}));
const savedPhotoDraft: ListingDraft = {
  ...DEFAULT_DRAFT,
  category: "car",
  priceKes: "1000000",
  coverImageName: savedPhotos[0].name,
  coverImageRef: savedPhotos[0],
  galleryImageNames: savedPhotos.slice(1).map((photo) => photo.name),
  galleryImageRefs: savedPhotos.slice(1),
};

type MediaElement = { type: unknown; props: Record<string, unknown> };
function renderMedia(draft: ListingDraft): MediaElement[] {
  const componentModule = { exports: {} as { StepMedia: () => MediaElement } };
  const dependencies: Record<string, unknown> = {
    react: { useState: () => [null, () => {}], useMemo: (build: () => unknown) => build() },
    "react/jsx-runtime": {
      jsx: (type: unknown, props: MediaElement["props"]) => ({ type, props }),
      jsxs: (type: unknown, props: MediaElement["props"]) => ({ type, props }),
    },
    "next/image": "img",
    "@/components/ui/dropzone": { Dropzone: "dropzone" },
    "../seller-dashboard-ui": {},
    "@/lib/utils/listings": { getImageUrl: (key: string) => key },
    "./wizard-context": { MIN_TOTAL_IMAGES: 3, useWizard: () => ({
      isEditing: true, draft, galleryFiles: [], documentFiles: [], videoFile: null,
    }) },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("./step-media.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, {
    exports: componentModule.exports, module: componentModule,
    require(name: string) {
      if (!(name in dependencies)) throw new Error(`Unexpected media dependency: ${name}`);
      return dependencies[name];
    },
  });
  function elements(node: unknown): MediaElement[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!node || typeof node !== "object" || !("props" in node)) return [];
    const element = node as MediaElement;
    if (typeof element.type === "function") return elements(element.type(element.props));
    return [element, ...elements(element.props.children)];
  }
  return elements(componentModule.exports.StepMedia());
}

function mediaText(node: unknown): string {
  if (Array.isArray(node)) return node.map(mediaText).join("");
  return typeof node === "string" || typeof node === "number" ? String(node) : "";
}

test("reloading a failed replacement restores the saved gallery and preserves vehicle edits", () => {
  const interruptedDraft = {
    ...savedPhotoDraft,
    priceKes: "1060000",
    description: "Edited vehicle details",
    details: { ...DEFAULT_DRAFT.details, make: "Toyota", model: "Corolla", year: "2021" },
    coverImageName: null,
    coverImageRef: null,
    galleryImageNames: ["replacement-front.jpg", "replacement-side.jpg", "replacement-rear.jpg"],
    galleryImageRefs: [],
    coverFromGalleryIndex: 1,
  };
  assert.equal(renderMedia(interruptedDraft).filter((node) => node.type === "img").length, 0);

  const restored = restoreSavedListingDraft(savedPhotoDraft, interruptedDraft);
  assert.equal(restored.priceKes, "1060000");
  assert.equal(restored.description, "Edited vehicle details");
  assert.equal(restored.details.year, "2021");
  assert.equal(restored.coverFromGalleryIndex, null);
  assert.equal(restored.coverImageName, "front.jpg");
  assert.deepEqual(restored.galleryImageNames, ["side.jpg", "rear.jpg"]);
  const rendered = renderMedia(restored);
  assert.deepEqual(rendered.filter((node) => node.type === "img").map((node) => node.props.src), savedPhotos.map((photo) => photo.r2_key));
  assert.equal(mediaText(rendered.find((node) => node.type === "h3")?.props.children), "Uploaded media files (3)");
  assert.ok(rendered.some((node) => mediaText(node.props.children).includes("select the new photo set again")));
});

test("reloading keeps an existing-photo cover/order change only within the current saved gallery", () => {
  const savedOrder = {
    coverImageRef: savedPhotos[2],
    galleryImageRefs: savedPhotos.slice(0, 2),
    coverImageName: "stale-name.jpg",
    galleryImageNames: ["stale-gallery-name.jpg"],
  };
  const restored = restoreSavedListingDraft(savedPhotoDraft, savedOrder);
  assert.equal(restored.coverImageRef, savedPhotos[2]);
  assert.equal(restored.coverImageName, "rear.jpg");
  assert.deepEqual(restored.galleryImageNames, ["front.jpg", "side.jpg"]);
  assert.equal(restored.coverFromGalleryIndex, null);
});

test("reloading uses current saved photos when the stored photo references are stale", () => {
  const restored = restoreSavedListingDraft(savedPhotoDraft, {
    description: "Keep this text edit",
    coverImageRef: { ...savedPhotos[0], r2_key: "listings/sample-listing/media/image/old-cover.jpg" },
    galleryImageRefs: savedPhotos.slice(1),
  });
  assert.equal(restored.description, "Keep this text edit");
  assert.equal(restored.coverImageRef, savedPhotos[0]);
  assert.deepEqual(restored.galleryImageRefs, savedPhotos.slice(1));
});

test("new-listing recovery retains its vehicle signature while requiring local photos to be selected again", () => {
  const restored = restoreSavedListingDraft(DEFAULT_DRAFT, {
    category: "car",
    priceKes: "1060000",
    description: "Continue the same saved vehicle draft",
    details: { ...DEFAULT_DRAFT.details, make: "Toyota", model: "Corolla", year: "2021" },
    coverImageName: "local-cover.jpg",
    galleryImageNames: ["local-side.jpg", "local-rear.jpg"],
    coverFromGalleryIndex: 0,
  });
  assert.equal(restored.priceKes, "1060000");
  assert.equal(restored.details.make, "Toyota");
  assert.equal(restored.details.model, "Corolla");
  assert.equal(restored.details.year, "2021");
  assert.equal(restored.description, "Continue the same saved vehicle draft");
  assert.equal(restored.coverImageName, null);
  assert.equal(restored.coverImageRef, null);
  assert.deepEqual(restored.galleryImageNames, []);
  assert.deepEqual(restored.galleryImageRefs, []);
  assert.equal(restored.coverFromGalleryIndex, null);
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

test("dealer defaults retain explicit county for a custom town and old saved drafts infer known counties", () => {
  const defaults = buildSellerAccountDefaults({
    profile: null,
    dealer: { status: "APPROVED", county: "Kiambu", city: "Custom Town", location: "Market Area", mobile: null, whatsapp: null, contact_person: null },
  });
  assert.deepEqual(defaults.dealerLocation, { county: "Kiambu", cityTown: "Custom Town", locationArea: "Market Area" });
  assert.equal(restoreSavedListingDraft(DEFAULT_DRAFT, { cityTown: "Thika" }).county, "Kiambu");
  assert.equal(restoreSavedListingDraft(DEFAULT_DRAFT, { cityTown: "Legacy Town" }).cityTown, "Legacy Town");
});


test("completed listings stay cleared when draft autosave runs again", () => {
  const source = readFileSync(new URL("./wizard-context.tsx", import.meta.url), "utf8");
  const effect = source.match(/React\.useEffect\(\(\) => \{([\s\S]*?)\}, \[draft, storageKey, draftReady, savedDraft, submitted\]\);/);
  assert.ok(effect);
  const storage = new Map<string, string>();
  const context = {
    submitted: false, draftReady: true, savedDraft: null,
    draft: { category: "car", title: "Submitted vehicle" }, storageKey: "listing-draft",
    localStorage: {
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  };
  const run = () => vm.runInNewContext(`(() => {${effect[1]}})()`, context);
  run();
  assert.equal(storage.has(context.storageKey), true);
  context.submitted = true;
  run();
  assert.equal(storage.has(context.storageKey), false);
  context.draft.title = "Late draft update";
  run();
  assert.equal(storage.has(context.storageKey), false);
});

test("submission confirmation scrolls into view and receives focus only after success", () => {
  const source = readFileSync(new URL("./listing-wizard-v2.tsx", import.meta.url), "utf8");
  const effect = source.match(/useEffect\(\(\) => \{\s*if \(submitted\) \{([\s\S]*?)\}\s*\}, \[submitted\]\);/);
  assert.ok(effect);
  assert.match(source, /<section ref=\{successRef\} tabIndex=\{-1\}/);
  const calls: string[] = [];
  const context = { submitted: false, successRef: { current: {
    scrollIntoView: () => calls.push("scroll"), focus: () => calls.push("focus"),
  } } };
  const run = () => vm.runInNewContext(`if (submitted) {${effect[1]}}`, context);
  run();
  assert.deepEqual(calls, []);
  context.submitted = true;
  run();
  assert.deepEqual(calls, ["scroll", "focus"]);
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
