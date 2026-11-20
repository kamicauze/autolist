import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

type Element = { type: unknown; props: Record<string, unknown> };

test("applying AI copy clears its preview and keeps the applied listing description", async () => {
  const states: unknown[] = [];
  let stateIndex = 0;
  const draft = { category: "car", title: "Sample vehicle", description: "Original description", details: {} };
  const suggestion = { description: "Generated vehicle description", tips: ["Add service history"], provider: "rules" };
  const componentModule = { exports: {} as { ListingCopyAssistant: (props: object) => Element } };
  const jsx = (type: unknown, props: Element["props"]) => ({ type, props });
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("./listing-copy-assistant.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    exports: componentModule.exports, module: componentModule,
    fetch: async () => ({ ok: true, json: async () => suggestion }),
    require(name: string) {
      if (name === "react") return { useState(initial: unknown) {
        const index = stateIndex++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value: unknown) => { states[index] = value; }];
      } };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "lucide-react") return {};
      if (name === "./wizard-context") return { useWizard: () => ({ draft, updateField: (key: "description", value: string) => { draft[key] = value; } }) };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  function render() {
    stateIndex = 0;
    return componentModule.exports.ListingCopyAssistant({});
  }
  function elements(node: unknown): Element[] {
    if (Array.isArray(node)) return node.flatMap(elements);
    if (!node || typeof node !== "object" || !("props" in node)) return [];
    const element = node as Element;
    return [element, ...elements(element.props.children)];
  }
  function button(tree: Element, label: string) {
    return elements(tree).find((element) => element.type === "button" &&
      (Array.isArray(element.props.children) ? element.props.children : [element.props.children]).includes(label));
  }
  await (button(render(), "Generate AI Description")!.props.onClick as () => Promise<void>)();
  const preview = render();
  assert.equal(draft.description, "Original description");
  assert.ok(elements(preview).some((element) => element.props.children === suggestion.description));
  (button(preview, "Apply AI Description")!.props.onClick as () => void)();
  const applied = render();
  assert.equal(draft.description, suggestion.description);
  assert.equal(button(applied, "Apply AI Description"), undefined);
  assert.equal(elements(applied).some((element) => element.props.children === suggestion.description), false);
  assert.ok(button(applied, "Generate AI Description"));
});
