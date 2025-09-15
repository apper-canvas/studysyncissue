import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import { gradeService } from "@/services/api/gradeService";

import StatCard from "@/components/molecules/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/molecules/ProgressBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [gpa, setGPA] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const [coursesData, assignmentsData, upcomingData, overdueData] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        assignmentService.getUpcoming(5),
        assignmentService.getOverdue()
      ]);

      setCourses(coursesData);
      setAssignments(assignmentsData);
      setUpcomingAssignments(upcomingData);
      setOverdue(overdueData);

      // Calculate GPA
      const calculatedGPA = await gradeService.calculateGPA();
      setGPA(calculatedGPA);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleMarkComplete = async (assignmentId) => {
    try {
      await assignmentService.markComplete(assignmentId);
      toast.success("Assignment marked as complete!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed to update assignment");
    }
  };

  const getDueDateInfo = (dueDate) => {
    const due = new Date(dueDate);
    if (isToday(due)) {
      return { text: "Due Today", color: "danger" };
    } else if (isTomorrow(due)) {
      return { text: "Due Tomorrow", color: "warning" };
    } else if (due <= addDays(new Date(), 7)) {
      return { text: `Due ${format(due, "MMM d")}`, color: "warning" };
    } else {
      return { text: `Due ${format(due, "MMM d")}`, color: "secondary" };
    }
  };

  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

  const completedAssignments = assignments.filter(a => a.completed).length;
  const totalAssignments = assignments.length;
  const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your academic progress.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatCard
          title="Current GPA"
          value={gpa.toFixed(2)}
          icon="Award"
          gradient="from-primary-500 to-primary-600"
          trend={gpa >= 3.5 ? "up" : gpa >= 3.0 ? "neutral" : "down"}
          trendValue={gpa >= 3.5 ? "Excellent" : gpa >= 3.0 ? "Good" : "Needs Improvement"}
        />
        <StatCard
          title="Total Courses"
          value={courses.length}
          icon="BookOpen"
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Assignments"
          value={`${completedAssignments}/${totalAssignments}`}
          icon="FileText"
          gradient="from-warning-500 to-warning-600"
          trend={completionRate >= 80 ? "up" : "down"}
          trendValue={`${Math.round(completionRate)}% Complete`}
        />
        <StatCard
          title="Overdue"
          value={overdue.length}
          icon="Clock"
          gradient={overdue.length > 0 ? "from-red-500 to-red-600" : "from-success-500 to-success-600"}
          trend={overdue.length === 0 ? "up" : "down"}
          trendValue={overdue.length === 0 ? "All caught up!" : "Need attention"}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <ApperIcon name="Calendar" className="w-5 h-5 mr-2 text-primary-600" />
                Upcoming Assignments
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/assignments")}
              >
                View All
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="CheckCircle" className="w-6 h-6 text-success-600" />
                  </div>
                  <p className="text-gray-600">All caught up! No upcoming assignments.</p>
                </div>
              ) : (
                upcomingAssignments.map((assignment) => {
                  const course = getCourseById(assignment.courseId);
                  const dueInfo = getDueDateInfo(assignment.dueDate);
                  
                  return (
                    <motion.div
                      key={assignment.Id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: course?.color || "#6B7280" }}
                        ></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{course?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={dueInfo.color}>
                          {dueInfo.text}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkComplete(assignment.Id)}
                        >
                          <ApperIcon name="Check" className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="TrendingUp" className="w-5 h-5 mr-2 text-primary-600" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Assignment Completion</span>
                  <span className="text-sm text-gray-600">{completedAssignments}/{totalAssignments}</span>
                </div>
                <ProgressBar 
                  value={completedAssignments} 
                  max={totalAssignments} 
                  variant={completionRate >= 80 ? "success" : completionRate >= 60 ? "warning" : "danger"}
                  showLabel={false}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{completedAssignments}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">{upcomingAssignments.length}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
                  <div className="text-sm text-gray-600">Overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Recent Courses */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="Zap" className="w-5 h-5 mr-2 text-primary-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/assignments")}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Assignment
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/courses")}
              >
                <ApperIcon name="BookOpen" className="w-4 h-4 mr-2" />
                Add Course
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/grades")}
              >
                <ApperIcon name="Award" className="w-4 h-4 mr-2" />
                Update Grades
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/calendar")}
              >
                <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="BookOpen" className="w-5 h-5 mr-2 text-primary-600" />
                Your Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ApperIcon name="BookOpen" className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">No courses added yet</p>
                  <Button size="sm" onClick={() => navigate("/courses")}>
                    <ApperIcon name="Plus" className="w-3 h-3 mr-1" />
                    Add Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 4).map((course) => (
                    <motion.div
                      key={course.Id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate(`/courses/${course.Id}`)}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: course.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {course.instructor}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.credits} cr
                      </Badge>
                    </motion.div>
                  ))}
                  {courses.length > 4 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate("/courses")}
                    >
                      View All Courses
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;