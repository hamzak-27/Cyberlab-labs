import { Lab } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { calculateDifficultyScore, validateObjectStructure } from '../utils/helpers.js';
import vmProvisioner from '../services/vmProvisioner.js';
import path from 'path';

/**
 * @desc Get all active labs
 * @route GET /api/labs
 * @access Public
 */
export const getLabs = async (req, res) => {
    try {
        const { 
            category, 
            difficulty, 
            limit = 20, 
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        const filter = { isActive: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (difficulty && difficulty !== 'all') {
            filter.difficulty = difficulty;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        // Get labs with pagination
        const labs = await Lab.find(filter)
            .select('-vmTemplate -defaultCredentials.password -flags.*.value')
            .sort({ [sortBy]: sortDirection })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get total count
        const totalCount = await Lab.countDocuments(filter);

        // Add computed fields
        const enhancedLabs = labs.map(lab => ({
            ...lab,
            difficultyScore: calculateDifficultyScore(lab.difficulty),
            totalPoints: (lab.flags?.user?.points || 0) + (lab.flags?.root?.points || 0)
        }));

        res.json({
            success: true,
            data: {
                labs: enhancedLabs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    limit: parseInt(limit),
                    hasNext: skip + labs.length < totalCount,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get labs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve labs'
        });
    }
};

/**
 * @desc Get single lab by ID
 * @route GET /api/labs/:id
 * @access Public
 */
export const getLabById = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findOne({ _id: id, isActive: true })
            .select('-vmTemplate -defaultCredentials.password -flags.*.value')
            .lean();

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Add computed fields
        const enhancedLab = {
            ...lab,
            difficultyScore: calculateDifficultyScore(lab.difficulty),
            totalPoints: (lab.flags?.user?.points || 0) + (lab.flags?.root?.points || 0)
        };

        res.json({
            success: true,
            data: enhancedLab
        });

    } catch (error) {
        logger.error('Failed to get lab by ID', { 
            error: error.message, 
            labId: req.params.id 
        });

        const statusCode = error.name === 'CastError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.name === 'CastError' ? 'Invalid lab ID' : 'Failed to retrieve lab'
        });
    }
};

/**
 * @desc Create new lab (Admin only)
 * @route POST /api/labs
 * @access Admin
 */
export const createLab = async (req, res) => {
    try {
        const requiredFields = [
            'name', 'description', 'difficulty', 'category', 
            'ovfPath', 'ovaChecksum', 'defaultCredentials', 'flags'
        ];

        const missingFields = validateObjectStructure(req.body, requiredFields);
        if (missingFields) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate flag structure
        const { flags } = req.body;
        if (!flags.user || !flags.root) {
            return res.status(400).json({
                success: false,
                message: 'Both user and root flags are required'
            });
        }

        // Create lab
        const lab = new Lab({
            ...req.body,
            createdBy: req.user.id,
            isActive: true
        });

        await lab.save();

        logger.info('Lab created', { 
            labId: lab._id, 
            labName: lab.name, 
            createdBy: req.user.id 
        });

        // Auto-import VM template in background (non-blocking)
        importVMTemplate(lab).catch(err => {
            logger.error('Background VM import failed', { 
                labId: lab._id, 
                error: err.message 
            });
        });

        // Return lab without sensitive data
        const labResponse = lab.toObject();
        delete labResponse.defaultCredentials.password;
        delete labResponse.flags.user.value;
        delete labResponse.flags.root.value;

        res.status(201).json({
            success: true,
            message: 'Lab created successfully. VM template import started in background.',
            data: labResponse
        });

    } catch (error) {
        logger.error('Failed to create lab', { 
            error: error.message, 
            userId: req.user?.id 
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Lab name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create lab'
        });
    }
};

/**
 * @desc Update lab (Admin only)
 * @route PUT /api/labs/:id
 * @access Admin
 */
export const updateLab = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findById(id);
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Update fields
        const updateFields = [
            'name', 'description', 'difficulty', 'category', 
            'ovfPath', 'ovaChecksum', 'flags', 'vmConfig', 
            'defaultCredentials', 'services', 'vulnerabilities',
            'estimatedSolveTime', 'isActive'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                lab[field] = req.body[field];
            }
        });

        await lab.save();

        logger.info('Lab updated', { 
            labId: lab._id, 
            labName: lab.name, 
            updatedBy: req.user.id 
        });

        // Return lab without sensitive data
        const labResponse = lab.toObject();
        delete labResponse.defaultCredentials.password;
        delete labResponse.flags.user.value;
        delete labResponse.flags.root.value;

        res.json({
            success: true,
            message: 'Lab updated successfully',
            data: labResponse
        });

    } catch (error) {
        logger.error('Failed to update lab', { 
            error: error.message, 
            labId: req.params.id,
            userId: req.user?.id 
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Lab name already exists'
            });
        }

        const statusCode = error.name === 'CastError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.name === 'CastError' ? 'Invalid lab ID' : 'Failed to update lab'
        });
    }
};

/**
 * @desc Delete/Deactivate lab (Admin only)
 * @route DELETE /api/labs/:id
 * @access Admin
 */
export const deleteLab = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false } = req.query;

        const lab = await Lab.findById(id);
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        if (permanent === 'true') {
            // Permanent deletion (dangerous)
            await Lab.findByIdAndDelete(id);
            logger.warn('Lab permanently deleted', { 
                labId: id, 
                labName: lab.name, 
                deletedBy: req.user.id 
            });

            res.json({
                success: true,
                message: 'Lab permanently deleted'
            });
        } else {
            // Soft delete (deactivate)
            lab.isActive = false;
            await lab.save();

            logger.info('Lab deactivated', { 
                labId: id, 
                labName: lab.name, 
                deactivatedBy: req.user.id 
            });

            res.json({
                success: true,
                message: 'Lab deactivated successfully'
            });
        }

    } catch (error) {
        logger.error('Failed to delete lab', { 
            error: error.message, 
            labId: req.params.id,
            userId: req.user?.id 
        });

        const statusCode = error.name === 'CastError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.name === 'CastError' ? 'Invalid lab ID' : 'Failed to delete lab'
        });
    }
};

/**
 * @desc Get lab statistics
 * @route GET /api/labs/:id/stats
 * @access Public
 */
export const getLabStats = async (req, res) => {
    try {
        const { id } = req.params;

        const lab = await Lab.findOne({ _id: id, isActive: true })
            .select('name stats rating')
            .lean();

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        res.json({
            success: true,
            data: {
                labId: lab._id,
                labName: lab.name,
                statistics: lab.stats,
                rating: lab.rating,
                completionRate: lab.stats.totalSessions > 0 ? 
                    ((lab.stats.totalCompletions / lab.stats.totalSessions) * 100).toFixed(1) : 0
            }
        });

    } catch (error) {
        logger.error('Failed to get lab stats', { 
            error: error.message, 
            labId: req.params.id 
        });

        const statusCode = error.name === 'CastError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.name === 'CastError' ? 'Invalid lab ID' : 'Failed to retrieve lab statistics'
        });
    }
};

/**
 * @desc Rate a lab
 * @route POST /api/labs/:id/rate
 * @access Private
 */
export const rateLab = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const lab = await Lab.findOne({ _id: id, isActive: true });
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        // Add rating using the model method
        await lab.addRating(rating);

        logger.info('Lab rated', { 
            labId: id, 
            rating, 
            userId: req.user.id,
            newAverage: lab.rating.average
        });

        res.json({
            success: true,
            message: 'Lab rated successfully',
            data: {
                newRating: {
                    average: lab.rating.average.toFixed(1),
                    count: lab.rating.count
                }
            }
        });

    } catch (error) {
        logger.error('Failed to rate lab', { 
            error: error.message, 
            labId: req.params.id,
            userId: req.user?.id 
        });

        const statusCode = error.name === 'CastError' ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.name === 'CastError' ? 'Invalid lab ID' : 'Failed to rate lab'
        });
    }
};

/**
 * @desc Get lab categories
 * @route GET /api/labs/meta/categories
 * @access Public
 */
export const getCategories = async (req, res) => {
    try {
        // Get available categories from schema
        const categories = ['Web', 'Binary', 'Network', 'Crypto', 'Forensics', 'Misc'];
        
        // Get count of labs per category
        const categoryCounts = await Lab.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const categoriesWithCounts = categories.map(category => {
            const countData = categoryCounts.find(c => c._id === category);
            return {
                name: category,
                count: countData ? countData.count : 0
            };
        });

        res.json({
            success: true,
            data: categoriesWithCounts
        });

    } catch (error) {
        logger.error('Failed to get categories', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories'
        });
    }
};

/**
 * @desc Get popular labs
 * @route GET /api/labs/popular
 * @access Public
 */
export const getPopularLabs = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const labs = await Lab.find({ isActive: true })
            .select('-vmTemplate -defaultCredentials.password -flags.*.value')
            .sort({ 'stats.totalSessions': -1, 'rating.average': -1 })
            .limit(parseInt(limit))
            .lean();

        const enhancedLabs = labs.map(lab => ({
            ...lab,
            difficultyScore: calculateDifficultyScore(lab.difficulty),
            totalPoints: (lab.flags?.user?.points || 0) + (lab.flags?.root?.points || 0),
            completionRate: lab.stats.totalSessions > 0 ? 
                ((lab.stats.totalCompletions / lab.stats.totalSessions) * 100).toFixed(1) : 0
        }));

        res.json({
            success: true,
            data: enhancedLabs
        });

    } catch (error) {
        logger.error('Failed to get popular labs', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve popular labs'
        });
    }
};

/**
 * @desc Search labs
 * @route GET /api/labs/search
 * @access Public
 */
export const searchLabs = async (req, res) => {
    try {
        const { 
            q = '', 
            category, 
            difficulty,
            limit = 20,
            page = 1
        } = req.query;

        // Build search query
        const searchQuery = { isActive: true };

        // Text search
        if (q.trim()) {
            searchQuery.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { vulnerabilities: { $regex: q, $options: 'i' } }
            ];
        }

        // Filters
        if (category && category !== 'all') {
            searchQuery.category = category;
        }
        if (difficulty && difficulty !== 'all') {
            searchQuery.difficulty = difficulty;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const labs = await Lab.find(searchQuery)
            .select('-vmTemplate -defaultCredentials.password -flags.*.value')
            .sort({ 'stats.totalSessions': -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const totalCount = await Lab.countDocuments(searchQuery);

        const enhancedLabs = labs.map(lab => ({
            ...lab,
            difficultyScore: calculateDifficultyScore(lab.difficulty),
            totalPoints: (lab.flags?.user?.points || 0) + (lab.flags?.root?.points || 0)
        }));

        res.json({
            success: true,
            data: {
                labs: enhancedLabs,
                query: q,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        logger.error('Failed to search labs', { 
            error: error.message, 
            query: req.query.q 
        });

        res.status(500).json({
            success: false,
            message: 'Failed to search labs'
        });
    }
};

/**
 * Helper function to import VM template after lab creation
 * Runs in background and updates lab with templateVmId
 */
async function importVMTemplate(lab) {
    try {
        logger.info('Starting VM template import', { 
            labId: lab._id, 
            labName: lab.name,
            ovfPath: lab.ovfPath 
        });

        // Find the .ovf file path from the uploaded files
        // ovfPath should be something like './storage/ova-files/empire-lupin-one-1234567.ovf'
        const absoluteOvfPath = path.resolve(lab.ovfPath);

        // Import template using VM provisioner
        const importResult = await vmProvisioner.importTemplate(absoluteOvfPath, {
            name: lab.name,
            vmConfig: lab.vmConfig || {}
        });

        if (importResult.success) {
            // Update lab with templateVmId
            lab.templateVmId = importResult.templateId;
            await lab.save();

            logger.info('VM template imported successfully', {
                labId: lab._id,
                labName: lab.name,
                templateId: importResult.templateId,
                templateName: importResult.templateName
            });
        } else {
            throw new Error(importResult.message || 'Import failed');
        }
    } catch (error) {
        logger.error('VM template import failed', {
            labId: lab._id,
            labName: lab.name,
            error: error.message,
            stack: error.stack
        });
        
        // Optionally: Update lab status to indicate import failure
        // lab.importStatus = 'failed';
        // await lab.save();
    }
}
