import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from "date-fns";

import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { cn } from "@/utils/cn";

const Calendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ]);
      
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => 
      isSameDay(parseISO(assignment.due_date_c), date)
    );
  };

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedDateAssignments = getAssignmentsForDate(selectedDate);

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const calendarDays = getCalendarDays();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-gray-600 mt-1">View your assignments and important dates.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ApperIcon name="ChevronRight" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers */}
                {weekdays.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map(day => {
                  const dayAssignments = getAssignmentsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[120px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50",
                        isCurrentMonth ? "bg-white" : "bg-gray-50",
                        isTodayDate && "bg-primary-50 border-primary-200",
                        isSelected && "ring-2 ring-primary-500"
                      )}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        !isCurrentMonth && "text-gray-400",
                        isTodayDate && "text-primary-700 font-bold"
                      )}>
                        {format(day, "d")}
                      </div>
                      
                      <div className="space-y-1">
                        {dayAssignments.slice(0, 3).map(assignment => {
                          const course = getCourseById(assignment.courseId);
                          return (
                            <div
                              key={assignment.Id}
                              className="text-xs p-1 rounded text-white text-center truncate"
                              style={{ backgroundColor: course?.color || "#6B7280" }}
                              title={`${assignment.title} - ${course?.name}`}
                            >
                              {assignment.title}
                            </div>
                          );
                        })}
                        {dayAssignments.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayAssignments.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="Calendar" className="w-5 h-5 mr-2 text-primary-600" />
                {format(selectedDate, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAssignments.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="Calendar" className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-600 text-sm">No assignments due on this date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateAssignments.map(assignment => {
                    const course = getCourseById(assignment.courseId);
                    
                    return (
                      <motion.div
                        key={assignment.Id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
style={{ backgroundColor: course?.color_c || course?.color || "#6B7280" }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {assignment.title_c || assignment.Name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                              {course?.name_c || course?.Name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={assignment.priority} className="text-xs">
                                {assignment.priority}
                              </Badge>
                              <Badge variant={assignment.completed ? "completed" : "pending"} className="text-xs">
                                {assignment.completed ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
                              {format(parseISO(assignment.dueDate), "h:mm a")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="BarChart3" className="w-5 h-5 mr-2 text-primary-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Assignments</span>
                  <span className="font-semibold">{assignments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-success-600">
{assignments.filter(a => a.completed_c).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-warning-600">
                    {assignments.filter(a => !a.completed_c && !isPast(parseISO(a.due_date_c))).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="font-semibold text-red-600">
                    {assignments.filter(a => !a.completed_c && isPast(parseISO(a.due_date_c))).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="Info" className="w-5 h-5 mr-2 text-primary-600" />
                Course Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
{courses.map(course => (
                  <div key={course.Id} className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: course.color_c || course.color || '#6B7280' }}
                    ></div>
                    <span className="text-sm text-gray-700 truncate">
                      {course.code}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function (should be imported from date-fns but added here for completeness)
const isPast = (date) => {
  return date < new Date();
};

export default Calendar;