import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  // Simple dashboard - no complex loading states
  if (!user?.name) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">Not Logged In</p>
          <p>Please log in to view your dashboard.</p>
          <Link
            to="/login"
            className="mt-2 inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Welcome, {user.name}!</h1>
        <p className="text-gray-600">Track your progress and manage your team</p>
      </div>

      {/* Team Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Team Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Team Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Members</p>
            <p className="text-lg font-semibold">
              {user.members?.map(m => m.name).join(', ') || 'No members'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avatar</p>
            <p className="text-2xl">{user.avatar || '👥'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Joined</p>
            <p className="text-lg font-semibold">
              {user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link 
            to="/challenges"
            className="block w-full text-left p-3 rounded border hover:bg-gray-50 transition"
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">🔍</span>
              <div>
                <p className="font-medium">View Challenges</p>
                <p className="text-sm text-gray-600">Browse and solve challenges</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/leaderboard"
            className="block w-full text-left p-3 rounded border hover:bg-gray-50 transition"
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">🏆</span>
              <div>
                <p className="font-medium">View Leaderboard</p>
                <p className="text-sm text-gray-600">See team rankings</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/profile"
            className="block w-full text-left p-3 rounded border hover:bg-gray-50 transition"
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">👥</span>
              <div>
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm text-gray-600">Update team information</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}