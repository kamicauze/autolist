import { normalizeRichTextContent } from "@/lib/content-rich-text";
import { cn } from "@/lib/utils";

type RichContentRendererProps = {
  body: string;
  className?: string;
};

export function RichContentRenderer({ body, className }: RichContentRendererProps) {
  const html = normalizeRichTextContent(body);

  if (!html) {
    return null;
  }

  return (
    <div
      className={cn(
        "rich-content space-y-5 text-[15px] leading-8 text-[#374151]",
        "[&_a]:font-semibold [&_a]:text-brand-link [&_a]:underline [&_a]:underline-offset-4",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-brand-muted-border [&_blockquote]:bg-brand-soft-surface [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-[#475467]",
        "[&_h2]:pt-3 [&_h2]:font-heading [&_h2]:text-[26px] [&_h2]:font-semibold [&_h2]:leading-8 [&_h2]:text-[#111827]",
        "[&_h3]:pt-2 [&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:text-[#111827]",
        "[&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:text-[15px] [&_p]:leading-8 [&_ul]:list-disc [&_ul]:pl-6",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
