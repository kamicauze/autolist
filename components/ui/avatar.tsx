import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex items-center justify-center overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

function Avatar({
  className,
  src,
  alt = "Avatar",
  size,
  fallback,
  ...props
}: AvatarProps) {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = fallback || getInitials(alt);

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={size === "sm" ? "32px" : size === "lg" ? "56px" : "40px"}
        />
      ) : (
        <span className={cn("font-medium text-muted-foreground", textSizes[size || "md"])}>
          {initials}
        </span>
      )}
    </div>
  );
}

export { Avatar, avatarVariants };
