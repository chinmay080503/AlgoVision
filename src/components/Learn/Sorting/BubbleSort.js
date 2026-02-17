import React, { useState, useEffect } from "react";
import "./BubbleSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const BubbleSort = () => {
  const navigate = useNavigate();

  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    const generatedSteps = generateSteps(array);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [array]);

  const generateSteps = (arr) => {
    const steps = [];
    const tempArray = [...arr];
    const n = tempArray.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...tempArray],
          comparing: [j, j + 1],
          swapped: false,
          sortedIndices: Array.from({ length: i }, (_, k) => n - 1 - k),
          pass: i + 1,
          action: `Comparing elements at positions ${j} and ${j + 1}`,
          code: "if (arr[j] > arr[j + 1])",
        });

        if (tempArray[j] > tempArray[j + 1]) {
          [tempArray[j], tempArray[j + 1]] = [tempArray[j + 1], tempArray[j]];
          steps.push({
            array: [...tempArray],
            comparing: [j, j + 1],
            swapped: true,
            sortedIndices: Array.from({ length: i }, (_, k) => n - 1 - k),
            pass: i + 1,
            action: `Swapping ${tempArray[j + 1]} and ${tempArray[j]}`,
            code: "swap(arr[j], arr[j + 1])",
          });
        }
      }
    }

    steps.push({
      array: [...tempArray],
      comparing: [-1, -1],
      swapped: false,
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      pass: n,
      action: "Sorting complete!",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        comparing: [-1, -1],
        swapped: false,
        sortedIndices: [],
        pass: 0,
        action: "Click Next to start sorting",
        code: "bubbleSort(arr)",
      };
    return steps[Math.min(currentStep, steps.length - 1)];
  };

  const stepData = getCurrentStepData();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const getBarColor = (index) => {
    if (stepData.sortedIndices.includes(index)) {
      return "#10b981";
    } else if (stepData.comparing.includes(index)) {
      return stepData.swapped ? "#ef4444" : "#eab308";
    } else {
      return "#3b82f6";
    }
  };

  const algorithm = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`;

  const getHighlightedCode = () => {
  const lines = algorithm.split('\n');

  return lines.map((line, index) => {
    let highlight = false;

    if (stepData.code === 'if (arr[j] > arr[j + 1])' && line.includes('if (arr[j] > arr[j + 1])')) {
      highlight = true;
    }

    if (stepData.code === 'swap(arr[j], arr[j + 1])' && line.includes('[arr[j], arr[j + 1]]')) {
      highlight = true;
    }

    if (stepData.code === 'return arr' && line.includes('return arr')) {
      highlight = true;
    }

    return (
      <div
        key={index}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          color: highlight ? '#1e293b' : '#f1f5f9',
          backgroundColor: highlight ? '#facc15' : 'transparent',
          borderLeft: highlight ? '4px solid #f59e0b' : 'none',
          fontFamily: 'Consolas, monospace',
        }}
      >
        {line}
      </div>
    );
  });
};


  return (
    
    <div className="bubble-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Bubble Sort Algorithm</h1>
          <div className="spacer" />
        </div>

        <div className="left-column">
          {/* About */}
          <div className="card">
            <h2 className="card-title">About Bubble Sort</h2>
            <div className="card-content">
              <p>
                <strong>Bubble Sort</strong> is a simple sorting algorithm that
                repeatedly steps through the list, compares adjacent elements
                and swaps them if they are in the wrong order.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n)</li>
                    <li>Average: O(n²)</li>
                    <li>Worst: O(n²)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(1) - In-place sorting</li>
                  </ul>
                </div>
              </div>
              <div
                className="complexity-card yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="complexity-title yellow-title">
                  Key Characteristics
                </h3>
                <ul className="characteristics-list">
                  <li>• Stable sorting algorithm</li>
                  <li>• In-place sorting (requires only O(1) extra space)</li>
                  <li>• Simple to understand and implement</li>
                  <li>• Inefficient for large datasets</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code + Visualization side by side */}
          <div className="code-visualization-grid">
            {/* Code */}
            <div className="card">
              <h2 className="card-title">Algorithm Code</h2>
              <div className="code-container">
                <pre>{getHighlightedCode()}</pre>
              </div>
            </div>

            {/* Visualization */}
            <div className="card">
              <h2 className="card-title">Visualization</h2>
              <div className="visualization-area">
                <div className="array-container">
                  {stepData.array.map((value, index) => (
                    <div
                      key={index}
                      className="bar"
                      style={{
                        height: `${(value / Math.max(...array)) * 200}px`,
                        backgroundColor: getBarColor(index),
                        transform: stepData.comparing.includes(index)
                          ? "scale(1.1)"
                          : "scale(1)",
                      }}
                    >
                      <div className="bar-value">{value}</div>
                      {stepData.comparing.includes(index) && (
                        <div className="bounce-indicator"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="status-grid">
                <div className="status-card blue-card">
                  <div className="status-label blue-title">Current Pass</div>
                  <div className="status-value" style={{ color: "#1e40af" }}>
                    {stepData.pass}
                  </div>
                </div>
                <div className="status-card green-card">
                  <div className="status-label green-title">Steps</div>
                  <div className="status-value" style={{ color: "#065f46" }}>
                    {currentStep + 1} / {totalSteps}
                  </div>
                </div>
              </div>

              <div className="action-container">
                <div className="action-label">Current Action:</div>
                <div className="action-text">{stepData.action}</div>
              </div>

              <div className="controls-container">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`control-button gray-button ${
                    currentStep === 0 ? "disabled-button" : ""
                  }`}
                >
                  <SkipBack size={16} /> Previous
                </button>
                <button
                  onClick={togglePlay}
                  disabled={currentStep >= steps.length - 1}
                  className={`control-button blue-button ${
                    currentStep >= steps.length - 1 ? "disabled-button" : ""
                  }`}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}{" "}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1}
                  className={`control-button blue-button ${
                    currentStep >= steps.length - 1 ? "disabled-button" : ""
                  }`}
                >
                  Next <SkipForward size={16} />
                </button>
                <button onClick={reset} className="control-button red-button">
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Legend - moved to bottom */}
          <div className="card">
            <h2 className="card-title">Color Legend</h2>
            <div className="legend-grid">
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#3b82f6" }}
                ></div>
                <span className="legend-text">Unsorted</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#eab308" }}
                ></div>
                <span className="legend-text">Comparing</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#ef4444" }}
                ></div>
                <span className="legend-text">Swapping</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: "#10b981" }}
                ></div>
                <span className="legend-text">Sorted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;
