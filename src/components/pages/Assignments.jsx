import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { toast } from "react-toastify";

import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    priority: "medium",
    maxPoints: "",
    type: "assignment",
    submissionFormat: ""
  });

  const priorityOptions = [
    { value: "high", label: "High Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "low", label: "Low Priority" }
  ];

  const typeOptions = [
    { value: "assignment", label: "Assignment" },
    { value: "homework", label: "Homework" },
    { value: "quiz", label: "Quiz" },
    { value: "exam", label: "Exam" },
    { value: "project", label: "Project" },
    { value: "lab", label: "Lab Report" },
    { value: "essay", label: "Essay" }
  ];

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
      setFilteredAssignments(assignmentsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = assignments.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (filterBy) {
        case "completed":
          return assignment.completed;
        case "pending":
          return !assignment.completed && !isPast(parseISO(assignment.dueDate));
        case "overdue":
          return !assignment.completed && isPast(parseISO(assignment.dueDate));
        case "high":
          return assignment.priority === "high";
        case "medium":
          return assignment.priority === "medium";
        case "low":
          return assignment.priority === "low";
        default:
          return true;
      }
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "title":
          return a.title.localeCompare(b.title);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "course":
          const courseA = getCourseById(a.courseId)?.name || "";
          const courseB = getCourseById(b.courseId)?.name || "";
          return courseA.localeCompare(courseB);
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, filterBy, sortBy]);

  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const assignmentData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        maxPoints: parseInt(formData.maxPoints) || 100
      };

      if (editingAssignment) {
        await assignmentService.update(editingAssignment.Id, assignmentData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentService.create(assignmentData);
        toast.success("Assignment added successfully!");
      }

      resetForm();
      loadData();
    } catch (err) {
      toast.error(editingAssignment ? "Failed to update assignment" : "Failed to add assignment");
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId.toString(),
      dueDate: assignment.dueDate.slice(0, 16), // Format for datetime-local input
      priority: assignment.priority,
      maxPoints: assignment.maxPoints.toString(),
      type: assignment.type,
      submissionFormat: assignment.submissionFormat || ""
    });
    setShowAddForm(true);
  };

  const handleToggleComplete = async (assignmentId) => {
    try {
      await assignmentService.markComplete(assignmentId);
      toast.success("Assignment marked as complete!");
      loadData();
    } catch (err) {
      toast.error("Failed to update assignment");
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await assignmentService.delete(assignmentId);
      toast.success("Assignment deleted successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete assignment");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      dueDate: "",
      priority: "medium",
      maxPoints: "",
      type: "assignment",
      submissionFormat: ""
    });
    setEditingAssignment(null);
    setShowAddForm(false);
  };

  const getDueDateStatus = (dueDate, completed) => {
    if (completed) {
      return { variant: "completed", text: "Completed" };
    }
    
    const due = parseISO(dueDate);
    if (isPast(due)) {
      return { variant: "overdue", text: "Overdue" };
    } else if (isToday(due)) {
      return { variant: "danger", text: "Due Today" };
    } else if (isTomorrow(due)) {
      return { variant: "warning", text: "Due Tomorrow" };
    } else {
      return { variant: "secondary", text: `Due ${format(due, "MMM d")}` };
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-gray-600 mt-1">Track your assignments, deadlines, and progress.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={courses.length === 0}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search assignments..."
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-40"
              >
                <option value="all">All Assignments</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
                <option value="priority">Sort by Priority</option>
                <option value="course">Sort by Course</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ApperIcon name="FileText" className="w-5 h-5 mr-2 text-primary-600" />
                    {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <ApperIcon name="X" className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Assignment Title" required>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Programming Assignment 1"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Course" required>
                      <Select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.Id} value={course.Id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Assignment description and requirements..."
                      rows={3}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Due Date" required>
                      <Input
                        type="datetime-local"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required
                      />
                    </FormField>
                    
                    <FormField label="Priority">
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    
                    <FormField label="Type">
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        {typeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Max Points">
                      <Input
                        type="number"
                        name="maxPoints"
                        value={formData.maxPoints}
                        onChange={handleInputChange}
                        placeholder="100"
                        min="1"
                      />
                    </FormField>
                    
                    <FormField label="Submission Format">
                      <Input
                        name="submissionFormat"
                        value={formData.submissionFormat}
                        onChange={handleInputChange}
                        placeholder="e.g., PDF upload, Online submission"
                      />
                    </FormField>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit">
                      <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                      {editingAssignment ? "Update Assignment" : "Add Assignment"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Empty
          title="No assignments found"
          message={
            courses.length === 0 
              ? "You need to add courses first before creating assignments."
              : searchTerm || filterBy !== "all"
              ? "No assignments match your current filters."
              : "You haven't added any assignments yet. Start by adding your first assignment!"
          }
          actionLabel={
            courses.length === 0 
              ? "Add Your First Course"
              : (searchTerm || filterBy !== "all") 
              ? undefined 
              : "Add Your First Assignment"
          }
          onAction={
            courses.length === 0 
              ? () => window.location.href = "/courses"
              : (searchTerm || filterBy !== "all") 
              ? undefined 
              : () => setShowAddForm(true)
          }
          icon="FileText"
        />
      ) : (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredAssignments.map((assignment, index) => {
            const course = getCourseById(assignment.courseId);
            const dueDateStatus = getDueDateStatus(assignment.dueDate, assignment.completed);
            
            return (
              <motion.div
                key={assignment.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${assignment.completed ? "opacity-75" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <button
                          onClick={() => handleToggleComplete(assignment.Id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            assignment.completed 
                              ? "bg-success-500 border-success-500 text-white" 
                              : "border-gray-300 hover:border-primary-500"
                          }`}
                        >
                          {assignment.completed && (
                            <ApperIcon name="Check" className="w-3 h-3" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-semibold ${assignment.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                              {assignment.title}
                            </h3>
                            <Badge variant={assignment.priority}>
                              {assignment.priority}
                            </Badge>
                            <Badge variant={dueDateStatus.variant}>
                              {dueDateStatus.text}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: course?.color || "#6B7280" }}
                              ></div>
                              <span>{course?.name || "Unknown Course"}</span>
                            </div>
                            <div className="flex items-center">
                              <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                              {format(parseISO(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                            <div className="flex items-center">
                              <ApperIcon name="Award" className="w-4 h-4 mr-1" />
                              {assignment.maxPoints} points
                            </div>
                          </div>
                          
                          {assignment.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <Badge variant="secondary" className="text-xs">
                                {assignment.type}
                              </Badge>
                              {assignment.submissionFormat && (
                                <span>{assignment.submissionFormat}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(assignment)}>
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.Id)}>
                          <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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

export default Assignments;