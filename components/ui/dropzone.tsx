"use client";

import * as React from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  className?: string;
  files?: File[];
  onFilesAdded: (files: File[]) => void;
  onRemove?: (file: File) => void;
  showFiles?: boolean;
  accept?: string; // e.g. "image/*"
  maxSize?: number; // in bytes
  multiple?: boolean;
}

function isPreviewableImage(file: File) {
  return typeof file.type === "string" && file.type.startsWith("image/");
}

function getFileName(file: File, fallbackIndex: number) {
  return file?.name || `File ${fallbackIndex + 1}`;
}

function getFileSizeLabel(file: File) {
  return typeof file?.size === "number" && Number.isFinite(file.size)
    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
    : "Saved file";
}

export function Dropzone({
  className,
  files,
  onFilesAdded,
  onRemove,
  showFiles = true,
  accept,
  maxSize,
  multiple = true,
}: DropzoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const validateFile = (file: File) => {
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileName = file.name;
      // Simple check for mime types or extensions
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const mainType = type.split("/")[0];
          return fileType.startsWith(mainType);
        }
        if (type.startsWith(".")) {
          return fileName.toLowerCase().endsWith(type.toLowerCase());
        }
        return fileType === type;
      });

      if (!isAccepted) return false;
    }

    if (maxSize && file.size > maxSize) return false;

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        if (multiple) {
          onFilesAdded(validFiles);
        } else {
          onFilesAdded([validFiles[0]]);
        }
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        if (multiple) {
          onFilesAdded(validFiles);
        } else {
          onFilesAdded([validFiles[0]]);
        }
      }
    }
    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10",
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
            <UploadCloud className="h-6 w-6 text-gray-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-primary hover:underline">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept ? accept.replace(/,/g, ", ") : "Any file"} (max {maxSize ? `${(maxSize / 1024 / 1024).toFixed(0)}MB` : "size unconstrained"})
            </p>
          </div>
        </div>
      </div>

      {showFiles && files && files.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, index) => (
            <li
              key={`${getFileName(file, index)}-${index}`}
              className="relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                {isPreviewableImage(file) ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={getFileName(file, index)}
                    className="h-full w-full rounded-md object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                ) : (
                  <File className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-700">
                  {getFileName(file, index)}
                </p>
                <p className="text-xs text-gray-500">
                  {getFileSizeLabel(file)}
                </p>
              </div>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
