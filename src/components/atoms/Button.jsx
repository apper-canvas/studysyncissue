import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600",
    ghost: "text-primary-600 hover:bg-primary-50",
    success: "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-lg shadow-success-500/25",
    warning: "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-lg shadow-warning-500/25",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;