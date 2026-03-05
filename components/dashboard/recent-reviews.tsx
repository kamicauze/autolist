import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: "1",
    author: "John M.",
    rating: 5,
    text: "Great dealer, very professional and honest about the car condition.",
    date: "2 days ago",
  },
  {
    id: "2",
    author: "Sarah K.",
    rating: 4,
    text: "Smooth transaction, the vehicle was exactly as described.",
    date: "5 days ago",
  },
  {
    id: "3",
    author: "David O.",
    rating: 5,
    text: "Excellent service. Would definitely buy from here again.",
    date: "1 week ago",
  },
];

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export function RecentReviews() {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">Recent Reviews</h3>
      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((review) => (
          <div key={review.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {review.author[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.author}
                </span>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {review.text}
              </p>
              <p className="mt-1 text-xs text-gray-400">{review.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
