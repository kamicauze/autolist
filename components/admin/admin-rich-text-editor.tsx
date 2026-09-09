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
  RefreshCw,
  Strikethrough,
  Trash2,
  Underline,
  Upload,
} from "lucide-react";
import { uploadCmsImage } from "@/lib/actions/cms";
import { getContentPlainText, normalizeRichTextContent, sanitizeContentHtml } from "@/lib/content-rich-text";
import type { CmsMediaAsset } from "@/lib/types/cms-media";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "./admin-ui";

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

type SelectedInlineImage = {
  index: number;
  altText: string;
  caption: string;
};

type ImageDialogMode = "insert" | "replace" | null;

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

function getFigureForImage(image: HTMLImageElement) {
  return image.parentElement?.tagName.toLowerCase() === "figure"
    ? (image.parentElement as HTMLElement)
    : null;
}

function getImageCaption(image: HTMLImageElement) {
  return getFigureForImage(image)?.querySelector("figcaption")?.textContent?.trim() ?? "";
}

function moveRangeAfterContainingBlock(range: Range, editorElement: HTMLElement) {
  const container =
    range.commonAncestorContainer instanceof HTMLElement
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentElement;
  let block = container?.closest("p, h2, h3, blockquote, li, figure");
  if (block?.tagName.toLowerCase() === "li" && block.parentElement?.matches("ol, ul")) {
    block = block.parentElement;
  }

  if (block && editorElement.contains(block)) {
    range.selectNode(block);
    range.collapse(false);
  }
}

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
  const savedSelectionRef = React.useRef<Range | null>(null);
  const lastEmittedValueRef = React.useRef("");
  const [imageDialogMode, setImageDialogMode] = React.useState<ImageDialogMode>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageAltText, setImageAltText] = React.useState("");
  const [imageCaption, setImageCaption] = React.useState("");
  const [imageDialogError, setImageDialogError] = React.useState("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<SelectedInlineImage | null>(null);
  const plainText = getContentPlainText(value);

  React.useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement || value === lastEmittedValueRef.current) return;

    editorElement.innerHTML = normalizeRichTextContent(value);
    setSelectedImage(null);
  }, [value]);

  function emitChange() {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    if (selectedImage && !editorElement.querySelectorAll("img").item(selectedImage.index)) {
      setSelectedImage(null);
    }
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

  function resetImageDialog() {
    setImageFile(null);
    setImageAltText("");
    setImageCaption("");
    setImageDialogError("");
  }

  function openInsertImageDialog() {
    resetImageDialog();
    setImageDialogMode("insert");
  }

  function openReplaceImageDialog() {
    if (!selectedImage) return;
    setImageFile(null);
    setImageAltText(selectedImage.altText);
    setImageCaption(selectedImage.caption);
    setImageDialogError("");
    setImageDialogMode("replace");
  }

  function closeImageDialog() {
    if (isUploadingImage) return;
    setImageDialogMode(null);
    resetImageDialog();
  }

  function selectImage(image: HTMLImageElement) {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const images = Array.from(editorElement.querySelectorAll("img"));
    const index = images.indexOf(image);
    if (index < 0) return;

    setSelectedImage({
      index,
      altText: image.getAttribute("alt") ?? "",
      caption: getImageCaption(image),
    });
  }

  function getSelectedImageElement() {
    if (!editorRef.current || !selectedImage) return null;
    return editorRef.current.querySelectorAll("img").item(selectedImage.index) || null;
  }

  function buildFigure(url: string, altText: string, caption: string) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = url;
    image.alt = altText;
    figure.append(image);

    if (caption) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = caption;
      figure.append(figcaption);
    }

    return { figure, image };
  }

  function insertImage(url: string, altText: string, caption: string) {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    editorElement.focus();
    const selection = window.getSelection();
    const range = savedSelectionRef.current ?? document.createRange();

    if (!savedSelectionRef.current || !editorElement.contains(range.commonAncestorContainer)) {
      range.selectNodeContents(editorElement);
      range.collapse(false);
    } else {
      moveRangeAfterContainingBlock(range, editorElement);
    }

    const followingNode = range.startContainer.childNodes.item(range.startOffset);
    const { figure, image } = buildFigure(url, altText, caption);
    range.deleteContents();
    range.insertNode(figure);

    let caretTarget = followingNode instanceof HTMLElement ? followingNode : null;
    if (!caretTarget || !editorElement.contains(caretTarget)) {
      caretTarget = document.createElement("p");
      caretTarget.append(document.createElement("br"));
      figure.after(caretTarget);
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(caretTarget);
    nextRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(nextRange);
    savedSelectionRef.current = nextRange.cloneRange();
    emitChange();
    selectImage(image);
  }

  function replaceSelectedImage(url: string, altText: string, caption: string) {
    const image = getSelectedImageElement();
    if (!image) {
      setImageDialogError("Select the image in the article again, then retry.");
      return false;
    }

    image.setAttribute("src", url);
    image.setAttribute("alt", altText);
    let figure = getFigureForImage(image);
    if (!figure) {
      figure = document.createElement("figure");
      image.replaceWith(figure);
      figure.append(image);
    }

    const existingCaption = figure.querySelector("figcaption");
    if (caption) {
      const figcaption = existingCaption ?? document.createElement("figcaption");
      figcaption.textContent = caption;
      if (!existingCaption) figure.append(figcaption);
    } else {
      existingCaption?.remove();
    }

    emitChange();
    selectImage(image);
    return true;
  }

  function updateSelectedImageMetadata(field: "altText" | "caption", nextValue: string) {
    const image = getSelectedImageElement();
    if (!image || !selectedImage) return;

    if (field === "altText") {
      image.setAttribute("alt", nextValue);
    } else {
      let figure = getFigureForImage(image);
      if (!figure) {
        figure = document.createElement("figure");
        image.replaceWith(figure);
        figure.append(image);
      }

      const existingCaption = figure.querySelector("figcaption");
      if (nextValue) {
        const figcaption = existingCaption ?? document.createElement("figcaption");
        figcaption.textContent = nextValue;
        if (!existingCaption) figure.append(figcaption);
      } else {
        existingCaption?.remove();
      }
    }

    setSelectedImage((current) => (current ? { ...current, [field]: nextValue } : current));
    emitChange();
  }

  function removeSelectedImage() {
    const image = getSelectedImageElement();
    if (!image) return;

    const figure = getFigureForImage(image);
    (figure ?? image).remove();
    setSelectedImage(null);
    emitChange();
    onFeedback?.({ tone: "success", message: "Image removed from the article body. Save changes to keep this update." });
  }

  async function handleInlineImageUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const altText = imageAltText.trim();
    const caption = imageCaption.trim();

    if (!imageFile) {
      setImageDialogError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (!altText) {
      setImageDialogError("Alt text is required so the image is understandable to screen-reader users.");
      return;
    }

    const formData = new FormData();
    formData.set("image", imageFile);
    formData.set("usageContext", "blog_cover");
    formData.set("altText", altText);

    setIsUploadingImage(true);
    setImageDialogError("");
    onFeedback?.(null);
    try {
      const result = await uploadCmsImage(formData);
      if (!result.success) {
        setImageDialogError(result.error);
        return;
      }

      const completed =
        imageDialogMode === "replace"
          ? replaceSelectedImage(result.url, altText, caption)
          : (insertImage(result.url, altText, caption), true);
      if (!completed) return;

      if (result.asset) {
        onAssetUploaded?.(result.asset);
      }
      setImageDialogMode(null);
      resetImageDialog();
      onFeedback?.({
        tone: "success",
        message:
          imageDialogMode === "replace"
            ? "Article image replaced. Save changes to keep this update."
            : "Image uploaded and inserted. Save changes to keep its position.",
      });
    } catch {
      setImageDialogError("The image could not be uploaded. Check the connection and retry.");
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
            Place the cursor between paragraphs, then choose Add image. Select an inserted image to replace it, edit its description, or remove it.
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
          <span className="mx-1 h-9 w-px bg-[#dbe3ee]" aria-hidden="true" />
          <button
            type="button"
            onMouseDown={saveEditorSelection}
            onClick={openInsertImageDialog}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#cbd5e1] bg-white px-3 text-[12px] font-semibold text-[#334155] transition hover:border-primary hover:text-primary active:translate-y-px"
          >
            <ImagePlus className="h-4 w-4" />
            Add image
          </button>
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
            onClick={(event) => {
              const target = event.target;
              if (target instanceof HTMLImageElement) {
                selectImage(target);
              } else if (!(target instanceof HTMLElement && target.closest("figure"))) {
                setSelectedImage(null);
              }
            }}
            className={cn(
              "rich-content-editor w-full bg-white px-4 py-4 text-[14px] leading-7 text-[#273041] outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "[&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-brand-muted-border [&_blockquote]:bg-brand-soft-surface [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:text-[#475467]",
              "[&_h2]:mt-5 [&_h2]:font-heading [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:leading-8 [&_h2]:text-[#111827] [&_h3]:mt-4 [&_h3]:font-heading [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-[#111827]",
              "[&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-6",
              "[&_figure]:my-5 [&_figure]:rounded-[14px] [&_figure]:border [&_figure]:border-transparent [&_figure]:p-1 [&_figure]:transition [&_figure:has(img:hover)]:border-primary/40 [&_figcaption]:px-2 [&_figcaption]:pb-1 [&_figcaption]:pt-2 [&_figcaption]:text-center [&_figcaption]:text-[12px] [&_figcaption]:italic [&_figcaption]:text-[#64748b]",
              "[&_img]:max-h-[560px] [&_img]:w-full [&_img]:cursor-pointer [&_img]:rounded-[12px] [&_img]:object-cover",
              minHeightClassName
            )}
          />
        </div>

        {selectedImage ? (
          <div className="border-t border-[#e8edf5] bg-[#f8fafc] px-4 py-4" data-inline-image-inspector>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#273041]">Selected article image</p>
                <p className="mt-1 text-[12px] text-[#64748b]">Changes appear in the body immediately and persist when you save.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={cn(adminGhostButtonClass, "h-9 gap-2 px-3")} onClick={openReplaceImageDialog}>
                  <RefreshCw className="h-4 w-4" />
                  Replace image
                </button>
                <button type="button" className={cn(adminGhostButtonClass, "h-9 gap-2 px-3 text-[#b42318] hover:text-[#991b1b]")} onClick={removeSelectedImage}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#374151]">Alt text</span>
                <input
                  value={selectedImage.altText}
                  onChange={(event) => updateSelectedImageMetadata("altText", event.target.value)}
                  className={adminInputClass}
                  placeholder="Describe what is visible in the image"
                  required
                />
                {!selectedImage.altText.trim() ? <span className="block text-[12px] text-[#b42318]">Alt text is required before saving.</span> : null}
              </label>
              <label className="space-y-2">
                <span className="text-[13px] font-medium text-[#374151]">Caption <span className="font-normal text-[#9ca3af]">optional</span></span>
                <input
                  value={selectedImage.caption}
                  onChange={(event) => updateSelectedImageMetadata("caption", event.target.value)}
                  className={adminInputClass}
                  placeholder="Add context shown below the image"
                />
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog
        open={imageDialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeImageDialog();
        }}
      >
        <DialogContent className="border-[#e5e7eb] bg-white sm:max-w-[560px]">
          <form className="space-y-5" onSubmit={handleInlineImageUpload}>
            <DialogHeader>
              <DialogTitle className="font-heading text-[20px] text-[#111827]">
                {imageDialogMode === "replace" ? "Replace article image" : "Add image to article"}
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-6 text-[#6b7280]">
                {imageDialogMode === "replace"
                  ? "Choose a replacement file and confirm the accessible description. Its position in the article will not change."
                  : "The image will be inserted at the cursor position between the surrounding paragraphs."}
              </DialogDescription>
            </DialogHeader>

            <label className="block space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Image file</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className={cn(adminInputClass, "h-auto file:mr-4 file:rounded-[8px] file:border-0 file:bg-[#eaf7f6] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-primary")}
                disabled={isUploadingImage}
                required
              />
              <span className="block text-[12px] leading-5 text-[#6b7280]">JPG, PNG, or WebP up to 10MB.</span>
            </label>

            <label className="block space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Alt text</span>
              <textarea
                value={imageAltText}
                onChange={(event) => setImageAltText(event.target.value)}
                className={adminTextareaClass}
                placeholder="Describe the image for someone who cannot see it"
                maxLength={180}
                disabled={isUploadingImage}
                required
              />
              <span className="block text-[12px] leading-5 text-[#6b7280]">Describe the meaningful visual content; do not repeat the caption.</span>
            </label>

            <label className="block space-y-2">
              <span className="text-[13px] font-medium text-[#374151]">Caption <span className="font-normal text-[#9ca3af]">optional</span></span>
              <input
                value={imageCaption}
                onChange={(event) => setImageCaption(event.target.value)}
                className={adminInputClass}
                placeholder="Context or credit shown beneath the image"
                maxLength={300}
                disabled={isUploadingImage}
              />
            </label>

            {imageDialogError ? (
              <p role="alert" className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[13px] text-[#991b1b]">
                {imageDialogError}
              </p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <button type="button" className={adminGhostButtonClass} onClick={closeImageDialog} disabled={isUploadingImage}>
                Cancel
              </button>
              <button type="submit" className={cn(adminPrimaryButtonClass, "gap-2")} disabled={isUploadingImage}>
                <Upload className="h-4 w-4" />
                {isUploadingImage ? "Uploading..." : imageDialogMode === "replace" ? "Replace image" : "Upload and insert"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
