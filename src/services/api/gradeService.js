import gradesData from "@/services/mockData/grades.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let grades = [...gradesData];

export const gradeService = {
  async getAll() {
    await delay(300);
    return grades.map(grade => ({ ...grade }));
  },

  async getByCourse(courseId) {
    await delay(250);
    return grades
      .filter(grade => grade.courseId === parseInt(courseId))
      .map(grade => ({ ...grade }));
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade category not found");
    }
    return { ...grade };
  },

  async calculateGPA(courseIds = null) {
    await delay(300);
    
    const relevantGrades = courseIds 
      ? grades.filter(g => courseIds.includes(g.courseId))
      : grades;

    const courseGrades = {};
    
    // Calculate weighted average for each course
    relevantGrades.forEach(category => {
      if (!courseGrades[category.courseId]) {
        courseGrades[category.courseId] = {
          totalWeightedPoints: 0,
          totalWeight: 0,
          credits: 0
        };
      }

      const completedAssignments = category.assignments.filter(a => a.grade !== null);
      if (completedAssignments.length > 0) {
        const categoryAverage = completedAssignments.reduce((sum, a) => sum + (a.grade / a.maxPoints), 0) / completedAssignments.length;
        courseGrades[category.courseId].totalWeightedPoints += categoryAverage * category.weight;
        courseGrades[category.courseId].totalWeight += category.weight;
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
    await delay(300);
    const categoryIndex = grades.findIndex(g => g.Id === parseInt(categoryId));
    if (categoryIndex === -1) {
      throw new Error("Grade category not found");
    }

    const assignmentIndex = grades[categoryIndex].assignments.findIndex(a => a.Id === parseInt(assignmentId));
    if (assignmentIndex === -1) {
      throw new Error("Assignment not found");
    }

    grades[categoryIndex].assignments[assignmentIndex].grade = grade;
    grades[categoryIndex].assignments[assignmentIndex].completed = true;
    
    return { ...grades[categoryIndex] };
  },

  async create(gradeData) {
    await delay(400);
    const maxId = Math.max(...grades.map(g => g.Id), 0);
    const newGrade = {
      ...gradeData,
      Id: maxId + 1
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async delete(id) {
    await delay(300);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade category not found");
    }
    grades.splice(index, 1);
    return true;
  }
};