import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { courseService } from "@/services/api/courseService";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    schedule: "",
    credits: "",
    color: "#3B82F6",
    semester: "Fall 2024",
    description: ""
  });

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#059669", label: "Green" },
    { value: "#DC2626", label: "Red" },
    { value: "#7C3AED", label: "Purple" },
    { value: "#F59E0B", label: "Amber" },
    { value: "#EC4899", label: "Pink" },
    { value: "#06B6D4", label: "Cyan" },
    { value: "#84CC16", label: "Lime" }
  ];

  const loadCourses = async () => {
    try {
      setError("");
      setLoading(true);
      const coursesData = await courseService.getAll();
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    let filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "code":
          return a.code.localeCompare(b.code);
        case "instructor":
          return a.instructor.localeCompare(b.instructor);
        case "credits":
          return b.credits - a.credits;
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, sortBy]);

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
      const courseData = {
        ...formData,
        credits: parseInt(formData.credits)
      };

      if (editingCourse) {
        await courseService.update(editingCourse.Id, courseData);
        toast.success("Course updated successfully!");
      } else {
        await courseService.create(courseData);
        toast.success("Course added successfully!");
      }

      resetForm();
      loadCourses();
    } catch (err) {
      toast.error(editingCourse ? "Failed to update course" : "Failed to add course");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      schedule: course.schedule,
      credits: course.credits.toString(),
      color: course.color,
      semester: course.semester,
      description: course.description || ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await courseService.delete(courseId);
      toast.success("Course deleted successfully!");
      loadCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      instructor: "",
      schedule: "",
      credits: "",
      color: "#3B82F6",
      semester: "Fall 2024",
      description: ""
    });
    setEditingCourse(null);
    setShowAddForm(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCourses} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Courses
          </h1>
          <p className="text-gray-600 mt-1">Manage your enrolled courses and academic schedule.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search courses, codes, or instructors..."
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="code">Sort by Code</option>
                <option value="instructor">Sort by Instructor</option>
                <option value="credits">Sort by Credits</option>
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
                    <ApperIcon name="BookOpen" className="w-5 h-5 mr-2 text-primary-600" />
                    {editingCourse ? "Edit Course" : "Add New Course"}
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <ApperIcon name="X" className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Course Name" required>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Introduction to Computer Science"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Course Code" required>
                      <Input
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g., CS101"
                        required
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Instructor" required>
                      <Input
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        placeholder="e.g., Dr. Sarah Johnson"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Schedule" required>
                      <Input
                        name="schedule"
                        value={formData.schedule}
                        onChange={handleInputChange}
                        placeholder="e.g., MWF 10:00-11:00 AM"
                        required
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Credits" required>
                      <Input
                        type="number"
                        name="credits"
                        value={formData.credits}
                        onChange={handleInputChange}
                        min="1"
                        max="6"
                        required
                      />
                    </FormField>
                    
                    <FormField label="Color">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-300"
                          style={{ backgroundColor: formData.color }}
                        ></div>
                        <Select
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        >
                          {colorOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </FormField>
                    
                    <FormField label="Semester" required>
                      <Select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Summer 2025">Summer 2025</option>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the course"
                    />
                  </FormField>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit">
                      <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                      {editingCourse ? "Update Course" : "Add Course"}
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

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Empty
          title="No courses found"
          message={searchTerm ? "No courses match your search criteria." : "You haven't added any courses yet. Start by adding your first course!"}
          actionLabel={searchTerm ? undefined : "Add Your First Course"}
          onAction={searchTerm ? undefined : () => setShowAddForm(true)}
          icon="BookOpen"
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div 
                  className="h-2 w-full"
                  style={{ backgroundColor: course.color }}
                ></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {course.code}
                      </Badge>
                      <CardTitle className="text-lg leading-tight mb-1">
                        {course.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {course.instructor}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course.Id)}>
                        <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                      {course.schedule}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Award" className="w-4 h-4 mr-2" />
                        {course.credits} Credit{course.credits !== 1 ? "s" : ""}
                      </div>
                      <Badge variant="secondary">
                        {course.semester}
                      </Badge>
                    </div>
                    
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Courses;