import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary-100 text-primary-800 border-primary-200",
    success: "bg-success-100 text-success-800 border-success-200",
    warning: "bg-warning-100 text-warning-800 border-warning-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-warning-100 text-warning-800 border-warning-200",
    low: "bg-success-100 text-success-800 border-success-200",
    completed: "bg-success-100 text-success-800 border-success-200",
    pending: "bg-warning-100 text-warning-800 border-warning-200",
    overdue: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";
export default Badge;