import React, { useState, useEffect } from "react";
import { ChevronLeft, Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import "./LinearSearch.css";

const LinearSearch = () => {
  const [array, setArray] = useState([34, 55, 48, 23, 75, 30, 45, 52, 61, 28]);
  const [target, setTarget] = useState(23);
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
    let foundIdx = -1;

    newSteps.push({
      array: [...arr],
      currentIndex: -1,
      target: targetValue,
      foundIndex: -1,
      action: "Starting Linear Search. We'll check each element one by one.",
      code: "linearSearch(arr, target)"
    });

    for (let i = 0; i < arr.length; i++) {
      newSteps.push({
        array: [...arr],
        currentIndex: i,
        target: targetValue,
        foundIndex: -1,
        action: `Checking element at index ${i} (value: ${arr[i]})`,
        code: "if (arr[i] === target)"
      });

      if (arr[i] === targetValue) {
        foundIdx = i;
        newSteps.push({
          array: [...arr],
          currentIndex: i,
          target: targetValue,
          foundIndex: i,
          action: `Found target ${targetValue} at index ${i}!`,
          code: "return i"
        });
        break;
      }
    }

    if (foundIdx === -1) {
      newSteps.push({
        array: [...arr],
        currentIndex: -1,
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
      currentIndex: -1,
      target: target,
      foundIndex: -1,
      action: "Click Next to start searching",
      code: "linearSearch(arr, target)"
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
    for (let i = 0; i < 10; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1);
    }
    setArray(newArray);
    reset();
  };

  const handleTargetChange = (e) => {
    setTarget(Number(e.target.value));
    reset();
  };

  const getBarColor = (value, index) => {
    if (index === stepData.currentIndex) return "#f59e0b";
    if (index === stepData.foundIndex) return "#10B981";
    return "#3b82f6";
  };

  const algorithm = `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (stepData.code === "linearSearch(arr, target)" && line.includes("linearSearch(arr, target)")) {
        highlight = true;
      }
      if (stepData.code === "if (arr[i] === target)" && line.includes("if (arr[i] === target)")) {
        highlight = true;
      }
      if (stepData.code === "return i" && line.includes("return i")) {
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
    <div className="linear-search-container">
      <div className="max-width">
        <div className="header">
        
          <h1 className="title">Linear Search Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="scrollable-content">
          {/* About Card with Complexity Sections */}
          <div className="card about-card">
            <h2 className="card-title">About Linear Search</h2>
            <div className="card-content">
              <div className="about-content">
                <p>
                  Linear Search is a simple searching algorithm that checks each element in the list
                  sequentially until the target element is found or the list ends.
                </p>
              </div>
              
              <div className="complexity-section">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(1)</li>
                    <li>Average: O(n)</li>
                    <li>Worst: O(n)</li>
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
                  <li>• Works on any list (sorted or unsorted)</li>
                  <li>• Simple implementation</li>
                  <li>• No additional space required</li>
                  <li>• Inefficient for large datasets</li>
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
                    min="1"
                    max="100"
                  />
                </div>

                <div className="action-container">
                  <div className="action-label">Current Action:</div>
                  <div className="action-text">{stepData.action}</div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label">Current Index</div>
                    <div className="status-value">
                      {stepData.currentIndex === -1 ? "N/A" : stepData.currentIndex}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label">Status</div>
                    <div className="status-value">
                      {stepData.foundIndex >= 0 ? 'Found' : 
                       stepData.currentIndex >= 0 ? 'Searching' : 'Ready'}
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
                          <div className="current-indicator">Checking</div>
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
                <span className="legend-text">Default Elements</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
                <span className="legend-text">Current Element</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: "#10B981" }}></div>
                <span className="legend-text">Found Element</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearSearch;