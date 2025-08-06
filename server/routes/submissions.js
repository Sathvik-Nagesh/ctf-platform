const express = require('express');
const { db } = require('../config/firebase');
const { authenticateTeam, submissionRateLimit } = require('../middleware/auth');

const router = express.Router();

// Submit flag
router.post('/flag', authenticateTeam, async (req, res) => {
  try {
    const { challengeId, flag } = req.body;
    const { team } = req;

    // Rate limiting check
    const rateLimitKey = `flag_submission:${team.name}`;
    const currentTimeMs = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxAttempts = 10;

    const attempts = team.rateLimitAttempts || [];
    const recentAttempts = attempts.filter(timestamp => currentTimeMs - timestamp < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        error: 'Too many flag submissions. Please wait before trying again.' 
      });
    }

    // Get challenge details
    const challengeRef = db.collection('challenges').doc(challengeId);
    const challengeDoc = await challengeRef.get();

    if (!challengeDoc.exists) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const challenge = challengeDoc.data();
    const isCorrect = challenge.flag.toLowerCase() === flag.toLowerCase();

    // Check if already solved - find team by teamName field
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', team.name).get();
    
    if (teamQuery.empty) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    const submissions = teamData.submissions || [];
    
    const alreadySolved = submissions.some(sub => 
      sub.challengeId === challengeId && sub.correct
    );

    if (alreadySolved) {
      return res.json({ 
        correct: true, 
        message: 'Flag already submitted correctly' 
      });
    }

    // Create submission record
    const submission = {
      challengeId,
      flag,
      correct: isCorrect,
      submittedAt: new Date().toISOString(),
      challengeTitle: challenge.title
    };

    // Update team submissions
    submissions.push(submission);
    
    let scoreChange = 0;
    let solvedCount = challenge.solvedCount || 0;
    let solvedBy = challenge.solvedBy || [];

    if (isCorrect) {
      scoreChange = challenge.points;
      solvedCount++;
      
      // Add team to solvedBy list if not already there
      if (!solvedBy.includes(team.name)) {
        solvedBy.push(team.name);
      }
    }

    // Update team data
    const newScore = (teamData.score || 0) + scoreChange;
    const submissionTime = new Date();
    
    await teamDoc.ref.update({
      submissions,
      score: newScore,
      lastSubmission: submissionTime,
      rateLimitAttempts: [...recentAttempts, Date.now()]
    });

    // Update challenge solved count and solvedBy list
    await challengeRef.update({
      solvedCount,
      solvedBy
    });

    // Update leaderboard
    await updateLeaderboard();

    res.json({
      correct: isCorrect,
      scoreChange,
      newScore,
      message: isCorrect ? 'Correct flag! Points awarded.' : 'Incorrect flag. Try again.'
    });

  } catch (error) {
    console.error('Flag submission error:', error);
    res.status(500).json({ error: 'Failed to submit flag' });
  }
});

// Get team submissions
router.get('/team', authenticateTeam, async (req, res) => {
  try {
    const { team } = req;
    
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', team.name).get();
    
    if (teamQuery.empty) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    const submissions = teamData.submissions || [];

    res.json({
      submissions,
      totalScore: teamData.score || 0,
      solvedCount: submissions.filter(sub => sub.correct).length
    });

  } catch (error) {
    console.error('Get team submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get team submissions (POST route for frontend compatibility)
router.post('/team', authenticateTeam, async (req, res) => {
  try {
    const { team } = req;
    
    const teamsRef = db.collection('teams');
    const teamQuery = await teamsRef.where('teamName', '==', team.name).get();
    
    if (teamQuery.empty) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamDoc = teamQuery.docs[0];
    const teamData = teamDoc.data();
    const submissions = teamData.submissions || [];

    res.json({
      submissions,
      totalScore: teamData.score || 0,
      solvedCount: submissions.filter(sub => sub.correct).length
    });

  } catch (error) {
    console.error('Get team submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get all submissions (admin only)
router.get('/all', async (req, res) => {
  try {
    const submissionsRef = db.collection('submissions');
    const snapshot = await submissionsRef.orderBy('submittedAt', 'desc').get();
    
    const submissions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      submissions.push({
        id: doc.id,
        teamName: data.teamName,
        challengeId: data.challengeId,
        challengeTitle: data.challengeTitle,
        correct: data.correct,
        submittedAt: data.submittedAt,
        points: data.points
      });
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard() {
  try {
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.orderBy('score', 'desc').orderBy('lastSubmission', 'asc').get();
    
    const leaderboard = [];
    let rank = 1;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      leaderboard.push({
        rank,
        teamName: data.teamName, // Use teamName field instead of doc.id
        members: data.members,
        score: data.score || 0,
        solvedCount: (data.submissions || []).filter(sub => sub.correct).length,
        lastSubmission: data.lastSubmission || null
      });
      rank++;
    });

    // Update leaderboard in settings collection
    const settingsRef = db.collection('settings').doc('leaderboard');
    await settingsRef.set({
      leaderboard,
      lastUpdated: new Date().toISOString()
    });

    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
}

module.exports = router; 