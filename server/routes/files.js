const express = require('express');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Download challenge file (public)
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file info from database to find original name
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    
    let originalName = filename;
    let fileInfo = null;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.files) {
        const file = data.files.find(f => f.filename === filename);
        if (file) {
          originalName = file.originalName;
          fileInfo = file;
        }
      }
    });

    console.log(`Downloading file: ${filename} -> ${originalName}`);

    // Determine MIME type based on file extension
    const ext = path.extname(originalName).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    // Common MIME types
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    if (mimeTypes[ext]) {
      mimeType = mimeTypes[ext];
    }
    
    console.log(`File type: ${ext} -> MIME: ${mimeType}`);

    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);

    // Check if this is a preview request (no download header)
    const isPreview = req.query.preview === 'true';
    
    // Set headers
    if (isPreview) {
      // For preview, don't force download
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else {
      // For download, force download
      res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
    }
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });
    
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Get file info (public)
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    
    // Get file info from database
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    
    let fileInfo = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.files) {
        const file = data.files.find(f => f.filename === filename);
        if (file) {
          fileInfo = {
            filename: file.filename,
            originalName: file.originalName,
            size: file.size,
            mimetype: file.mimetype,
            url: file.url,
            challengeTitle: data.title,
            challengeId: doc.id
          };
        }
      }
    });

    if (!fileInfo) {
      return res.status(404).json({ error: 'File info not found' });
    }

    res.json({ fileInfo });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// List all files (admin only)
router.get('/list', authenticateAdmin, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    const fileList = [];

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      // Get file info from database
      const challengesRef = db.collection('challenges');
      const snapshot = await challengesRef.get();
      
      let fileInfo = {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        challengeTitle: 'Unknown',
        challengeId: null
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.files) {
          const file = data.files.find(f => f.filename === filename);
          if (file) {
            fileInfo = {
              ...fileInfo,
              originalName: file.originalName,
              mimetype: file.mimetype,
              challengeTitle: data.title,
              challengeId: doc.id
            };
          }
        }
      });

      fileList.push(fileInfo);
    }

    res.json({ files: fileList });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete file (admin only)
router.delete('/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Remove file from filesystem
    fs.unlinkSync(filePath);

    // Remove file reference from challenges
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.files) {
        const updatedFiles = data.files.filter(f => f.filename !== filename);
        if (updatedFiles.length !== data.files.length) {
          batch.update(doc.ref, { files: updatedFiles });
        }
      }
    });
    
    await batch.commit();

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get storage statistics (admin only)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        totalFiles: 0,
        totalSize: 0,
        averageSize: 0
      });
    }

    const files = fs.readdirSync(uploadsDir);
    let totalSize = 0;
    let fileCount = 0;

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      fileCount++;
    }

    res.json({
      totalFiles: fileCount,
      totalSize,
      averageSize: fileCount > 0 ? Math.round(totalSize / fileCount) : 0,
      sizeInMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({ error: 'Failed to get storage statistics' });
  }
});

module.exports = router; 