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

  useEffect(() => {
    if (!makeName || makeName === "any" || makeName === "all") {
      setModels([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchModelsForMake(makeName)
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
  }, [makeName]);

  return { models, isLoading };
}
