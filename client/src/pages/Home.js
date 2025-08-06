import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChallenges } from '../context/ChallengeContext';
import { useLeaderboard } from '../context/LeaderboardContext';

export default function Home() {
  const { user } = useAuth();
  const { challenges, loading: challengesLoading } = useChallenges();
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard();

  // Show loading state while data is being fetched
  if (challengesLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  // Ensure we have valid data
  const challengesData = Array.isArray(challenges) ? challenges : [];
  const leaderboardData = Array.isArray(leaderboard) ? leaderboard : [];

  const stats = {
    totalChallenges: challengesData.length,
    totalTeams: leaderboardData.length,
    totalPoints: challengesData.reduce((sum, c) => sum + (c.points || 0), 0),
    categories: [...new Set(challengesData.map(c => c.category))].length
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              GitXTribe
              <span className="block text-3xl md:text-4xl font-light mt-2 drop-shadow-md">CTF Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Experience the thrill of Capture The Flag with our advanced platform designed for technical clubs and cybersecurity enthusiasts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
                  >
                    Register Team
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white hover:text-primary hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Statistics</h2>
            <p className="text-lg text-gray-600">Real-time updates on the CTF event</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-2">{stats.totalChallenges}</div>
              <div className="text-sm text-gray-700 font-medium">Challenges</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalTeams}</div>
              <div className="text-sm text-gray-700 font-medium">Teams</div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPoints}</div>
              <div className="text-sm text-gray-700 font-medium">Total Points</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.categories}</div>
              <div className="text-sm text-gray-700 font-medium">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600">Everything you need for an amazing CTF experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Challenges</h3>
              <p className="text-gray-700">
                Multiple categories including Web, Crypto, Forensics, Reverse Engineering, and more.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Leaderboard</h3>
              <p className="text-gray-700">
                Track your progress and compete with other teams in real-time rankings.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-700">
                Form teams of up to 2 members and work together to solve challenges.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
              <p className="text-gray-700">
                View your submission history, success rates, and performance metrics.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">File Downloads</h3>
              <p className="text-gray-700">
                Download challenge files and resources directly from the platform.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-700">
                Stay updated with real-time notifications and event announcements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">How It Works</h2>
            <p className="text-lg text-black">Get started in just a few simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-primary text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Register Team</h3>
              <p className="text-black">Create your team with up to 2 members</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-primary text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Browse Challenges</h3>
              <p className="text-black">Explore challenges by category and difficulty</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-primary text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Solve & Submit</h3>
              <p className="text-black">Download files, analyze, and submit flags</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-primary text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Track Progress</h3>
              <p className="text-black">Monitor your score and leaderboard position</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary via-accent to-secondary py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-15"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Start?</h2>
          <p className="text-xl text-white/95 mb-8 drop-shadow-md">
            Join the competition and test your cybersecurity skills today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/challenges"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                View Challenges
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-primary font-semibold rounded-lg shadow-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-8 py-3 bg-white/25 backdrop-blur-sm border-2 border-white/70 text-white font-semibold rounded-lg hover:bg-white hover:text-primary hover:border-white transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  View Leaderboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">GitXTribe Technical Club</h3>
          <p className="text-gray-400 mb-6">
            Empowering students with hands-on cybersecurity experience through Capture The Flag challenges.
          </p>
          
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link to="/challenges" className="hover:text-white transition">Challenges</Link>
            <Link to="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
            <Link to="/admin/login" className="hover:text-white transition">Admin</Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-500">
            <p>&copy; 2025 GitXTribe CTF Platform. Built with ❤️ for the technical community.</p>
          </div>
        </div>
      </div>
    </div>
  );
}