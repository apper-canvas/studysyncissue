import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { gradeService } from "@/services/api/gradeService";
import { courseService } from "@/services/api/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Courses from "@/components/pages/Courses";
import ProgressBar from "@/components/molecules/ProgressBar";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";


const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [gpa, setGPA] = useState(0);
  const [editingGrade, setEditingGrade] = useState(null);

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [gradesData, coursesData] = await Promise.all([
        gradeService.getAll(),
        courseService.getAll()
      ]);
      
      setGrades(gradesData);
      setCourses(coursesData);

      // Calculate GPA
      const calculatedGPA = await gradeService.calculateGPA();
      setGPA(calculatedGPA);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load grades");
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

const calculateCourseGrade = (courseId) => {
    const courseGrades = grades.filter(g => (g.course_id_c?.Id || g.course_id_c) === courseId);
    let totalWeightedScore = 0;
    let totalWeight = 0;

    courseGrades.forEach(category => {
      const completedAssignments = category.assignments?.filter(a => a.grade !== null) || [];
      if (completedAssignments.length > 0) {
        const categoryAverage = completedAssignments.reduce((sum, a) => sum + (a.grade / a.maxPoints * 100), 0) / completedAssignments.length;
        totalWeightedScore += categoryAverage * (category.weight_c || 0);
        totalWeight += (category.weight_c || 0);
      }
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    return "F";
  };

  const handleGradeUpdate = async (categoryId, assignmentId, newGrade) => {
    try {
      await gradeService.updateAssignmentGrade(categoryId, assignmentId, parseFloat(newGrade));
      toast.success("Grade updated successfully!");
      setEditingGrade(null);
      loadData();
    } catch (err) {
      toast.error("Failed to update grade");
    }
  };

const filteredGrades = selectedCourse === "all" 
    ? grades 
    : grades.filter(g => (g.course_id_c?.Id || g.course_id_c) === parseInt(selectedCourse));
  const courseStats = courses.map(course => {
    const courseGrade = calculateCourseGrade(course.Id);
    return {
      course,
      grade: courseGrade,
      letterGrade: getLetterGrade(courseGrade)
    };
  });

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (courses.length === 0) {
    return (
      <Empty
        title="No courses found"
        message="You need to add courses first before managing grades."
        actionLabel="Add Your First Course"
        onAction={() => window.location.href = "/courses"}
        icon="Award"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Grades
        </h1>
        <p className="text-gray-600 mt-1">Track your academic performance and calculate your GPA.</p>
      </div>

      {/* GPA Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatCard
          title="Overall GPA"
          value={gpa.toFixed(2)}
          icon="Award"
          gradient="from-primary-500 to-primary-600"
          trend={gpa >= 3.5 ? "up" : gpa >= 3.0 ? "neutral" : "down"}
          trendValue={gpa >= 3.5 ? "Excellent" : gpa >= 3.0 ? "Good" : "Needs Improvement"}
        />
        <StatCard
          title="Courses"
          value={courses.length}
          icon="BookOpen"
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Avg Course Grade"
          value={`${courseStats.length > 0 ? (courseStats.reduce((sum, stat) => sum + stat.grade, 0) / courseStats.length).toFixed(1) : 0}%`}
          icon="TrendingUp"
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          title="Best Course"
          value={courseStats.length > 0 ? Math.max(...courseStats.map(stat => stat.grade)).toFixed(1) + "%" : "N/A"}
          icon="Star"
          gradient="from-purple-500 to-purple-600"
        />
      </motion.div>

      {/* Course Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Filter" className="w-5 h-5 text-gray-500" />
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-64"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
<option key={course.Id} value={course.Id}>
                    {course.code_c || 'N/A'} - {course.name_c || course.Name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {courseStats.map(({ course, grade, letterGrade }) => (
                <Badge
                  key={course.Id}
                  variant={grade >= 90 ? "success" : grade >= 80 ? "warning" : grade >= 70 ? "secondary" : "danger"}
                  className="text-sm"
                >
                  {course.code}: {letterGrade}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grades */}
      {filteredGrades.length === 0 ? (
        <Empty
          title="No grades found"
          message="No grade data available for the selected course filter."
          icon="Award"
        />
      ) : (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Group grades by course */}
          {Object.entries(
            filteredGrades.reduce((acc, grade) => {
const courseId = grade.course_id_c?.Id || grade.course_id_c;
              if (!acc[courseId]) {
                acc[courseId] = [];
              }
              acc[courseId].push(grade);
              return acc;
            }, {})
          ).map(([courseId, courseGrades]) => {
            const course = getCourseById(parseInt(courseId));
            const courseGrade = calculateCourseGrade(parseInt(courseId));
            const letterGrade = getLetterGrade(courseGrade);

            return (
              <motion.div
                key={courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
<div 
                    className="h-1 w-full"
                    style={{ backgroundColor: course?.color_c || course?.color || "#6B7280" }}
                  ></div>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: course?.color_c || course?.color || "#6B7280" }}
                          ></div>
                          {course?.name_c || course?.Name || "Unknown Course"}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          {course?.code_c || 'N/A'} • {course?.instructor_c || 'No Instructor'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {courseGrade.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Course Grade</div>
                        </div>
                        <div className="text-center">
                          <Badge
                            variant={courseGrade >= 90 ? "success" : courseGrade >= 80 ? "warning" : courseGrade >= 70 ? "secondary" : "danger"}
                            className="text-lg font-bold px-3 py-1"
                          >
                            {letterGrade}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">Letter Grade</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
{courseGrades.map(category => (
                        <div key={category.Id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {category.category_name_c || category.Name}
                            </h4>
                            <Badge variant="secondary">
                              {category.weight}% of grade
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
{(category.assignments || []).map(assignment => {
                              const percentage = assignment.grade !== null ? (assignment.grade / assignment.maxPoints * 100) : null;
                              
                              return (
                                <div key={assignment.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">
                                        {assignment.name}
                                      </span>
                                      <div className="flex items-center space-x-4">
                                        {assignment.grade !== null ? (
                                          <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-gray-900">
                                              {assignment.grade}/{assignment.maxPoints}
                                            </span>
                                            <Badge
                                              variant={percentage >= 90 ? "success" : percentage >= 80 ? "warning" : percentage >= 70 ? "secondary" : "danger"}
                                            >
                                              {percentage.toFixed(1)}%
                                            </Badge>
                                          </div>
                                        ) : (
                                          <div className="flex items-center space-x-2">
                                            {editingGrade === assignment.Id ? (
                                              <div className="flex items-center space-x-2">
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  max={assignment.maxPoints}
                                                  className="w-20 h-8 text-sm"
                                                  placeholder="Grade"
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                      handleGradeUpdate(category.Id, assignment.Id, e.target.value);
                                                    } else if (e.key === "Escape") {
                                                      setEditingGrade(null);
                                                    }
                                                  }}
                                                  autoFocus
                                                />
                                                <span className="text-sm text-gray-600">
                                                  /{assignment.maxPoints}
                                                </span>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => setEditingGrade(null)}
                                                >
                                                  <ApperIcon name="X" className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ) : (
                                              <>
                                                <Badge variant="secondary">
                                                  Not Graded
                                                </Badge>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => setEditingGrade(assignment.Id)}
                                                >
                                                  <ApperIcon name="Edit" className="w-3 h-3" />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Category Progress */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Category Average
                              </span>
<span className="text-sm text-gray-600">
{(category.assignments || []).filter(a => a.grade !== null).length} of {(category.assignments || []).length} graded
                              </span>
                            </div>
                            <ProgressBar
                              value={(category.assignments || []).filter(a => a.grade !== null).length}
                              max={(category.assignments || []).length}
                              variant="primary"
                              showLabel={false}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Grades;