import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import "./TernarySearch.css";

const TernarySearch = () => {
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
      mid1: -1,
      mid2: -1,
      target: targetValue,
      foundIndex: -1,
      action: "Starting Ternary Search. Array must be sorted.",
      code: "ternarySearch(arr, target)"
    });

    while (left <= right) {
      const mid1 = left + Math.floor((right - left) / 3);
      const mid2 = right - Math.floor((right - left) / 3);

      newSteps.push({
        array: [...arr],
        left,
        right,
        mid1,
        mid2,
        target: targetValue,
        foundIndex: -1,
        action: `Calculated mid points: mid1=${mid1} (${arr[mid1]}), mid2=${mid2} (${arr[mid2]})`,
        code: "mid1 = left + (right-left)/3, mid2 = right - (right-left)/3"
      });

      if (arr[mid1] === targetValue) {
        foundIdx = mid1;
        newSteps.push({
          array: [...arr],
          left,
          right,
          mid1,
          mid2,
          target: targetValue,
          foundIndex: mid1,
          action: `Found target ${targetValue} at index ${mid1}!`,
          code: "return mid1"
        });
        break;
      }

      if (arr[mid2] === targetValue) {
        foundIdx = mid2;
        newSteps.push({
          array: [...arr],
          left,
          right,
          mid1,
          mid2,
          target: targetValue,
          foundIndex: mid2,
          action: `Found target ${targetValue} at index ${mid2}!`,
          code: "return mid2"
        });
        break;
      }

      if (targetValue < arr[mid1]) {
        newSteps.push({
          array: [...arr],
          left,
          right: mid1 - 1,
          mid1,
          mid2,
          target: targetValue,
          foundIndex: -1,
          action: `Target is in first third (left=${left} to right=${mid1 - 1})`,
          code: "right = mid1 - 1"
        });
        right = mid1 - 1;
      } else if (targetValue > arr[mid2]) {
        newSteps.push({
          array: [...arr],
          left: mid2 + 1,
          right,
          mid1,
          mid2,
          target: targetValue,
          foundIndex: -1,
          action: `Target is in third third (left=${mid2 + 1} to right=${right})`,
          code: "left = mid2 + 1"
        });
        left = mid2 + 1;
      } else {
        newSteps.push({
          array: [...arr],
          left: mid1 + 1,
          right: mid2 - 1,
          mid1,
          mid2,
          target: targetValue,
          foundIndex: -1,
          action: `Target is in middle third (left=${mid1 + 1} to right=${mid2 - 1})`,
          code: "left = mid1 + 1, right = mid2 - 1"
        });
        left = mid1 + 1;
        right = mid2 - 1;
      }
    }

    if (foundIdx === -1) {
      newSteps.push({
        array: [...arr],
        left: -1,
        right: -1,
        mid1: -1,
        mid2: -1,
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
      mid1: -1,
      mid2: -1,
      target: target,
      foundIndex: -1,
      action: "Click Next to start searching",
      code: "ternarySearch(arr, target)"
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

  const getBarColor = (index) => {
    if (index === stepData.foundIndex) return "#10B981"; // Green for found element
    if (index === stepData.mid1 || index === stepData.mid2) return "#f59e0b"; // Yellow for mid points
    if (index >= stepData.left && index <= stepData.right) return "#3b82f6"; // Blue for current range
    return "#e5e7eb"; // Gray for other elements
  };

  const algorithm = `function ternarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid1 = left + Math.floor((right - left) / 3);
    const mid2 = right - Math.floor((right - left) / 3);

    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;

    if (target < arr[mid1]) {
      right = mid1 - 1;
    } else if (target > arr[mid2]) {
      left = mid2 + 1;
    } else {
      left = mid1 + 1;
      right = mid2 - 1;
    }
  }
  return -1;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (stepData.code === "ternarySearch(arr, target)" && line.includes("ternarySearch(arr, target)")) {
        highlight = true;
      }
      if (stepData.code.includes("mid1 = left + (right-left)/3") && line.includes("const mid1 = left + Math.floor")) {
        highlight = true;
      }
      if (stepData.code.includes("return mid1") && line.includes("return mid1")) {
        highlight = true;
      }
      if (stepData.code.includes("return mid2") && line.includes("return mid2")) {
        highlight = true;
      }
      if (stepData.code.includes("right = mid1 - 1") && line.includes("right = mid1 - 1")) {
        highlight = true;
      }
      if (stepData.code.includes("left = mid2 + 1") && line.includes("left = mid2 + 1")) {
        highlight = true;
      }
      if (stepData.code.includes("left = mid1 + 1, right = mid2 - 1") && 
          (line.includes("left = mid1 + 1") || line.includes("right = mid2 - 1"))) {
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
    <div className="ternary-search-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Ternary Search Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="scrollable-content">
          {/* About Card with Complexity Sections */}
          <div className="card about-card">
            <h2 className="card-title">About Ternary Search</h2>
            <div className="card-content">
              <div className="about-content">
                <p>
                  Ternary Search is a divide and conquer algorithm that divides the array into three parts
                  instead of two (like binary search) to determine where the target value might be located.
                </p>
              </div>
              
              <div className="complexity-section">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(1)</li>
                    <li>Average: O(log₃n)</li>
                    <li>Worst: O(log₃n)</li>
                  </ul>
                </div>
                
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(1) for iterative implementation</li>
                  </ul>
                </div>
              </div>
              
              <div className="characteristics-section yellow-card">
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Requires sorted array</li>
                  <li>• More comparisons per iteration than binary search</li>
                  <li>• Fewer iterations than binary search</li>
                  <li>• Optimal for expensive comparisons</li>
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
                    <div className="status-label">Search Range</div>
                    <div className="status-value">
                      {stepData.left === -1 ? "N/A" : `${stepData.left} - ${stepData.right}`}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label">Mid Point 1</div>
                    <div className="status-value">
                      {stepData.mid1 === -1 ? "N/A" : stepData.mid1}
                    </div>
                  </div>
                  <div className="status-card yellow-card">
                    <div className="status-label">Mid Point 2</div>
                    <div className="status-value">
                      {stepData.mid2 === -1 ? "N/A" : stepData.mid2}
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
                          backgroundColor: getBarColor(index),
                          transform: index === stepData.mid1 || index === stepData.mid2 ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {(index === stepData.mid1 || index === stepData.mid2) && (
                          <div className="current-indicator">
                            {index === stepData.mid1 ? "Mid1" : "Mid2"}
                          </div>
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
                <span className="legend-text">Mid Points</span>
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

export default TernarySearch;