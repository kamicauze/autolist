import { FaqItem } from "@/components/finance/guide-elements";
import { FaqAnswer } from "@/components/faqs/faq-answer";
import { INSURANCE_FAQS, INSURANCE_FAQ_SOURCES } from "@/lib/constants/insurance-faqs";

export function InsuranceFaq() {
  return (
    <div className="mt-4 border-t border-border">
      {INSURANCE_FAQS.map((item) => (
        <FaqItem key={item.question} question={item.question}>
          <FaqAnswer blocks={item.answer} />
        </FaqItem>
      ))}
      <div className="mt-6 space-y-2 text-xs leading-5 text-muted-foreground">
        <p>Policy wording, schedules and endorsements determine your cover. Insurer references below illustrate coverage and claims processes; they are not recommendations.</p>
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          {INSURANCE_FAQ_SOURCES.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">{source.label}</a>
          ))}
        </p>
      </div>
    </div>
  );
}
