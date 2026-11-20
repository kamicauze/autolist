"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { countyOptions, selectCounty, townOptions, type CountyTownSelection } from "@/lib/location/selection";
import { normalizeLocationText } from "@/lib/location/normalize";
import { cn } from "@/lib/utils";

export function CountyTownFields({ county, town, onChange, search = false, showValidationErrors = false, className, labelClassName }: CountyTownSelection & {
  onChange: (selection: CountyTownSelection) => void;
  search?: boolean;
  showValidationErrors?: boolean;
  className?: string;
  labelClassName?: string;
}) {
  const options = townOptions(county);
  const selectedTown = options.find((option) => {
    const [optionCounty, optionTown] = JSON.parse(option.value) as string[];
    return optionTown === town && (!county || optionCounty === county);
  });
  return (
    <>
      <div>
        <p className={labelClassName ?? "mb-1 text-sm font-medium"}>County{search ? "" : " *"}</p>
        <SearchableSelect
          aria-label="County"
          aria-invalid={showValidationErrors && !county.trim()}
          value={county}
          onChange={(value) => onChange(selectCounty({ county, town }, value))}
          options={search ? [{ value: "", label: "All counties" }, ...countyOptions] : countyOptions}
          placeholder={search ? "All counties" : "Select county"}
          searchPlaceholder="Search counties..."
          className={cn(className, showValidationErrors && !county.trim() && "border-[#f04438]")}
        />
      </div>
      <div>
        <p className={labelClassName ?? "mb-1 text-sm font-medium"}>City / Town{search ? "" : " *"}</p>
        <SearchableSelect
          aria-label="City / Town"
          aria-invalid={showValidationErrors && !town.trim()}
          value={selectedTown?.value ?? town}
          displayValue={town || undefined}
          onChange={(value) => {
            const option = options.find((candidate) => candidate.value === value);
            if (option) {
              const [nextCounty, nextTown] = JSON.parse(option.value) as [string, string];
              onChange({ county: nextCounty, town: nextTown });
            } else {
              onChange({ county, town: normalizeLocationText(value) });
            }
          }}
          options={search ? [{ value: "", label: "All towns" }, ...options] : options}
          allowCustomValue={Boolean(county)}
          placeholder={search ? "All towns" : "Select city / town"}
          searchPlaceholder={county ? "Search towns or enter your town..." : "Search towns across Kenya..."}
          className={cn(className, showValidationErrors && !town.trim() && "border-[#f04438]")}
        />
        <p className="mt-1 text-xs text-muted-foreground">{county ? "Town missing? Type its name and choose Use." : "Choose a town to fill its county, or select a county for a custom town."}</p>
      </div>
    </>
  );
}
