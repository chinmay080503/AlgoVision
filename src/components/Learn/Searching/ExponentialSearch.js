import React, { useState, useEffect } from "react";
import { ChevronLeft, Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import "./ExponentialSearch.css";

const ExponentialSearch = () => {
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
    const n = arr.length;
    let bound = 1;
    let foundIdx = -1;

    newSteps.push({
      array: [...arr],
      currentBound: bound,
      currentIndex: -1,
      target: targetValue,
      foundIndex: -1,
      action: "Starting Exponential Search. Array must be sorted.",
      code: "exponentialSearch(arr, target)"
    });

    // Find the range where the target might be
    while (bound < n && arr[bound] < targetValue) {
      newSteps.push({
        array: [...arr],
        currentBound: bound,
        currentIndex: bound,
        target: targetValue,
        foundIndex: -1,
        action: `Doubling bound to ${bound * 2} (checking index ${bound})`,
        code: "while (bound < n && arr[bound] < target)"
      });
      bound *= 2;
    }

    // Perform binary search in the found range
    const start = Math.floor(bound / 2);
    const end = Math.min(bound, n - 1);

    newSteps.push({
      array: [...arr],
      currentBound: bound,
      currentIndex: -1,
      searchStart: start,
      searchEnd: end,
      target: targetValue,
      foundIndex: -1,
      action: `Performing binary search between indices ${start} and ${end}`,
      code: "binarySearch(arr, bound/2, min(bound, n-1))"
    });

    let left = start;
    let right = end;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      newSteps.push({
        array: [...arr],
        currentBound: bound,
        currentIndex: mid,
        searchStart: left,
        searchEnd: right,
        target: targetValue,
        foundIndex: -1,
        action: `Checking middle element at index ${mid} (value: ${arr[mid]})`,
        code: "mid = left + (right - left)/2"
      });

      if (arr[mid] === targetValue) {
        foundIdx = mid;
        newSteps.push({
          array: [...arr],
          currentBound: bound,
          currentIndex: mid,
          searchStart: left,
          searchEnd: right,
          target: targetValue,
          foundIndex: mid,
          action: `Found target ${targetValue} at index ${mid}!`,
          code: "return mid"
        });
        break;
      } else if (arr[mid] < targetValue) {
        newSteps.push({
          array: [...arr],
          currentBound: bound,
          currentIndex: mid,
          searchStart: mid + 1,
          searchEnd: right,
          target: targetValue,
          foundIndex: -1,
          action: `Target is in right half (${mid + 1} to ${right})`,
          code: "left = mid + 1"
        });
        left = mid + 1;
      } else {
        newSteps.push({
          array: [...arr],
          currentBound: bound,
          currentIndex: mid,
          searchStart: left,
          searchEnd: mid - 1,
          target: targetValue,
          foundIndex: -1,
          action: `Target is in left half (${left} to ${mid - 1})`,
          code: "right = mid - 1"
        });
        right = mid - 1;
      }
    }

    if (foundIdx === -1) {
      newSteps.push({
        array: [...arr],
        currentBound: -1,
        currentIndex: -1,
        searchStart: -1,
        searchEnd: -1,
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
      currentBound: 1,
      currentIndex: -1,
      searchStart: -1,
      searchEnd: -1,
      target: target,
      foundIndex: -1,
      action: "Click Next to start searching",
      code: "exponentialSearch(arr, target)"
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
    if (index === stepData.currentIndex) return "#f59e0b"; // Yellow for current element
    if (index === stepData.foundIndex) return "#10B981"; // Green for found element
    if (stepData.searchStart !== undefined && stepData.searchEnd !== undefined && 
        index >= stepData.searchStart && index <= stepData.searchEnd) return "#3b82f6"; // Blue for current search range
    return "#e5e7eb"; // Gray for other elements
  };

  const algorithm = `function exponentialSearch(arr, target) {
  const n = arr.length;
  
  // If first element is the target
  if (arr[0] === target) return 0;

  // Find range for binary search by doubling bound
  let bound = 1;
  while (bound < n && arr[bound] < target) {
    bound *= 2;
  }

  // Perform binary search in the found range
  return binarySearch(arr, bound/2, Math.min(bound, n-1), target);
}

function binarySearch(arr, left, right, target) {
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
      if (stepData.code === "exponentialSearch(arr, target)" && line.includes("exponentialSearch(arr, target)")) {
        highlight = true;
      }
      if (stepData.code.includes("while (bound < n") && line.includes("while (bound < n")) {
        highlight = true;
      }
      if (stepData.code.includes("binarySearch(arr, bound/2") && line.includes("binarySearch(arr, bound/2")) {
        highlight = true;
      }
      if (stepData.code.includes("mid = left + (right") && line.includes("const mid = Math.floor")) {
        highlight = true;
      }
      if (stepData.code === "return mid" && line.includes("return mid")) {
        highlight = true;
      }
      if (stepData.code === "return -1" && line.includes("return -1")) {
        highlight = true;
      }
      if (stepData.code.includes("left = mid + 1") && line.includes("left = mid + 1")) {
        highlight = true;
      }
      if (stepData.code.includes("right = mid - 1") && line.includes("right = mid - 1")) {
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
    <div className="exponential-search-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Exponential Search Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="scrollable-content">
          {/* About Card with Complexity Sections */}
          <div className="card about-card">
            <h2 className="card-title">About Exponential Search</h2>
            <div className="card-content">
              <div className="about-content">
                <p>
                  Exponential Search is a searching algorithm for sorted arrays that 
                  first finds the range where the target might be by doubling the index,
                  then performs binary search in that range.
                </p>
              </div>
              
              <div className="complexity-section">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(1)</li>
                    <li>Average: O(log i) where i is the target's position</li>
                    <li>Worst: O(log n)</li>
                  </ul>
                </div>
                
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(1) for iterative implementation</li>
                    <li>O(log n) for recursive binary search</li>
                  </ul>
                </div>
              </div>
              
              <div className="characteristics-section yellow-card">
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Requires sorted array</li>
                  <li>• Faster than linear search</li>
                  <li>• Combines exponential range finding with binary search</li>
                  <li>• Particularly efficient for unbounded/infinite arrays</li>
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
                    <div className="status-label">Current Bound</div>
                    <div className="status-value">
                      {stepData.currentBound === -1 ? "N/A" : stepData.currentBound}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label">Current Index</div>
                    <div className="status-value">
                      {stepData.currentIndex === -1 ? "N/A" : stepData.currentIndex}
                    </div>
                  </div>
                  <div className="status-card yellow-card">
                    <div className="status-label">Search Range</div>
                    <div className="status-value">
                      {stepData.searchStart === -1 ? "N/A" : `${stepData.searchStart} - ${stepData.searchEnd}`}
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
                          transform: index === stepData.currentIndex ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.currentIndex && (
                          <div className="current-indicator">Current</div>
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
                <span className="legend-text">Current Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#10B981" }}></div>
                <span className="legend-text">Found Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#e5e7eb" }}></div>
                <span className="legend-text">Other Elements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExponentialSearch;