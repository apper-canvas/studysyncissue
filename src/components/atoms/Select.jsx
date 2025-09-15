import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  children,
  ...props 
}, ref) => {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
export default Select;