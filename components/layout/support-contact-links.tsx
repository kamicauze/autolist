import { ChevronRight, Mail, ShieldAlert } from "lucide-react";
import { IconWhatsapp } from "@/components/ui/icons";
import {
  SAFETY_EMAIL,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_NUMBER,
  SUPPORT_WHATSAPP_URL,
} from "@/lib/constants/support-contact";

export function SupportContactLinks({ includeSafety = false }: { includeSafety?: boolean }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card text-card-foreground">
      <li>
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4"
        >
          <IconWhatsapp className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Chat with us on WhatsApp</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">{SUPPORT_WHATSAPP_NUMBER}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </a>
      </li>
      <li>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4"
        >
          <Mail className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1 break-all text-sm font-semibold">{SUPPORT_EMAIL}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </a>
      </li>
      {includeSafety ? (
        <li>
          <a
            href={`mailto:${SAFETY_EMAIL}`}
            className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4"
          >
            <ShieldAlert className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Safety reports</span>
              <span className="mt-0.5 block break-all text-sm text-muted-foreground">{SAFETY_EMAIL}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          </a>
        </li>
      ) : null}
    </ul>
  );
}
