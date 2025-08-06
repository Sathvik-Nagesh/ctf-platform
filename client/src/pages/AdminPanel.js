import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChallenges } from '../context/ChallengeContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const { challenges, fetchChallenges } = useChallenges();
  const { leaderboard, fetchLeaderboard } = useLeaderboard();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalChallenges: 0,
    totalSubmissions: 0,
    activeTeams: 0
  });

  // Challenge form state
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    category: '',
    points: 100,
    flag: '',
    hints: [''],
    files: []
  });

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load teams
      const teamsResponse = await fetch('/api/admin/teams');
      const teamsData = await teamsResponse.json();
      setTeams(teamsData.teams || []);
      
      // Load statistics
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
      
    } catch (error) {
      console.error('Load admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', challengeForm.title);
      formData.append('description', challengeForm.description);
      formData.append('category', challengeForm.category);
      formData.append('points', challengeForm.points);
      formData.append('flag', challengeForm.flag);
      formData.append('hints', JSON.stringify(challengeForm.hints.filter(h => h.trim())));
      
      challengeForm.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/challenges', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        window.toast && window.toast.success('Challenge created successfully!');
        setChallengeForm({
          title: '',
          description: '',
          category: '',
          points: 100,
          flag: '',
          hints: [''],
          files: []
        });
        fetchChallenges();
      } else {
        const error = await response.json();
        window.toast && window.toast.error(error.error || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Create challenge error:', error);
      window.toast && window.toast.error('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationForm)
      });

      if (response.ok) {
        window.toast && window.toast.success('Notification sent successfully!');
        setNotificationForm({
          title: '',
          message: '',
          type: 'info'
        });
      } else {
        const error = await response.json();
        window.toast && window.toast.error(error.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Send notification error:', error);
      window.toast && window.toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAction = async (teamName, action) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamName}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        window.toast && window.toast.success(`Team ${action} successfully!`);
        loadAdminData();
      } else {
        const error = await response.json();
        window.toast && window.toast.error(error.error || `Failed to ${action} team`);
      }
    } catch (error) {
      console.error(`${action} team error:`, error);
      window.toast && window.toast.error(`Failed to ${action} team`);
    }
  };

  const handleLeaderboardReset = async () => {
    if (!window.confirm('Are you sure you want to reset everything? This will:\n\n• Reset all team scores to 0\n• Clear all submissions\n• Reset all challenge solved status\n• Clear leaderboard\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/leaderboard/reset', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        window.toast && window.toast.success(data.message || 'Complete reset successful!');
        
        // Refresh all data
        fetchLeaderboard();
        fetchChallenges();
        loadAdminData();
        
        // Trigger leaderboard update event for real-time updates
        window.dispatchEvent(new CustomEvent('leaderboard-update'));
      } else {
        const error = await response.json();
        window.toast && window.toast.error(error.error || 'Failed to reset');
      }
    } catch (error) {
      console.error('Reset error:', error);
      window.toast && window.toast.error('Failed to reset');
    }
  };

  const handleChallengeEdit = (challenge) => {
    // Populate form with challenge data for editing
    setChallengeForm({
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      points: challenge.points,
      flag: challenge.flag || '',
      hints: challenge.hints || [''],
      files: []
    });
    
    // Scroll to the form
    document.querySelector('.bg-white.rounded-lg.shadow.p-6').scrollIntoView({ behavior: 'smooth' });
    
    window.toast && window.toast.info('Challenge loaded for editing. Update the form and click "Create Challenge" to save changes.');
  };

  const handleChallengeDelete = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/challenges/${challengeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        window.toast && window.toast.success('Challenge deleted successfully!');
        fetchChallenges();
      } else {
        const error = await response.json();
        window.toast && window.toast.error(error.error || 'Failed to delete challenge');
      }
    } catch (error) {
      console.error('Delete challenge error:', error);
      window.toast && window.toast.error('Failed to delete challenge');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading admin panel..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage your CTF event and monitor teams</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Challenges</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTeams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'teams', label: 'Manage Teams', icon: '👥' },
          { id: 'challenges', label: 'Challenges', icon: '🎯' },
          { id: 'notifications', label: 'Notifications', icon: '📢' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
          { id: 'files', label: 'File Manager', icon: '📁' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('challenges')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition text-left"
              >
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium">Create Challenge</h4>
                <p className="text-sm text-gray-600">Add new challenges to the event</p>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className="p-4 border rounded-lg hover:bg-gray-50 transition text-left"
              >
                <div className="text-2xl mb-2">📢</div>
                <h4 className="font-medium">Send Notification</h4>
                <p className="text-sm text-gray-600">Notify all teams about updates</p>
              </button>
              
              <button
                onClick={handleLeaderboardReset}
                className="p-4 border rounded-lg hover:bg-gray-50 transition text-left"
              >
                <div className="text-2xl mb-2">🔄</div>
                                  <h4 className="font-medium">Reset Everything</h4>
                                  <p className="text-sm text-gray-600">Clear all scores, submissions, and challenge status</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Teams</h3>
              {teams.slice(0, 5).map(team => (
                <div key={team.name} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-gray-600">{team.members?.map(m => m.name).join(', ')}</p>
                  </div>
                  <span className="text-sm text-gray-500">{team.score || 0} pts</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Challenges</h3>
              {challenges.slice(0, 5).map(challenge => (
                <div key={challenge.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{challenge.title}</p>
                    <p className="text-sm text-gray-600">{challenge.category}</p>
                  </div>
                  <span className="text-sm text-gray-500">{challenge.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Manage Teams</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map(team => (
                  <tr key={team.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{team.avatar || '👥'}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">Joined {new Date(team.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.members?.map(m => m.name).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {team.score || 0} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        team.banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {team.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {team.banned ? (
                          <button
                            onClick={() => handleTeamAction(team.name, 'unban')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTeamAction(team.name, 'ban')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Ban
                          </button>
                        )}
                        <button
                          onClick={() => handleTeamAction(team.name, 'delete')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Challenge</h3>
            <form onSubmit={handleChallengeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={challengeForm.title}
                    onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={challengeForm.category}
                    onChange={(e) => setChallengeForm({...challengeForm, category: e.target.value})}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={challengeForm.points}
                    onChange={(e) => setChallengeForm({...challengeForm, points: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Flag</label>
                  <input
                    type="text"
                    value={challengeForm.flag}
                    onChange={(e) => setChallengeForm({...challengeForm, flag: e.target.value})}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hints</label>
                {challengeForm.hints.map((hint, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...challengeForm.hints];
                        newHints[index] = e.target.value;
                        setChallengeForm({...challengeForm, hints: newHints});
                      }}
                      className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Hint ${index + 1}`}
                    />
                    {challengeForm.hints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newHints = challengeForm.hints.filter((_, i) => i !== index);
                          setChallengeForm({...challengeForm, hints: newHints});
                        }}
                        className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setChallengeForm({...challengeForm, hints: [...challengeForm.hints, '']})}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  + Add Hint
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setChallengeForm({...challengeForm, files: Array.from(e.target.files)})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" text="Creating..." /> : 'Create Challenge'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Existing Challenges</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challenges.map(challenge => (
                    <tr key={challenge.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {challenge.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {challenge.points} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {challenge.solvedCount || 0} teams
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleChallengeEdit(challenge)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleChallengeDelete(challenge.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
          <form onSubmit={handleNotificationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" text="Sending..." /> : 'Send Notification'}
            </button>
          </form>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Leaderboard Management</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleLeaderboardReset}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Reset Everything
                </button>
                <button
                  onClick={() => fetchLeaderboard()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Solve</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map(team => (
                    <tr key={team.teamName}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{team.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{team.avatar || '👥'}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                            <div className="text-sm text-gray-500">{team.members?.map(m => m.name).join(', ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        {team.score} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.solvedCount || 0} challenges
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.lastSubmission 
                          ? new Date(team.lastSubmission).toLocaleDateString()
                          : 'No submissions'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">File Manager</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600">File management coming soon...</p>
            <p className="text-sm text-gray-500 mt-1">Upload and manage challenge files</p>
          </div>
        </div>
      )}
    </div>
  );
}