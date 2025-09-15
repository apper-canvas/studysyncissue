import { Card, CardContent } from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const Loading = ({ type = "page", className }) => {
  if (type === "page") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-4/5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-3/5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-5 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default Loading;