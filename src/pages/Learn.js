import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const backtrackingProblems = [
  "String Permutation Problem",
  "Sum of Subsets",
  "N Queens Problem",
  "Hamiltonian Cycle",
  "M-Coloring Problem"
];

const branchAndBoundProblems = [
  "Assignment Problem",
  "Travelling Salesman Problem",
  "0/1 Knapsack Problem",
  "Set Cover Problem",
  "Integer Programming"
];

const Learn = () => {
  const navigate = useNavigate();

  const handleCardClick = (category, name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/learn/${category}/${slug}`);
  };

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
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    })
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5
      }
    })
  };

  const sections = [
    { title: "Sorting Algorithms", algorithms: sortingAlgorithms, category: "sorting" },
    { title: "Searching Algorithms", algorithms: searchingAlgorithms, category: "searching" },
    { title: "Dynamic Programming Algorithms", algorithms: dynamicProgrammingProblems, category: "dynamic-programming" },
    { title: "Backtracking Algorithms", algorithms: backtrackingProblems, category: "backtracking" },
    { title: "Branch and Bound Algorithms", algorithms: branchAndBoundProblems, category: "branch&bound" }
  ];

  return (
    <div className="learn-container">
      <div className="learn-content-wrapper">
        <header className="learn-header">
          <motion.h1 
            className="learn-heading"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            Learn Algorithms
          </motion.h1>
          <motion.button 
            className="learn-back-button" 
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
        </header>

        {sections.map((section, sectionIndex) => (
          <motion.section
            key={section.category}
            className="algo-section"
            custom={sectionIndex}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="algo-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + sectionIndex * 0.1, duration: 0.4 }}
            >
              {section.title}
            </motion.h2>
            <div className="algo-grid">
              {section.algorithms.map((algo, index) => (
                <motion.div
                  key={index}
                  className="algo-card"
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{
                    y: -5,
                    rotateY: 2,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCardClick(section.category, algo)}
                >
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    {algo}
                  </motion.h3>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default Learn;