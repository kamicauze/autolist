"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSellerKycUploadTicket, savePrivateSellerRegistration } from "@/lib/actions/seller-verification";
import { createClient } from "@/lib/supabase/client";
import type { SellerVerificationDocumentType } from "@/lib/types/seller-verification";
import { listingPhoneSchema, sellerIdentityDocuments } from "@/lib/validations/registration";

const fileTypes = "application/pdf,image/jpeg,image/png,image/webp";
const identities = {
  national_id: ["national_id_front", "national_id_back"],
  passport: ["passport"],
} as const;

export function PrivateSellerRegistration({ initialPhone, destination }: { initialPhone: string; destination: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [identity, setIdentity] = useState<keyof typeof identities>("national_id");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const uploaded = useRef(new Map<SellerVerificationDocumentType, { file: File; path: string }>());

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!listingPhoneSchema.safeParse(phone).success) {
      setError("Enter a valid phone number.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const documents = identities[identity].map((documentType) => ({ documentType, file: formData.get(documentType) }));
    if (documents.some(({ file }) => !(file instanceof File) || !file.size ||
        file.size > 6 * 1024 * 1024 || !fileTypes.split(",").includes(file.type))) {
      setError("Choose the required PDF, JPG, PNG or WEBP files, up to 6 MB each.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const evidence = [];
      for (const { documentType, file } of documents) {
        if (!(file instanceof File)) continue;
        const descriptor = { documentType, fileName: file.name, contentType: file.type, sizeBytes: file.size };
        const previous = uploaded.current.get(documentType);
        let path = previous?.file === file ? previous.path : "";
        if (!path) {
          const ticket = await createSellerKycUploadTicket(descriptor, true);
          if (!ticket.success) throw new Error(ticket.error);
          const { error: uploadError } = await supabase.storage.from(ticket.bucket)
            .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
          if (uploadError) throw new Error("Unable to upload the identity document. Please retry.");
          path = ticket.path;
          uploaded.current.set(documentType, { file, path });
        }
        evidence.push({ ...descriptor, storagePath: path });
      }
      const result = await savePrivateSellerRegistration(phone, evidence);
      if (!result.success) throw new Error(result.error);
      router.replace(destination);
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error && failure.message
        ? failure.message
        : "Unable to save your seller setup. Please retry.");
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-[620px] rounded-2xl border border-border bg-white p-5 sm:p-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-[#14213d]">Set up your private seller account</h1>
      <form onSubmit={save} className="mt-6">
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="seller-setup-phone">Phone number</Label>
            <Input id="seller-setup-phone" type="tel" autoComplete="tel" maxLength={32} value={phone} placeholder="+254 700 000 000" onChange={(event) => setPhone(event.target.value)} className="h-11" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seller-setup-identity">Identity document</Label>
            <select id="seller-setup-identity" value={identity} onChange={(event) => { setIdentity(event.target.value as keyof typeof identities); setError(""); }} className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm">
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
            </select>
          </div>
          {identities[identity].map((type) => (
            <div key={type} className="space-y-1.5">
              <Label htmlFor={type}>{sellerIdentityDocuments[type]}</Label>
              <Input id={type} name={type} type="file" accept={fileTypes} className="h-11 py-2.5" required />
            </div>
          ))}
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
            Only you and authorised Autolist reviewers can access your identity document.
          </p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-11 w-full">{saving ? "Saving…" : "Continue"}</Button>
        </fieldset>
      </form>
    </section>
  );
}
