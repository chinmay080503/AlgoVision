// src/components/Quiz/QuizHome.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizHome.css";

const topics = ["sorting", "searching"];

const QuizHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cards = document.querySelectorAll(".quiz-topic-card");
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add("fade-in");
      }, i * 200);
    });
  }, []);

  return (
    <div className="quiz-home-container page-enter">
      <header className="quiz-header">
        <div className="quiz-header-content">
          <h1 className="quiz-title animate-heading">Choose a Quiz Topic</h1>
          <button
            className="quiz-back-to-dashboard"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="quiz-topic-grid">
        {topics.map((topic) => (
          <div
            key={topic}
            className="quiz-topic-card"
            onClick={() => navigate(`/quiz/${topic}`)}
          >
            <h3>{topic.toUpperCase()}</h3>
            <p>Test your knowledge of {topic} algorithms.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizHome;