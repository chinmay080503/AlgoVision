import React, { useState, useEffect } from "react";
import "./MergeSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const MergeSort = () => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [tempArrays, setTempArrays] = useState([]);

  useEffect(() => {
    const generatedSteps = generateSteps(array);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [array]);

  const generateSteps = (arr) => {
    const steps = [];
    const tempArray = [...arr];
    const n = tempArray.length;
    let callStack = [];

    // Initial state
    steps.push({
      array: [...tempArray],
      left: -1,
      right: -1,
      mid: -1,
      merging: false,
      tempArrays: [],
      action: "Starting merge sort. The array will be recursively divided and then merged.",
      code: "mergeSort(arr)",
    });

    function mergeSortRecursive(array, left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        // Push divide step
        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: false,
          tempArrays: [...callStack],
          action: `Dividing array from index ${left} to ${right}. Midpoint is ${mid}.`,
          code: "mid = (left + right) / 2",
        });

        callStack.push({ left, mid, right });
        mergeSortRecursive(array, left, mid);

        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: false,
          tempArrays: [...callStack],
          action: `Finished sorting left half (${left} to ${mid}). Now sorting right half (${mid + 1} to ${right}).`,
          code: "mergeSort(arr, left, mid)",
        });

        mergeSortRecursive(array, mid + 1, right);
        callStack.pop();

        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: false,
          tempArrays: [...callStack],
          action: `Finished sorting both halves. Now merging from ${left} to ${right}.`,
          code: "mergeSort(arr, mid+1, right)",
        });

        merge(array, left, mid, right);
      } else if (left === right) {
        steps.push({
          array: [...array],
          left,
          right,
          mid: -1,
          merging: false,
          tempArrays: [...callStack],
          action: `Base case reached (single element at index ${left}).`,
          code: "// Base case: single element",
        });
      }
    }

    function merge(array, left, mid, right) {
      const n1 = mid - left + 1;
      const n2 = right - mid;
      
      // Create temp arrays
      const L = new Array(n1);
      const R = new Array(n2);

      // Copy data to temp arrays
      for (let i = 0; i < n1; i++) {
        L[i] = array[left + i];
      }
      for (let j = 0; j < n2; j++) {
        R[j] = array[mid + 1 + j];
      }

      steps.push({
        array: [...array],
        left,
        right,
        mid,
        merging: true,
        tempLeftArray: [...L],
        tempRightArray: [...R],
        tempArrays: [...callStack],
        action: `Created temporary arrays for merging. Left array: [${L.join(", ")}], Right array: [${R.join(", ")}]`,
        code: "// Create temp arrays L[] and R[]",
      });

      // Merge the temp arrays back into array[left..right]
      let i = 0; // Initial index of first subarray
      let j = 0; // Initial index of second subarray
      let k = left; // Initial index of merged subarray

      while (i < n1 && j < n2) {
        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: true,
          tempLeftArray: [...L],
          tempRightArray: [...R],
          tempArrays: [...callStack],
          comparingLeft: i,
          comparingRight: j,
          currentIndex: k,
          action: `Comparing ${L[i]} from left array with ${R[j]} from right array.`,
          code: "while (i < n1 && j < n2)",
        });

        if (L[i] <= R[j]) {
          array[k] = L[i];
          steps.push({
            array: [...array],
            left,
            right,
            mid,
            merging: true,
            tempLeftArray: [...L],
            tempRightArray: [...R],
            tempArrays: [...callStack],
            comparingLeft: i,
            comparingRight: j,
            currentIndex: k,
            action: `${L[i]} is smaller or equal. Copying to main array at position ${k}.`,
            code: "arr[k] = L[i]",
          });
          i++;
        } else {
          array[k] = R[j];
          steps.push({
            array: [...array],
            left,
            right,
            mid,
            merging: true,
            tempLeftArray: [...L],
            tempRightArray: [...R],
            tempArrays: [...callStack],
            comparingLeft: i,
            comparingRight: j,
            currentIndex: k,
            action: `${R[j]} is smaller. Copying to main array at position ${k}.`,
            code: "arr[k] = R[j]",
          });
          j++;
        }
        k++;
      }

      // Copy the remaining elements of L[], if any
      while (i < n1) {
        array[k] = L[i];
        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: true,
          tempLeftArray: [...L],
          tempRightArray: [...R],
          tempArrays: [...callStack],
          comparingLeft: i,
          currentIndex: k,
          action: `Copying remaining element ${L[i]} from left array to position ${k}.`,
          code: "arr[k] = L[i]",
        });
        i++;
        k++;
      }

      // Copy the remaining elements of R[], if any
      while (j < n2) {
        array[k] = R[j];
        steps.push({
          array: [...array],
          left,
          right,
          mid,
          merging: true,
          tempLeftArray: [...L],
          tempRightArray: [...R],
          tempArrays: [...callStack],
          comparingRight: j,
          currentIndex: k,
          action: `Copying remaining element ${R[j]} from right array to position ${k}.`,
          code: "arr[k] = R[j]",
        });
        j++;
        k++;
      }

      steps.push({
        array: [...array],
        left,
        right,
        mid,
        merging: false,
        tempArrays: [...callStack],
        action: `Finished merging from ${left} to ${right}. This portion is now sorted.`,
        code: "// Finished merging",
      });
    }

    mergeSortRecursive(tempArray, 0, tempArray.length - 1);

    steps.push({
      array: [...tempArray],
      left: -1,
      right: -1,
      mid: -1,
      merging: false,
      tempArrays: [],
      action: "Merge sort complete! The entire array is now sorted.",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        left: -1,
        right: -1,
        mid: -1,
        merging: false,
        tempArrays: [],
        action: "Click Next to start sorting",
        code: "mergeSort(arr)",
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
    if (stepData.merging) {
      if (index >= stepData.left && index <= stepData.right) {
        return "#8b5cf6"; // Purple for current merge range
      }
      return "#3b82f6"; // Blue for other elements
    } else if (stepData.left !== -1 && stepData.right !== -1) {
      if (index >= stepData.left && index <= stepData.right) {
        return "#10b981"; // Green for current divide range
      }
      return "#3b82f6"; // Blue for other elements
    } else {
      return "#3b82f6"; // Blue by default
    }
  };

  const algorithm = `function mergeSort(arr, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    // Sort first and second halves
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    
    // Merge the sorted halves
    merge(arr, left, mid, right);
  }
}

function merge(arr, left, mid, right) {
  // Create temp arrays
  const n1 = mid - left + 1;
  const n2 = right - mid;
  const L = new Array(n1);
  const R = new Array(n2);
  
  // Copy data to temp arrays
  for (let i = 0; i < n1; i++)
    L[i] = arr[left + i];
  for (let j = 0; j < n2; j++)
    R[j] = arr[mid + 1 + j];
  
  // Merge the temp arrays
  let i = 0, j = 0, k = left;
  
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }
  
  // Copy remaining elements
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }
  
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "mergeSort(arr)" && line.includes("mergeSort(arr)")) {
        highlight = true;
      }

      if (stepData.code === "mid = (left + right) / 2" && line.includes("const mid = Math.floor((left + right) / 2);")) {
        highlight = true;
      }

      if (stepData.code === "mergeSort(arr, left, mid)" && line.includes("mergeSort(arr, left, mid);")) {
        highlight = true;
      }

      if (stepData.code === "mergeSort(arr, mid+1, right)" && line.includes("mergeSort(arr, mid + 1, right);")) {
        highlight = true;
      }

      if (stepData.code === "// Create temp arrays L[] and R[]" && line.includes("const L = new Array(n1);")) {
        highlight = true;
      }

      if (stepData.code === "while (i < n1 && j < n2)" && line.includes("while (i < n1 && j < n2) {")) {
        highlight = true;
      }

      if (stepData.code === "arr[k] = L[i]" && line.includes("arr[k] = L[i];")) {
        highlight = true;
      }

      if (stepData.code === "arr[k] = R[j]" && line.includes("arr[k] = R[j];")) {
        highlight = true;
      }

      if (stepData.code === "// Finished merging" && line.includes("// Copy remaining elements")) {
        highlight = true;
      }

      if (stepData.code === "return arr" && line.includes("}")) {
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
    <div className="merge-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Merge Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Merge Sort</h2>
              <p className="card-content">
                <strong>Merge Sort</strong> is a divide-and-conquer algorithm that works by recursively dividing the array into two halves, sorting them, and then merging the sorted halves. It's an efficient, stable sorting algorithm with consistent performance.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n log n)</li>
                    <li>Average: O(n log n)</li>
                    <li>Worst: O(n log n)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(n) - Requires auxiliary space</li>
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
                  <li>• Not in-place (requires O(n) extra space)</li>
                  <li>• Well-suited for linked lists and large datasets</li>
                  <li>• Excellent for external sorting</li>
                  <li>• Consistent O(n log n) performance</li>
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
                            (stepData.merging && index === stepData.currentIndex) ||
                            (stepData.comparingLeft !== undefined && index === stepData.left + stepData.comparingLeft) ||
                            (stepData.comparingRight !== undefined && index === stepData.mid + 1 + stepData.comparingRight)
                              ? "scale(1.1)"
                              : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {stepData.merging && index === stepData.currentIndex && (
                          <div className="current-indicator"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {stepData.merging && (
                    <div className="temp-arrays-container">
                      <div className="temp-array">
                        <div className="temp-array-label">Left Array:</div>
                        <div className="temp-array-values">
                          {stepData.tempLeftArray.map((val, idx) => (
                            <div 
                              key={idx}
                              className="temp-value"
                              style={{
                                backgroundColor: idx === stepData.comparingLeft ? "#ef4444" : "#8b5cf6"
                              }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="temp-array">
                        <div className="temp-array-label">Right Array:</div>
                        <div className="temp-array-values">
                          {stepData.tempRightArray.map((val, idx) => (
                            <div 
                              key={idx}
                              className="temp-value"
                              style={{
                                backgroundColor: idx === stepData.comparingRight ? "#ef4444" : "#8b5cf6"
                              }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Range</div>
                    <div className="status-value blue-title">
                      {stepData.left !== -1 ? `[${stepData.left}, ${stepData.right}]` : "N/A"}
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
                  <span className="legend-text">Unsorted/Other</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Current Merge Range</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Current Divide Range</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Comparing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeSort;