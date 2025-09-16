// src/components/Leaderboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('points'); // points, quizzes, avgScore, avgTime

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    } else {
      // Redirect to login if no user is logged in
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      calculateLeaderboard();
    }
  }, [currentUser, sortBy]);

  const calculateLeaderboard = () => {
    setLoading(true);
    
    try {
      const userQuizHistory = JSON.parse(localStorage.getItem('userQuizHistory')) || {};
      const allUsersData = [];
      
      // Process each user's quiz history
      Object.keys(userQuizHistory).forEach(username => {
        const userQuizzes = userQuizHistory[username] || [];
        
        if (userQuizzes.length > 0) {
          const totalQuizzes = userQuizzes.length;
          const totalScore = userQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
          const totalQuestions = userQuizzes.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
          const totalTime = userQuizzes.reduce((sum, quiz) => sum + quiz.timeElapsed, 0);
          
          const avgScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
          const avgTime = totalQuizzes > 0 ? totalTime / totalQuizzes : 0;
          
          // Calculate points: 10 points for each correct answer, bonus for speed
          let points = 0;
          userQuizzes.forEach(quiz => {
            const quizPoints = quiz.score * 10; // 10 points per correct answer
            const timeBonus = Math.max(0, 300 - quiz.timeElapsed) / 10; // Bonus for completing quickly (max 30 points)
            points += quizPoints + timeBonus;
          });
          
          allUsersData.push({
            username,
            points: Math.round(points),
            totalQuizzes,
            totalCorrect: totalScore,
            totalQuestions,
            avgScore: Math.round(avgScore),
            avgTime: Math.round(avgTime),
            lastActivity: userQuizzes[userQuizzes.length - 1]?.date || 'Never'
          });
        }
      });
      
      // Sort users based on selected criteria
      const sortedData = [...allUsersData].sort((a, b) => {
        switch (sortBy) {
          case 'quizzes':
            return b.totalQuizzes - a.totalQuizzes;
          case 'avgScore':
            return b.avgScore - a.avgScore;
          case 'avgTime':
            return a.avgTime - b.avgTime; // Lower time is better
          case 'points':
          default:
            return b.points - a.points;
        }
      });
      
      // Add ranks
      const rankedData = sortedData.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      setLeaderboardData(rankedData);
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (!currentUser) {
    return (
      <div className="leaderboard-container loading">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="leaderboard-container loading">
        <div className="loading-spinner"></div>
        <p>Calculating leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="header-left">
          <h1>Leaderboard</h1>
          <p>Compete with other users and track your progress!</p>
        </div>
        <div className="header-right">
          <div className="user-info">
          <span>USER: {currentUser?.username}</span>
        </div>
        </div>
      </div>

      <div className="sort-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="points">Total Points</option>
          <option value="quizzes">Quizzes Taken</option>
          <option value="avgScore">Average Score</option>
          <option value="avgTime">Average Time</option>
        </select>
      </div>

      <div className="points-system">
        <h3>📊 Points System</h3>
        <div className="points-info">
          <div className="point-item">
            <span className="point-value">+10 points</span>
            <span className="point-desc">Per correct answer</span>
          </div>
          <div className="point-item">
            <span className="point-value">+0-30 points</span>
            <span className="point-desc">Time bonus (faster = more points)</span>
          </div>
        </div>
      </div>

      {leaderboardData.length === 0 ? (
        <div className="empty-leaderboard">
          <h3>No quiz data available yet</h3>
          <p>Be the first to complete a quiz and top the leaderboard!</p>
          <button onClick={() => navigate('/quiz')}>
            Take Your First Quiz
          </button>
        </div>
      ) : (
        <>
          <div className="leaderboard-content">
            <div className="leaderboard-list">
              <div className="leaderboard-header-row">
                <span className="rank-header">Rank</span>
                <span className="user-header">User</span>
                <span className="points-header">Points</span>
                <span className="quizzes-header">Quizzes</span>
                <span className="score-header">Avg Score</span>
                <span className="time-header">Avg Time</span>
                <span className="activity-header">Last Activity</span>
              </div>

              {leaderboardData.map((user) => (
                <div
                  key={user.username}
                  className={`leaderboard-row ${
                    user.username === currentUser.username ? 'current-user' : ''
                  } ${user.rank <= 3 ? 'top-three' : ''}`}
                >
                  <span className="rank">
                    {getRankBadge(user.rank)}
                  </span>
                  <span className="user">
                    {user.username}
                    {user.username === currentUser.username && ' (You)'}
                  </span>
                  <span className="points">{user.points}</span>
                  <span className="quizzes">{user.totalQuizzes}</span>
                  <span className="score">{user.avgScore}%</span>
                  <span className="time">{formatTime(user.avgTime)}</span>
                  <span className="activity">
                    {new Date(user.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Current User Highlight Card */}
            {leaderboardData.find(user => user.username === currentUser.username) && (
              <div className="user-highlight">
                <h3>Your Performance</h3>
                <div className="highlight-card">
                  <div className="highlight-stat">
                    <span className="stat-value">
                      #{leaderboardData.find(user => user.username === currentUser.username).rank}
                    </span>
                    <span className="stat-label">Rank</span>
                  </div>
                  <div className="highlight-stat">
                    <span className="stat-value">
                      {leaderboardData.find(user => user.username === currentUser.username).points}
                    </span>
                    <span className="stat-label">Points</span>
                  </div>
                  <div className="highlight-stat">
                    <span className="stat-value">
                      {leaderboardData.find(user => user.username === currentUser.username).totalQuizzes}
                    </span>
                    <span className="stat-label">Quizzes</span>
                  </div>
                  <div className="highlight-stat">
                    <span className="stat-value">
                      {leaderboardData.find(user => user.username === currentUser.username).avgScore}%
                    </span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="leaderboard-actions">
            <button
              className="take-quiz-btn"
              onClick={() => navigate('/quiz')}
            >
              Take Another Quiz
            </button>
            <button
              className="view-progress-btn"
              onClick={() => navigate('/progress')}
            >
              View Detailed Progress
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;