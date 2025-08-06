const express = require('express');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current leaderboard
router.get('/', async (req, res) => {
  try {
    const settingsRef = db.collection('settings').doc('leaderboard');
    const doc = await settingsRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      res.json({
        leaderboard: data.leaderboard || [],
        lastUpdated: data.lastUpdated
      });
    } else {
      // If no leaderboard exists, create one
      await updateLeaderboard();
      const newDoc = await settingsRef.get();
      const data = newDoc.data();
      res.json({
        leaderboard: data.leaderboard || [],
        lastUpdated: data.lastUpdated
      });
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Refresh leaderboard (force update)
router.post('/refresh', async (req, res) => {
  try {
    await updateLeaderboard();
    res.json({ message: 'Leaderboard refreshed successfully' });
  } catch (error) {
    console.error('Refresh leaderboard error:', error);
    res.status(500).json({ error: 'Failed to refresh leaderboard' });
  }
});

// Get team's position on leaderboard
router.get('/team/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const leaderboardRef = db.collection('leaderboard').doc('current');
    const leaderboardDoc = await leaderboardRef.get();
    
    if (!leaderboardDoc.exists) {
      return res.status(404).json({ error: 'Leaderboard not found' });
    }

    const data = leaderboardDoc.data();
    const leaderboard = data.leaderboard || [];
    
    const teamPosition = leaderboard.find(team => team.teamName === teamName);
    
    if (!teamPosition) {
      return res.status(404).json({ error: 'Team not found on leaderboard' });
    }

    res.json({ team: teamPosition });

  } catch (error) {
    console.error('Get team position error:', error);
    res.status(500).json({ error: 'Failed to fetch team position' });
  }
});

// Reset leaderboard (admin only)
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Starting comprehensive reset...');
    
    // Reset all team scores
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.get();
    
    const batch = db.batch();
    
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        score: 0,
        submissions: [],
        lastSubmission: null
      });
    });
    
    await batch.commit();
    console.log('✅ Team scores and submissions reset');
    
    // Clear submissions collection
    const submissionsRef = db.collection('submissions');
    const submissionsSnapshot = await submissionsRef.get();
    
    const submissionsBatch = db.batch();
    submissionsSnapshot.forEach(doc => {
      submissionsBatch.delete(doc.ref);
    });
    
    await submissionsBatch.commit();
    console.log('✅ Submissions collection cleared');
    
    // Reset all challenge solved status
    const challengesRef = db.collection('challenges');
    const challengesSnapshot = await challengesRef.get();
    
    const challengesBatch = db.batch();
    challengesSnapshot.forEach(doc => {
      challengesBatch.update(doc.ref, {
        solvedCount: 0,
        solvedBy: []
      });
    });
    
    await challengesBatch.commit();
    console.log('✅ Challenge solved status reset');
    
    // Update leaderboard
    await updateLeaderboard();
    console.log('✅ Leaderboard updated');
    
    res.json({ message: 'Complete reset successful - All scores, submissions, and challenge status cleared' });

  } catch (error) {
    console.error('Reset leaderboard error:', error);
    res.status(500).json({ error: 'Failed to reset leaderboard' });
  }
});

// Archive current leaderboard (admin only)
router.post('/archive', async (req, res) => {
  try {
    const { eventName } = req.body;
    
    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    // Get current leaderboard
    const leaderboardRef = db.collection('leaderboard').doc('current');
    const leaderboardDoc = await leaderboardRef.get();
    
    if (!leaderboardDoc.exists) {
      return res.status(404).json({ error: 'No leaderboard to archive' });
    }

    const data = leaderboardDoc.data();
    
    // Create archive entry
    const archiveData = {
      eventName,
      leaderboard: data.leaderboard,
      archivedAt: new Date().toISOString(),
      archivedBy: req.admin?.username || 'Admin'
    };

    await db.collection('leaderboard_archives').add(archiveData);
    
    res.json({ message: 'Leaderboard archived successfully' });

  } catch (error) {
    console.error('Archive leaderboard error:', error);
    res.status(500).json({ error: 'Failed to archive leaderboard' });
  }
});

// Get archived leaderboards (admin only)
router.get('/archives', async (req, res) => {
  try {
    const archivesRef = db.collection('leaderboard_archives');
    const snapshot = await archivesRef.orderBy('archivedAt', 'desc').get();
    
    const archives = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      archives.push({
        id: doc.id,
        eventName: data.eventName,
        archivedAt: data.archivedAt,
        archivedBy: data.archivedBy,
        teamCount: data.leaderboard.length
      });
    });

    res.json({ archives });

  } catch (error) {
    console.error('Get archives error:', error);
    res.status(500).json({ error: 'Failed to fetch archives' });
  }
});

// Get specific archived leaderboard (admin only)
router.get('/archives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const archiveRef = db.collection('leaderboard_archives').doc(id);
    const archiveDoc = await archiveRef.get();
    
    if (!archiveDoc.exists) {
      return res.status(404).json({ error: 'Archive not found' });
    }

    const data = archiveDoc.data();
    res.json({
      id: archiveDoc.id,
      eventName: data.eventName,
      leaderboard: data.leaderboard,
      archivedAt: data.archivedAt,
      archivedBy: data.archivedBy
    });

  } catch (error) {
    console.error('Get archive error:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

// Helper function to update leaderboard
async function updateLeaderboard() {
  try {
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.get();
    
    const leaderboard = [];
    
    // Get all teams and sort them properly
    const teams = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      teams.push({
        teamName: data.teamName,
        members: data.members,
        score: data.score || 0,
        submissions: data.submissions || [],
        lastSubmission: data.lastSubmission
      });
    });
    
    // Sort teams by score (descending) and then by lastSubmission (ascending for tie-breaking)
    teams.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
      
      // If scores are equal, sort by lastSubmission (earlier wins)
      if (a.lastSubmission && b.lastSubmission) {
        const aTime = a.lastSubmission._seconds ? a.lastSubmission._seconds * 1000 : new Date(a.lastSubmission).getTime();
        const bTime = b.lastSubmission._seconds ? b.lastSubmission._seconds * 1000 : new Date(b.lastSubmission).getTime();
        return aTime - bTime; // Earlier time first
      }
      
      // If one has submission and other doesn't, the one with submission wins
      if (a.lastSubmission && !b.lastSubmission) return -1;
      if (!a.lastSubmission && b.lastSubmission) return 1;
      
      return 0; // Both have no submissions
    });
    
    // Create leaderboard entries
    teams.forEach((team, index) => {
      const solvedCount = team.submissions.filter(sub => sub.correct).length;
      
      // Convert Firestore timestamp to JavaScript Date
      let lastSubmission = null;
      if (team.lastSubmission) {
        if (team.lastSubmission._seconds) {
          // Firestore timestamp object
          lastSubmission = new Date(team.lastSubmission._seconds * 1000);
        } else if (team.lastSubmission.toDate) {
          // Firestore Timestamp object
          lastSubmission = team.lastSubmission.toDate();
        } else if (typeof team.lastSubmission === 'string') {
          // ISO string
          lastSubmission = new Date(team.lastSubmission);
        } else {
          // Regular Date object
          lastSubmission = new Date(team.lastSubmission);
        }
      }
      
      leaderboard.push({
        rank: index + 1,
        teamName: team.teamName,
        members: team.members,
        score: team.score,
        solvedCount,
        lastSubmission: lastSubmission ? lastSubmission.toISOString() : null
      });
    });

    // Update leaderboard in settings collection
    const settingsRef = db.collection('settings').doc('leaderboard');
    await settingsRef.set({
      leaderboard,
      lastUpdated: new Date()
    });

    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
}

module.exports = router; 