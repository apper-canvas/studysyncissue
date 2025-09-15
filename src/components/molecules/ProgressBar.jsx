import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  className, 
  variant = "primary",
  showLabel = true 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variants = {
    primary: "from-primary-500 to-primary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    danger: "from-red-500 to-red-600"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full bg-gradient-to-r transition-all duration-300",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;