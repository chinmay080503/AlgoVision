import React, { useState, useEffect } from "react";
import "./CountingSort.css";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const CountingSort = () => {
  const [array, setArray] = useState([4, 2, 2, 8, 3, 3, 1, 0, 5, 4]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    const max = Math.max(...array);
    setMaxValue(max);
    const generatedSteps = generateSteps(array, max);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [array]);

  const generateSteps = (arr, max) => {
    const steps = [];
    const n = arr.length;
    const output = new Array(n).fill(0);
    const count = new Array(max + 1).fill(0);

    // Initial state
    steps.push({
      array: [...arr],
      output: [...output],
      count: [...count],
      currentIndex: -1,
      currentValue: -1,
      action: "Starting Counting Sort algorithm. First, we'll count occurrences of each number.",
      code: "countingSort(arr)",
    });

    // Store count of each element
    for (let i = 0; i < n; i++) {
      const val = arr[i];
      count[val]++;
      
      steps.push({
        array: [...arr],
        output: [...output],
        count: [...count],
        currentIndex: i,
        currentValue: val,
        action: `Found element ${val} at index ${i}. Incrementing count for ${val} to ${count[val]}.`,
        code: "count[arr[i]]++",
      });
    }

    steps.push({
      array: [...arr],
      output: [...output],
      count: [...count],
      currentIndex: -1,
      currentValue: -1,
      action: `Finished counting occurrences. Count array: [${count.join(', ')}]`,
      code: "// Counting complete",
    });

    // Modify count array to store cumulative counts
    for (let i = 1; i <= max; i++) {
      count[i] += count[i - 1];
      
      steps.push({
        array: [...arr],
        output: [...output],
        count: [...count],
        currentIndex: i,
        currentValue: i,
        action: `Updating cumulative count at index ${i}. New value: ${count[i]}`,
        code: "count[i] += count[i - 1]",
      });
    }

    steps.push({
      array: [...arr],
      output: [...output],
      count: [...count],
      currentIndex: -1,
      currentValue: -1,
      action: `Cumulative counts complete. Count array: [${count.join(', ')}]`,
      code: "// Cumulative counts complete",
    });

    // Build the output array
    for (let i = n - 1; i >= 0; i--) {
      const val = arr[i];
      output[count[val] - 1] = val;
      count[val]--;
      
      steps.push({
        array: [...arr],
        output: [...output],
        count: [...count],
        currentIndex: i,
        currentValue: val,
        action: `Placing element ${val} from input index ${i} to output index ${count[val]}. Count for ${val} decremented to ${count[val]}.`,
        code: "output[count[arr[i]] - 1] = arr[i]; count[arr[i]]--",
      });
    }

    steps.push({
      array: [...output],
      output: [...output],
      count: [...count],
      currentIndex: -1,
      currentValue: -1,
      action: "Counting Sort complete! The array is now sorted.",
      code: "return output",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        output: new Array(array.length).fill(0),
        count: new Array(maxValue + 1).fill(0),
        currentIndex: -1,
        currentValue: -1,
        action: "Click Next to start sorting",
        code: "countingSort(arr)",
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

  const getBarColor = (index, arrayType = 'input') => {
    if (arrayType === 'input') {
      if (index === stepData.currentIndex) {
        return "#f59e0b"; // Orange for current element
      }
      return "#3b82f6"; // Blue for other elements
    } else if (arrayType === 'output') {
      if (stepData.output[index] !== 0) {
        return "#10b981"; // Green for filled output elements
      }
      return "#d1d5db"; // Gray for empty output elements
    } else if (arrayType === 'count') {
      if (index === stepData.currentValue && stepData.currentIndex !== -1) {
        return "#ef4444"; // Red for current count index
      }
      return "#8b5cf6"; // Purple for count array
    }
  };

  const algorithm = `function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  const output = new Array(arr.length);
  
  // Store count of each element
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
  }
  
  // Modify count to store cumulative counts
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }
  
  // Build the output array
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  
  return output;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "countingSort(arr)" && line.includes("countingSort(arr)")) {
        highlight = true;
      }

      if (stepData.code === "count[arr[i]]++" && line.includes("count[arr[i]]++")) {
        highlight = true;
      }

      if (stepData.code === "// Counting complete" && line.includes("// Store count of each element")) {
        highlight = true;
      }

      if (stepData.code === "count[i] += count[i - 1]" && line.includes("count[i] += count[i - 1]")) {
        highlight = true;
      }

      if (stepData.code === "// Cumulative counts complete" && line.includes("// Modify count to store cumulative counts")) {
        highlight = true;
      }

      if (stepData.code.includes("output[count[arr[i]] - 1] = arr[i]; count[arr[i]]--") && 
          line.includes("output[count[arr[i]] - 1] = arr[i]")) {
        highlight = true;
      }

      if (stepData.code === "return output" && line.includes("return output")) {
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
    <div className="counting-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Counting Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Counting Sort</h2>
              <p className="card-content">
                <strong>Counting Sort</strong> is a non-comparison based sorting algorithm that works by counting the number of objects that have distinct key values. It operates by counting the number of objects having each distinct key value, then using arithmetic to determine the positions of each key value in the output sequence.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n + k)</li>
                    <li>Average: O(n + k)</li>
                    <li>Worst: O(n + k)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(n + k) - Requires auxiliary arrays</li>
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
                  <li>• Not a comparison sort</li>
                  <li>• Only works with integer keys in a specific range</li>
                  <li>• Extremely efficient when the range of input data (k) is not significantly greater than the number of objects (n)</li>
                  <li>• Often used as a subroutine in Radix Sort</li>
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
                  {/* Input Array */}
                  <div className="array-section">
                    <h3 className="array-title">Input Array</h3>
                    <div className="array-container">
                      {stepData.array.map((value, index) => (
                        <div
                          key={`input-${index}`}
                          className="bar"
                          style={{
                            height: `${(value / maxValue) * 100}px`,
                            backgroundColor: getBarColor(index, 'input'),
                            transform: index === stepData.currentIndex ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          <span className="bar-value">{value}</span>
                          {index === stepData.currentIndex && (
                            <div className="current-indicator">Current</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Count Array */}
                  <div className="array-section">
                    <h3 className="array-title">Count Array</h3>
                    <div className="count-container">
                      {stepData.count.map((value, index) => (
                        <div
                          key={`count-${index}`}
                          className="count-element"
                          style={{
                            backgroundColor: getBarColor(index, 'count'),
                          }}
                        >
                          <div className="count-index">{index}</div>
                          <div className="count-value">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Output Array */}
                  <div className="array-section">
                    <h3 className="array-title">Output Array</h3>
                    <div className="array-container">
                      {stepData.output.map((value, index) => (
                        <div
                          key={`output-${index}`}
                          className="bar"
                          style={{
                            height: value === 0 ? "20px" : `${(value / maxValue) * 100}px`,
                            backgroundColor: getBarColor(index, 'output'),
                          }}
                        >
                          <span className="bar-value">{value === 0 ? " " : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Phase</div>
                    <div className="status-value blue-title">
                      {currentStep === 0 ? "Initial" : 
                       currentStep < steps.findIndex(step => step.code === "// Counting complete") ? "Counting" :
                       currentStep < steps.findIndex(step => step.code === "// Cumulative counts complete") ? "Cumulative" :
                       currentStep < steps.length - 1 ? "Placing" : "Complete"}
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
                  <span className="legend-text">Input Array</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span className="legend-text">Current Element</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Count Array</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Current Count Index</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Output Elements</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#d1d5db" }}
                  ></div>
                  <span className="legend-text">Empty Output</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountingSort;