import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SocialAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
}

export function SocialAuthButton({
  label,
  icon,
  className,
  ...props
}: SocialAuthButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#EDEDED] px-4 text-sm font-medium text-[#696665] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.8 2.9l2.9 2.2c1.7-1.6 2.7-4 2.7-6.8 0-.6-.1-1.2-.2-1.8H12z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.4 0 4.4-.8 5.9-2.2l-2.9-2.2c-.8.6-1.9 1-3 1-2.3 0-4.3-1.6-5-3.8H4v2.4c1.5 2.9 4.5 4.8 8 4.8z"
      />
      <path
        fill="#4A90E2"
        d="M7 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V8.3H4C3.4 9.6 3 11 3 12.5s.4 2.9 1 4.2L7 14.3z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.9c1.3 0 2.5.5 3.4 1.3l2.5-2.5C16.4 4.3 14.4 3.5 12 3.5c-3.5 0-6.5 2-8 4.8L7 10.7c.7-2.2 2.7-3.8 5-3.8z"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12"
      />
    </svg>
  );
}
