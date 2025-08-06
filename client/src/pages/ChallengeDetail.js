import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChallenges } from '../context/ChallengeContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChallengeDetail() {
  const { id } = useParams();
  const { fetchChallenge, submitFlag } = useChallenges();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flag, setFlag] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true);
        const challengeData = await fetchChallenge(id);
        setChallenge(challengeData);
      } catch (error) {
        console.error('Load challenge error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChallenge();
    }
  }, [id, fetchChallenge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flag.trim()) {
      setFeedback('Please enter a flag');
      return;
    }

    setSubmitting(true);
    setFeedback('');
    
    try {
      const result = await submitFlag(id, flag.trim());
      if (result.correct) {
        setFlag('');
        setFeedback('🎉 Correct flag! You earned points!');
        // Reload challenge to get updated solved information
        const updatedChallenge = await fetchChallenge(id);
        setChallenge(updatedChallenge);
      } else {
        setFeedback('❌ Incorrect flag. Try again!');
      }
    } catch (error) {
      setFeedback('Error submitting flag. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFile = async (filename) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(`/api/files/download/${filename}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create a blob URL
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = `/api/files/download/${filename}`;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Check if current user has solved this challenge
  const isSolvedByUser = () => {
    if (!user || user.type !== 'team' || !challenge) return false;
    return challenge.solvedBy && challenge.solvedBy.includes(user.teamName);
  };

  if (loading) {
    return <LoadingSpinner text="Loading challenge..." />;
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Challenge not found</h3>
          <p className="text-gray-600 mb-4">The challenge you're looking for doesn't exist.</p>
          <Link 
            to="/challenges"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/challenges"
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Challenges
        </Link>
        <h1 className="text-3xl font-bold gradient-text mb-2">{challenge.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">{challenge.category}</span>
          <span className="font-semibold text-primary">{challenge.points} points</span>
          {isSolvedByUser() && (
            <span className="text-green-600 bg-green-100 px-2 py-1 rounded">✓ Solved</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{challenge.description}</p>
            </div>
          </div>

          {/* Files */}
          {challenge.files && challenge.files.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Files</h3>
              <div className="space-y-4">
                {challenge.files.map((file, index) => {
                  const fileName = file.filename || file.originalName || file;
                  const fileExt = fileName.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExt);
                  const isViewable = ['txt', 'html', 'css', 'js', 'json', 'xml', 'pdf'].includes(fileExt);
                  
                  return (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">📎</span>
                          <span className="font-medium">{fileName}</span>
                        </div>
                        <div className="flex space-x-2">
                          {isImage && (
                            <button
                              onClick={() => window.open(`/api/files/download/${file.filename || file.originalName || file}?preview=true`, '_blank')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
                            >
                              Preview
                            </button>
                          )}
                          <button
                            onClick={() => downloadFile(file.filename || file.originalName || file)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                      
                      {/* File info */}
                      <div className="text-sm text-gray-600">
                        <span className="mr-4">Type: {fileExt?.toUpperCase() || 'Unknown'}</span>
                        {file.size && <span>Size: {(file.size / 1024).toFixed(1)} KB</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Hints</h3>
              <div className="space-y-3">
                {challenge.hints.map((hint, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start">
                      <span className="text-yellow-600 mr-2">💡</span>
                      <span className="text-sm text-gray-700">{hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams who solved this challenge */}
          {challenge.solvedBy && challenge.solvedBy.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Teams who solved this challenge</h3>
              <div className="space-y-2">
                {challenge.solvedBy.map((teamName, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="font-medium">{teamName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flag Submission */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Submit Flag</h3>
            
            {isSolvedByUser() ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-green-600 font-semibold">Challenge Solved!</p>
                <p className="text-sm text-gray-600 mt-1">You've already solved this challenge</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag
                  </label>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="Enter flag here..."
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={submitting}
                  />
                </div>

                {feedback && (
                  <div className={`p-3 rounded text-sm ${
                    feedback.includes('Correct') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {feedback}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !flag.trim()}
                  className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" text="Submitting..." />
                  ) : (
                    'Submit Flag'
                  )}
                </button>
              </form>
            )}

            {/* Challenge Stats */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Challenge Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">
                    {challenge.points <= 100 ? 'Easy' : 
                     challenge.points <= 200 ? 'Medium' : 
                     challenge.points <= 300 ? 'Hard' : 'Expert'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Solved by:</span>
                  <span className="font-medium">{challenge.solvedCount || 0} teams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success rate:</span>
                  <span className="font-medium">
                    {challenge.solvedCount && challenge.totalTeams 
                      ? Math.round((challenge.solvedCount / challenge.totalTeams) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}