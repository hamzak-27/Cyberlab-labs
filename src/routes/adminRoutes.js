import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { authorization, adminOnly } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Ensure upload directory exists
const ensureUploadDir = async () => {
    const uploadDir = './storage/ova-files';
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
        logger.info('Created upload directory:', uploadDir);
    }
};

// Configure multer for VM file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureUploadDir();
        cb(null, './storage/ova-files');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${timestamp}-${sanitizedName}`;
        cb(null, uniqueName);
    }
});

// File filter for VM files
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.ova', '.ovf', '.vmdk'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10 GB max
    },
    fileFilter: fileFilter
});

// Calculate SHA256 checksum of file
async function calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const fs = require('fs');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

// Get file size in human-readable format
function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

/**
 * @route POST /api/admin/upload-vm
 * @desc Upload VM file (OVA/OVF/VMDK)
 * @access Admin only
 */
router.post('/upload-vm', 
    authorization, 
    adminOnly, 
    upload.single('vmFile'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const file = req.file;
            const filePath = `./storage/ova-files/${file.filename}`;
            
            logger.info('VM file uploaded', {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                uploadedBy: req.user.id
            });

            // Calculate checksum
            logger.info('Calculating checksum...');
            const checksum = await calculateChecksum(filePath);

            res.json({
                success: true,
                message: 'VM file uploaded successfully',
                data: {
                    filePath: filePath,
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    sizeFormatted: formatFileSize(file.size),
                    checksum: checksum,
                    mimetype: file.mimetype,
                    uploadedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('VM file upload failed', {
                error: error.message,
                userId: req.user?.id
            });

            // Delete file if upload failed
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    logger.error('Failed to delete uploaded file', unlinkError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload VM file',
                error: error.message
            });
        }
    }
);

/**
 * @route DELETE /api/admin/vm-file/:filename
 * @desc Delete uploaded VM file
 * @access Admin only
 */
router.delete('/vm-file/:filename',
    authorization,
    adminOnly,
    async (req, res) => {
        try {
            const { filename } = req.params;
            const filePath = `./storage/ova-files/${filename}`;

            // Check if file exists
            try {
                await fs.access(filePath);
            } catch {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }

            // Delete file
            await fs.unlink(filePath);

            logger.info('VM file deleted', {
                filename,
                deletedBy: req.user.id
            });

            res.json({
                success: true,
                message: 'VM file deleted successfully'
            });

        } catch (error) {
            logger.error('Failed to delete VM file', {
                error: error.message,
                filename: req.params.filename
            });

            res.status(500).json({
                success: false,
                message: 'Failed to delete VM file',
                error: error.message
            });
        }
    }
);

/**
 * @route GET /api/admin/vm-files
 * @desc List all uploaded VM files
 * @access Admin only
 */
router.get('/vm-files',
    authorization,
    adminOnly,
    async (req, res) => {
        try {
            await ensureUploadDir();
            const files = await fs.readdir('./storage/ova-files');
            
            const fileDetails = await Promise.all(
                files.map(async (filename) => {
                    const filePath = `./storage/ova-files/${filename}`;
                    const stats = await fs.stat(filePath);
                    
                    return {
                        filename,
                        path: filePath,
                        size: stats.size,
                        sizeFormatted: formatFileSize(stats.size),
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    };
                })
            );

            res.json({
                success: true,
                data: {
                    files: fileDetails,
                    totalFiles: fileDetails.length,
                    totalSize: fileDetails.reduce((sum, f) => sum + f.size, 0)
                }
            });

        } catch (error) {
            logger.error('Failed to list VM files', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list VM files',
                error: error.message
            });
        }
    }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10 GB'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next();
});

export default router;
