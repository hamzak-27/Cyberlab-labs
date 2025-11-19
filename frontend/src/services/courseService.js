// src/services/courseService.js
// Resilient enrollCourse which tries common endpoint variants + payload shapes.
// Uses lib/api axios instance.

import api from '../lib/api'

/**
 * Try multiple endpoints + payload shapes for enroll, return first successful response.
 * If none succeed, throw a detailed error (includes attempts).
 */
export const enrollCourse = async ({ userId, courseId }) => {
  if (!courseId) {
    throw new Error('enrollCourse: missing courseId')
  }

  // Candidate endpoints to try (order: most likely -> fallback)
  const endpoints = [
    '/api/progress/course/enroll',
    '/api/progress/enroll',
    '/api/progress/course',
    '/api/progress/course/enroll/', // trailing slash variant
    '/api/progress', // generic
    '/api/progress/course/enroll-course', // unlikely but safe
  ]

  // Candidate payload shapes to try
  const payloads = [
    { userId, courseId },
    { user: userId, course: courseId },
    { user_id: userId, course_id: courseId },
    { courseId },
    { course_id: courseId },
    { course: courseId, user: userId },
  ]

  const attempts = []

  for (const ep of endpoints) {
    for (const body of payloads) {
      // Skip payloads that require userId if we don't have one
      if ((!body.userId && !body.user && !body.user_id) && !body.courseId && !body.course_id && !body.course) {
        continue
      }

      try {
        console.debug(`[enrollCourse] trying ${ep} with body:`, body)
        const res = await api.post(ep, body)
        // Consider any 2xx as success
        if (res && res.status >= 200 && res.status < 300) {
          console.info(`[enrollCourse] success ${ep}`, { status: res.status, data: res.data })
          return res.data
        }
      } catch (err) {
        // Save attempt info and continue trying other endpoints/payloads
        const status = err?.response?.status
        const respData = err?.response?.data
        console.warn(`[enrollCourse] attempt failed: ${ep}`, { body, status, respData, message: err.message })
        attempts.push({ endpoint: ep, body, status, respData, message: err.message })
        // If error is 401, rethrow immediately so auth flow can handle it
        if (status === 401) {
          const e = new Error('Unauthorized (401) while trying to enroll')
          e.attempts = attempts
          throw e
        }
        // otherwise continue to next attempt
      }
    }
  }

  const err = new Error('enrollCourse: no working endpoint found for enroll')
  err.attempts = attempts
  // Attach some helpful debugging info on the error object
  throw err
}

/**
 * Mark a lesson complete.
 * POST /api/progress/lesson/complete
 * payload: { userId, courseId, moduleId, lessonId }
 */
export const completeLesson = async ({ userId, courseId, moduleId, lessonId }) => {
  if (!courseId || !moduleId || !lessonId) {
    throw new Error('completeLesson: missing required params')
  }
  const body = { userId, courseId, moduleId, lessonId }
  const res = await api.post('/api/progress/lesson/complete', body)
  return res.data
}

/**
 * Get progress for a user.
 * GET /api/progress/user/:userId
 */
export const getUserProgress = async (userId) => {
  if (!userId) {
    throw new Error('getUserProgress: missing userId')
  }
  const res = await api.get(`/api/progress/user/${encodeURIComponent(userId)}`)
  return res.data
}

export default {
  enrollCourse,
  completeLesson,
  getUserProgress,
}
