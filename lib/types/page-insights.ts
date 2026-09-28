export const PAGE_INSIGHTS_RANGES = ["today", "week", "month"] as const;

export type PageInsightsRange = (typeof PAGE_INSIGHTS_RANGES)[number];

export type PageInsightsSeries = {
  labels: string[];
  views: number[];
  leads: number[];
  totalViews: number;
  totalLeads: number;
};

export type PageInsightsData = Record<PageInsightsRange, PageInsightsSeries>;
