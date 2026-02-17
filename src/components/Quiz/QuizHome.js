import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./QuizHome.css";

const topics = ["sorting", "searching", "dynamic-programming", "backtracking", "branch and bound"];

const QuizHome = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
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

  return (
    <div className="quiz-home-container">
      <header className="quiz-header">
        <div className="quiz-header-content">
          <motion.h1 
            className="quiz-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            Choose a Quiz Topic
          </motion.h1>
          <motion.button
            className="quiz-back-to-dashboard"
            onClick={() => navigate("/dashboard")}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Dashboard
          </motion.button>
        </div>
      </header>

      <div className="quiz-topic-grid">
        {topics.map((topic, index) => (
          <motion.div
            key={topic}
            className="quiz-topic-card"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              y: -8,
              rotateY: 2,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/quiz/${topic}`)}
          >
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {topic.replace(/-/g, ' ').toUpperCase()}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              Test your knowledge of {topic.replace(/-/g, ' ')} algorithms.
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizHome;