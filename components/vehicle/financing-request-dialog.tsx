"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinancingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

export function FinancingRequestDialog({
  open,
  onOpenChange,
  title,
}: FinancingRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-gray-200 p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Request Financing Quote
          </DialogTitle>
          <p className="text-sm text-gray-500">{title}</p>
        </DialogHeader>

        <form className="space-y-4 px-6 py-5">
          <Input placeholder="Full name" />
          <Input placeholder="Phone number" type="tel" />
          <Input placeholder="Email address" type="email" />
          <Input placeholder="Monthly income" />
          <Input placeholder="Preferred down payment" />
          <Textarea
            placeholder="Additional details (optional)"
            className="min-h-[100px]"
          />

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
