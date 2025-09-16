// src/components/Quiz/Quiz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const timerRef = useRef(null);

  // Get current user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    } else {
      // Redirect to login if no user is logged in
      navigate('/login');
    }
  }, [navigate]);

  // Check if quiz was previously completed for this user
  useEffect(() => {
    if (!currentUser) return;
    
    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    const algoProgress = userData[algo];
    
    if (algoProgress?.quizCompleted) {
      // Load completed quiz results
      setScore(algoProgress.score);
      setTimeElapsed(algoProgress.timeElapsed);
      setAnsweredQuestions(algoProgress.answeredQuestions);
      setShowResult(true);
      setQuizSubmitted(true);
    } else if (algoProgress) {
      // Load in-progress quiz state
      setScore(algoProgress.score);
      setTimeElapsed(algoProgress.timeElapsed);
      setAnsweredQuestions(algoProgress.answeredQuestions);
      setCurrentQuestion(algoProgress.currentQuestion);
    }
    
    setInitialLoadComplete(true);
  }, [algo, currentUser]);

  // Timer logic
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
    
    // Check if answer is correct
    const isCorrect = selectedOption === quizData[algo][currentQuestion].answer;
    const newScore = isCorrect ? score + 1 : score;

    // Record the answer
    const newAnsweredQuestions = [...answeredQuestions, {
      question: quizData[algo][currentQuestion].question,
      selectedOption,
      isCorrect,
      correctAnswer: quizData[algo][currentQuestion].answer,
      explanation: quizData[algo][currentQuestion].explanation
    }];

    // Save progress for this user
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
      // Move to next question
      setScore(newScore);
      setAnsweredQuestions(newAnsweredQuestions);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Quiz completed
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

    // Mark as completed in user progress storage
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

    // Save to user's quiz history
    const userQuizHistory = JSON.parse(localStorage.getItem('userQuizHistory')) || {};
    const userHistory = userQuizHistory[currentUser.username] || [];
    
    userHistory.push(quizResults);
    userQuizHistory[currentUser.username] = userHistory;
    localStorage.setItem('userQuizHistory', JSON.stringify(userQuizHistory));

    // Update state
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
    
    // Clear previous attempt for this user
    const userQuizData = JSON.parse(localStorage.getItem('userQuizData')) || {};
    const userData = userQuizData[currentUser.username] || {};
    
    delete userData[algo];
    userQuizData[currentUser.username] = userData;
    localStorage.setItem('userQuizData', JSON.stringify(userQuizData));

    // Reset state
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
    navigate(`/quiz/${topic}`);
  };

  if (!currentUser) {
    return <div className="quiz-container loading">Loading user data...</div>;
  }

  if (!initialLoadComplete) {
    return <div className="quiz-container loading">Loading quiz data...</div>;
  }

  if (!quizData[algo]) {
    return (
      <div className="quiz-container">
        <h2>Quiz not found for this algorithm</h2>
        <button onClick={handleBackToTopics}>Back to Topics</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>{algo.replace(/-/g, ' ').toUpperCase()} Quiz Results</h2>
          <div className="user-info">
            <span>User: {currentUser.username}</span>
            <button className="back-button" onClick={handleBackToTopics}>
              Back to Topics
            </button>
          </div>
        </div>
        
        <div className="result-section">
          <div className="result-summary">
            <h3>Your Score: {score} / {quizData[algo].length}</h3>
            <p>Time Taken: {formatTime(timeElapsed)}</p>
            <p>Percentage: {Math.round((score / quizData[algo].length) * 100)}%</p>
          </div>
          
          <div className="action-buttons">
            <button onClick={handleRetakeQuiz}>Retake Quiz</button>
            <button onClick={handleBackToTopics}>Back to Topics</button>
          </div>
          
          <div className="detailed-results">
            <h4>Detailed Results:</h4>
            {answeredQuestions.map((item, index) => (
              <div key={index} className={`question-result ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                <p><strong>Question {index + 1}:</strong> {item.question}</p>
                <p>Your answer: {item.selectedOption}</p>
                {!item.isCorrect && <p>Correct answer: {item.correctAnswer}</p>}
                <p>Explanation: {item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{algo.replace(/-/g, ' ').toUpperCase()} Quiz</h2>
        <div className="quiz-controls">
          <span className="user-info">User: {currentUser.username}</span>
          <span className="timer">Time: {formatTime(timeElapsed)}</span>
          <button onClick={handlePauseResume}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="back-button" onClick={handleBackToTopics}>
            Back to Topics
          </button>
        </div>
      </div>
      
      <div className="quiz-progress">
        <p>Question {currentQuestion + 1} of {quizData[algo].length}</p>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${((currentQuestion + 1) / quizData[algo].length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="question-section">
        <h3>{quizData[algo][currentQuestion].question}</h3>
        <div className="options">
          {quizData[algo][currentQuestion].options.map((option, index) => (
            <div 
              key={index}
              className={`option ${selectedOption === option ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      
      <div className="navigation">
        <button 
          onClick={handleNextQuestion}
          disabled={!selectedOption}
          className={!selectedOption ? 'disabled' : ''}
        >
          {currentQuestion === quizData[algo].length - 1 ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;