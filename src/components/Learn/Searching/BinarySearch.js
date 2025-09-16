import React, { useState, useEffect } from "react";
import { ChevronLeft, Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import "./BinarySearch.css";

const BinarySearch = () => {
  const [array, setArray] = useState([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  const [target, setTarget] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [foundIndex, setFoundIndex] = useState(-1);

  useEffect(() => {
    const generatedSteps = generateSteps(array, target);
    setSteps(generatedSteps);
    setFoundIndex(generatedSteps[generatedSteps.length - 1]?.foundIndex ?? -1);
  }, [array, target]);

  const generateSteps = (arr, targetValue) => {
    const newSteps = [];
    let left = 0;
    let right = arr.length - 1;
    let foundIdx = -1;

    newSteps.push({
      array: [...arr],
      left,
      right,
      mid: -1,
      target: targetValue,
      foundIndex: -1,
      action: "Starting Binary Search. Array must be sorted.",
      code: "binarySearch(arr, target)"
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      newSteps.push({
        array: [...arr],
        left,
        right,
        mid,
        target: targetValue,
        foundIndex: -1,
        action: `Checking middle element at index ${mid} (value: ${arr[mid]})`,
        code: "mid = floor((left + right) / 2)"
      });

      if (arr[mid] === targetValue) {
        foundIdx = mid;
        newSteps.push({
          array: [...arr],
          left,
          right,
          mid,
          target: targetValue,
          foundIndex: mid,
          action: `Found target ${targetValue} at index ${mid}!`,
          code: "return mid"
        });
        break;
      } else if (arr[mid] < targetValue) {
        newSteps.push({
          array: [...arr],
          left: mid + 1,
          right,
          mid,
          target: targetValue,
          foundIndex: -1,
          action: `Target ${targetValue} is greater than ${arr[mid]}, searching right half`,
          code: "left = mid + 1"
        });
        left = mid + 1;
      } else {
        newSteps.push({
          array: [...arr],
          left,
          right: mid - 1,
          mid,
          target: targetValue,
          foundIndex: -1,
          action: `Target ${targetValue} is less than ${arr[mid]}, searching left half`,
          code: "right = mid - 1"
        });
        right = mid - 1;
      }
    }

    if (foundIdx === -1) {
      newSteps.push({
        array: [...arr],
        left: -1,
        right: -1,
        mid: -1,
        target: targetValue,
        foundIndex: -1,
        action: `Target ${targetValue} not found in the array.`,
        code: "return -1"
      });
    }

    return newSteps;
  };

  const getCurrentStepData = () => {
    return steps[currentStep] || {
      array: array,
      left: 0,
      right: array.length - 1,
      mid: -1,
      target: target,
      foundIndex: -1,
      action: "Click Next to start searching",
      code: "binarySearch(arr, target)"
    };
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
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const generateNewArray = () => {
    const newArray = [];
    let current = 10;
    for (let i = 0; i < 10; i++) {
      newArray.push(current);
      current += Math.floor(Math.random() * 10) + 5;
    }
    setArray(newArray);
    reset();
  };

  const handleTargetChange = (e) => {
    setTarget(Number(e.target.value));
    reset();
  };

  const getBarColor = (value, index) => {
    if (index === stepData.mid) return "#f59e0b"; // Yellow for current mid
    if (index === stepData.foundIndex) return "#10B981"; // Green for found
    if (index >= stepData.left && index <= stepData.right) return "#3b82f6"; // Blue for current search range
    return "#e5e7eb"; // Gray for out of range
  };

  const algorithm = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (stepData.code === "binarySearch(arr, target)" && line.includes("binarySearch(arr, target)")) {
        highlight = true;
      }
      if (stepData.code.includes("mid = floor") && line.includes("const mid = Math.floor")) {
        highlight = true;
      }
      if (stepData.code === "return mid" && line.includes("return mid")) {
        highlight = true;
      }
      if (stepData.code === "left = mid + 1" && line.includes("left = mid + 1")) {
        highlight = true;
      }
      if (stepData.code === "right = mid - 1" && line.includes("right = mid - 1")) {
        highlight = true;
      }
      if (stepData.code === "return -1" && line.includes("return -1")) {
        highlight = true;
      }
      return (
        <div key={index} className={highlight ? "highlighted-line" : "code-line"}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="binary-search-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Binary Search Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="scrollable-content">
          {/* About Card with Complexity Sections */}
          <div className="card about-card">
            <h2 className="card-title">About Binary Search</h2>
            <div className="card-content">
              <div className="about-content">
                <p>
                  Binary Search is an efficient algorithm for finding an item from a sorted list of items.
                  It works by repeatedly dividing in half the portion of the list that could contain the item.
                </p>
              </div>
              
              <div className="complexity-section">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(1)</li>
                    <li>Average: O(log n)</li>
                    <li>Worst: O(log n)</li>
                  </ul>
                </div>
                
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(1)</li>
                  </ul>
                </div>
              </div>
              
              <div className="characteristics-section yellow-card">
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Requires sorted array</li>
                  <li>• Much faster than linear search</li>
                  <li>• No additional space required</li>
                  <li>• Works by divide and conquer</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Algorithm and Visualization Side by Side */}
          <div className="algorithm-visualization-row">
            <div className="algorithm-card">
              <div className="card">
                <h2 className="card-title">Algorithm Code</h2>
                <div className="code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>
            </div>

            <div className="visualization-card">
              <div className="card">
                <h2 className="card-title">Visualization</h2>
                
                <div className="config-section">
                  <label htmlFor="target">Search Target: </label>
                  <input
                    id="target"
                    type="number"
                    value={target}
                    onChange={handleTargetChange}
                    min={array[0]}
                    max={array[array.length - 1]}
                  />
                </div>

                <div className="action-container">
                  <div className="action-label">Current Action:</div>
                  <div className="action-text">{stepData.action}</div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label">Current Range</div>
                    <div className="status-value">
                      {stepData.left === -1 ? "N/A" : `${stepData.left} - ${stepData.right}`}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label">Mid Index</div>
                    <div className="status-value">
                      {stepData.mid === -1 ? "N/A" : stepData.mid}
                    </div>
                  </div>
                  <div className="status-card yellow-card">
                    <div className="status-label">Status</div>
                    <div className="status-value">
                      {stepData.foundIndex >= 0 ? 'Found' : 
                       stepData.mid >= 0 ? 'Searching' : 'Ready'}
                    </div>
                  </div>
                </div>

                <div className="array-section">
                  <h3 className="array-title">Array Elements</h3>
                  <div className="array-container">
                    {stepData.array.map((value, index) => (
                      <div
                        key={`array-${index}`}
                        className="bar"
                        style={{
                          height: `${value}px`,
                          backgroundColor: getBarColor(value, index),
                          transform: index === stepData.mid ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.mid && (
                          <div className="current-indicator">Mid</div>
                        )}
                        {index === stepData.foundIndex && (
                          <div className="current-indicator found">Found</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="controls-container">
                  <button
                    className="control-button gray-button"
                    onClick={generateNewArray}
                  >
                    <RotateCcw size={16} /> New Array
                  </button>
                  <button
                    className="control-button gray-button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    className="control-button blue-button"
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    className="control-button blue-button"
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button 
                    className="control-button red-button"
                    onClick={reset}
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Color Legend at Bottom */}
          <div className="card legend-card">
            <h2 className="card-title">Color Legend</h2>
            <div className="legend-grid">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
                <span className="legend-text">Current Search Range</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
                <span className="legend-text">Mid Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#10B981" }}></div>
                <span className="legend-text">Found Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#e5e7eb" }}></div>
                <span className="legend-text">Out of Range</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinarySearch;