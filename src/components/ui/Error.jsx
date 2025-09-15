import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Error = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading the data. Please try again.", 
  onRetry,
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-4", className)}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="AlertTriangle" className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="w-full"
            >
              <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Error;