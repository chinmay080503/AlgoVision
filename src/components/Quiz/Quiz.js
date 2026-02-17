import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import quizData from './quizData';
import './Quiz.css';

const Quiz = () => {
  const { topic, algo } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const timerRef = useRef(null);

  // Check for dark mode from multiple sources
  useEffect(() => {
    const checkDarkMode = () => {
      const bodyHasDark = document.body.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsDarkMode(bodyHasDark || savedTheme === 'dark' || (!savedTheme && prefersDark));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', checkDarkMode);
    window.addEventListener('themeChange', checkDarkMode);

    return () => {
      observer.disconnect();
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
    if (!currentUser) return;
    
    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    const algoProgress = userData[algo];
    
    if (algoProgress?.quizCompleted) {
      setScore(algoProgress.score);
      setTimeElapsed(algoProgress.timeElapsed);
      setAnsweredQuestions(algoProgress.answeredQuestions);
      setShowResult(true);
      setQuizSubmitted(true);
    } else if (algoProgress) {
      setScore(algoProgress.score);
      setTimeElapsed(algoProgress.timeElapsed);
      setAnsweredQuestions(algoProgress.answeredQuestions);
      setCurrentQuestion(algoProgress.currentQuestion);
    }
    
    setInitialLoadComplete(true);
  }, [algo, currentUser]);

  useEffect(() => {
    if (!initialLoadComplete || quizSubmitted || !currentUser) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isPaused, quizSubmitted, initialLoadComplete, currentUser]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (!currentUser) return;
    
    const isCorrect = selectedOption === quizData[algo][currentQuestion].answer;
    const newScore = isCorrect ? score + 1 : score;

    const newAnsweredQuestions = [...answeredQuestions, {
      question: quizData[algo][currentQuestion].question,
      selectedOption,
      isCorrect,
      correctAnswer: quizData[algo][currentQuestion].answer,
      explanation: quizData[algo][currentQuestion].explanation
    }];

    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    
    userData[algo] = {
      ...userData[algo],
      score: newScore,
      timeElapsed,
      answeredQuestions: newAnsweredQuestions,
      currentQuestion: currentQuestion + 1,
      lastAttempt: new Date().toISOString()
    };
    
    userQuizData[currentUser.username] = userData;
    localStorage.setItem('userQuizData', JSON.stringify(userQuizData));

    if (currentQuestion < quizData[algo].length - 1) {
      setScore(newScore);
      setAnsweredQuestions(newAnsweredQuestions);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      saveQuizResults(newScore, newAnsweredQuestions);
    }
  };

  const saveQuizResults = (finalScore, finalAnswers) => {
    if (!currentUser) return;
    
    const quizResults = {
      algo,
      score: finalScore,
      totalQuestions: quizData[algo].length,
      timeElapsed,
      date: new Date().toISOString()
    };

    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    
    userData[algo] = {
      ...userData[algo],
      score: finalScore,
      timeElapsed,
      answeredQuestions: finalAnswers,
      quizCompleted: true,
      lastAttempt: new Date().toISOString()
    };
    
    userQuizData[currentUser.username] = userData;
    localStorage.setItem('userQuizData', JSON.stringify(userQuizData));

    const userQuizHistory = JSON.parse(localStorage.getItem('userQuizHistory')) || {};
    const userHistory = userQuizHistory[currentUser.username] || [];
    
    userHistory.push(quizResults);
    userQuizHistory[currentUser.username] = userHistory;
    localStorage.setItem('userQuizHistory', JSON.stringify(userQuizHistory));

    setScore(finalScore);
    setAnsweredQuestions(finalAnswers);
    setShowResult(true);
    setQuizSubmitted(true);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleRetakeQuiz = () => {
    if (!currentUser) return;
    
    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    
    delete userData[algo];
    userQuizData[currentUser.username] = userData;
    localStorage.setItem('userQuizData', JSON.stringify(userQuizData));

    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setTimeElapsed(0);
    setQuizSubmitted(false);
    setAnsweredQuestions([]);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToTopics = () => {
    navigate(`/quiz`);
  };

  if (!currentUser) {
    return <div className={`quiz-wrapper ${isDarkMode ? 'dark' : ''} loading`}>Loading user data...</div>;
  }

  if (!initialLoadComplete) {
    return <div className={`quiz-wrapper ${isDarkMode ? 'dark' : ''} loading`}>Loading quiz data...</div>;
  }

  if (!quizData[algo]) {
    return (
      <div className={`quiz-wrapper ${isDarkMode ? 'dark' : ''}`}>
        <h2>Quiz not found for this algorithm</h2>
        <button onClick={handleBackToTopics}>Back to Topics</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        className={`quiz-wrapper ${isDarkMode ? 'dark' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="quiz-top-bar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2>{algo.replace(/-/g, ' ').toUpperCase()} Quiz Results</h2>
          <motion.button 
            className="quiz-back-btn" 
            onClick={handleBackToTopics}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Topics
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="quiz-user-badge"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          User: {currentUser.username}
        </motion.div>
        
        <div className="quiz-results-area">
          <motion.div 
            className="quiz-score-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <h3>Your Score: {score} / {quizData[algo].length}</h3>
            <p>Time Taken: {formatTime(timeElapsed)}</p>
            <p>Percentage: {Math.round((score / quizData[algo].length) * 100)}%</p>
          </motion.div>
          
          <motion.div 
            className="quiz-buttons-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <motion.button 
              onClick={handleRetakeQuiz}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retake Quiz
            </motion.button>
          </motion.div>
          
          <div className="quiz-answer-details">
            <motion.h4
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              Detailed Results:
            </motion.h4>
            {answeredQuestions.map((item, index) => (
              <motion.div 
                key={index} 
                className={`quiz-answer-card ${item.isCorrect ? 'correct' : 'incorrect'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              >
                <p><strong>Question {index + 1}:</strong> {item.question}</p>
                <p>Your answer: {item.selectedOption}</p>
                {!item.isCorrect && <p>Correct answer: {item.correctAnswer}</p>}
                <p>Explanation: {item.explanation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`quiz-wrapper ${isDarkMode ? 'dark' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="quiz-top-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2>{algo.replace(/-/g, ' ').toUpperCase()} QUIZ</h2>
        <div className="quiz-control-group">
          <span className="quiz-user-label">User: {currentUser.username}</span>
          <span className="quiz-time-display">Time: {formatTime(timeElapsed)}</span>
          <motion.button 
            onClick={handlePauseResume}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          <motion.button 
            className="quiz-back-btn" 
            onClick={handleBackToTopics}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Topics
          </motion.button>
        </div>
      </motion.div>
      
      <motion.div 
        className="quiz-progress-area"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p>Question {currentQuestion + 1} of {quizData[algo].length}</p>
        <div className="quiz-progress-track">
          <motion.div 
            className="quiz-progress-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / quizData[algo].length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion}
          className="quiz-question-box"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h3>{quizData[algo][currentQuestion].question}</h3>
          <div className="quiz-choices-list">
            {quizData[algo][currentQuestion].options.map((option, index) => (
              <motion.div 
                key={index}
                className={`quiz-choice ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        className="quiz-nav-area"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <motion.button 
          onClick={handleNextQuestion}
          disabled={!selectedOption}
          className={!selectedOption ? 'disabled' : ''}
          whileHover={selectedOption ? { scale: 1.05 } : {}}
          whileTap={selectedOption ? { scale: 0.95 } : {}}
        >
          {currentQuestion === quizData[algo].length - 1 ? 'Submit Quiz' : 'Next Question'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Quiz;