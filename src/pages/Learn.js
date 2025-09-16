import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Learn.css";

const sortingAlgorithms = [
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
];

const searchingAlgorithms = [
  "Linear Search",
  "Binary Search",
  "Jump Search",
  "Exponential Search",
  "Ternary Search",
];

const dynamicProgrammingProblems = [
  "LCS Problem",
  "Matrix Chain Multiplication",
  "0/1 Knapsack Problem",
  "Floyd-Warshall Algorithm",
  "Bellman Ford's Algorithm",
  "Travelling Salesman Problem",
];

const Learn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const cards = document.querySelectorAll(".algo-card");
    cards.forEach((card, i) => {
      card.style.setProperty("--delay", `${1 + i * 0.15}s`);
    });
  }, []);

  const handleCardClick = (category, name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/learn/${category}/${slug}`);
  };

  return (
    <div className="learn-container">
      <div className="learn-content-wrapper">
        <header className="learn-header">
          <h1 className="learn-heading">Learn Algorithms</h1>
          <button className="learn-back-button" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </header>

        <section className="algo-section">
          <h2 className="algo-title">Sorting Algorithms</h2>
          <div className="algo-grid">
            {sortingAlgorithms.map((algo, index) => (
              <div
                key={index}
                className="algo-card"
                onClick={() => handleCardClick("sorting", algo)}
              >
                <h3>{algo}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="algo-section">
          <h2 className="algo-title">Searching Algorithms</h2>
          <div className="algo-grid">
            {searchingAlgorithms.map((algo, index) => (
              <div
                key={index}
                className="algo-card"
                onClick={() => handleCardClick("searching", algo)}
              >
                <h3>{algo}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="algo-section">
          <h2 className="algo-title">Dynamic Programming</h2>
          <div className="algo-grid">
            {dynamicProgrammingProblems.map((problem, index) => (
              <div
                key={index}
                className="algo-card"
                onClick={() => handleCardClick("dynamic-programming", problem)}
              >
                <h3>{problem}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Learn;