import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  "dynamic-programming": [
    "LCS Problem",
    "Matrix Chain Multiplication",
    "01 Knapsack Problem",
    "Floyd-Warshall Algorithm",
    "Bellman Ford's Algorithm",
    "Travelling Salesman Problem",
  ],
  backtracking: [
    "String Permutations",
    "Sum of Subsets",
    "N Queens Problem",
    "Hamiltonian Cycle",
    "M-Coloring Problem",
  ],
  "branch and bound": [
    "Assignment Problem",
    "Travelling Salesman Problem",
    "01 Knapsack Problem",
    "Set Cover Problem",
    "Integer Programming",
  ],
};

const QuizTopic = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  const handleClick = (algo) => {
    const slug = algo.toLowerCase().replace(/\s+/g, "-");
    navigate(`/quiz/${topic}/${slug}`);
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

  return (
    <div className="quiz-topic-page">
      <header className="quiz-topic-header">
        <motion.h1 
          className="animate-heading"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          {topic.replace(/-/g, " ").toUpperCase()} ALGORITHMS
        </motion.h1>
        <motion.button
          className="back-to-topic-button"
          onClick={() => navigate("/quiz")}
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
          ← Back to Quiz Topic
        </motion.button>
      </header>

      <div className="algo-card-grid">
        {algorithms[topic]?.map((algo, idx) => (
          <motion.div
            key={idx}
            className="algo-card"
            custom={idx}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{
              y: -8,
              rotateY: 2,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleClick(algo)}
          >
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              {algo}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + idx * 0.05 }}
            >
              Take a quiz on {algo}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuizTopic;