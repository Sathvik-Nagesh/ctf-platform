import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChallenges } from '../context/ChallengeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AVATARS = [
  '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🐧', '🐨', '🦄', '🐲', '🐙', '🦉', '🦋', '🐝', '🐞', '🦕', '🦖'
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { getTeamSubmissions } = useChallenges();
  
  const [form, setForm] = useState({
    teamName: '',
    member1: '',
    member2: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Load team submissions
        const teamSubmissions = await getTeamSubmissions();
        setSubmissions(teamSubmissions);
        
        // Initialize form with current user data
        setForm({
          teamName: user?.name || '',
          member1: user?.members?.[0]?.name || '',
          member2: user?.members?.[1]?.name || '',
          avatar: user?.avatar || AVATARS[0],
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Load profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, getTeamSubmissions]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.teamName.trim()) {
      return window.toast && window.toast.error('Team name is required.');
    }
    
    if (!form.member1.trim()) {
      return window.toast && window.toast.error('At least one member is required.');
    }

    setSaving(true);
    try {
      const updates = {
        name: form.teamName.trim(),
        members: [
          { name: form.member1.trim(), avatar: form.avatar },
          ...(form.member2.trim() ? [{ name: form.member2.trim(), avatar: form.avatar }] : [])
        ],
        avatar: form.avatar
      };

      await updateProfile(updates);
      window.toast && window.toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return window.toast && window.toast.error('Please fill all password fields.');
    }
    
    if (form.newPassword.length < 6) {
      return window.toast && window.toast.error('New password must be at least 6 characters.');
    }
    
    if (form.newPassword !== form.confirmPassword) {
      return window.toast && window.toast.error('New passwords do not match.');
    }

    setSaving(true);
    try {
      await updateProfile({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      
      // Clear password fields
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      window.toast && window.toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Update password error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Team Profile</h1>
        <p className="text-gray-600">Manage your team information and settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === 'password'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === 'submissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Submission History
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Team Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamName"
                value={form.teamName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={32}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member 1 Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="member1"
                value={form.member1}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={32}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member 2 Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                name="member2"
                value={form.member2}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={32}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Avatar
              </label>
              <select
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {AVATARS.map(avatar => (
                  <option key={avatar} value={avatar}>{avatar}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner size="sm" text="Saving..." /> : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner size="sm" text="Updating..." /> : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Submission History Tab */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Submission History</h3>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600">No submissions yet</p>
              <p className="text-sm text-gray-500 mt-1">Start solving challenges to see your submission history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <span className={`text-sm px-2 py-1 rounded mr-3 ${
                      submission.correct 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="font-medium">{submission.challengeTitle}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(submission.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {submission.points || 0} pts
                    </p>
                    <p className="text-xs text-gray-500">
                      {submission.correct ? 'Correct' : 'Incorrect'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}