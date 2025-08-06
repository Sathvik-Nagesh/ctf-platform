const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get all challenges (public)
router.get('/', async (req, res) => {
  try {
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    
    const challenges = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        ...data,
        solvedCount: data.solvedCount || 0,
        solvedBy: data.solvedBy || []
      });
    });

    res.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get single challenge (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const challengeRef = db.collection('challenges').doc(id);
    const doc = await challengeRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const data = doc.data();
    res.json({
      id: doc.id,
      ...data,
      solvedCount: data.solvedCount || 0,
      solvedBy: data.solvedBy || []
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// Create challenge (admin only)
router.post('/', upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, category, points, hints, flag } = req.body;
    
    if (!title || !description || !category || !points || !flag) {
      return res.status(400).json({ 
        error: 'Title, description, category, points, and flag are required' 
      });
    }

    // Handle uploaded files
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        files.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${file.filename}`
        });
      });
    }

    const challengeData = {
      title,
      description,
      category,
      points: parseInt(points),
      hints: hints ? hints.split(',').map(hint => hint.trim()) : [],
      flag: flag.trim(),
      files,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: req.admin?.username || 'Admin'
    };

    const challengeRef = await db.collection('challenges').add(challengeData);
    
    res.status(201).json({
      message: 'Challenge created successfully',
      challengeId: challengeRef.id
    });

  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Update challenge (admin only)
router.put('/:id', upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, points, hints, flag, isActive } = req.body;
    
    const challengeRef = db.collection('challenges').doc(id);
    const challengeDoc = await challengeRef.get();
    
    if (!challengeDoc.exists) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const updateData = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (points) updateData.points = parseInt(points);
    if (hints !== undefined) {
      updateData.hints = hints ? hints.split(',').map(hint => hint.trim()) : [];
    }
    if (flag) updateData.flag = flag.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      }));
      
      // Get existing files
      const existingData = challengeDoc.data();
      const existingFiles = existingData.files || [];
      
      updateData.files = [...existingFiles, ...newFiles];
    }

    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.admin?.username || 'Admin';

    await challengeRef.update(updateData);
    
    res.json({ message: 'Challenge updated successfully' });

  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// Delete challenge (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const challengeRef = db.collection('challenges').doc(id);
    const challengeDoc = await challengeRef.get();
    
    if (!challengeDoc.exists) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Delete associated files
    const data = challengeDoc.data();
    if (data.files && data.files.length > 0) {
      data.files.forEach(file => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await challengeRef.delete();
    
    res.json({ message: 'Challenge deleted successfully' });

  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Get challenge categories
router.get('/categories/list', async (req, res) => {
  try {
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    
    const categories = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    res.json({ categories: Array.from(categories) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router; 