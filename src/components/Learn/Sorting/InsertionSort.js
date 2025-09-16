import React, { useState, useEffect } from "react";
import "./InsertionSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const InsertionSort = () => {
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

    // Initial state
    steps.push({
      array: [...tempArray],
      currentIndex: -1,
      key: -1,
      comparing: -1,
      sortedIndices: [0],
      pass: 0,
      action: "Starting insertion sort. First element is considered sorted.",
      code: "// First element is already sorted",
    });

    for (let i = 1; i < n; i++) {
      const key = tempArray[i];
      let j = i - 1;

      // Add step for starting new pass
      steps.push({
        array: [...tempArray],
        currentIndex: i,
        key: key,
        comparing: -1,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        pass: i,
        action: `Pass ${i}: Taking element ${key} at index ${i} as key to insert into sorted portion`,
        code: "key = arr[i]",
      });

      // Move elements that are greater than key one position ahead
      while (j >= 0 && tempArray[j] > key) {
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          key: key,
          comparing: j,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pass: i,
          action: `Comparing key ${key} with element ${tempArray[j]} at index ${j}. Since ${tempArray[j]} > ${key}, we need to shift it right`,
          code: "while (j >= 0 && arr[j] > key)",
        });

        tempArray[j + 1] = tempArray[j];

        steps.push({
          array: [...tempArray],
          currentIndex: i,
          key: key,
          comparing: j,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pass: i,
          action: `Shifted element ${tempArray[j]} from index ${j} to index ${
            j + 1
          }`,
          code: "arr[j + 1] = arr[j]",
        });

        j--;
      }

      // Check if we need to compare with the element at current j position
      if (j >= 0) {
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          key: key,
          comparing: j,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pass: i,
          action: `Comparing key ${key} with element ${tempArray[j]} at index ${j}. Since ${tempArray[j]} <= ${key}, we found the correct position`,
          code: "// Found correct position for key",
        });
      }

      // Insert the key at its correct position
      tempArray[j + 1] = key;

      steps.push({
        array: [...tempArray],
        currentIndex: -1,
        key: -1,
        comparing: -1,
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        pass: i,
        action: `Inserted key ${key} at index ${
          j + 1
        }. Elements from index 0 to ${i} are now sorted`,
        code: "arr[j + 1] = key",
      });
    }

    steps.push({
      array: [...tempArray],
      currentIndex: -1,
      key: -1,
      comparing: -1,
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      pass: n,
      action: "Insertion sort complete! All elements are now in sorted order.",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        currentIndex: -1,
        key: -1,
        comparing: -1,
        sortedIndices: [],
        pass: 0,
        action: "Click Next to start sorting",
        code: "insertionSort(arr)",
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
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const getBarColor = (index) => {
    if (stepData.sortedIndices.includes(index)) {
      return "#10b981"; // Green for sorted
    } else if (index === stepData.currentIndex) {
      return "#8b5cf6"; // Purple for current element being inserted
    } else if (index === stepData.comparing) {
      return "#ef4444"; // Red for comparing
    } else {
      return "#3b82f6"; // Blue for unsorted
    }
  };

  const algorithm = `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "key = arr[i]" && line.includes("key = arr[i]")) {
        highlight = true;
      }

      if (
        stepData.code === "while (j >= 0 && arr[j] > key)" &&
        line.includes("while (j >= 0 && arr[j] > key)")
      ) {
        highlight = true;
      }

      if (
        stepData.code === "arr[j + 1] = arr[j]" &&
        line.includes("arr[j + 1] = arr[j]")
      ) {
        highlight = true;
      }

      if (
        stepData.code === "arr[j + 1] = key" &&
        line.includes("arr[j + 1] = key")
      ) {
        highlight = true;
      }

      if (stepData.code === "return arr" && line.includes("return arr")) {
        highlight = true;
      }

      return (
        <div
          key={index}
          className={highlight ? "highlighted-line" : "code-line"}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="insertion-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Insertion Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Insertion Sort</h2>
              <p className="card-content">
                <strong>Insertion Sort</strong> is a simple sorting algorithm
                that builds the final sorted array one item at a time. It works
                by taking elements from the unsorted portion and inserting them
                into their correct position in the sorted portion. It's similar
                to how you might sort playing cards in your hands.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n) - Already sorted</li>
                    <li>Average: O(n²)</li>
                    <li>Worst: O(n²) - Reverse sorted</li>
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
                <ul className="characteristics-list yellow-text">
                  <li>• Stable (maintains relative order of equal elements)</li>
                  <li>• In-place sorting (requires only O(1) extra space)</li>
                  <li>
                    • Adaptive (performs better on partially sorted arrays)
                  </li>
                  <li>• Online (can sort arrays as they are received)</li>
                  <li>• Efficient for small datasets</li>
                </ul>
              </div>
            </div>

            {/* Code and Visualization Grid */}
            <div className="code-visualization-grid">
              {/* Code Section */}
              <div className="card">
                <h2 className="card-title">Algorithm Code</h2>
                <div className="code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              {/* Visualization Section */}
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
                          transform:
                            index === stepData.comparing ||
                            index === stepData.currentIndex
                              ? "scale(1.1)"
                              : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.currentIndex && (
                          <div className="current-indicator"></div>
                        )}
                        {index === stepData.comparing &&
                          stepData.comparing !== -1 && (
                            <div className="comparing-indicator"></div>
                          )}
                      </div>
                    ))}
                  </div>
                  {stepData.key !== -1 && (
                    <div className="key-display">
                      <div className="key-label">Key to Insert:</div>
                      <div className="key-value">{stepData.key}</div>
                    </div>
                  )}
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Pass</div>
                    <div className="status-value blue-title">
                      {stepData.pass}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label green-text">Steps</div>
                    <div className="status-value green-title">
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
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
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

            {/* Legend */}
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
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Current Element</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Comparing</span>
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
    </div>
  );
};

export default InsertionSort;
