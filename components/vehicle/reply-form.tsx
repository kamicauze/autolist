"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { upsertListingReview } from "@/lib/actions/listing-reviews";
import {
  MAX_LISTING_REVIEW_LENGTH,
  MIN_LISTING_REVIEW_LENGTH,
} from "@/lib/types/listing-review";
import type { ListingReviewRecord } from "@/lib/types/listing-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReplyFormProps = {
  listingId?: string;
  sellerId?: string;
  viewer?: {
    id: string | null;
    email: string | null;
    fullName: string | null;
  } | null;
  existingReview?: ListingReviewRecord | null;
};

export function ReplyForm({
  listingId,
  sellerId,
  viewer = null,
  existingReview = null,
}: ReplyFormProps) {
  const router = useRouter();
  const [rating, setRating] = React.useState(existingReview?.rating ?? 0);
  const [body, setBody] = React.useState(existingReview?.body ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setRating(existingReview?.rating ?? 0);
    setBody(existingReview?.body ?? "");
  }, [existingReview]);

  const isOwnListing = Boolean(viewer?.id && sellerId && viewer.id === sellerId);
  const remainingCharacters = MAX_LISTING_REVIEW_LENGTH - body.length;

  const handleSubmit = () => {
    if (!listingId) {
      setError("Reviews can only be submitted from a vehicle page.");
      return;
    }

    if (!viewer?.id) {
      router.push(`/login?next=${encodeURIComponent(`/vehicle/${listingId}`)}`);
      return;
    }

    if (isOwnListing) {
      setError("You cannot review your own listing.");
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await upsertListingReview({
        listingId,
        rating,
        body,
      });

      if (result.error) {
        if (result.error === "AUTH_REQUIRED") {
          router.push(`/login?next=${encodeURIComponent(`/vehicle/${listingId}`)}`);
          return;
        }

        setError(result.error);
        return;
      }

      setSuccess(existingReview ? "Your review has been updated." : "Your review is now live.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <div>
        <h3 className="mb-1 text-lg font-bold text-gray-900">
          {existingReview ? "Update Your Review" : "Leave a Reply"}
        </h3>
        <p className="text-sm text-gray-500">
          {viewer?.id
            ? "Your review is tied to your Autolist account and will appear publicly on this vehicle."
            : "Sign in to leave a public review from your Autolist account."}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#ffd9d6] bg-[#fff3f2] px-4 py-3 text-sm text-[#d92d20]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-[#d1fadf] bg-[#eefaf2] px-4 py-3 text-sm text-[#2f9e63]">
          {success}
        </div>
      ) : null}

      {!listingId ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Reviews are submitted from individual vehicle pages.
        </div>
      ) : !viewer?.id ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          <p>Sign in to rate this vehicle and share your buying experience.</p>
          <Link
            href={`/login?next=${encodeURIComponent(`/vehicle/${listingId}`)}`}
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Sign in to review
          </Link>
        </div>
      ) : isOwnListing ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Sellers cannot post reviews on their own listings.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">What is your rating?</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={
                    value <= rating
                      ? "text-yellow-400 transition-colors"
                      : "text-gray-300 transition-colors hover:text-yellow-400"
                  }
                  aria-label={`Rate ${value} stars`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                value={viewer.fullName || viewer.email?.split("@")[0] || "Autolist user"}
                readOnly
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <Input value={viewer.email || ""} type="email" readOnly className="bg-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Review</label>
            <Textarea
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setError(null);
                setSuccess(null);
              }}
              placeholder="Write your review here..."
              className="min-h-[120px] bg-white"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Minimum {MIN_LISTING_REVIEW_LENGTH} characters.</span>
              <span>{remainingCharacters} characters remaining</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-[#2C52D8] px-8 hover:bg-[#2546b8] sm:w-auto"
          >
            {isPending ? "Saving..." : existingReview ? "Update Review" : "Post Comment"}
          </Button>
        </>
      )}
    </div>
  );
}
