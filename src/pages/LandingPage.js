import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./LandingPage.css";
import logo from "../logo.png";

const features = [
  {
    title: "Interactive Learning",
    description:
      "Master Algorithms through interactive visualizations and gamified learning experiences.",
  },
  {
    title: "Prove Your Mastery",
    description:
      "Test yourself with algorithm quizzes, earn XP points, and climb the global leaderboard.",
  },
  {
    title: "Monitor Your Growth",
    description:
      "Track your progress with detailed analytics, XP gains, and level advancements for each algorithm.",
  },
  {
    title: "Rise Through Ranks",
    description:
      "Measure your skills against other learners and watch your position climb as you master algorithms.",
  },
  {
    title: "Learn Together",
    description:
      "Join our community to share knowledge, ask questions, and collaborate on challenges.",
  },
  {
    title: "AI-Powered Assistance",
    description:
      "Get instant, personalized help with explanations and hints tailored to your learning style.",
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
  const [typedText, setTypedText] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambledWord, setScrambledWord] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fullText = "Visualize. Understand. Master ";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsScrambling(true);
          animateSorting();
        }, 300);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const animateSorting = async () => {
    // Start with scrambled letters
    const scrambled = [
      { id: 'm', char: 'm' },
      { id: 'l1', char: 'l' },
      { id: 'h', char: 'h' },
      { id: 'A', char: 'A' },
      { id: 'g', char: 'g' },
      { id: 't', char: 't' },
      { id: 'o', char: 'o' },
      { id: 'i', char: 'i' },
      { id: 'r', char: 'r' },
      { id: 's', char: 's' }
    ];
    
    const target = ['A', 'l', 'g', 'o', 'r', 'i', 't', 'h', 'm', 's'];
    
    setScrambledWord([...scrambled]);
    await sleep(800);
    
    // Insertion sort - pick each letter and move to correct position
    const current = [...scrambled];
    
    for (let i = 1; i < current.length; i++) {
      const key = current[i];
      const keyChar = key.char;
      
      // Find correct position in target
      const targetIndex = target.indexOf(keyChar);
      let insertPos = 0;
      
      for (let k = 0; k < i; k++) {
        if (target.indexOf(current[k].char) < targetIndex) {
          insertPos = k + 1;
        }
      }
      
      if (insertPos < i) {
        // Highlight the letter being moved
        setActiveIndex(i);
        await sleep(500);
        
        // Remove from current position and insert at correct position
        current.splice(i, 1);
        current.splice(insertPos, 0, key);
        setScrambledWord([...current]);
        
        await sleep(700);
        setActiveIndex(-1);
        await sleep(300);
      }
    }
    
    setActiveIndex(-1);
  };

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
    if (nav) {
      nav.classList.remove("slide-down");
      requestAnimationFrame(() => {
        nav.classList.add("slide-down");
      });
    }
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

  useEffect(() => {
    const handleUserLoggedIn = () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser?.username) {
        showNotification(`Welcome, ${currentUser.username}!`);
      }
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
        <h1 className="animate-heading typing-heading">
          {typedText}
          {isScrambling && (
            <span className="scrambled-word-framer">
              <AnimatePresence mode="popLayout">
                {scrambledWord.map((letter, index) => (
                  <motion.span
                    key={letter.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: activeIndex === index ? 1.2 : 1,
                      y: activeIndex === index ? -8 : 0,
                      color: activeIndex === index 
                        ? (isDark ? '#00bcd4' : '#003366')
                        : (isDark ? '#00e5ff' : '#004e92')
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      },
                      scale: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      },
                      y: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      },
                      color: {
                        duration: 0.3
                      }
                    }}
                    className="letter-framer"
                  >
                    {letter.char}
                  </motion.span>
                ))}
              </AnimatePresence>
            </span>
          )}
          {!isScrambling && <span className="typing-cursor">|</span>}
          <span className="period">.</span>
        </h1>
        <p className="animate-text">
          Your personalized platform to learn Algorithms
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
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <div className="feature-description">
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <footer className="landing-footer">
        <p>Copyright © 2026 Chinmay Srivastava. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;