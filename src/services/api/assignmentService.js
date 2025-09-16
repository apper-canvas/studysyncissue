export const assignmentService = {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "submission_format_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      };

      const response = await apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching assignments:", error?.response?.data?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "submission_format_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      };

      const response = await apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching assignments by course:", error?.response?.data?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "submission_format_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      };

      const response = await apperClient.getRecordById('assignment_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error("Assignment not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error?.response?.data?.message || error);
      throw new Error("Assignment not found");
    }
  },

  async getUpcoming(limit = 5) {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "submission_format_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [
          {"FieldName": "completed_c", "Operator": "EqualTo", "Values": [false]},
          {"FieldName": "due_date_c", "Operator": "GreaterThan", "Values": [new Date().toISOString()]}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };

      const response = await apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getOverdue() {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "submission_format_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [
          {"FieldName": "completed_c", "Operator": "EqualTo", "Values": [false]},
          {"FieldName": "due_date_c", "Operator": "LessThan", "Values": [new Date().toISOString()]}
        ]
      };

      const response = await apperClient.fetchRecords('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching overdue assignments:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(assignmentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: assignmentData.title_c || assignmentData.title || 'Assignment',
          title_c: assignmentData.title_c || assignmentData.title || '',
          description_c: assignmentData.description_c || assignmentData.description || '',
          due_date_c: assignmentData.due_date_c || assignmentData.dueDate || new Date().toISOString(),
          priority_c: assignmentData.priority_c || assignmentData.priority || 'medium',
          completed_c: assignmentData.completed_c || assignmentData.completed || false,
          grade_c: assignmentData.grade_c || assignmentData.grade || null,
          max_points_c: parseInt(assignmentData.max_points_c || assignmentData.maxPoints || 100),
          type_c: assignmentData.type_c || assignmentData.type || 'assignment',
          submission_format_c: assignmentData.submission_format_c || assignmentData.submissionFormat || '',
          course_id_c: parseInt(assignmentData.course_id_c || assignmentData.courseId)
        }]
      };

      const response = await apperClient.createRecord('assignment_c', params);
      
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
      console.error("Error creating assignment:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, assignmentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          Name: assignmentData.title_c || assignmentData.title || 'Assignment',
          title_c: assignmentData.title_c || assignmentData.title,
          description_c: assignmentData.description_c || assignmentData.description,
          due_date_c: assignmentData.due_date_c || assignmentData.dueDate,
          priority_c: assignmentData.priority_c || assignmentData.priority,
          completed_c: assignmentData.completed_c !== undefined ? assignmentData.completed_c : assignmentData.completed,
          grade_c: assignmentData.grade_c !== undefined ? assignmentData.grade_c : assignmentData.grade,
          max_points_c: parseInt(assignmentData.max_points_c || assignmentData.maxPoints),
          type_c: assignmentData.type_c || assignmentData.type,
          submission_format_c: assignmentData.submission_format_c || assignmentData.submissionFormat,
          course_id_c: parseInt(assignmentData.course_id_c || assignmentData.courseId)
        }]
      };

      const response = await apperClient.updateRecord('assignment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, JSON.stringify(failed));
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating assignment:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async markComplete(id) {
    try {
      return await this.update(id, { completed_c: true });
    } catch (error) {
      console.error("Error marking assignment complete:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('assignment_c', params);
      
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
      console.error("Error deleting assignment:", error?.response?.data?.message || error);
      throw error;
    }
  }
};