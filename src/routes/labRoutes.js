import express from 'express';
import {
    getLabs,
    getLabById,
    createLab,
    updateLab,
    deleteLab,
    getLabStats,
    rateLab,
    getCategories,
    getPopularLabs,
    searchLabs
} from '../controllers/labController.js';
import { authorization, adminOnly, rateLimitByUser as authRateLimitByUser } from '../middleware/auth.js';
import { rateLimitByUser, rateLimitByIP } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Lab:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         category:
 *           type: string
 *           enum: [Web, Binary, Network, Crypto, Forensics, Misc]
 *         services:
 *           type: array
 *           items:
 *             type: string
 *         vulnerabilities:
 *           type: array
 *           items:
 *             type: string
 *         estimatedSolveTime:
 *           type: string
 *         stats:
 *           type: object
 *           properties:
 *             totalSessions:
 *               type: number
 *             totalCompletions:
 *               type: number
 *             averageCompletionTime:
 *               type: number
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *             count:
 *               type: number
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LabCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - difficulty
 *         - category
 *         - ovfPath
 *         - ovaChecksum
 *         - defaultCredentials
 *         - flags
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         category:
 *           type: string
 *           enum: [Web, Binary, Network, Crypto, Forensics, Misc]
 *         ovfPath:
 *           type: string
 *         ovaChecksum:
 *           type: string
 *         defaultCredentials:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *         flags:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 template:
 *                   type: string
 *                 points:
 *                   type: number
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: string
 *             root:
 *               type: object
 *               properties:
 *                 template:
 *                   type: string
 *                 points:
 *                   type: number
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: string
 *         vmConfig:
 *           type: object
 *           properties:
 *             ram:
 *               type: number
 *             cpu:
 *               type: number
 *             network:
 *               type: string
 *             diskSize:
 *               type: number
 *         services:
 *           type: array
 *           items:
 *             type: string
 *         vulnerabilities:
 *           type: array
 *           items:
 *             type: string
 *         estimatedSolveTime:
 *           type: string
 */

// Public routes

/**
 * @swagger
 * /api/labs/meta/categories:
 *   get:
 *     summary: Get all lab categories with counts
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       count:
 *                         type: number
 */
router.get('/meta/categories', getCategories);

/**
 * @swagger
 * /api/labs/popular:
 *   get:
 *     summary: Get popular labs
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of labs to return
 *     responses:
 *       200:
 *         description: Popular labs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lab'
 */
router.get('/popular', getPopularLabs);

/**
 * @swagger
 * /api/labs/search:
 *   get:
 *     summary: Search labs
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     labs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Lab'
 *                     query:
 *                       type: string
 *                     pagination:
 *                       type: object
 */
router.get('/search', searchLabs);

/**
 * @swagger
 * /api/labs:
 *   get:
 *     summary: Get all active labs with pagination and filtering
 *     tags: [Labs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Labs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     labs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Lab'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalCount:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/', getLabs);

/**
 * @swagger
 * /api/labs/{id}:
 *   get:
 *     summary: Get single lab by ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *     responses:
 *       200:
 *         description: Lab retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lab'
 *       400:
 *         description: Invalid lab ID
 *       404:
 *         description: Lab not found
 */
router.get('/:id', getLabById);

/**
 * @swagger
 * /api/labs/{id}/stats:
 *   get:
 *     summary: Get lab statistics
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *     responses:
 *       200:
 *         description: Lab statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     labId:
 *                       type: string
 *                     labName:
 *                       type: string
 *                     statistics:
 *                       type: object
 *                     rating:
 *                       type: object
 *                     completionRate:
 *                       type: string
 *       404:
 *         description: Lab not found
 */
router.get('/:id/stats', getLabStats);

// Protected routes (require authentication)

/**
 * @swagger
 * /api/labs/{id}/rate:
 *   post:
 *     summary: Rate a lab
 *     tags: [Labs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *     responses:
 *       200:
 *         description: Lab rated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     newRating:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: string
 *                         count:
 *                           type: number
 *       400:
 *         description: Invalid rating value
 *       404:
 *         description: Lab not found
 */
router.post('/:id/rate', authorization, rateLimitByUser(5, 300), rateLab);

// Admin-only routes
router.use(authorization);
router.use(adminOnly);

/**
 * @swagger
 * /api/labs:
 *   post:
 *     summary: Create new lab (Admin only)
 *     tags: [Labs, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabCreate'
 *     responses:
 *       201:
 *         description: Lab created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lab'
 *       400:
 *         description: Validation error or missing required fields
 *       409:
 *         description: Lab name already exists
 *       403:
 *         description: Admin access required
 */
router.post('/', createLab);

/**
 * @swagger
 * /api/labs/{id}:
 *   put:
 *     summary: Update lab (Admin only)
 *     tags: [Labs, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabCreate'
 *     responses:
 *       200:
 *         description: Lab updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Lab'
 *       400:
 *         description: Validation error or invalid lab ID
 *       404:
 *         description: Lab not found
 *       409:
 *         description: Lab name already exists
 *       403:
 *         description: Admin access required
 */
router.put('/:id', updateLab);

/**
 * @swagger
 * /api/labs/{id}:
 *   delete:
 *     summary: Delete/Deactivate lab (Admin only)
 *     tags: [Labs, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to permanently delete the lab
 *     responses:
 *       200:
 *         description: Lab deleted/deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid lab ID
 *       404:
 *         description: Lab not found
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', deleteLab);

export default router;