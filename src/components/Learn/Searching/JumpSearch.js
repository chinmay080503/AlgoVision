import React, { useState, useEffect } from "react";
import { ChevronLeft, Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import "./JumpSearch.css";

const JumpSearch = () => {
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
    const blockSize = Math.floor(Math.sqrt(n));
    let currentBlock = 0;
    let foundIdx = -1;

    newSteps.push({
      array: [...arr],
      currentBlock,
      currentIndex: -1,
      target: targetValue,
      foundIndex: -1,
      action: "Starting Jump Search. Array must be sorted.",
      code: "jumpSearch(arr, target)"
    });

    // Jump through blocks
    while (currentBlock * blockSize < n && arr[Math.min((currentBlock + 1) * blockSize, n) - 1] < targetValue) {
      newSteps.push({
        array: [...arr],
        currentBlock,
        currentIndex: -1,
        target: targetValue,
        foundIndex: -1,
        action: `Jumping to block ${currentBlock + 1} (indices ${currentBlock * blockSize} to ${Math.min((currentBlock + 1) * blockSize, n) - 1})`,
        code: "while (arr[min(blockEnd, n-1)] < target)"
      });
      currentBlock++;
    }

    // Linear search in current block
    const start = currentBlock * blockSize;
    const end = Math.min((currentBlock + 1) * blockSize, n);

    for (let i = start; i < end; i++) {
      newSteps.push({
        array: [...arr],
        currentBlock,
        currentIndex: i,
        target: targetValue,
        foundIndex: -1,
        action: `Checking element at index ${i} (value: ${arr[i]})`,
        code: "for (i = blockStart; i < blockEnd; i++)"
      });

      if (arr[i] === targetValue) {
        foundIdx = i;
        newSteps.push({
          array: [...arr],
          currentBlock,
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
        currentBlock: -1,
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
      currentBlock: 0,
      currentIndex: -1,
      target: target,
      foundIndex: -1,
      action: "Click Next to start searching",
      code: "jumpSearch(arr, target)"
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
    const blockSize = Math.floor(Math.sqrt(array.length));
    const currentBlockStart = stepData.currentBlock * blockSize;
    const currentBlockEnd = Math.min((stepData.currentBlock + 1) * blockSize, array.length);

    if (index === stepData.currentIndex) return "#f59e0b"; // Yellow for current element
    if (index === stepData.foundIndex) return "#10B981"; // Green for found element
    if (index >= currentBlockStart && index < currentBlockEnd) return "#3b82f6"; // Blue for current block
    return "#e5e7eb"; // Gray for other elements
  };

  const algorithm = `function jumpSearch(arr, target) {
  const n = arr.length;
  const blockSize = Math.floor(Math.sqrt(n));
  let currentBlock = 0;

  // Jump through blocks
  while (currentBlock * blockSize < n && 
         arr[Math.min((currentBlock + 1) * blockSize, n) - 1] < target) {
    currentBlock++;
  }

  // Linear search in current block
  const start = currentBlock * blockSize;
  const end = Math.min((currentBlock + 1) * blockSize, n);

  for (let i = start; i < end; i++) {
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
      if (stepData.code === "jumpSearch(arr, target)" && line.includes("jumpSearch(arr, target)")) {
        highlight = true;
      }
      if (stepData.code.includes("while (arr[min") && line.includes("arr[Math.min")) {
        highlight = true;
      }
      if (stepData.code.includes("for (i = blockStart") && line.includes("for (let i = start")) {
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
    <div className="jump-search-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Jump Search Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="scrollable-content">
          {/* About Card with Complexity Sections */}
          <div className="card about-card">
            <h2 className="card-title">About Jump Search</h2>
            <div className="card-content">
              <div className="about-content">
                <p>
                  Jump Search is a searching algorithm for sorted arrays that jumps
                  ahead by fixed steps and then performs linear search in the block
                  where the target might be.
                </p>
              </div>
              
              <div className="complexity-section">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(1)</li>
                    <li>Average: O(√n)</li>
                    <li>Worst: O(√n)</li>
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
                  <li>• Faster than linear search</li>
                  <li>• Slower than binary search</li>
                  <li>• Optimal block size is √n</li>
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
                    <div className="status-label">Current Block</div>
                    <div className="status-value">
                      {stepData.currentBlock === -1 ? "N/A" : stepData.currentBlock}
                    </div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label">Current Index</div>
                    <div className="status-value">
                      {stepData.currentIndex === -1 ? "N/A" : stepData.currentIndex}
                    </div>
                  </div>
                  <div className="status-card yellow-card">
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
                    {stepData.array.map((value, index) => {
                      const blockSize = Math.floor(Math.sqrt(array.length));
                      const blockNumber = Math.floor(index / blockSize);
                      return (
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
                          <div className="block-number">Block {blockNumber}</div>
                        </div>
                      );
                    })}
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
                <span className="legend-text">Current Block</span>
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

export default JumpSearch;