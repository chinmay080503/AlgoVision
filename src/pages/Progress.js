import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import quizData from "../components/Quiz/quizData";
import "./Progress.css";

const Progress = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState({});
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [weakAreas, setWeakAreas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [xpProgress, setXpProgress] = useState(0);
  const [showLevelInfoModal, setShowLevelInfoModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode from multiple sources with logging
  useEffect(() => {
    const checkDarkMode = () => {
      // Check body class (most reliable for your app)
      const bodyHasDark = document.body.classList.contains('dark');
      // Check html class
      const htmlHasDark = document.documentElement.classList.contains('dark');
      // Check localStorage
      const savedTheme = localStorage.getItem('theme');
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const isDark = bodyHasDark || htmlHasDark || savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      console.log('Progress Dark Mode Check:', {
        bodyHasDark,
        htmlHasDark,
        savedTheme,
        prefersDark,
        isDark
      });
      
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Listen for changes to body class
    const bodyObserver = new MutationObserver(checkDarkMode);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Listen for changes to html class
    const htmlObserver = new MutationObserver(checkDarkMode);
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Listen for localStorage changes
    window.addEventListener('storage', checkDarkMode);
    
    // Listen for custom theme change events
    window.addEventListener('themeChange', checkDarkMode);

    // Poll every second as backup (will remove this once we confirm it works)
    const interval = setInterval(checkDarkMode, 1000);

    return () => {
      bodyObserver.disconnect();
      htmlObserver.disconnect();
      window.removeEventListener('storage', checkDarkMode);
      window.removeEventListener('themeChange', checkDarkMode);
      clearInterval(interval);
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
      loadProgressData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedAlgo && progressData[selectedAlgo]) {
      analyzeWeakAreas(selectedAlgo);
    }
  }, [selectedAlgo, progressData]);

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
    const level = Math.floor(Math.sqrt(totalXP / 50)) + 1;
    const nextLevel = level + 1;
    const xpForNextLevel = Math.pow(nextLevel - 1, 2) * 50;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 50;
    const xpNeeded = xpForNextLevel - totalXP;
    const progressPercent = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    
    return {
      level,
      currentXP: totalXP,
      xpForCurrentLevel,
      xpForNextLevel,
      xpNeeded,
      progressPercent: Math.min(100, Math.max(0, progressPercent))
    };
  };

  const calculateUserLevelAndXP = () => {
    try {
      const userQuizData = JSON.parse(localStorage.getItem("userQuizData")) || {};
      const userQuizHistory = JSON.parse(localStorage.getItem("userQuizHistory")) || {};
      
      const userData = currentUser ? userQuizData[currentUser.username] || {} : {};
      const userHistory = currentUser ? userQuizHistory[currentUser.username] || [] : [];
      
      let totalXP = 0;
      const processedQuizzes = new Set();

      Object.keys(userData).forEach((algo) => {
        const progress = userData[algo];
        if (progress?.quizCompleted && quizData[algo]?.length) {
          const quizKey = `${algo}-${progress.lastAttempt}`;
          
          if (!processedQuizzes.has(quizKey)) {
            const xpEarned = calculateXPForQuiz(
              progress.score,
              quizData[algo].length,
              progress.timeElapsed
            );
            totalXP += xpEarned;
            processedQuizzes.add(quizKey);
          }
        }
      });

      userHistory.forEach((attempt) => {
        if (attempt?.algo && attempt?.score !== undefined) {
          const quizKey = `${attempt.algo}-${attempt.date}`;
          
          if (!processedQuizzes.has(quizKey)) {
            const xpEarned = calculateXPForQuiz(
              attempt.score,
              attempt.totalQuestions || 5,
              attempt.timeElapsed || 0
            );
            totalXP += xpEarned;
            processedQuizzes.add(quizKey);
          }
        }
      });

      const levelInfo = calculateLevelFromXP(totalXP);
      setUserLevel(levelInfo.level);
      setUserXP(levelInfo.currentXP);
      setXpToNextLevel(levelInfo.xpNeeded);
      setXpProgress(levelInfo.progressPercent);

      return levelInfo;
    } catch (e) {
      console.error("Error calculating level and XP:", e);
      return { level: 1, currentXP: 0, xpNeeded: 100, progressPercent: 0 };
    }
  };

  const loadProgressData = () => {
    setLoading(true);
    setError(null);

    try {
      const userQuizData = JSON.parse(localStorage.getItem("userQuizData")) || {};
      const userQuizHistory = JSON.parse(localStorage.getItem("userQuizHistory")) || {};
      
      const userData = currentUser ? userQuizData[currentUser.username] || {} : {};
      const userHistory = currentUser ? userQuizHistory[currentUser.username] || [] : [];
      
      const algoProgressMap = {};

      userHistory.forEach((attempt) => {
        try {
          if (attempt?.algo) {
            const algo = attempt.algo;
            if (!algoProgressMap[algo]) {
              algoProgressMap[algo] = [];
            }

            const totalQuestions = Number(attempt.totalQuestions) || 1;
            const score = Number(attempt.score) || 0;

            algoProgressMap[algo].push({
              date: attempt.date
                ? new Date(attempt.date).toLocaleDateString()
                : "Unknown Date",
              score,
              total: totalQuestions,
              percentage: Math.round((score / totalQuestions) * 100),
              timeTaken: Number(attempt.timeElapsed) || 0,
              source: "history",
            });
          }
        } catch (e) {
          console.warn("Error processing quiz history entry:", e);
        }
      });

      Object.keys(userData).forEach((algo) => {
        try {
          const progress = userData[algo];
          if (progress?.quizCompleted && quizData[algo]?.length) {
            if (!algoProgressMap[algo]) {
              algoProgressMap[algo] = [];
            }

            const totalQuestions = quizData[algo].length;
            const score = Number(progress.score) || 0;
            const progressDate = progress.lastAttempt
              ? new Date(progress.lastAttempt).toLocaleDateString()
              : "Unknown Date";

            const isDuplicate = algoProgressMap[algo].some(
              (attempt) =>
                attempt.date === progressDate &&
                attempt.score === score &&
                attempt.total === totalQuestions
            );

            if (!isDuplicate) {
              algoProgressMap[algo].push({
                date: progressDate,
                score,
                total: totalQuestions,
                percentage: Math.round((score / totalQuestions) * 100),
                timeTaken: Number(progress.timeElapsed) || 0,
                isLatest: true,
                source: "progress",
              });
            }
          }
        } catch (e) {
          console.warn(`Error processing progress for ${algo}:`, e);
        }
      });

      Object.keys(algoProgressMap).forEach((algo) => {
        algoProgressMap[algo].sort((a, b) => {
          try {
            return new Date(a.date) - new Date(b.date);
          } catch {
            return 0;
          }
        });
      });

      setProgressData(algoProgressMap);
      setSelectedAlgo(
        Object.keys(algoProgressMap).length > 0
          ? Object.keys(algoProgressMap)[0]
          : null
      );

      calculateUserLevelAndXP();
    } catch (e) {
      console.error("Failed to load progress data:", e);
      setError("Failed to load progress data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeakAreas = (algo) => {
    try {
      const userQuizData = JSON.parse(localStorage.getItem("userQuizData")) || {};
      const userData = currentUser ? userQuizData[currentUser.username] || {} : {};
      const algoProgress = userData[algo];

      if (!algoProgress?.answeredQuestions) {
        setWeakAreas({});
        return;
      }

      const weakAreasMap = {};

      algoProgress.answeredQuestions.forEach((item) => {
        try {
          if (!item?.isCorrect && item?.question) {
            const questionText = item.question.toLowerCase();
            let topic = "general";

            if (questionText.includes("time complexity")) {
              topic = "time complexity";
            } else if (questionText.includes("space complexity")) {
              topic = "space complexity";
            } else if (questionText.includes("implementation")) {
              topic = "implementation";
            } else if (
              questionText.includes("use case") ||
              questionText.includes("when to use")
            ) {
              topic = "use cases";
            } else if (
              questionText.includes("algorithm") ||
              questionText.includes("approach")
            ) {
              topic = "algorithm understanding";
            }

            weakAreasMap[topic] = (weakAreasMap[topic] || 0) + 1;
          }
        } catch (e) {
          console.warn("Error processing question:", e);
        }
      });

      setWeakAreas(weakAreasMap);
    } catch (e) {
      console.error("Error analyzing weak areas:", e);
      setWeakAreas({});
    }
  };

  const handleAlgoSelect = (algo) => {
    setSelectedAlgo(algo);
  };

  const handleBackToTopics = () => {
    navigate(`/quiz`);
  };

  const handleTakeQuiz = (algo) => {
    navigate(`/quiz/${topic || "algorithms"}/${algo}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getLevelTitle = (level) => {
    if (level === 1) return "Novice";
    if (level >= 2 && level <= 4) return "Apprentice";
    if (level >= 5 && level <= 9) return "Intermediate";
    if (level >= 10 && level <= 14) return "Advanced";
    if (level >= 15 && level <= 19) return "Expert";
    return "Master";
  };

  const toggleLevelInfoModal = () => {
    setShowLevelInfoModal(!showLevelInfoModal);
    if (!showLevelInfoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  if (!currentUser) {
    return (
      <motion.div 
        className={`progress-container ${isDarkMode ? 'dark' : ''} loading`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className={`progress-container ${isDarkMode ? 'dark' : ''} loading`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading your progress data...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className={`progress-container ${isDarkMode ? 'dark' : ''} error`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <motion.button 
            onClick={loadProgressData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
          <motion.button 
            onClick={handleBackToDashboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (Object.keys(progressData).length === 0) {
    return (
      <div className={`progress-container ${isDarkMode ? 'dark' : ''} empty`}>
        <div className="progress-header">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            {topic ? `${topic.toUpperCase()} PROGRESS` : "PROGRESS TRACKING"}
          </motion.h2>
          <motion.button
            className="back-to-dashboard-btn"
            onClick={handleBackToDashboard}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Dashboard
          </motion.button>
        </div>
        
        <motion.div 
          className="level-xp-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        >
          <motion.div 
            className="level-badge clickable" 
            onClick={toggleLevelInfoModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="level-icon">🏆</div>
            <div className="level-info">
              <h3>Level {userLevel}</h3>
              <p className="level-title">{getLevelTitle(userLevel)}</p>
            </div>
          </motion.div>
          <div className="xp-info">
            <div className="xp-header">
              <span className="xp-label">Experience Points</span>
              <span className="xp-value">{userXP} XP</span>
            </div>
            <div className="xp-bar">
              <motion.div 
                className="xp-progress" 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              />
            </div>
            <p className="xp-next-level">{xpToNextLevel} XP to Level {userLevel + 1}</p>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {showLevelInfoModal && (
            <motion.div 
              className="modal-overlay" 
              onClick={toggleLevelInfoModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="modal-content" 
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <button className="modal-close" onClick={toggleLevelInfoModal}>×</button>
                <h2>🏆 Level & XP System</h2>
                
                <div className="modal-section">
                  <h3>📊 How to Earn XP</h3>
                  <ul>
                    <li><strong>Base XP:</strong> 10 XP per correct answer</li>
                    <li><strong>Perfect Score Bonus:</strong> +50 XP for answering all questions correctly</li>
                    <li><strong>High Accuracy Bonus:</strong>
                      <ul>
                        <li>+30 XP for ≥80% accuracy</li>
                        <li>+15 XP for ≥60% accuracy</li>
                      </ul>
                    </li>
                    <li><strong>Speed Bonus:</strong>
                      <ul>
                        <li>+20 XP for completing in &lt;30 seconds per question</li>
                        <li>+10 XP for completing in &lt;60 seconds per question</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="modal-section">
                  <h3>🎯 Level Titles</h3>
                  <div className="level-titles-grid">
                    <div className="level-title-item">
                      <span className="title-badge novice">Novice</span>
                      <span className="title-level">Level 1</span>
                    </div>
                    <div className="level-title-item">
                      <span className="title-badge apprentice">Apprentice</span>
                      <span className="title-level">Levels 2-4</span>
                    </div>
                    <div className="level-title-item">
                      <span className="title-badge intermediate">Intermediate</span>
                      <span className="title-level">Levels 5-9</span>
                    </div>
                    <div className="level-title-item">
                      <span className="title-badge advanced">Advanced</span>
                      <span className="title-level">Levels 10-14</span>
                    </div>
                    <div className="level-title-item">
                      <span className="title-badge expert">Expert</span>
                      <span className="title-level">Levels 15-19</span>
                    </div>
                    <div className="level-title-item">
                      <span className="title-badge master">Master</span>
                      <span className="title-level">Level 20+</span>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h3>📈 Level Progression</h3>
                  <p>Each level requires more XP than the previous one. Keep completing quizzes with high accuracy and speed to level up faster!</p>
                  <p className="formula-note">Formula: Level = ⌊√(Total XP / 50)⌋ + 1</p>
                </div>

                <div className="modal-section tip-section">
                  <h3>💡 Pro Tips</h3>
                  <ul>
                    <li>Focus on accuracy first, then work on speed</li>
                    <li>Perfect scores give the biggest XP boost!</li>
                    <li>Review weak areas to improve your accuracy</li>
                    <li>Retake quizzes to earn more XP and master topics</li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="user-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3>Welcome, {currentUser.username}!</h3>
        </motion.div>
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p>No quiz data available yet.</p>
          <p>Complete some quizzes to track your progress and earn XP!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`progress-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="progress-header">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          Progress Tracking
        </motion.h2>
        <motion.button
          className="back-to-dashboard-btn"
          onClick={handleBackToDashboard}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Dashboard
        </motion.button>
      </div>

      <motion.div 
        className="level-xp-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="level-badge clickable" 
          onClick={toggleLevelInfoModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="level-icon">🏆</div>
          <div className="level-info">
            <h3>Level {userLevel}</h3>
            <p className="level-title">{getLevelTitle(userLevel)}</p>
          </div>
        </motion.div>
        <div className="xp-info">
          <div className="xp-header">
            <span className="xp-label">Experience Points</span>
            <span className="xp-value">{userXP} XP</span>
          </div>
          <div className="xp-bar">
            <motion.div 
              className="xp-progress" 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="xp-next-level">{xpToNextLevel} XP to Level {userLevel + 1}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLevelInfoModal && (
          <motion.div 
            className="modal-overlay" 
            onClick={toggleLevelInfoModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button className="modal-close" onClick={toggleLevelInfoModal}>×</button>
              <h2>🏆 Level & XP System</h2>
              
              <div className="modal-section">
                <h3>📊 How to Earn XP</h3>
                <ul>
                  <li><strong>Base XP:</strong> 10 XP per correct answer</li>
                  <li><strong>Perfect Score Bonus:</strong> +50 XP for answering all questions correctly</li>
                  <li><strong>High Accuracy Bonus:</strong>
                    <ul>
                      <li>+30 XP for ≥80% accuracy</li>
                      <li>+15 XP for ≥60% accuracy</li>
                    </ul>
                  </li>
                  <li><strong>Speed Bonus:</strong>
                    <ul>
                      <li>+20 XP for completing in &lt;30 seconds per question</li>
                      <li>+10 XP for completing in &lt;60 seconds per question</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="modal-section">
                <h3>🎯 Level Titles</h3>
                <div className="level-titles-grid">
                  <div className="level-title-item">
                    <span className="title-badge novice">Novice</span>
                    <span className="title-level">Level 1</span>
                  </div>
                  <div className="level-title-item">
                    <span className="title-badge apprentice">Apprentice</span>
                    <span className="title-level">Levels 2-4</span>
                  </div>
                  <div className="level-title-item">
                    <span className="title-badge intermediate">Intermediate</span>
                    <span className="title-level">Levels 5-9</span>
                  </div>
                  <div className="level-title-item">
                    <span className="title-badge advanced">Advanced</span>
                    <span className="title-level">Levels 10-14</span>
                  </div>
                  <div className="level-title-item">
                    <span className="title-badge expert">Expert</span>
                    <span className="title-level">Levels 15-19</span>
                  </div>
                  <div className="level-title-item">
                    <span className="title-badge master">Master</span>
                    <span className="title-level">Level 20+</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>📈 Level Progression</h3>
                <p>Each level requires more XP than the previous one. Keep completing quizzes with high accuracy and speed to level up faster!</p>
                <p className="formula-note">Formula: Level = ⌊√(Total XP / 50)⌋ + 1</p>
              </div>

              <div className="modal-section tip-section">
                <h3>💡 Pro Tips</h3>
                <ul>
                  <li>Focus on accuracy first, then work on speed</li>
                  <li>Perfect scores give the biggest XP boost!</li>
                  <li>Review weak areas to improve your accuracy</li>
                  <li>Retake quizzes to earn more XP and master topics</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="algo-selector"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2>Select Algorithm:</h2>
        <div className="algo-buttons">
          {Object.keys(progressData).map((algo, index) => (
            <motion.button
              key={algo}
              onClick={() => handleAlgoSelect(algo)}
              className={selectedAlgo === algo ? "active" : ""}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {algo.replace(/-/g, " ").toUpperCase()}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {selectedAlgo && progressData[selectedAlgo] && (
        <>
          <motion.div 
            className="progress-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3>{selectedAlgo.replace(/-/g, " ").toUpperCase()} PERFORMANCE</h3>

            <div className="progress-stats">
              {[
                {
                  title: "Latest Score",
                  value: `${progressData[selectedAlgo].slice(-1)[0].score} / ${progressData[selectedAlgo].slice(-1)[0].total}`,
                  percentage: `${progressData[selectedAlgo].slice(-1)[0].percentage}%`
                },
                {
                  title: "Attempts",
                  value: progressData[selectedAlgo].length
                },
                {
                  title: "Average Score",
                  value: `${Math.round(
                    progressData[selectedAlgo].reduce(
                      (sum, attempt) => sum + attempt.percentage,
                      0
                    ) / progressData[selectedAlgo].length
                  )}%`
                },
                {
                  title: "Best Time",
                  value: `${Math.min(
                    ...progressData[selectedAlgo].map(
                      (attempt) => attempt.timeTaken
                    )
                  )}s`
                }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="stat-card"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.8 + index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <h4>{stat.title}</h4>
                  <p className="stat-value">{stat.value}</p>
                  {stat.percentage && <p className="stat-percentage">{stat.percentage}</p>}
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="progress-chart"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <h4>Performance Over Time</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={progressData[selectedAlgo]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Score"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    name="Score Percentage"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>

          <motion.div 
            className="weak-areas-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <h3>Weak Areas</h3>
            {Object.keys(weakAreas).length > 0 ? (
              <>
                <p>Topics you need to focus on:</p>
                <div className="weak-areas-list">
                  {Object.entries(weakAreas)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, count], index) => (
                      <motion.div 
                        key={area} 
                        className="weak-area-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <span className="topic">{area}</span>
                        <span className="count">
                          {count} incorrect {count === 1 ? "answer" : "answers"}
                        </span>
                      </motion.div>
                    ))}
                </div>

                <div className="suggested-actions">
                  <h4>Recommended Study Plan:</h4>
                  <ul>
                    {Object.keys(weakAreas)
                      .sort((a, b) => weakAreas[b] - weakAreas[a])
                      .slice(0, 3)
                      .map((area) => (
                        <li key={area}>
                          <strong>{area}:</strong> Review{" "}
                          {selectedAlgo.replace(/-/g, " ")} {area} concepts
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="no-weak-areas">
                <p>No significant weak areas identified!</p>
                <p>Keep up the good work with your studies.</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="action-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <motion.button
              onClick={() => handleTakeQuiz(selectedAlgo)}
              className="retake-button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Retake {selectedAlgo.replace(/-/g, " ")} Quiz
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Progress;