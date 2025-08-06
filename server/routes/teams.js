const express = require('express');
const { db } = require('../config/firebase');

const router = express.Router();

// Get all teams (public - for leaderboard)
router.get('/', async (req, res) => {
  try {
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.orderBy('score', 'desc').get();
    
    const teams = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      teams.push({
        name: doc.id,
        members: data.members,
        score: data.score || 0,
        solvedCount: (data.submissions || []).filter(sub => sub.correct).length
      });
    });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get team profile (requires team authentication)
router.get('/profile', async (req, res) => {
  try {
    const { teamName } = req.query;
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    
    // Check if team is banned
    if (data.banned) {
      return res.status(403).json({ error: 'Team is banned' });
    }

    res.json({
      name: teamName,
      members: data.members,
      score: data.score || 0,
      submissions: data.submissions || [],
      solvedCount: (data.submissions || []).filter(sub => sub.correct).length,
      createdAt: data.createdAt,
      lastLogin: data.lastLogin,
      lastSubmission: data.lastSubmission
    });

  } catch (error) {
    console.error('Get team profile error:', error);
    res.status(500).json({ error: 'Failed to fetch team profile' });
  }
});

// Update team profile
router.put('/profile', async (req, res) => {
  try {
    const { teamName, password, members } = req.body;
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    
    // Check if team is banned
    if (data.banned) {
      return res.status(403).json({ error: 'Team is banned' });
    }

    const updateData = {};
    
    if (members) {
      if (members.length > 2) {
        return res.status(400).json({ error: 'Maximum 2 members per team' });
      }
      if (members.length === 0) {
        return res.status(400).json({ error: 'At least one member is required' });
      }
      updateData.members = members;
    }
    
    if (password) {
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateData.updatedAt = new Date().toISOString();

    await teamRef.update(updateData);

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update team profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get team's solved challenges
router.get('/solved', async (req, res) => {
  try {
    const { teamName } = req.query;
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    const submissions = data.submissions || [];
    const solvedChallenges = submissions.filter(sub => sub.correct);

    res.json({
      solvedChallenges,
      totalSolved: solvedChallenges.length,
      totalScore: data.score || 0
    });

  } catch (error) {
    console.error('Get solved challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch solved challenges' });
  }
});

// Get team's submission history
router.get('/submissions', async (req, res) => {
  try {
    const { teamName } = req.query;
    
    if (!teamName) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    const submissions = data.submissions || [];

    // Get challenge details for each submission
    const submissionsWithDetails = [];
    for (const submission of submissions) {
      const challengeRef = db.collection('challenges').doc(submission.challengeId);
      const challengeDoc = await challengeRef.get();
      
      if (challengeDoc.exists) {
        const challengeData = challengeDoc.data();
        submissionsWithDetails.push({
          ...submission,
          challengeTitle: challengeData.title,
          category: challengeData.category,
          points: challengeData.points
        });
      } else {
        submissionsWithDetails.push(submission);
      }
    }

    res.json({
      submissions: submissionsWithDetails,
      totalSubmissions: submissions.length,
      correctSubmissions: submissions.filter(sub => sub.correct).length,
      totalScore: data.score || 0
    });

  } catch (error) {
    console.error('Get submission history error:', error);
    res.status(500).json({ error: 'Failed to fetch submission history' });
  }
});

module.exports = router; 