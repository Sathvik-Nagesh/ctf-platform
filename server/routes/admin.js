const express = require('express');
const { db } = require('../config/firebase');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin login route
router.post('/login', async (req, res) => {
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

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Admin login successful',
      admin: { username }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all teams (admin only)
router.get('/teams', async (req, res) => {
  try {
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.orderBy('createdAt', 'desc').get();
    
    const teams = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      teams.push({
        name: doc.id,
        members: data.members,
        score: data.score || 0,
        solvedCount: (data.submissions || []).filter(sub => sub.correct).length,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
        lastSubmission: data.lastSubmission
      });
    });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get team details (admin only)
router.get('/teams/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
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
    console.error('Get team details error:', error);
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

// Ban team (admin only)
router.post('/teams/:teamName/ban', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await teamRef.update({
      banned: true,
      bannedAt: new Date().toISOString(),
      bannedBy: req.admin?.username || 'Admin'
    });

    res.json({ message: 'Team banned successfully' });

  } catch (error) {
    console.error('Ban team error:', error);
    res.status(500).json({ error: 'Failed to ban team' });
  }
});

// Unban team (admin only)
router.post('/teams/:teamName/unban', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await teamRef.update({
      banned: false,
      bannedAt: null,
      bannedBy: null
    });

    res.json({ message: 'Team unbanned successfully' });

  } catch (error) {
    console.error('Unban team error:', error);
    res.status(500).json({ error: 'Failed to unban team' });
  }
});

// Delete team (admin only)
router.post('/teams/:teamName/delete', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await teamRef.delete();

    res.json({ message: 'Team deleted successfully' });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Ban/unban team (admin only)
router.put('/teams/:teamName/ban', async (req, res) => {
  try {
    const { teamName } = req.params;
    const { banned } = req.body;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await teamRef.update({
      banned: banned,
      bannedAt: banned ? new Date().toISOString() : null,
      bannedBy: banned ? (req.admin?.username || 'Admin') : null
    });

    res.json({ 
      message: banned ? 'Team banned successfully' : 'Team unbanned successfully' 
    });

  } catch (error) {
    console.error('Ban team error:', error);
    res.status(500).json({ error: 'Failed to update team status' });
  }
});

// Delete team (admin only)
router.delete('/teams/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    
    const teamRef = db.collection('teams').doc(teamName);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete team's submissions
    const submissionsRef = db.collection('submissions');
    const submissionsSnapshot = await submissionsRef.where('teamName', '==', teamName).get();
    
    const batch = db.batch();
    submissionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete team
    batch.delete(teamRef);
    await batch.commit();

    res.json({ message: 'Team deleted successfully' });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Get event statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get teams count
    const teamsRef = db.collection('teams');
    const teamsSnapshot = await teamsRef.get();
    const totalTeams = teamsSnapshot.size;
    
    // Get challenges count
    const challengesRef = db.collection('challenges');
    const challengesSnapshot = await challengesRef.get();
    const totalChallenges = challengesSnapshot.size;
    const activeChallenges = challengesSnapshot.docs.filter(doc => doc.data().isActive !== false).length;
    
    // Get submissions count
    const submissionsRef = db.collection('submissions');
    const submissionsSnapshot = await submissionsRef.get();
    const totalSubmissions = submissionsSnapshot.size;
    const correctSubmissions = submissionsSnapshot.docs.filter(doc => doc.data().correct).length;
    
    // Get total points awarded
    let totalPoints = 0;
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.correct) {
        totalPoints += data.points || 0;
      }
    });

    // Get leaderboard
    const leaderboardRef = db.collection('leaderboard').doc('current');
    const leaderboardDoc = await leaderboardRef.get();
    const leaderboard = leaderboardDoc.exists ? leaderboardDoc.data().leaderboard || [] : [];

    res.json({
      totalTeams,
      totalChallenges,
      activeChallenges,
      totalSubmissions,
      correctSubmissions,
      totalPoints,
      leaderboard: leaderboard.slice(0, 10) // Top 10 teams
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get event settings (admin only)
router.get('/settings', async (req, res) => {
  try {
    const settingsRef = db.collection('settings').doc('event');
    const settingsDoc = await settingsRef.get();
    
    if (!settingsDoc.exists) {
      // Create default settings
      const defaultSettings = {
        eventName: 'GitXTribe CTF Event',
        eventStart: null,
        eventEnd: null,
        registrationOpen: true,
        submissionsOpen: true,
        leaderboardVisible: true,
        maxTeamSize: 2,
        createdAt: new Date().toISOString()
      };
      
      await settingsRef.set(defaultSettings);
      res.json({ settings: defaultSettings });
    } else {
      res.json({ settings: settingsDoc.data() });
    }

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update event settings (admin only)
router.put('/settings', async (req, res) => {
  try {
    const { 
      eventName, 
      eventStart, 
      eventEnd, 
      registrationOpen, 
      submissionsOpen, 
      leaderboardVisible,
      maxTeamSize 
    } = req.body;
    
    const settingsRef = db.collection('settings').doc('event');
    
    const updateData = {};
    if (eventName !== undefined) updateData.eventName = eventName;
    if (eventStart !== undefined) updateData.eventStart = eventStart;
    if (eventEnd !== undefined) updateData.eventEnd = eventEnd;
    if (registrationOpen !== undefined) updateData.registrationOpen = registrationOpen;
    if (submissionsOpen !== undefined) updateData.submissionsOpen = submissionsOpen;
    if (leaderboardVisible !== undefined) updateData.leaderboardVisible = leaderboardVisible;
    if (maxTeamSize !== undefined) updateData.maxTeamSize = maxTeamSize;
    
    updateData.updatedAt = new Date().toISOString();
    updateData.updatedBy = req.admin?.username || 'Admin';

    await settingsRef.update(updateData);
    
    res.json({ message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Send notification (admin only)
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const notificationData = {
      title,
      message,
      type: type || 'info',
      createdAt: new Date().toISOString(),
      createdBy: req.admin?.username || 'Admin',
      read: false
    };

    await db.collection('notifications').add(notificationData);
    
    res.json({ message: 'Notification sent successfully' });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});



// Get notifications (admin only)
router.get('/notifications', async (req, res) => {
  try {
    const notificationsRef = db.collection('notifications');
    const snapshot = await notificationsRef.orderBy('createdAt', 'desc').limit(50).get();
    
    const notifications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        title: data.title,
        message: data.message,
        type: data.type,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        read: data.read
      });
    });

    res.json({ notifications });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router; 