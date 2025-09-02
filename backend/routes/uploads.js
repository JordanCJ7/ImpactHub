const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Configure multer for campaign image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/campaigns');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID and timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `campaign-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for campaign images
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: fileFilter
});

// Upload campaign images
router.post('/campaign-images', 
  auth, 
  authorize(['campaign-leader', 'admin']),
  upload.array('images', 5), // Allow up to 5 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Create response with uploaded file URLs
      const uploadedImages = req.files.map(file => ({
        filename: file.filename,
        url: `/uploads/campaigns/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} image(s) uploaded successfully`,
        images: uploadedImages
      });

    } catch (error) {
      console.error('Campaign image upload error:', error);
      
      // Delete uploaded files if there was an error
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }
);

// Delete campaign image
router.delete('/campaign-images/:filename',
  auth,
  authorize(['campaign-leader', 'admin']),
  async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Validate filename to prevent directory traversal
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid filename' 
        });
      }

      const imagePath = path.join(__dirname, '../uploads/campaigns', filename);
      
      // Check if file exists and delete it
      try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        
        res.status(200).json({
          success: true,
          message: 'Image deleted successfully'
        });
      } catch (error) {
        return res.status(404).json({ 
          success: false,
          error: 'Image not found' 
        });
      }
    } catch (error) {
      console.error('Delete campaign image error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete image' 
      });
    }
  }
);

// Serve campaign images with proper CORS headers
router.get('/campaigns/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const imagePath = path.join(__dirname, '../uploads/campaigns', filename);
    
    // Check if file exists
    try {
      await fs.access(imagePath);
    } catch (error) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Set content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send the file
    res.sendFile(imagePath);
    
  } catch (error) {
    console.error('Campaign image serve error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

module.exports = router;
