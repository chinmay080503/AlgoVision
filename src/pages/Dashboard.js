import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [username, setUsername] = useState("");
  const [animationState, setAnimationState] = useState({
    heading: false,
    welcome: false,
    backButton: false,
    cards: [false, false, false, false, false, false] // Keeping six cards, replacing game with AI assistant
  });

  useEffect(() => {
    // Get username from local storage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.username) {
      setUsername(currentUser.username);
    }
  }, []);

  useEffect(() => {
    if (!hasAnimated) {
      // Use a timeout to trigger animations in sequence
      setTimeout(() => {
        setAnimationState(prev => ({...prev, heading: true}));
      }, 100);

      setTimeout(() => {
        setAnimationState(prev => ({...prev, welcome: true}));
      }, 300);

      setTimeout(() => {
        setAnimationState(prev => ({...prev, backButton: true}));
      }, 600);

      // Animate cards with delays
      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, false, false, false, false, false]}));
      }, 800);

      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, true, false, false, false, false]}));
      }, 950);

      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, true, true, false, false, false]}));
      }, 1100);

      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, true, true, true, false, false]}));
      }, 1250);
      
      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, true, true, true, true, false]}));
      }, 1400);
      
      setTimeout(() => {
        setAnimationState(prev => ({...prev, cards: [true, true, true, true, true, true]}));
        setHasAnimated(true);
      }, 1550);
    }
  }, [hasAnimated]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className={`dashboard-heading ${animationState.heading ? "fade-in" : ""}`}>
            Algorithm Dashboard
          </h1>
          {username && (
            <div className={`welcome-message ${animationState.welcome ? "fade-in" : ""}`}>
              Welcome, <span className="username">{username}</span>!
            </div>
          )}
        </div>
        
        <button 
          className={`dashboard-back-button ${animationState.backButton ? "fade-in" : ""}`} 
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </div>

      <div className="main-dashboard-grid">
        <div
          className={`main-dashboard-card ${animationState.cards[0] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/learn")}
        >
          <h2>📘 Learn Algorithms</h2>
          <p>
            Visualize and understand searching and sorting algorithms through
            animations and interactive code.
          </p>
        </div>

        <div
          className={`main-dashboard-card ${animationState.cards[1] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/quiz")}
        >
          <h2>🧠 Take Quiz</h2>
          <p>
            Test your algorithm knowledge with quizzes covering theory, code
            tracing, and time complexity.
          </p>
        </div>

        <div
          className={`main-dashboard-card ${animationState.cards[2] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/progress")}
        >
          <h2>📊 Track Progress</h2>
          <p>
            View your learning history, strengths, and weak topics based on quiz
            results and time spent.
          </p>
        </div>

        <div
          className={`main-dashboard-card ${animationState.cards[3] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/leaderboard")}
        >
          <h2>🏆 Leaderboard</h2>
          <p>
            Compete with other users and see your ranking based on quiz performance and
            scores.
          </p>
        </div>
        
        <div
          className={`main-dashboard-card ${animationState.cards[4] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/forum")}
        >
          <h2>💬 Discussion Forum</h2>
          <p>
            Ask questions, share insights, and discuss algorithms with other learners
            in the community.
          </p>
        </div>
        
        {/* Replaced Game Section with AI Teaching Assistant */}
        <div
          className={`main-dashboard-card ${animationState.cards[5] ? "fade-in" : ""}`}
          onClick={() => handleNavigation("/ai-assistant")}
        >
          <h2>🤖 AI Teaching Assistant</h2>
          <p>
            Get personalized explanations and guidance on algorithms from our AI assistant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;