import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../logo.png";

const features = [
  {
    title: "Algorithm Animations",
    description:
      "Visualize algorithms like Bubble Sort, Quick Sort, and Binary Search with step-by-step animations.",
  },
  {
    title: "Code Sync with Animation",
    description:
      "Each step of the algorithm is synced with the exact line of code being executed.",
  },
  {
    title: "Interactive Learning",
    description:
      "Explore, pause, and replay animations at your pace. Perfect for mastering DSA fundamentals.",
  },
  {
    title: "Algorithm Quizzes",
    description:
      "Test your understanding with targeted quizzes for each algorithm and data structure.",
  },
  {
    title: "Progress Tracking",
    description:
      "Identify your weak areas and track your improvement over time with detailed analytics.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return JSON.parse(localStorage.getItem("isDark")) || false;
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("isDark", JSON.stringify(newTheme));
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const nav = document.querySelector(".landing-nav");
    nav.classList.remove("slide-down");
    requestAnimationFrame(() => {
      nav.classList.add("slide-down");
    });
  }, []);

  useEffect(() => {
    const animateElements = () => {
      const elements = [
        ...document.querySelectorAll(".animate-heading"),
        ...document.querySelectorAll(".animate-text"),
        ...document.querySelectorAll(".animate-button"),
        ...document.querySelectorAll(".feature-card"),
      ];

      elements.forEach((el, i) => {
        el.style.animationDelay = `${i * 0.15}s`;
        el.classList.add("animate-in");
      });
    };

    const timer = setTimeout(animateElements, 300);
    return () => clearTimeout(timer);
  }, []);

  // Add this useEffect to LandingPage component
  useEffect(() => {
    const handleUserLoggedIn = () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      showNotification(`Welcome, ${currentUser.username}!`);
    };

    window.addEventListener("userLoggedIn", handleUserLoggedIn);

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn);
    };
  }, []);

  const handleStartLearning = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleLoginSignup = () => {
    navigate("/login");
  };

  return (
    <div className="landing-hero">
      {notification.show && (
        <div className="notification">{notification.message}</div>
      )}

      <nav className="landing-nav">
        <div className="landing-logo">
          <img src={logo} alt="" height={100} width={150} />
        </div>
        <div className="nav-buttons">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="login-signup-btn" onClick={handleLoginSignup}>
            Login/Signup
          </button>
        </div>
      </nav>

      <main className="landing-content">
        <h1 className="animate-heading">
          Visualize. Understand. Master Algorithms.
        </h1>
        <p className="animate-text">
          Your personalized platform to learn Data Structures & Algorithms
          through
          <span className="landing-highlight"> animated visuals</span> and
          <span className="landing-highlight">
            {" "}
            interactive code exploration
          </span>
          .
        </p>

        <button
          className="landing-cta-btn animate-button"
          onClick={handleStartLearning}
        >
          Start Learning
        </button>

        <div className="features-container">
          <div className="top-features">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bottom-features">
            {features.slice(3).map((feature, index) => (
              <div key={index + 3} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Footer Section */}
      <footer className="landing-footer">
        <p>Copyright © 2025 Chinmay Srivastava. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;