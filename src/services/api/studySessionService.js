import mockSessions from "@/services/mockData/sessions.json";

// In-memory storage for mock data
let sessions = [...mockSessions];
let nextId = Math.max(...sessions.map(s => s.Id), 0) + 1;

export const studySessionService = {
  async getAll() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return sessions sorted by most recent first
    return [...sessions].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const session = sessions.find(s => s.Id === parseInt(id));
    if (!session) {
      throw new Error(`Study session with ID ${id} not found`);
    }
    
    return { ...session };
  },

  async create(sessionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newSession = {
      Id: nextId++,
      subject: sessionData.subject || 'Unknown Subject',
      duration: parseInt(sessionData.duration) || 0,
      startTime: sessionData.startTime || new Date().toISOString(),
      endTime: sessionData.endTime || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    sessions.unshift(newSession);
    return { ...newSession };
  },

  async update(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const sessionIndex = sessions.findIndex(s => s.Id === parseInt(id));
    if (sessionIndex === -1) {
      throw new Error(`Study session with ID ${id} not found`);
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...updateData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    sessions[sessionIndex] = updatedSession;
    return { ...updatedSession };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const sessionIndex = sessions.findIndex(s => s.Id === parseInt(id));
    if (sessionIndex === -1) {
      throw new Error(`Study session with ID ${id} not found`);
    }
    
const deletedSession = sessions.splice(sessionIndex, 1)[0];
    return { ...deletedSession };
  }
};