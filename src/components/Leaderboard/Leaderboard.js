import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('points');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const bodyHasDark = document.body.classList.contains('dark');
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsDarkMode(bodyHasDark || htmlHasDark || savedTheme === 'dark' || (!savedTheme && prefersDark));
    };

    checkDarkMode();

    const bodyObserver = new MutationObserver(checkDarkMode);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const htmlObserver = new MutationObserver(checkDarkMode);
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', checkDarkMode);
    window.addEventListener('themeChange', checkDarkMode);

    return () => {
      bodyObserver.disconnect();
      htmlObserver.disconnect();
      window.removeEventListener('storage', checkDarkMode);
      window.removeEventListener('themeChange', checkDarkMode);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      calculateLeaderboard();
    }
  }, [currentUser, sortBy]);

  const calculateXPForQuiz = (score, total, timeTaken) => {
    const baseXP = score * 10;
    const perfectBonus = score === total ? 50 : 0;
    const accuracy = score / total;
    const accuracyBonus = accuracy >= 0.8 ? 30 : accuracy >= 0.6 ? 15 : 0;
    const avgTimePerQuestion = timeTaken / total;
    const timeBonus = avgTimePerQuestion < 30 ? 20 : avgTimePerQuestion < 60 ? 10 : 0;
    return baseXP + perfectBonus + accuracyBonus + timeBonus;
  };

  const calculateLevelFromXP = (totalXP) => {
    return Math.floor(Math.sqrt(totalXP / 50)) + 1;
  };

  const getLevelTitle = (level) => {
    if (level === 1) return "Novice";
    if (level >= 2 && level <= 4) return "Apprentice";
    if (level >= 5 && level <= 9) return "Intermediate";
    if (level >= 10 && level <= 14) return "Advanced";
    if (level >= 15 && level <= 19) return "Expert";
    return "Master";
  };

  const calculateLeaderboard = () => {
    setLoading(true);
    
    try {
      const userQuizHistory = JSON.parse(localStorage.getItem('userQuizHistory')) || {};
      const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
      const allUsersData = [];
      
      Object.keys(userQuizHistory).forEach(username => {
        const userQuizzes = userQuizHistory[username] || [];
        const userData = userQuizData[username] || {};
        
        if (userQuizzes.length > 0) {
          const totalQuizzes = userQuizzes.length;
          const totalScore = userQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
          const totalQuestions = userQuizzes.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
          const totalTime = userQuizzes.reduce((sum, quiz) => sum + quiz.timeElapsed, 0);
          
          const avgScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
          const avgTime = totalQuizzes > 0 ? totalTime / totalQuizzes : 0;
          
          let totalXP = 0;
          const processedQuizzes = new Set();
          
          Object.keys(userData).forEach((algo) => {
            const progress = userData[algo];
            if (progress?.quizCompleted) {
              const quizKey = `${algo}-${progress.lastAttempt}`;
              if (!processedQuizzes.has(quizKey)) {
                const xpEarned = calculateXPForQuiz(
                  progress.score,
                  progress.answeredQuestions?.length || 5,
                  progress.timeElapsed
                );
                totalXP += xpEarned;
                processedQuizzes.add(quizKey);
              }
            }
          });
          
          userQuizzes.forEach((quiz) => {
            const quizKey = `${quiz.algo}-${quiz.date}`;
            if (!processedQuizzes.has(quizKey)) {
              const xpEarned = calculateXPForQuiz(
                quiz.score,
                quiz.totalQuestions || 5,
                quiz.timeElapsed || 0
              );
              totalXP += xpEarned;
              processedQuizzes.add(quizKey);
            }
          });
          
          const userLevel = calculateLevelFromXP(totalXP);
          const levelTitle = getLevelTitle(userLevel);
          
          let points = 0;
          userQuizzes.forEach(quiz => {
            const quizPoints = quiz.score * 10;
            const timeBonus = Math.max(0, 300 - quiz.timeElapsed) / 10;
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
            lastActivity: userQuizzes[userQuizzes.length - 1]?.date || 'Never',
            level: userLevel,
            levelTitle: levelTitle,
            xp: totalXP
          });
        }
      });
      
      const sortedData = [...allUsersData].sort((a, b) => {
        switch (sortBy) {
          case 'quizzes':
            return b.totalQuizzes - a.totalQuizzes;
          case 'avgScore':
            return b.avgScore - a.avgScore;
          case 'avgTime':
            return a.avgTime - b.avgTime;
          case 'level':
            return b.level - a.level || b.xp - a.xp;
          case 'points':
          default:
            return b.points - a.points;
        }
      });
      
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
      <motion.div 
        className={`leaderboard-wrap ${isDarkMode ? 'dark' : ''} loading`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className={`leaderboard-wrap ${isDarkMode ? 'dark' : ''} loading`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Calculating leaderboard...</p>
      </motion.div>
    );
  }

  return (
    <div className={`leaderboard-wrap ${isDarkMode ? 'dark' : ''}`}>
      <motion.div 
        className="leaderboard-top"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="top-left">
          <h1>Leaderboard</h1>
          <p>Compete with other users and track your progress!</p>
        </div>
        <motion.button
          className="dashboard-btn"
          onClick={handleBackToDashboard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>

      <motion.div 
        className="sort-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="points">Total Points</option>
          <option value="level">Level</option>
          <option value="quizzes">Quizzes Taken</option>
          <option value="avgScore">Average Score</option>
          <option value="avgTime">Average Time</option>
        </select>
      </motion.div>

      <motion.div 
        className="points-info-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>📊 Points System</h3>
        <div className="points-grid">
          <div className="point-box">
            <span className="point-num">+10 points</span>
            <span className="point-text">Per correct answer</span>
          </div>
          <div className="point-box">
            <span className="point-num">+0-30 points</span>
            <span className="point-text">Time bonus (faster = more points)</span>
          </div>
        </div>
      </motion.div>

      {leaderboardData.length === 0 ? (
        <motion.div 
          className="no-data"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3>No quiz data available yet</h3>
          <p>Be the first to complete a quiz and top the leaderboard!</p>
          <motion.button 
            onClick={() => navigate('/quiz')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take Your First Quiz
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div className="leader-grid">
            <motion.div 
              className="leader-table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="table-head">
                <span className="head-rank">Rank</span>
                <span className="head-user">User</span>
                <span className="head-level">Level</span>
                <span className="head-points">Points</span>
                <span className="head-quizzes">Quizzes</span>
                <span className="head-score">Avg Score</span>
                <span className="head-time">Avg Time</span>
              </div>

              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.username}
                  className={`table-row ${
                    user.username === currentUser.username ? 'is-current' : ''
                  } ${user.rank <= 3 ? 'is-top' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ x: 5, backgroundColor: 'var(--bg-alt)' }}
                >
                  <span className="cell-rank">
                    {getRankBadge(user.rank)}
                  </span>
                  <span className="cell-user">
                    {user.username}
                    {user.username === currentUser.username && ' (You)'}
                  </span>
                  <span className="cell-level">
                    <span className="level-chip" title={user.levelTitle}>
                      Lv {user.level}
                    </span>
                    <span className="level-name">{user.levelTitle}</span>
                  </span>
                  <span className="cell-points">{user.points}</span>
                  <span className="cell-quizzes">{user.totalQuizzes}</span>
                  <span className="cell-score">{user.avgScore}%</span>
                  <span className="cell-time">{formatTime(user.avgTime)}</span>
                </motion.div>
              ))}
            </motion.div>

            {leaderboardData.find(user => user.username === currentUser.username) && (
              <motion.div 
                className="user-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3>Your Performance</h3>
                <div className="stats-grid">
                  {[
                    { label: 'Rank', value: `#${leaderboardData.find(u => u.username === currentUser.username).rank}` },
                    { label: 'Level', value: leaderboardData.find(u => u.username === currentUser.username).level },
                    { label: 'Points', value: leaderboardData.find(u => u.username === currentUser.username).points },
                    { label: 'Quizzes', value: leaderboardData.find(u => u.username === currentUser.username).totalQuizzes },
                    { label: 'Avg Score', value: `${leaderboardData.find(u => u.username === currentUser.username).avgScore}%` },
                    { label: 'Total XP', value: leaderboardData.find(u => u.username === currentUser.username).xp }
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      className="stat-box"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + idx * 0.05 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                    >
                      <span className="stat-num">{stat.value}</span>
                      <span className="stat-name">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div 
            className="action-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              className="quiz-btn"
              onClick={() => navigate('/quiz')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Take Another Quiz
            </motion.button>
            <motion.button
              className="progress-btn"
              onClick={() => navigate('/progress')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Detailed Progress
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;