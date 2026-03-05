"use client";

import * as React from "react";
import { Upload, FileCheck, Clock, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type VerificationState = "upload" | "uploaded" | "under_review";

interface UploadedDoc {
  name: string;
  type: string;
}

export function VerificationPage() {
  const [state, setState] = React.useState<VerificationState>("upload");
  const [docs, setDocs] = React.useState<UploadedDoc[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDocs = Array.from(files).map((f) => ({ name: f.name, type: f.type }));
    setDocs((prev) => [...prev, ...newDocs]);
  };

  const removeDoc = (name: string) => {
    setDocs((prev) => prev.filter((d) => d.name !== name));
  };

  const handleSubmit = () => {
    if (docs.length > 0) {
      setState("under_review");
    }
  };

  // State 1: Upload
  if (state === "upload" || (state === "uploaded" && docs.length === 0)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Verification</h1>
          <p className="text-sm text-muted-foreground">
            Upload your documents to verify your identity and build trust with buyers.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-foreground">Required Documents</h3>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">National ID / Passport</Label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-primary/40">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</span>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
              </label>
            </div>

            <div>
              <Label className="mb-2 block">Business Registration (for dealers)</Label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-primary/40">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                <span className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</span>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} />
              </label>
            </div>
          </div>

          {docs.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">{docs.length} file(s) selected:</p>
              {docs.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded-lg border border-border bg-gray-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground">{doc.name}</span>
                  </div>
                  <button onClick={() => removeDoc(doc.name)} className="text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button onClick={handleSubmit} className="mt-3">Submit for Verification</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // State 3: Under Review
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Verification</h1>
        <p className="text-sm text-muted-foreground">Your documents are being reviewed.</p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-700">Verification Under Review</p>
            <p className="text-xs text-blue-600">
              Our team is reviewing your documents. This usually takes 1-2 business days.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Verification Timeline</h3>
          <div className="space-y-3">
            {[
              { label: "Documents Uploaded", done: true },
              { label: "Review in Progress", done: true, current: true },
              { label: "Verification Complete", done: false },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                  step.done ? "border-green-500 bg-green-50 text-green-600" : "border-gray-300 text-gray-400",
                  step.current && "border-blue-500 bg-blue-50 text-blue-600"
                )}>
                  {step.done && !step.current ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("text-sm", step.done ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Submitted Documents</h3>
          {docs.map((doc) => (
            <div key={doc.name} className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2 mb-2">
              <FileCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm text-foreground">{doc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
