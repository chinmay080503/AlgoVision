import React, { useState, useEffect } from "react";
import "./RadixSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const RadixSort = () => {
  const [array, setArray] = useState([34, 12, 56, 7, 89, 23, 45, 9, 61, 28]);
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
    let tempArray = [...arr];
    const maxNum = Math.max(...tempArray);
    const maxDigits = maxNum.toString().length;

    // Initial state
    steps.push({
      array: [...tempArray],
      digitPosition: -1,
      buckets: Array(10).fill().map(() => []),
      currentNum: null,
      action: "Starting Radix Sort. We'll sort digit by digit from right to left.",
      code: "radixSort(arr)"
    });

    for (let digitPos = 0; digitPos < maxDigits; digitPos++) {
      const buckets = Array(10).fill().map(() => []);

      steps.push({
        array: [...tempArray],
        digitPosition: digitPos,
        buckets: JSON.parse(JSON.stringify(buckets)),
        currentNum: null,
        action: `Starting pass ${digitPos + 1} (${digitPos === 0 ? "1st" : digitPos === 1 ? "2nd" : `${digitPos+1}th`} digit from right).`,
        code: `for (let digitPos = 0; digitPos < ${maxDigits}; digitPos++)`
      });

      // Distribution phase
      for (let i = 0; i < tempArray.length; i++) {
        const num = tempArray[i];
        const digit = getDigit(num, digitPos);

        steps.push({
          array: [...tempArray],
          digitPosition: digitPos,
          buckets: JSON.parse(JSON.stringify(buckets)),
          currentNum: num,
          action: `Placing ${num} in bucket ${digit} (${digitPos === 0 ? "1st" : digitPos === 1 ? "2nd" : `${digitPos+1}th`} digit is ${digit})`,
          code: "buckets[getDigit(num, digitPos)].push(num)"
        });

        buckets[digit].push(num);
      }

      // Concatenation phase
      tempArray = [].concat(...buckets);
      
      steps.push({
        array: [...tempArray],
        digitPosition: digitPos,
        buckets: JSON.parse(JSON.stringify(buckets)),
        currentNum: null,
        action: `Buckets concatenated after ${digitPos === 0 ? "1st" : digitPos === 1 ? "2nd" : `${digitPos+1}th`} digit pass`,
        code: "arr = [].concat(...buckets)"
      });
    }

    steps.push({
      array: [...tempArray],
      digitPosition: -1,
      buckets: Array(10).fill().map(() => []),
      currentNum: null,
      action: "Radix Sort complete! Array is now sorted.",
      code: "return arr"
    });

    return steps;
  };

  const getDigit = (num, pos) => {
    return Math.floor(num / Math.pow(10, pos)) % 10;
  };

  const getCurrentStepData = () => {
    return steps[currentStep] || {
      array: array,
      digitPosition: -1,
      buckets: Array(10).fill().map(() => []),
      currentNum: null,
      action: "Click Next to start sorting",
      code: "radixSort(arr)"
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
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const getBarColor = (value) => {
    if (stepData.currentNum === value) return "#f59e0b"; // Orange for current element
    return "#3b82f6"; // Blue for other elements
  };

  const getBucketColor = (bucketIdx) => {
    if (stepData.currentNum !== null) {
      const currentDigit = getDigit(stepData.currentNum, stepData.digitPosition);
      if (bucketIdx === currentDigit) return "#ef4444"; // Red for current bucket
    }
    return "#8b5cf6"; // Purple for other buckets
  };

  const algorithm = `function radixSort(arr) {
  const max = Math.max(...arr);
  const maxDigits = max.toString().length;
  
  for (let digitPos = 0; digitPos < maxDigits; digitPos++) {
    const buckets = Array.from({ length: 10 }, () => []);
    
    for (let i = 0; i < arr.length; i++) {
      const digit = getDigit(arr[i], digitPos);
      buckets[digit].push(arr[i]);
    }
    
    arr = [].concat(...buckets);
  }
  
  return arr;
}

function getDigit(num, pos) {
  return Math.floor(num / Math.pow(10, pos)) % 10;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "radixSort(arr)" && line.includes("radixSort(arr)")) {
        highlight = true;
      }

      if (stepData.code.startsWith("for (let digitPos = 0; digitPos < ") && line.includes("for (let digitPos = 0; digitPos < maxDigits; digitPos++)")) {
        highlight = true;
      }

      if (stepData.code === "buckets[getDigit(num, digitPos)].push(num)" && line.includes("buckets[digit].push(arr[i])")) {
        highlight = true;
      }

      if (stepData.code === "arr = [].concat(...buckets)" && line.includes("arr = [].concat(...buckets)")) {
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
    <div className="radix-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Radix Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Radix Sort</h2>
              <p className="card-content">
                <strong>Radix Sort</strong> is a non-comparative integer sorting algorithm that sorts data with integer keys by grouping keys by the individual digits which share the same significant position and value. It processes each digit from least significant to most significant.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(nk)</li>
                    <li>Average: O(nk)</li>
                    <li>Worst: O(nk)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(n + k)</li>
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
                  <li>• Stable sorting algorithm</li>
                  <li>• Works on integer keys</li>
                  <li>• Processes digits from least to most significant</li>
                  <li>• Uses buckets to group numbers</li>
                  <li>• Efficient for numbers with small digit counts</li>
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
                  {/* Main Array */}
                  <div className="array-section">
                    <h3 className="array-title">
                      {stepData.digitPosition === -1 ? "Original Array" : 
                       `Pass ${stepData.digitPosition + 1} (${stepData.digitPosition + 1}${["st", "nd", "rd"][stepData.digitPosition] || "th"} digit)`}
                    </h3>
                    <div className="array-container">
                      {stepData.array.map((value, index) => (
                        <div
                          key={`array-${index}`}
                          className="bar"
                          style={{
                            height: `${value}px`,
                            backgroundColor: getBarColor(value),
                            transform: stepData.currentNum === value ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          <span className="bar-value">{value}</span>
                          {stepData.currentNum === value && (
                            <div className="current-indicator">
                              Digit: {getDigit(value, stepData.digitPosition)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buckets */}
                  <div className="buckets-section">
                    <h3 className="buckets-title">Buckets (0-9)</h3>
                    <div className="buckets-container">
                      {stepData.buckets.map((bucket, bucketIndex) => (
                        <div
                          key={`bucket-${bucketIndex}`}
                          className="bucket"
                          style={{
                            backgroundColor: getBucketColor(bucketIndex),
                          }}
                        >
                          <div className="bucket-label">{bucketIndex}</div>
                          <div className="bucket-items">
                            {bucket.map((num, numIndex) => (
                              <div key={`bucket-${bucketIndex}-${numIndex}`} className="bucket-item">
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Digit</div>
                    <div className="status-value blue-title">
                      {stepData.digitPosition === -1 ? "N/A" : stepData.digitPosition + 1}
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
                  <span className="legend-text">Array Elements</span>
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
                  <span className="legend-text">Buckets</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Current Bucket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadixSort;