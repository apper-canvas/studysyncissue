import assignmentsData from "@/services/mockData/assignments.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let assignments = [...assignmentsData];

export const assignmentService = {
  async getAll() {
    await delay(300);
    return assignments.map(assignment => ({ ...assignment }));
  },

  async getByCourse(courseId) {
    await delay(250);
    return assignments
      .filter(assignment => assignment.courseId === parseInt(courseId))
      .map(assignment => ({ ...assignment }));
  },

  async getById(id) {
    await delay(200);
    const assignment = assignments.find(a => a.Id === parseInt(id));
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    return { ...assignment };
  },

  async getUpcoming(limit = 5) {
    await delay(250);
    const now = new Date();
    return assignments
      .filter(assignment => !assignment.completed && new Date(assignment.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit)
      .map(assignment => ({ ...assignment }));
  },

  async getOverdue() {
    await delay(250);
    const now = new Date();
    return assignments
      .filter(assignment => !assignment.completed && new Date(assignment.dueDate) < now)
      .map(assignment => ({ ...assignment }));
  },

  async create(assignmentData) {
    await delay(400);
    const maxId = Math.max(...assignments.map(a => a.Id), 0);
    const newAssignment = {
      ...assignmentData,
      Id: maxId + 1,
      completed: false,
      grade: null
    };
    assignments.push(newAssignment);
    return { ...newAssignment };
  },

  async update(id, assignmentData) {
    await delay(300);
    const index = assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    assignments[index] = { ...assignments[index], ...assignmentData };
    return { ...assignments[index] };
  },

  async markComplete(id) {
    await delay(300);
    const index = assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    assignments[index].completed = true;
    return { ...assignments[index] };
  },

  async delete(id) {
    await delay(300);
    const index = assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    assignments.splice(index, 1);
    return true;
  }
};