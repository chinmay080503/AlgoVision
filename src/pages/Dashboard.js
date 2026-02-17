import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [levelTitle, setLevelTitle] = useState("Novice");

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

  const getLevelColor = (level) => {
    if (level === 1) return "#8b8b8b";
    if (level >= 2 && level <= 4) return "#cd7f32";
    if (level >= 5 && level <= 9) return "#c0c0c0";
    if (level >= 10 && level <= 14) return "#ffd700";
    if (level >= 15 && level <= 19) return "#50c878";
    return "#9370db";
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.username) {
      setUsername(currentUser.username);
      
      const userQuizHistory = JSON.parse(localStorage.getItem('userQuizHistory')) || {};
      const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
      const userData = userQuizData[currentUser.username] || {};
      const userQuizzes = userQuizHistory[currentUser.username] || [];
      
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
      
      const level = calculateLevelFromXP(totalXP);
      const title = getLevelTitle(level);
      
      setUserLevel(level);
      setLevelTitle(title);
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    })
  };

  const cards = [
    {
      path: "/learn",
      icon: "📘",
      title: "Learn Algorithms",
      description: "Visualize and understand searching and sorting algorithms through animations and interactive code."
    },
    {
      path: "/quiz",
      icon: "🧠",
      title: "Take Quiz",
      description: "Test your algorithm knowledge with quizzes covering theory, code tracing, and time complexity."
    },
    {
      path: "/progress",
      icon: "📊",
      title: "Track Progress",
      description: "View your learning history, strengths, and weak topics based on quiz results and time spent."
    },
    {
      path: "/leaderboard",
      icon: "🏆",
      title: "Leaderboard",
      description: "Compete with other users and see your ranking based on quiz performance and scores."
    },
    {
      path: "/forum",
      icon: "💬",
      title: "Discussion Forum",
      description: "Ask questions, share insights, and discuss algorithms with other learners in the community."
    },
    {
      path: "/ai-assistant",
      icon: "🤖",
      title: "AI Teaching Assistant",
      description: "Get personalized explanations and guidance on algorithms from our AI assistant."
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <motion.h1 
            className="dashboard-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            Algorithm Dashboard
          </motion.h1>
          {username && (
            <>
              <motion.div 
                className="welcome-message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Welcome, <span className="username">{username}</span>!
              </motion.div>
              <motion.div 
                className="level-display"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.span 
                  className={`level-badge-dashboard ${levelTitle.toLowerCase()}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {levelTitle}
                </motion.span>
                <span className="level-number">Level {userLevel}</span>
              </motion.div>
            </>
          )}
        </div>
        
        <div className="header-right">
          <motion.button 
            className="dashboard-back-button" 
            onClick={() => navigate("/")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Home
          </motion.button>
        </div>
      </div>

      <div className="main-dashboard-grid">
        {cards.map((card, index) => (
          <motion.div
            key={card.path}
            className="main-dashboard-card"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.03,
              y: -8,
              rotateY: 2,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation(card.path)}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {card.icon} {card.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              {card.description}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;