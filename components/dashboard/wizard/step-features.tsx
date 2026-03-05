"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterChip } from "@/components/ui/filter-chip";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  LISTING_FEATURES_BY_CATEGORY,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
} from "@/lib/constants/marketplace";
import { useWizard } from "./wizard-context";

const FEATURE_PRESET_IDS = ["popular", "safety", "driver_assist"] as const;
const FEATURE_PRESET_LABELS: Record<string, string> = {
  popular: "Popular package",
  safety: "Safety package",
  driver_assist: "Driver assist package",
};

export function StepFeatures() {
  const {
    draft,
    featureQuery,
    setFeatureQuery,
    showFeatureIds,
    setShowFeatureIds,
    expandedFeatureGroups,
    toggleFeatureGroupExpansion,
    selectedFeatureIdSet,
    toggleFeature,
    setFeatureSelection,
    clearFeatureSelection,
    applyFeaturePreset,
    undoFeaturePreset,
  } = useWizard();

  const selectedFeatureGroups = draft.category
    ? LISTING_FEATURES_BY_CATEGORY[draft.category]
    : null;
  const selectedFeatureGroupDef = draft.category
    ? LISTING_FEATURE_GROUPS_BY_CATEGORY[draft.category]
    : null;

  const normalizedQuery = featureQuery.trim().toLowerCase().replace(/[_-]+/g, " ");

  const visibleGroups = React.useMemo(() => {
    if (!selectedFeatureGroups || !selectedFeatureGroupDef) return [];
    return selectedFeatureGroupDef.order
      .map((groupKey) => {
        const features = selectedFeatureGroups[groupKey] ?? [];
        if (features.length === 0) return null;
        const visible = normalizedQuery
          ? features.filter((f) =>
              [f.label, f.id, ...(f.aliases ?? [])]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)
            )
          : features;
        if (normalizedQuery && visible.length === 0) return null;
        const selectedCount = features.filter((f) => selectedFeatureIdSet.has(f.id)).length;
        return { key: groupKey, label: selectedFeatureGroupDef.labels[groupKey] ?? groupKey, allFeatures: features, visibleFeatures: visible, selectedCount };
      })
      .filter(Boolean) as Array<{ key: string; label: string; allFeatures: Array<{ id: string; label: string; aliases?: string[] }>; visibleFeatures: Array<{ id: string; label: string; aliases?: string[] }>; selectedCount: number }>;
  }, [normalizedQuery, selectedFeatureGroupDef, selectedFeatureGroups, selectedFeatureIdSet]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Features & Specifications</h2>
          <p className="text-sm text-muted-foreground">Select relevant features for your listing.</p>
        </div>
        <Badge variant="info">{draft.selectedFeatureIds.length} selected</Badge>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="listing-feature-search">Find features</Label>
            <Input
              id="listing-feature-search"
              placeholder="Search by name or ID"
              value={featureQuery}
              onChange={(e) => setFeatureQuery(e.target.value)}
            />
          </div>
          <label className="flex h-12 items-center gap-2 rounded-lg border border-border px-3 text-sm">
            <input type="checkbox" checked={showFeatureIds} onChange={(e) => setShowFeatureIds(e.target.checked)} />
            Show IDs
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FEATURE_PRESET_IDS.map((presetId) => (
            <FilterChip key={presetId} size="sm" onClick={() => applyFeaturePreset(presetId)}>
              {FEATURE_PRESET_LABELS[presetId]}
            </FilterChip>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={clearFeatureSelection} disabled={draft.selectedFeatureIds.length === 0}>
            Clear all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={undoFeaturePreset}>
            Undo preset
          </Button>
        </div>
      </div>

      {visibleGroups.length === 0 && (
        <p className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
          No features match your search.
        </p>
      )}

      <div className="space-y-3">
        {visibleGroups.map((group) => {
          const visibleIds = group.visibleFeatures.map((f) => f.id);
          const selectedVisibleCount = visibleIds.filter((id) => selectedFeatureIdSet.has(id)).length;
          const allSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
          const expanded = expandedFeatureGroups[group.key] ?? false;

          return (
            <article key={group.key} className="rounded-xl border border-border bg-white p-4">
              <Collapsible open={expanded}>
                <div className="flex flex-wrap items-start gap-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                    onClick={() => toggleFeatureGroupExpansion(group.key)}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.selectedCount}/{group.allFeatures.length} selected
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{expanded ? "Hide" : "Show"}</span>
                  </button>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant={allSelected ? "secondary" : "outline"} onClick={() => setFeatureSelection(visibleIds, "add")} disabled={allSelected}>
                      Select all
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setFeatureSelection(visibleIds, "remove")} disabled={selectedVisibleCount === 0}>
                      Clear
                    </Button>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {group.visibleFeatures.map((feature) => (
                      <label key={feature.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selectedFeatureIdSet.has(feature.id)} onChange={() => toggleFeature(feature.id)} />
                        <span>{feature.label}</span>
                        {showFeatureIds && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">{feature.id}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </article>
          );
        })}
      </div>
    </div>
  );
}
