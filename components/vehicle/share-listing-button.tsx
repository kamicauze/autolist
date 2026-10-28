"use client";

import { useId, useRef, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function ShareListingButton({ listingId, title }: { listingId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copying, setCopying] = useState(false);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setUrl(new URL(`/vehicle/${encodeURIComponent(listingId)}`, window.location.origin).href);
    }
    setStatus("");
    setOpen(nextOpen);
  }

  function selectForManualCopy() {
    inputRef.current?.focus();
    inputRef.current?.select();
    setStatus("Copy isn't available here. The link is selected; copy it manually.");
  }

  async function copyLink() {
    if (!navigator.clipboard?.writeText) {
      selectForManualCopy();
      return;
    }
    setCopying(true);
    setStatus("");
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      selectForManualCopy();
    } finally {
      setCopying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Share listing"
          className="h-8 w-8 rounded-full border-white/40 bg-white/70 shadow-sm backdrop-blur-sm hover:bg-white/90"
        >
          <Share2 className="h-3.5 w-3.5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] rounded-xl">
        <DialogHeader>
          <DialogTitle>Share this listing</DialogTitle>
          <DialogDescription className="break-words">
            Send someone the link to {title}.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-2">
          <label htmlFor={inputId} className="text-sm font-medium">Listing link</label>
          <Input
            ref={inputRef}
            id={inputId}
            type="url"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
        <Button type="button" onClick={() => void copyLink()} disabled={copying || !url}>
          <Copy className="h-4 w-4" />
          {copying ? "Copying…" : "Copy link"}
        </Button>
        {url ? (
          <Button asChild variant="outline">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share via WhatsApp
            </a>
          </Button>
        ) : null}
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {status}
        </p>
      </DialogContent>
    </Dialog>
  );
}
