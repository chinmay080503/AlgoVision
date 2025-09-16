import React, { useState, useEffect } from "react";
import "./BucketSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const BucketSort = () => {
  const [array, setArray] = useState([34, 12, 56, 7, 89, 23, 45, 9, 61, 28]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [numBuckets, setNumBuckets] = useState(5);

  useEffect(() => {
    const generatedSteps = generateSteps(array);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [array, numBuckets]);

  const generateSteps = (arr) => {
    const steps = [];
    let tempArray = [...arr];
    const maxNum = Math.max(...tempArray);
    const minNum = Math.min(...tempArray);
    const range = maxNum - minNum;
    const bucketSize = range / numBuckets;

    // Initial state
    steps.push({
      array: [...tempArray],
      buckets: Array(numBuckets).fill().map(() => []),
      currentNum: null,
      currentBucket: null,
      action: "Starting Bucket Sort. We'll distribute elements into buckets based on their values.",
      code: "bucketSort(arr)"
    });

    // Create empty buckets
    const buckets = Array(numBuckets).fill().map(() => []);

    // Distribution phase
    steps.push({
      array: [...tempArray],
      buckets: JSON.parse(JSON.stringify(buckets)),
      currentNum: null,
      currentBucket: null,
      action: `Created ${numBuckets} empty buckets. Ready to distribute elements.`,
      code: `const buckets = new Array(${numBuckets}).fill().map(() => [])`
    });

    for (let i = 0; i < tempArray.length; i++) {
      const num = tempArray[i];
      let bucketIndex = Math.floor((num - minNum) / bucketSize);
      
      // Handle the maximum value case
      if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;

      steps.push({
        array: [...tempArray],
        buckets: JSON.parse(JSON.stringify(buckets)),
        currentNum: num,
        currentBucket: bucketIndex,
        action: `Placing ${num} in bucket ${bucketIndex + 1} (range: ${Math.floor(minNum + bucketIndex * bucketSize)}-${Math.floor(minNum + (bucketIndex + 1) * bucketSize)})`,
        code: "buckets[bucketIndex].push(num)"
      });

      buckets[bucketIndex].push(num);
    }

    // Sorting phase
    steps.push({
      array: [...tempArray],
      buckets: JSON.parse(JSON.stringify(buckets)),
      currentNum: null,
      currentBucket: null,
      action: "All elements distributed. Now sorting each bucket individually.",
      code: "for (let bucket of buckets) bucket.sort()"
    });

    // Sort each bucket and track progress
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length > 0) {
        steps.push({
          array: [...tempArray],
          buckets: JSON.parse(JSON.stringify(buckets)),
          currentNum: null,
          currentBucket: i,
          action: `Sorting bucket ${i + 1} (${buckets[i].length} elements)`,
          code: "bucket.sort((a, b) => a - b)"
        });

        buckets[i].sort((a, b) => a - b);

        steps.push({
          array: [...tempArray],
          buckets: JSON.parse(JSON.stringify(buckets)),
          currentNum: null,
          currentBucket: i,
          action: `Bucket ${i + 1} sorted`,
          code: "bucket.sort((a, b) => a - b)"
        });
      }
    }

    // Concatenation phase
    tempArray = [].concat(...buckets);
    
    steps.push({
      array: [...tempArray],
      buckets: JSON.parse(JSON.stringify(buckets)),
      currentNum: null,
      currentBucket: null,
      action: "Concatenating all sorted buckets back into the array",
      code: "arr = [].concat(...buckets)"
    });

    steps.push({
      array: [...tempArray],
      buckets: JSON.parse(JSON.stringify(buckets)),
      currentNum: null,
      currentBucket: null,
      action: "Bucket Sort complete! Array is now sorted.",
      code: "return arr"
    });

    return steps;
  };

  const getCurrentStepData = () => {
    return steps[currentStep] || {
      array: array,
      buckets: Array(numBuckets).fill().map(() => []),
      currentNum: null,
      currentBucket: null,
      action: "Click Next to start sorting",
      code: "bucketSort(arr)"
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
    if (stepData.currentBucket === bucketIdx) return "#ef4444"; // Red for current bucket
    return "#8b5cf6"; // Purple for other buckets
  };

  const generateNewArray = () => {
    const newArray = [];
    for (let i = 0; i < 10; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1);
    }
    setArray(newArray);
    reset();
  };

  const algorithm = `function bucketSort(arr, numBuckets = 5) {
  // Find min and max values
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min;
  const bucketSize = range / numBuckets;

  // Create empty buckets
  const buckets = Array(numBuckets).fill().map(() => []);

  // Distribute elements into buckets
  for (const num of arr) {
    let bucketIndex = Math.floor((num - min) / bucketSize);
    // Handle the max value case
    if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
    buckets[bucketIndex].push(num);
  }

  // Sort each bucket
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
  }

  // Concatenate all buckets
  return [].concat(...buckets);
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "bucketSort(arr)" && line.includes("bucketSort(arr)")) {
        highlight = true;
      }

      if (stepData.code.startsWith("const buckets = new Array") && line.includes("const buckets = Array(numBuckets)")) {
        highlight = true;
      }

      if (stepData.code === "buckets[bucketIndex].push(num)" && line.includes("buckets[bucketIndex].push(num)")) {
        highlight = true;
      }

      if (stepData.code === "bucket.sort((a, b) => a - b)" && line.includes("bucket.sort((a, b) => a - b)")) {
        highlight = true;
      }

      if (stepData.code === "arr = [].concat(...buckets)" && line.includes("return [].concat(...buckets)")) {
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

  const getBucketRange = (bucketIndex, min, max, numBuckets) => {
    const range = max - min;
    const bucketSize = range / numBuckets;
    const start = Math.floor(min + bucketIndex * bucketSize);
    const end = Math.floor(min + (bucketIndex + 1) * bucketSize);
    return `${start}-${end}`;
  };

  const minNum = Math.min(...array);
  const maxNum = Math.max(...array);

  return (
    <div className="bucket-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Bucket Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Bucket Sort</h2>
              <p className="card-content">
                <strong>Bucket Sort</strong> is a distribution sort algorithm that works by distributing elements of an array into several buckets. Each bucket is then sorted individually, either using a different sorting algorithm or by recursively applying bucket sort.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n + k)</li>
                    <li>Average: O(n + k)</li>
                    <li>Worst: O(n²)</li>
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
                  <li>• Works well when input is uniformly distributed</li>
                  <li>• Non-comparison based sort</li>
                  <li>• Stable when using stable sort for buckets</li>
                  <li>• Performance depends on number of buckets</li>
                  <li>• Useful for floating point numbers</li>
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
                  {/* Bucket Configuration */}
                  <div className="config-section">
                    <label htmlFor="numBuckets">Number of Buckets:</label>
                    <select 
                      id="numBuckets" 
                      value={numBuckets}
                      onChange={(e) => setNumBuckets(parseInt(e.target.value))}
                      disabled={currentStep > 0}
                    >
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="7">7</option>
                      <option value="10">10</option>
                    </select>
                  </div>

                  {/* Main Array */}
                  <div className="array-section">
                    <h3 className="array-title">
                      {currentStep === steps.length - 1 ? "Sorted Array" : "Original Array"}
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
                              Current
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buckets */}
                  <div className="buckets-section">
                    <h3 className="buckets-title">Buckets</h3>
                    <div className="buckets-container">
                      {stepData.buckets.map((bucket, bucketIndex) => (
                        <div
                          key={`bucket-${bucketIndex}`}
                          className="bucket"
                          style={{
                            backgroundColor: getBucketColor(bucketIndex),
                          }}
                        >
                          <div className="bucket-label">
                            Bucket {bucketIndex + 1}<br />
                            ({getBucketRange(bucketIndex, minNum, maxNum, numBuckets)})
                          </div>
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
                    <div className="status-label blue-text">Current Bucket</div>
                    <div className="status-value blue-title">
                      {stepData.currentBucket === null ? "N/A" : stepData.currentBucket + 1}
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
                    onClick={generateNewArray}
                    className="control-button gray-button"
                  >
                    <RotateCcw size={16} /> New Array
                  </button>
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

export default BucketSort;