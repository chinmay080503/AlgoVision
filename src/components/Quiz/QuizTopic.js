// src/components/Quiz/QuizTopic.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./QuizTopic.css";

const algorithms = {
  sorting: [
    "Bubble Sort",
    "Selection Sort",
    "Insertion Sort",
    "Merge Sort",
    "Quick Sort",
    "Heap Sort",
    "Shell Sort",
    "Counting Sort",
    "Radix Sort",
    "Bucket Sort",
  ],
  searching: [
    "Linear Search",
    "Binary Search",
    "Jump Search",
    "Exponential Search",
    "Ternary Search",
  ],
};

const QuizTopic = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const cards = document.querySelectorAll(".algo-card");
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add("fade-in");
      }, i * 200);
    });
  }, []);

  const handleClick = (algo) => {
    const slug = algo.toLowerCase().replace(/\s+/g, "-");
    navigate(`/quiz/${topic}/${slug}`);
  };

  return (
    <div className="quiz-topic-page">
      {/* Fixed Top-Right Back Button */}

      <header className="quiz-topic-header">
        <h1 className="animate-heading">{topic.toUpperCase()} ALGORITHMS</h1>
        {/* Removed the old back-button here */}
        <button
          className="back-to-topic-button"
          onClick={() => navigate("/quiz")}
        >
          ← Back to Quiz Topic
        </button>
      </header>

      <div className="algo-card-grid">
        {algorithms[topic]?.map((algo, idx) => (
          <div
            key={idx}
            className="algo-card"
            onClick={() => handleClick(algo)}
          >
            <h3>{algo}</h3>
            <p>Take a quiz on {algo}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizTopic;
