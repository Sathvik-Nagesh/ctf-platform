import React, { useState } from 'react';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Leaderboard() {
  const { leaderboard, loading, lastUpdated, getLeaderboardStats } = useLeaderboard();
  const { user } = useAuth();
  const [showTop10, setShowTop10] = useState(true);

  const stats = getLeaderboardStats();
  const currentTeam = user && user.type === 'team' ? leaderboard.find(team => team.teamName === user.teamName) : null;

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading leaderboard..." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Leaderboard</h1>
        <p className="text-gray-600">
          Real-time rankings and team performance
          {lastUpdated && (
            <span className="text-sm text-gray-500 ml-2">
              • Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

             {/* Current Team Position */}
       {currentTeam && (
         <div className="bg-white border-2 border-primary rounded-lg shadow p-6 mb-6">
           <h3 className="text-lg font-semibold mb-2 text-gray-900">Your Team Position</h3>
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <span className="text-3xl mr-4">{getRankIcon(currentTeam.rank)}</span>
               <div>
                 <p className="text-xl font-bold text-gray-900">{currentTeam.teamName}</p>
                 <p className="text-sm text-gray-600">
                   Rank #{currentTeam.rank} • {currentTeam.score} points • {currentTeam.solvedCount || 0} challenges solved
                 </p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-sm text-gray-600">
                 Last solve: {currentTeam.lastSubmission 
                   ? (() => {
                       try {
                         const date = new Date(currentTeam.lastSubmission);
                         if (isNaN(date.getTime())) {
                           return 'Invalid Date';
                         }
                         return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                       } catch (error) {
                         return 'Invalid Date';
                       }
                     })()
                   : 'No submissions yet'
                 }
               </p>
             </div>
           </div>
         </div>
       )}

      {/* Leaderboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalTeams}</div>
          <div className="text-sm text-gray-600">Total Teams</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.highestScore}</div>
          <div className="text-sm text-gray-600">Highest Score</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.lowestScore}</div>
          <div className="text-sm text-gray-600">Lowest Score</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setShowTop10(true)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              showTop10 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Top 10
          </button>
          <button
            onClick={() => setShowTop10(false)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              !showTop10 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Teams
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {showTop10 ? 'Top 10 Teams' : 'All Teams'}
          </h3>
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-600">Be the first to register and start solving challenges!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Solve
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showTop10 ? leaderboard.slice(0, 10) : leaderboard).map((team, index) => (
                  <tr 
                    key={team.teamName}
                    className={`hover:bg-gray-50 transition ${
                      user && team.teamName === user.name ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-bold mr-2">{getRankIcon(team.rank)}</span>
                        <span className="text-sm text-gray-500">#{team.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{team.avatar || '👥'}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {team.teamName}
                            {user && team.teamName === user.name && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {team.members?.map(m => m.name).join(', ') || 'No members'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary">
                        {team.score} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.solvedCount || 0} challenges
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.lastSubmission 
                        ? (() => {
                            try {
                              const date = new Date(team.lastSubmission);
                              if (isNaN(date.getTime())) {
                                return 'Invalid Date';
                              }
                              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            } catch (error) {
                              return 'Invalid Date';
                            }
                          })()
                        : 'No submissions'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Show More/Less Button */}
      {leaderboard.length > 10 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowTop10(!showTop10)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            {showTop10 ? 'Show All Teams' : 'Show Top 10 Only'}
          </button>
        </div>
      )}
    </div>
  );
}