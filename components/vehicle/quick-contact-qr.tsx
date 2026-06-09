"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ExternalLink } from "lucide-react";

interface QuickContactQrProps {
  value: string;
  label: string;
}

export function QuickContactQr({ value, label }: QuickContactQrProps) {
  const [result, setResult] = useState<{
    value: string;
    svg: string | null;
    hasError: boolean;
  }>({
    value,
    svg: null,
    hasError: false,
  });

  useEffect(() => {
    let active = true;

    void QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: 176,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((nextSvg) => {
        if (active) {
          setResult({ value, svg: nextSvg, hasError: false });
        }
      })
      .catch(() => {
        if (active) {
          setResult({ value, svg: null, hasError: true });
        }
      });

    return () => {
      active = false;
    };
  }, [value]);

  const isCurrent = result.value === value;
  const svg = isCurrent ? result.svg : null;
  const hasError = isCurrent && result.hasError;

  if (hasError) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="mx-auto flex h-52 w-52 flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
      >
        <ExternalLink className="h-5 w-5 text-primary" />
        Open contact link
      </a>
    );
  }

  return (
    <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {svg ? (
        <div
          aria-label={label}
          className="h-44 w-44 [&_svg]:h-full [&_svg]:w-full"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="h-44 w-44 animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
      )}
    </div>
  );
}
