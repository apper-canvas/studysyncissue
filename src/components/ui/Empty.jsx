import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "No data found", 
  message = "There's nothing to show here yet. Get started by adding some content.", 
  actionLabel,
  onAction,
  icon = "FileText",
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-4", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name={icon} className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          {actionLabel && onAction && (
            <Button 
              onClick={onAction}
              className="w-full"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Empty;