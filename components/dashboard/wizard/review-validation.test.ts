import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { LISTING_FEATURE_GROUPS_BY_CATEGORY, LISTING_FEATURES_BY_CATEGORY } from "@/lib/constants/marketplace";
import { DEFAULT_DRAFT, WIZARD_STEP } from "./wizard-context";
import { CountyTownFields } from "@/components/shared/county-town-fields";

type Element = { type: unknown; props: Record<string, unknown> };
const require = createRequire(import.meta.url);
function load(file: string, context: object, react: object = {}, window: object = {}) {
  const componentModule = { exports: {} as Record<string, (props: object) => Element> };
  const jsx = (type: unknown, props: Element["props"]) => ({ type, props });
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, {
    exports: componentModule.exports, module: componentModule, window,
    require(name: string) {
      if (name === "react") return { ...require("react"), ...react };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "./wizard-context") return { ...require("./wizard-context"), useWizard: () => context };
      return require(name);
    },
  });
  return componentModule.exports;
}
function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !("props" in node)) return [];
  const element = node as Element;
  return [element, ...elements(element.props.children)];
}

test("production location fields mark the missing town without marking a completed county", () => {
  const tree = CountyTownFields({ county: "Nairobi", town: "", onChange() {}, showValidationErrors: true });
  const fields = elements(tree);
  assert.equal(fields.find((node) => node.props["aria-label"] === "County")?.props["aria-invalid"], false);
  assert.equal(fields.find((node) => node.props["aria-label"] === "City / Town")?.props["aria-invalid"], true);
  const town = fields.find((node) => node.props["aria-label"] === "City / Town")!;
  const select = load("../../ui/searchable-select.tsx", {}, {
    useState: (initial: unknown) => [initial, () => {}], useRef: () => ({ current: null }),
    useId: () => "sample-town", useMemo: (build: () => unknown) => build(), useEffect() {}, useLayoutEffect() {},
  }).SearchableSelect(town.props);
  assert.equal(elements(select).find((node) => node.props.role === "combobox")?.props["aria-invalid"], true);
});

test("review groups selected features under their category labels and retains unknown saved features", () => {
  for (const category of ["car", "motorbike", "farm_agricultural", "plant_construction"] as const) {
    const definitions = LISTING_FEATURE_GROUPS_BY_CATEGORY[category];
    const groups = LISTING_FEATURES_BY_CATEGORY[category];
    const keys = definitions.order.filter((key) => groups[key]?.length).slice(0, 2);
    const selected = keys.map((key) => groups[key][0]);
    const context = { draft: { ...DEFAULT_DRAFT, category, selectedFeatureIds: [...selected.map((feature) => feature.id), "saved-legacy-feature"] }, selectedCategoryFields: [] };
    const tree = load("./step-review.tsx", context).StepReview({});
    const nodes = elements(tree);
    assert.deepEqual(nodes.filter((node) => node.type === "h4").map((node) => node.props.children), [...keys.map((key) => definitions.labels[key]), "Other features"]);
    for (const feature of [...selected.map((item) => item.label), "saved-legacy-feature"]) {
      assert.equal(nodes.filter((node) => node.type === "span" && node.props.children === feature).length, 1);
    }
    assert.equal(nodes.find((node) => node.type === "details")?.props.open, undefined);
  }
});

test("validation focuses the missing field after each attempt, skips hidden inputs and respects reduced motion", () => {
  const focused: string[] = [];
  const scrolled: unknown[] = [];
  let reducedMotion = false;
  const hidden = { matches: () => false, getClientRects: () => [], focus: () => focused.push("hidden") };
  const visible = { matches: () => false, getClientRects: () => [{}], focus: () => focused.push("field"), scrollIntoView: (options: unknown) => scrolled.push(options) };
  const invalid = { matches: () => false, querySelectorAll: () => [hidden, visible], scrollIntoView: (options: unknown) => scrolled.push(options) };
  let currentInvalid: unknown = invalid;
  const refs: Array<{ current: unknown }> = [];
  let refIndex = 0;
  let effects: Array<() => void> = [];
  const previousDeps: unknown[][] = [];
  let effectIndex = 0;
  const context = { draft: DEFAULT_DRAFT, draftReady: true, isEditing: true, activeStep: WIZARD_STEP.vehicle as number, stepCompletion: [], validationAttempt: 0 };
  const component = load("./listing-wizard-v2.tsx", context, {
    useRef(initial: unknown) { return refs[refIndex++] ??= { current: initial }; },
    useEffect(callback: () => void, deps: unknown[]) {
      const index = effectIndex++;
      if (!previousDeps[index] || deps.some((value, i) => !Object.is(value, previousDeps[index][i]))) effects.push(callback);
      previousDeps[index] = [...deps];
    },
  }, { scrollTo() {}, requestAnimationFrame: (callback: () => void) => { callback(); return 1; }, cancelAnimationFrame() {}, matchMedia: () => ({ matches: reducedMotion }) });
  function render() {
    refIndex = 0;
    effects = [];
    effectIndex = 0;
    const wrapper = component.ListingWizardV2({});
    const content = wrapper.props.children as Element;
    (content.type as (props: object) => Element)(content.props);
    refs[1].current = { querySelector: () => currentInvalid };
    effects.forEach((effect) => effect());
  }
  render();
  assert.deepEqual(focused, []);
  for (const attempt of [1, 2]) { context.validationAttempt = attempt; render(); }
  assert.deepEqual(focused, ["field", "field"]);
  assert.equal((scrolled[0] as { behavior: string }).behavior, "smooth");
  reducedMotion = true;
  context.validationAttempt = 3;
  render();
  assert.equal((scrolled[2] as { behavior: string }).behavior, "auto");
  context.activeStep = WIZARD_STEP.features;
  render();
  assert.equal(focused.length, 3, "ordinary step changes must not focus missing fields after an earlier validation failure");
  currentInvalid = null;
  context.validationAttempt = 4;
  render();
  assert.equal(focused.length, 3);
});

test("submission progress follows the current step content", () => {
  const context = { draft: DEFAULT_DRAFT, draftReady: true, isEditing: true, activeStep: WIZARD_STEP.review, stepCompletion: [], validationAttempt: 0, isSubmitting: true, submissionStatus: "Uploading media (1 of 3)..." };
  const component = load("./listing-wizard-v2.tsx", context, {
    useRef: () => ({ current: null }),
    useEffect() {},
  });
  const content = component.ListingWizardV2({}).props.children as Element;
  const tree = (content.type as (props: object) => Element)(content.props);
  const nodes = elements(tree);
  const statusIndex = nodes.findIndex((node) => node.props.role === "status");
  const stepIndex = nodes.findIndex((node) => typeof node.type === "function" && (node.type as { name: string }).name === "StepReview");
  assert.ok(stepIndex >= 0 && statusIndex > stepIndex);
  assert.equal(nodes[statusIndex].props["aria-live"], "polite");
});
