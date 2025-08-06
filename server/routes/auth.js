const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { authenticateTeam } = require('../middleware/auth');

const router = express.Router();

// Team registration
router.post('/register', async (req, res) => {
  try {
    const { teamName, password, members } = req.body;

    console.log('Registration attempt:', { teamName, members: members?.length });

    // Validation
    if (!teamName || !password || !members) {
      return res.status(400).json({ error: 'Team name, password, and members are required' });
    }

    if (members.length > 2) {
      return res.status(400).json({ error: 'Maximum 2 members per team' });
    }

    if (members.length === 0) {
      return res.status(400).json({ error: 'At least one member is required' });
    }

    // Sanitize team name for use as document ID
    const sanitizedTeamName = teamName.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    
    if (sanitizedTeamName.length === 0) {
      return res.status(400).json({ error: 'Team name contains invalid characters' });
    }

    // Check if team name already exists
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', teamName).get();

    if (!teamQuery.empty) {
      return res.status(409).json({ error: 'Team name already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create team document with auto-generated ID
    const teamData = {
      teamName,
      password: hashedPassword,
      members,
      score: 0,
      submissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const newTeamRef = await teamsRef.add(teamData);
    console.log('Team registered successfully with ID:', newTeamRef.id);

    res.status(201).json({
      message: 'Team registered successfully',
      team: {
        name: teamName,
        members,
        score: 0
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Team login
router.post('/login', async (req, res) => {
  try {
    const { teamName, password } = req.body;

    console.log('Login attempt for team:', teamName);

    if (!teamName || !password) {
      return res.status(400).json({ error: 'Team name and password are required' });
    }

    // Get team from Firestore by teamName field
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', teamName).get();

    if (teamQuery.empty) {
      console.log('Team not found:', teamName);
      return res.status(401).json({ error: 'Invalid team name or password' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, teamData.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for team:', teamName);
      return res.status(401).json({ error: 'Invalid team name or password' });
    }

    // Update last login
    await teamDoc.ref.update({
      lastLogin: new Date().toISOString()
    });

    console.log('Login successful for team:', teamName);

    res.json({
      message: 'Login successful',
      team: {
        name: teamName,
        members: teamData.members,
        score: teamData.score || 0
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Get team profile (requires authentication)
router.get('/profile', authenticateTeam, async (req, res) => {
  try {
    const { teamName } = req.body;
    
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', teamName).get();
    
    if (teamQuery.empty) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    
    res.json({
      team: {
        name: teamName,
        members: teamData.members,
        score: teamData.score || 0,
        submissions: teamData.submissions || [],
        createdAt: teamData.createdAt,
        lastLogin: teamData.lastLogin
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update team profile
router.put('/profile', authenticateTeam, async (req, res) => {
  try {
    const { teamName } = req.body;
    const { members, password } = req.body;

    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', teamName).get();
    
    if (teamQuery.empty) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamDoc = teamQuery.docs[0];
    
    const updateData = {};
    
    if (members) {
      if (members.length > 2) {
        return res.status(400).json({ error: 'Maximum 2 members per team' });
      }
      updateData.members = members;
    }
    
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await teamDoc.ref.update(updateData);

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router; 