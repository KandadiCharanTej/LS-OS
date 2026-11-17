import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C65D2E]/20 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-[#C65D2E] text-[#FAF9F6] hover:bg-[#A64B24] active:bg-[#8D3E1C] shadow-[0_4px_14px_rgba(198,93,46,0.25)] rounded-full",
      secondary:
        "bg-[#071525] text-[#FAF9F6] hover:bg-[#0D2137] active:bg-[#050E18] rounded-full",
      outline:
        "bg-white border border-[#071525]/10 text-[#071525] hover:border-[#C65D2E]/50 hover:text-[#C65D2E] hover:bg-[#FAF9F6] rounded-full",
      ghost:
        "bg-transparent text-[#071525] hover:bg-[#071525]/5 hover:text-[#071525] rounded-xl",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 rounded-full",
      dark:
        "bg-[#0B1B2B] text-white hover:bg-[#071525] border border-white/10 rounded-xl",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-2.5 gap-2.5 h-12",
      icon: "p-2 w-9 h-9 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

