"use client";

import { useState, useEffect } from "react";
import { fetchModelsForMake } from "@/lib/actions/car-data";

/**
 * Client hook — fetches car models for a given make via server action.
 * Returns the model name list and a loading flag.
 */
export function useCarModels(makeName: string | null) {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedMake =
    makeName && makeName !== "any" && makeName !== "all" ? makeName : null;

  useEffect(() => {
    if (!selectedMake) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
      }
    });

    fetchModelsForMake(selectedMake)
      .then((data) => {
        if (!cancelled) setModels(data);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMake]);

  return {
    models: selectedMake ? models : [],
    isLoading: selectedMake ? isLoading : false,
  };
}
