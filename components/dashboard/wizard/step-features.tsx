"use client";

import * as React from "react";
import { LISTING_FEATURE_GROUPS_BY_CATEGORY, LISTING_FEATURES_BY_CATEGORY } from "@/lib/constants/marketplace";
import { useWizard } from "./wizard-context";
import { sellerGhostButtonClass, sellerInputClass } from "../seller-dashboard-ui";

export function StepFeatures() {
  const {
    draft,
    featureQuery,
    setFeatureQuery,
    selectedFeatureIdSet,
    toggleFeature,
    clearFeatureSelection,
  } = useWizard();

  const groups = draft.category ? LISTING_FEATURES_BY_CATEGORY[draft.category] : null;
  const groupDef = draft.category ? LISTING_FEATURE_GROUPS_BY_CATEGORY[draft.category] : null;

  const visibleGroups = React.useMemo(() => {
    if (!groups || !groupDef) return [];

    return groupDef.order
      .map((key) => {
        const all = groups[key] ?? [];
        const visible = featureQuery.trim()
          ? all.filter((item) =>
              [item.label, item.id, ...(item.aliases ?? [])]
                .join(" ")
                .toLowerCase()
                .includes(featureQuery.toLowerCase())
            )
          : all;

        if (visible.length === 0) return null;
        return {
          key,
          label: groupDef.labels[key] ?? key,
          features: visible,
        };
      })
      .filter(Boolean) as Array<{ key: string; label: string; features: Array<{ id: string; label: string }> }>;
  }, [featureQuery, groupDef, groups]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h2 className="font-heading text-[28px] font-semibold text-[#202224]">
            Features & Specifications
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#767676]">
            Pick the exact equipment and options included in this listing package before it is
            reviewed.
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#ededed] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              Listing equipment
            </p>
            <p className="text-[15px] text-[#636363]">
              {draft.selectedFeatureIds.length} feature{draft.selectedFeatureIds.length === 1 ? "" : "s"} selected
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={featureQuery}
              onChange={(event) => setFeatureQuery(event.target.value)}
              placeholder="Search feature name or code"
              className={`${sellerInputClass} md:min-w-[320px]`}
            />
            <button
              type="button"
              onClick={clearFeatureSelection}
              className={sellerGhostButtonClass}
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {visibleGroups.map((group) => (
          <section
            key={group.key}
            className="rounded-[24px] border border-[#ededed] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)]"
          >
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#efefef] pb-4">
              <div>
                <h3 className="font-heading text-[22px] font-semibold text-[#202224]">
                  {group.label}
                </h3>
                <p className="mt-1 text-[13px] text-[#7d7d7d]">
                  Select all applicable items from this group.
                </p>
              </div>
              <div className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[12px] font-semibold text-[#2563eb]">
                {group.features.filter((item) => selectedFeatureIdSet.has(item.id)).length} selected
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {group.features.map((feature) => {
                const selected = selectedFeatureIdSet.has(feature.id);
                return (
                  <label
                    key={feature.id}
                    className={`flex items-start gap-3 rounded-[18px] border px-4 py-3.5 text-[14px] transition ${
                      selected
                        ? "border-[#2563eb] bg-[#eef4ff]"
                        : "border-[#ededed] bg-white hover:border-[#cfdaf7] hover:bg-[#fafcff]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleFeature(feature.id)}
                      className="mt-1 h-4 w-4 rounded border-[#c8c8c8]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#202224]">{feature.label}</p>
                      <p className="mt-1 truncate text-[12px] text-[#8a8a8a]">{feature.id}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
