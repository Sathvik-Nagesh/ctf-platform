import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LeaderboardContext = createContext();

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

export const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leaderboard');
      setLeaderboard(response.data.leaderboard || []);
      setLastUpdated(response.data.lastUpdated);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh leaderboard every 30 seconds
  useEffect(() => {
    fetchLeaderboard();
    
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 30000); // Refresh every 30 seconds

    // Listen for leaderboard update events
    const handleLeaderboardUpdate = () => {
      fetchLeaderboard();
    };

    window.addEventListener('leaderboard-update', handleLeaderboardUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('leaderboard-update', handleLeaderboardUpdate);
    };
  }, []);

  const getTeamPosition = (teamName) => {
    const team = leaderboard.find(entry => entry.teamName === teamName);
    return team ? team.rank : null;
  };

  const getTeamStats = (teamName) => {
    console.log('LeaderboardContext - Looking for team:', teamName);
    console.log('LeaderboardContext - Available teams:', leaderboard.map(t => t.teamName));
    const team = leaderboard.find(entry => entry.teamName.toLowerCase() === teamName?.toLowerCase());
    console.log('LeaderboardContext - Found team:', team);
    return team || null;
  };

  const getTopTeams = (count = 10) => {
    return leaderboard.slice(0, count);
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-500';
  };

  const getLeaderboardStats = () => {
    if (!leaderboard || leaderboard.length === 0) {
      return {
        totalTeams: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = leaderboard.map(team => team.score || 0);
    const totalTeams = leaderboard.length;
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalTeams);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    return {
      totalTeams,
      averageScore,
      highestScore,
      lowestScore
    };
  };

  return (
    <LeaderboardContext.Provider value={{
      leaderboard,
      loading,
      lastUpdated,
      fetchLeaderboard,
      getTeamPosition,
      getTeamStats,
      getTopTeams,
      getRankColor,
      getLeaderboardStats
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
}; 