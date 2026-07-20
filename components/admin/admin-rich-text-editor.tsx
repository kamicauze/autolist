"use client";

import * as React from "react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { uploadCmsImage } from "@/lib/actions/cms";
import { getContentPlainText, normalizeRichTextContent, sanitizeContentHtml } from "@/lib/content-rich-text";
import type { CmsMediaAsset } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";

type AdminRichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  onAssetUploaded?: (asset: CmsMediaAsset) => void;
  onFeedback?: (feedback: { tone: "success" | "error"; message: string } | null) => void;
};

type ToolbarButton = {
  label: string;
  icon: React.ReactNode;
  command: string;
  value?: string;
};

const INLINE_TOOLS: ToolbarButton[] = [
  { label: "Bold", icon: <Bold className="h-4 w-4" />, command: "bold" },
  { label: "Italic", icon: <Italic className="h-4 w-4" />, command: "italic" },
  { label: "Underline", icon: <Underline className="h-4 w-4" />, command: "underline" },
  {
    label: "Strikethrough",
    icon: <Strikethrough className="h-4 w-4" />,
    command: "strikeThrough",
  },
];

const BLOCK_TOOLS: ToolbarButton[] = [
  { label: "Heading 2", icon: <Heading2 className="h-4 w-4" />, command: "formatBlock", value: "h2" },
  { label: "Heading 3", icon: <Heading3 className="h-4 w-4" />, command: "formatBlock", value: "h3" },
  { label: "Paragraph", icon: <span className="text-[13px] font-semibold">P</span>, command: "formatBlock", value: "p" },
  { label: "Bullet list", icon: <List className="h-4 w-4" />, command: "insertUnorderedList" },
  { label: "Numbered list", icon: <ListOrdered className="h-4 w-4" />, command: "insertOrderedList" },
  { label: "Quote", icon: <Quote className="h-4 w-4" />, command: "formatBlock", value: "blockquote" },
];

export function AdminRichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write formatted content here.",
  minHeightClassName = "min-h-[320px]",
  onAssetUploaded,
  onFeedback,
}: AdminRichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const savedSelectionRef = React.useRef<Range | null>(null);
  const lastEmittedValueRef = React.useRef("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const plainText = getContentPlainText(value);

  React.useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement || value === lastEmittedValueRef.current) return;

    editorElement.innerHTML = normalizeRichTextContent(value);
  }, [value]);

  function emitChange() {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const nextValue = sanitizeContentHtml(editorElement.innerHTML);
    lastEmittedValueRef.current = nextValue;
    onChange(nextValue);
  }

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function addLink() {
    const url = window.prompt("Paste a link URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  function saveEditorSelection() {
    const editorElement = editorRef.current;
    const selection = window.getSelection();
    if (!editorElement || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editorElement.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  }

  function insertImage(url: string, altText: string) {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    editorElement.focus();
    const selection = window.getSelection();
    const range = savedSelectionRef.current ?? document.createRange();

    if (!savedSelectionRef.current) {
      range.selectNodeContents(editorElement);
      range.collapse(false);
    }

    const image = document.createElement("img");
    image.src = url;
    image.alt = altText;

    const nextParagraph = document.createElement("p");
    nextParagraph.append(document.createElement("br"));

    const fragment = document.createDocumentFragment();
    fragment.append(image, nextParagraph);
    range.deleteContents();
    range.insertNode(fragment);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(nextParagraph);
    nextRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
    savedSelectionRef.current = nextRange.cloneRange();
    emitChange();
  }

  async function handleInlineImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    const altText = window.prompt("Describe this image for screen readers", "") ?? "";
    const formData = new FormData();
    formData.set("image", image);
    formData.set("usageContext", "blog_cover");
    formData.set("altText", altText);

    setIsUploadingImage(true);
    onFeedback?.(null);
    try {
      const result = await uploadCmsImage(formData);
      if (!result.success) {
        onFeedback?.({ tone: "error", message: result.error });
        return;
      }

      insertImage(result.url, altText);
      if (result.asset) {
        onAssetUploaded?.(result.asset);
      }
      onFeedback?.({ tone: "success", message: "Image uploaded and inserted in the article body." });
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[13px] font-medium text-[#374151]">{label}</span>
          <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
            Format headings, lists, quotes, and links without leaving the CMS.
          </p>
        </div>
        <span className="rounded-full border border-[#dbe3ee] bg-white px-3 py-1 text-[11px] font-medium text-[#64748b]">
          {plainText ? `${plainText.split(/\s+/).length} words` : "No body copy"}
        </span>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#d9dee8] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap gap-1 border-b border-[#e8edf5] bg-[#f8fafc] px-2 py-2">
          {[...INLINE_TOOLS, ...BLOCK_TOOLS].map((tool) => (
            <button
              key={`${tool.command}-${tool.value ?? tool.label}`}
              type="button"
              aria-label={tool.label}
              title={tool.label}
              onClick={() => runCommand(tool.command, tool.value)}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-transparent px-2 text-[#334155] transition hover:border-[#cbd5e1] hover:bg-white active:translate-y-px"
            >
              {tool.icon}
            </button>
          ))}
          <button
            type="button"
            aria-label="Insert link"
            title="Insert link"
            onClick={addLink}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-transparent px-2 text-[#334155] transition hover:border-[#cbd5e1] hover:bg-white active:translate-y-px"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Upload inline image"
            title="Upload inline image"
            disabled={isUploadingImage}
            onMouseDown={saveEditorSelection}
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] border border-transparent px-2 text-[#334155] transition hover:border-[#cbd5e1] hover:bg-white active:translate-y-px disabled:cursor-wait disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInlineImageUpload}
            className="sr-only"
          />
        </div>

        <div className="relative">
          {!plainText ? (
            <p className="pointer-events-none absolute left-4 top-4 text-[14px] text-[#9aa4b2]">
              {placeholder}
            </p>
          ) : null}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onBlur={emitChange}
            className={cn(
              "rich-content-editor w-full bg-white px-4 py-4 text-[14px] leading-7 text-[#273041] outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "[&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-brand-muted-border [&_blockquote]:bg-brand-soft-surface [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:text-[#475467]",
              "[&_h2]:mt-5 [&_h2]:font-heading [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:leading-8 [&_h2]:text-[#111827] [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-[#111827]",
              "[&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6",
              "[&_img]:my-5 [&_img]:max-h-[560px] [&_img]:w-full [&_img]:rounded-[14px] [&_img]:object-cover",
              minHeightClassName
            )}
          />
        </div>
      </div>
    </div>
  );
}
