"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  listing: string;
}

const SAMPLE_REVIEWS: Review[] = [
  { id: "1", author: "John Mwangi", rating: 5, text: "Great dealer, very professional and honest about the car condition. Would recommend to anyone.", date: "Dec 10, 2025", listing: "2022 Toyota Prado TX" },
  { id: "2", author: "Sarah Kamau", rating: 4, text: "Smooth transaction, the vehicle was exactly as described. Communication was excellent throughout.", date: "Dec 8, 2025", listing: "2020 Mazda CX-5" },
  { id: "3", author: "David Ochieng", rating: 5, text: "Excellent service. Would definitely buy from here again. The car was in perfect condition.", date: "Dec 5, 2025", listing: "2019 Nissan X-Trail" },
  { id: "4", author: "Mary Wanjiku", rating: 3, text: "Good overall experience but delivery took longer than expected. Car was as described though.", date: "Dec 1, 2025", listing: "2018 Subaru Forester" },
  { id: "5", author: "Peter Otieno", rating: 5, text: "Best car buying experience I've ever had. Very transparent and helpful throughout the process.", date: "Nov 28, 2025", listing: "2021 Honda CR-V" },
  { id: "6", author: "Grace Njeri", rating: 4, text: "Professional dealer with quality vehicles. Price negotiation was fair and straightforward.", date: "Nov 20, 2025", listing: "2016 Mercedes-Benz C200" },
];

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewList() {
  const avgRating = SAMPLE_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / SAMPLE_REVIEWS.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Reviews</h1>
          <p className="text-sm text-muted-foreground">{SAMPLE_REVIEWS.length} reviews received</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 border border-border">
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">average</span>
        </div>
      </div>

      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {review.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">on {review.listing}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StarRating rating={review.rating} />
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
