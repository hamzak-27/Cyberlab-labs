// src/services/courseService.js
// TODO: Replace all mock implementations with real API calls

export const courseService = {
  // TODO: fetch from GET /api/courses/{id}
  async getCourse(courseId) {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCourses[courseId])
      }, 500)
    })
  },

  // TODO: fetch from GET /api/courses/{id}/modules
  async getCourseModules(courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockModules[courseId] || [])
      }, 500)
    })
  },

  // TODO: POST /api/courses/{courseId}/progress
  async updateCourseProgress(courseId, progress) {
    console.log('Updating course progress:', { courseId, progress })
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 300)
    })
  },

  // TODO: POST /api/courses/{courseId}/modules/{moduleId}/progress
  async updateModuleProgress(courseId, moduleId, progress) {
    console.log('Updating module progress:', { courseId, moduleId, progress })
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 300)
    })
  },

  // TODO: POST /api/labs/{labId}/start
  async startLab(labId) {
    console.log('Starting lab:', labId)
    return new Promise((resolve) => {
      setTimeout(() => resolve({ labUrl: 'https://lab-environment.example.com' }), 1000)
    })
  }
}

// Mock data (move to separate file in production)
const mockCourses = {
  'm1': {
    id: 'm1',
    title: 'Threat Detection Fundamentals',
    description: 'Identify and analyze malware and network threats in real time — the ideal starting point for cybersecurity beginners.',
    duration: '8–10 hours',
    difficulty: 'Beginner',
    instructor: 'Jane Doe',
    rating: 4.9,
    students: 1250,
    progress: 25
  }
  // Add more mock courses as needed
}

const mockModules = {
  'm1': [
    // ... same as the mock modules data from ModulePage.jsx
  ]
}