export const gradeService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_name_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "assignments_c"}}
        ]
      };

      const response = await apperClient.fetchRecords('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Process assignments_c MultilineText field to parse JSON
      const processedData = (response.data || []).map(grade => {
        try {
          grade.assignments = grade.assignments_c ? JSON.parse(grade.assignments_c) : [];
        } catch (e) {
          console.error("Error parsing assignments data:", e);
          grade.assignments = [];
        }
        return grade;
      });

      return processedData;
    } catch (error) {
      console.error("Error fetching grades:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByCourse(courseId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_name_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "assignments_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      };

      const response = await apperClient.fetchRecords('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Process assignments_c MultilineText field to parse JSON
      const processedData = (response.data || []).map(grade => {
        try {
          grade.assignments = grade.assignments_c ? JSON.parse(grade.assignments_c) : [];
        } catch (e) {
          console.error("Error parsing assignments data:", e);
          grade.assignments = [];
        }
        return grade;
      });

      return processedData;
    } catch (error) {
      console.error("Error fetching grades by course:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "course_id_c"}},
          {"field": {"Name": "category_name_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "assignments_c"}}
        ]
      };

      const response = await apperClient.getRecordById('grade_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Grade category not found");
      }
      
      // Process assignments_c MultilineText field
      try {
        response.data.assignments = response.data.assignments_c ? JSON.parse(response.data.assignments_c) : [];
      } catch (e) {
        console.error("Error parsing assignments data:", e);
        response.data.assignments = [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error?.response?.data?.message || error);
      throw new Error("Grade category not found");
    }
  },

  async calculateGPA(courseIds = null) {
    try {
      const grades = await this.getAll();
      
      const relevantGrades = courseIds 
        ? grades.filter(g => courseIds.includes(g.course_id_c?.Id || g.course_id_c))
        : grades;

      const courseGrades = {};
      
      // Calculate weighted average for each course
      relevantGrades.forEach(category => {
        const courseId = category.course_id_c?.Id || category.course_id_c;
        if (!courseGrades[courseId]) {
          courseGrades[courseId] = {
            totalWeightedPoints: 0,
            totalWeight: 0,
            credits: 0
          };
        }

        const completedAssignments = category.assignments.filter(a => a.grade !== null);
        if (completedAssignments.length > 0) {
          const categoryAverage = completedAssignments.reduce((sum, a) => sum + (a.grade / a.maxPoints), 0) / completedAssignments.length;
          courseGrades[courseId].totalWeightedPoints += categoryAverage * category.weight_c;
          courseGrades[courseId].totalWeight += category.weight_c;
        }
      });

      // Calculate overall GPA
      let totalQualityPoints = 0;
      let totalCredits = 0;
      
      Object.entries(courseGrades).forEach(([courseId, data]) => {
        if (data.totalWeight > 0) {
          const coursePercentage = data.totalWeightedPoints / data.totalWeight;
          const gpaPoints = this.percentageToGPA(coursePercentage * 100);
          const credits = 3; // Default credits, could be fetched from course data
          
          totalQualityPoints += gpaPoints * credits;
          totalCredits += credits;
        }
      });

      return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    } catch (error) {
      console.error("Error calculating GPA:", error?.response?.data?.message || error);
      return 0;
    }
  },

  percentageToGPA(percentage) {
    if (percentage >= 97) return 4.0;
    if (percentage >= 93) return 3.7;
    if (percentage >= 90) return 3.3;
    if (percentage >= 87) return 3.0;
    if (percentage >= 83) return 2.7;
    if (percentage >= 80) return 2.3;
    if (percentage >= 77) return 2.0;
    if (percentage >= 73) return 1.7;
    if (percentage >= 70) return 1.3;
    if (percentage >= 67) return 1.0;
    if (percentage >= 65) return 0.7;
    return 0.0;
  },

  async updateAssignmentGrade(categoryId, assignmentId, grade) {
    try {
      // First get the category
      const category = await this.getById(categoryId);
      
      const assignmentIndex = category.assignments.findIndex(a => a.Id === parseInt(assignmentId));
      if (assignmentIndex === -1) {
        throw new Error("Assignment not found");
      }

      // Update the assignment grade
      category.assignments[assignmentIndex].grade = grade;
      category.assignments[assignmentIndex].completed = true;
      
      // Update the record with new assignments data
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(categoryId),
          assignments_c: JSON.stringify(category.assignments)
        }]
      };

      const response = await apperClient.updateRecord('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return category;
    } catch (error) {
      console.error("Error updating assignment grade:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(gradeData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: gradeData.category_name_c || gradeData.categoryName || 'Grade Category',
          course_id_c: parseInt(gradeData.course_id_c || gradeData.courseId),
          category_name_c: gradeData.category_name_c || gradeData.categoryName || '',
          weight_c: parseFloat(gradeData.weight_c || gradeData.weight || 0),
          assignments_c: JSON.stringify(gradeData.assignments_c || gradeData.assignments || [])
        }]
      };

      const response = await apperClient.createRecord('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating grade:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, JSON.stringify(failed));
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting grade:", error?.response?.data?.message || error);
      throw error;
    }
  }
};