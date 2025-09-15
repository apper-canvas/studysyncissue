import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  className,
  gradient = "from-primary-500 to-primary-600"
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className={cn(
                "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                gradient
              )}>
                {value}
              </h3>
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  trend === "up" ? "text-success-600" : 
                  trend === "down" ? "text-red-600" : "text-gray-500"
                )}>
                  <ApperIcon 
                    name={trend === "up" ? "TrendingUp" : 
                          trend === "down" ? "TrendingDown" : "Minus"} 
                    className="w-3 h-3 mr-1" 
                  />
                  {trendValue}
                </div>
              )}
            </div>
          </div>
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r",
            gradient
          )}>
            <ApperIcon name={icon} className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;