const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Serve avatar images with proper CORS headers
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const avatarPath = path.join(__dirname, '../uploads/avatars', filename);
    
    // Check if file exists
    try {
      await fs.access(avatarPath);
    } catch (error) {
      return res.status(404).json({ error: 'Avatar not found' });
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
    res.sendFile(avatarPath);
    
  } catch (error) {
    console.error('Avatar serve error:', error);
    res.status(500).json({ error: 'Failed to serve avatar' });
  }
});

module.exports = router;
