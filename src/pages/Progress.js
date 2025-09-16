import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    } else {
      // Redirect to login if no user is logged in
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

  const loadProgressData = () => {
    setLoading(true);
    setError(null);

    try {
      // Get user-specific quiz data
      const userQuizData = JSON.parse(localStorage.getItem("userQuizData")) || {};
      const userQuizHistory = JSON.parse(localStorage.getItem("userQuizHistory")) || {};
      
      const userData = currentUser ? userQuizData[currentUser.username] || {} : {};
      const userHistory = currentUser ? userQuizHistory[currentUser.username] || [] : [];
      
      const algoProgressMap = {};

      // First process user quiz history
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

      // Then process user quiz progress, checking for duplicates
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

            // Check if this attempt already exists in history
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

      // Sort attempts by date
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
    navigate(`/quiz/${topic || ""}`);
  };

  const handleTakeQuiz = (algo) => {
    navigate(`/quiz/${topic || "algorithms"}/${algo}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (!currentUser) {
    return (
      <div className="progress-container loading">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="progress-container loading">
        <div className="loading-spinner"></div>
        <p>Loading your progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-container error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadProgressData}>Retry</button>
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (Object.keys(progressData).length === 0) {
    return (
      <div className="progress-container empty">
        <div className="progress-header">
          <h2>
            {topic ? `${topic.toUpperCase()} PROGRESS` : "PROGRESS TRACKING"}
          </h2>
          <div className="user-info">
            <span>User: {currentUser.username}</span>
            <button className="back-button" onClick={handleBackToTopics}>
              Back to Topics
            </button>
          </div>
        </div>
        <button
          className="back-to-dashboard-button"
          onClick={handleBackToDashboard}
        >
          ← Back to Dashboard
        </button>
        
        <div className="user-welcome">
          <h3>Welcome, {currentUser.username}!</h3>
        </div>
        <div className="empty-state">
          <p>No quiz data available yet.</p>
          <p>Complete some quizzes to track your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>
          Progress Tracking
        </h2>
        <div className="user-info">
          
          <button className="back-button" onClick={handleBackToTopics}>
            Back to Topics
          </button>
        </div>
      </div>
      
      <button
        className="back-to-dashboard-button"
        onClick={handleBackToDashboard}
      >
        ← Back to Dashboard
      </button>

      <div className="algo-selector">
        <h2>Select Algorithm:</h2>
        <div className="algo-buttons">
          {Object.keys(progressData).map((algo) => (
            <button
              key={algo}
              onClick={() => handleAlgoSelect(algo)}
              className={selectedAlgo === algo ? "active" : ""}
            >
              {algo.replace(/-/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {selectedAlgo && progressData[selectedAlgo] && (
        <>
          <div className="progress-section">
            <h3>{selectedAlgo.replace(/-/g, " ").toUpperCase()} PERFORMANCE</h3>

            <div className="progress-stats">
              <div className="stat-card">
                <h4>Latest Score</h4>
                <p className="stat-value">
                  {progressData[selectedAlgo].slice(-1)[0].score} /{" "}
                  {progressData[selectedAlgo].slice(-1)[0].total}
                </p>
                <p className="stat-percentage">
                  {progressData[selectedAlgo].slice(-1)[0].percentage}%
                </p>
              </div>

              <div className="stat-card">
                <h4>Attempts</h4>
                <p className="stat-value">
                  {progressData[selectedAlgo].length}
                </p>
              </div>

              <div className="stat-card">
                <h4>Average Score</h4>
                <p className="stat-value">
                  {Math.round(
                    progressData[selectedAlgo].reduce(
                      (sum, attempt) => sum + attempt.percentage,
                      0
                    ) / progressData[selectedAlgo].length
                  )}
                  %
                </p>
              </div>

              <div className="stat-card">
                <h4>Best Time</h4>
                <p className="stat-value">
                  {Math.min(
                    ...progressData[selectedAlgo].map(
                      (attempt) => attempt.timeTaken
                    )
                  )}
                  s
                </p>
              </div>
            </div>

            <div className="progress-chart">
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
            </div>
          </div>

          <div className="weak-areas-section">
            <h3>Weak Areas</h3>
            {Object.keys(weakAreas).length > 0 ? (
              <>
                <p>Topics you need to focus on:</p>
                <div className="weak-areas-list">
                  {Object.entries(weakAreas)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, count]) => (
                      <div key={area} className="weak-area-item">
                        <span className="topic">{area}</span>
                        <span className="count">
                          {count} incorrect {count === 1 ? "answer" : "answers"}
                        </span>
                      </div>
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
          </div>

          <div className="action-buttons">
            <button
              onClick={() => handleTakeQuiz(selectedAlgo)}
              className="retake-button"
            >
              Retake {selectedAlgo.replace(/-/g, " ")} Quiz
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;