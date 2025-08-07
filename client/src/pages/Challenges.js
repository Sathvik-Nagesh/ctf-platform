import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChallenges } from '../context/ChallengeContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Challenges() {
  const { challenges, loading, fetchChallenges } = useChallenges();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = [...new Set((challenges || []).map(c => c.category))];
    setCategories(uniqueCategories);
  }, [challenges]);

  // Filter challenges based on search and category
  const filteredChallenges = (challenges || []).filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if current user has solved a challenge
  const isSolvedByUser = (challenge) => {
    if (!user || user.type !== 'team') return false;
    return challenge.solvedBy && challenge.solvedBy.includes(user.teamName);
  };

  // Get solved count display
  const getSolvedDisplay = (challenge) => {
    if (!challenge.solvedCount || challenge.solvedCount === 0) {
      return '0 solved';
    }
    return `${challenge.solvedCount} solved`;
  };

  if (loading) {
    return <LoadingSpinner text="Loading challenges..." />;
  }

  const solvedCount = (challenges || []).filter(c => isSolvedByUser(c)).length;
  const totalPoints = (challenges || []).filter(c => isSolvedByUser(c)).reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Challenges</h1>
        <p className="text-gray-600">Browse and solve challenges to earn points.</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Challenges
            </label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChallenges.map(challenge => (
          <div key={challenge.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{challenge.title}</h3>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                {challenge.points <= 100 ? 'Easy' : 
                 challenge.points <= 200 ? 'Medium' : 
                 challenge.points <= 300 ? 'Hard' : 'Expert'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                {challenge.category}
              </span>
              {challenge.files && challenge.files.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  {challenge.files.length} file{challenge.files.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary">{challenge.points} pts</span>
              {isSolvedByUser(challenge) && (
                <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm font-medium">
                  ✓ Solved
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-500 text-sm">
                <span className="mr-1">👥</span>
                {getSolvedDisplay(challenge)}
              </div>
              {challenge.solvedBy && challenge.solvedBy.length > 0 && (
                <div className="text-xs text-gray-500">
                  {challenge.solvedBy.slice(0, 2).join(', ')}
                  {challenge.solvedBy.length > 2 && ` +${challenge.solvedBy.length - 2} more`}
                </div>
              )}
            </div>

            <Link
              to={`/challenges/${challenge.id}`}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isSolvedByUser(challenge) ? 'View' : 'Solve'}
            </Link>
          </div>
        ))}
      </div>

      {/* Challenge Statistics */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Challenge Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{challenges.length}</div>
            <div className="text-sm text-gray-600">Total Challenges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{solvedCount}</div>
            <div className="text-sm text-gray-600">Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}