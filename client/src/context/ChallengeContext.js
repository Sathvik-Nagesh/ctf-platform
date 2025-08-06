import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChallengeContext = createContext();

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
};

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/challenges');
      
      // Handle the response format - it should be an array directly
      const challengesData = Array.isArray(response.data) ? response.data : [];
      setChallenges(challengesData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(challengesData.map(c => c.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Fetch challenges error:', error);
      setChallenges([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single challenge
  const fetchChallenge = async (id) => {
    try {
      const response = await axios.get(`/api/challenges/${id}`);
      return response.data;
    } catch (error) {
      console.error('Fetch challenge error:', error);
      toast.error('Failed to fetch challenge');
      throw error;
    }
  };

  // Submit flag
  const submitFlag = async (challengeId, flag) => {
    try {
      // Get user data from localStorage for authentication
      const savedUser = localStorage.getItem('ctf_user');
      if (!savedUser) {
        throw new Error('User not authenticated');
      }
      
      const userData = JSON.parse(savedUser);
      if (userData.type !== 'team') {
        throw new Error('Only teams can submit flags');
      }

      const response = await axios.post('/api/submissions/flag', {
        challengeId,
        flag,
        teamName: userData.name,
        password: userData.password
      });

      // Update challenges list to reflect solved status
      setChallenges(prev => 
        prev.map(challenge => {
          if (challenge.id === challengeId && response.data.correct) {
            return {
              ...challenge,
              solvedCount: (challenge.solvedCount || 0) + 1,
              solvedBy: [...(challenge.solvedBy || []), userData.name]
            };
          }
          return challenge;
        })
      );

      // Trigger leaderboard refresh for real-time updates
      if (response.data.correct) {
        // Dispatch a custom event to notify leaderboard to refresh
        window.dispatchEvent(new CustomEvent('leaderboard-update'));
      }

      return response.data;
    } catch (error) {
      console.error('Submit flag error:', error);
      const message = error.response?.data?.error || 'Failed to submit flag';
      throw new Error(message);
    }
  };

  // Get team submissions
  const getTeamSubmissions = async () => {
    try {
      // Get user data from localStorage for authentication
      const savedUser = localStorage.getItem('ctf_user');
      if (!savedUser) {
        throw new Error('User not authenticated');
      }
      
      const userData = JSON.parse(savedUser);
      if (userData.type !== 'team') {
        throw new Error('Only teams can view submissions');
      }

      const response = await axios.post('/api/submissions/team', {
        teamName: userData.name,
        password: userData.password
      });
      return response.data;
    } catch (error) {
      console.error('Get team submissions error:', error);
      throw error;
    }
  };

  // Filter challenges by category
  const filteredChallenges = selectedCategory === 'all' 
    ? challenges || []
    : (challenges || []).filter(challenge => challenge.category === selectedCategory);

  // Get solved challenges for current team
  const getSolvedChallenges = async () => {
    try {
      const submissions = await getTeamSubmissions();
      const solvedSubmissions = submissions.filter(s => s.correct);
      return solvedSubmissions.map(s => s.challengeId);
    } catch (error) {
      console.error('Get solved challenges error:', error);
      return [];
    }
  };

  // Check if challenge is solved
  const isChallengeSolved = (challengeId) => {
    // This would check against team submissions
    return false;
  };

  // Get challenge statistics
  const getChallengeStats = () => {
    const total = challenges?.length || 0;
    const active = challenges?.filter(c => c.isActive)?.length || 0;
    
    return { total, active, solved: 0 }; // solved will be calculated in Dashboard
  };

  // Load challenges on mount
  useEffect(() => {
    fetchChallenges();
  }, []);

  const value = {
    challenges: filteredChallenges || [],
    allChallenges: challenges || [],
    loading,
    categories,
    selectedCategory,
    setSelectedCategory,
    fetchChallenges,
    fetchChallenge,
    submitFlag,
    getTeamSubmissions,
    getSolvedChallenges,
    isChallengeSolved,
    getChallengeStats
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}; 