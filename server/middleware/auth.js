const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

// Team authentication middleware
const authenticateTeam = async (req, res, next) => {
  try {
    const { teamName, password } = req.body;
    
    if (!teamName || !password) {
      return res.status(400).json({ error: 'Team name and password are required' });
    }

    // Get team from Firestore by teamName field
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', teamName).get();

    if (teamQuery.empty) {
      return res.status(401).json({ error: 'Invalid team name or password' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, teamData.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid team name or password' });
    }

    // Add team info to request
    req.team = {
      name: teamName,
      members: teamData.members,
      score: teamData.score || 0,
      submissions: teamData.submissions || []
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check admin credentials
    const adminUsername = process.env.ADMIN_USERNAME || 'Admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'pavanrocks';
    
    if (username !== adminUsername) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For simplicity, we'll compare directly since admin password is hardcoded
    // In production, you'd want to hash this too
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.admin = { username };
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Rate limiting middleware for flag submissions
const rateLimit = require('express-rate-limit');

const submissionRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each team to 10 submissions per minute
  message: {
    error: 'Too many flag submissions. Please wait before trying again.'
  },
  keyGenerator: (req) => {
    // Use team name as key for rate limiting
    return req.team ? req.team.name : req.ip;
  }
});

module.exports = {
  authenticateTeam,
  authenticateAdmin,
  submissionRateLimit
}; 