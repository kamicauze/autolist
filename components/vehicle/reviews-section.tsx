"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const REVIEWS = [
  {
    id: 1,
    name: "Leslie Alexander",
    date: "Sep 22, 2021",
    rating: 5,
    avatar: null,
    text: "It is undoubtedly the best car in its category, robust and elegantly designed. A car of guaranteed reliability & changing technologies, can easily be widely viewed the best car in its class.",
  },
  {
    id: 2,
    name: "Arlene McCoy",
    date: "Sep 22, 2021",
    rating: 5,
    avatar: null,
    text: "It is undoubtedly the best car in its category, robust and elegantly designed. A car of guaranteed reliability & changing technologies, can easily be widely viewed the best car in its class.",
  },
  {
    id: 3,
    name: "Jane Cooper",
    date: "Sep 22, 2021",
    rating: 5,
    avatar: null,
    text: "It is undoubtedly the best car in its category, robust and elegantly designed. A car of guaranteed reliability & changing technologies, can easily be widely viewed the best car in its class.",
  },
];

export function ReviewsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Car User Reviews & Rating
        </h2>
        
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-white p-2">
                <Star className="w-6 h-6 text-primary fill-current" />
            </div>
            <span className="text-4xl font-bold text-primary">4.8</span>
          </div>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-900">Outstanding</p>
            <p>372 Rating and Reviews</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {REVIEWS.map((review) => (
          <div key={review.id} className="rounded-lg border border-gray-100 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? "fill-current" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-gray-500">{review.date}</span>
            </div>

            <p className="mb-3 text-sm leading-relaxed text-gray-600">
              {review.text}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Is this review helpful?</span>
              <button className="hover:text-primary transition-colors">Yes</button>
              <button className="hover:text-primary transition-colors">No</button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
        View more reviews
      </Button>
    </div>
  );
}
