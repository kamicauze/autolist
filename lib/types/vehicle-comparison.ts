export type VehicleComparisonProvider = "openai" | "local_llm" | "rules";

export type VehicleComparisonPick = {
  vehicleId: string;
  title: string;
  reason: string;
};

export type VehicleModelInsight = {
  vehicleId: string;
  title: string;
  modelSummary: string;
  buyerFit: string;
  knownConsiderations: string[];
};

export type VehicleComparisonResult = {
  headline: string;
  summary: string;
  bestFor: VehicleComparisonPick[];
  modelInsights: VehicleModelInsight[];
  modelComparisons: string[];
  tradeoffs: string[];
  watchouts: string[];
  provider: VehicleComparisonProvider;
  model: string | null;
};
