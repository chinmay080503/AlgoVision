import React, { useState, useEffect } from "react";
import "./QuickSort.css";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const QuickSort = () => {
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
    let callStack = [];

    // Initial state
    steps.push({
      array: [...tempArray],
      low: -1,
      high: -1,
      pivot: -1,
      i: -1,
      j: -1,
      action: "Starting QuickSort algorithm. The array will be partitioned recursively.",
      code: "quickSort(arr, 0, n-1)",
    });

    function quickSortRecursive(array, low, high) {
      if (low < high) {
        // Push partition start step
        steps.push({
          array: [...array],
          low,
          high,
          pivot: -1,
          i: -1,
          j: -1,
          action: `Starting partition from index ${low} to ${high}.`,
          code: "if (low < high)",
        });

        const pivotIndex = partition(array, low, high);

        // Push partition complete step
        steps.push({
          array: [...array],
          low,
          high,
          pivot: pivotIndex,
          i: -1,
          j: -1,
          action: `Partition complete. Pivot ${array[pivotIndex]} is now at correct position ${pivotIndex}.`,
          code: "pivot = partition(arr, low, high)",
        });

        // Push before left recursion step
        steps.push({
          array: [...array],
          low,
          high,
          pivot: pivotIndex,
          i: -1,
          j: -1,
          action: `Recursively sorting left subarray (${low} to ${pivotIndex - 1}).`,
          code: "quickSort(arr, low, pivot - 1)",
        });

        quickSortRecursive(array, low, pivotIndex - 1);

        // Push before right recursion step
        steps.push({
          array: [...array],
          low,
          high,
          pivot: pivotIndex,
          i: -1,
          j: -1,
          action: `Recursively sorting right subarray (${pivotIndex + 1} to ${high}).`,
          code: "quickSort(arr, pivot + 1, high)",
        });

        quickSortRecursive(array, pivotIndex + 1, high);
      } else if (low === high) {
        steps.push({
          array: [...array],
          low,
          high,
          pivot: -1,
          i: -1,
          j: -1,
          action: `Base case reached (single element at index ${low}).`,
          code: "// Base case: single element",
        });
      }
    }

    function partition(array, low, high) {
      // Choose the rightmost element as pivot
      const pivot = array[high];
      let i = low - 1; // Index of smaller element

      steps.push({
        array: [...array],
        low,
        high,
        pivot: high,
        i: i,
        j: -1,
        action: `Choosing pivot ${pivot} at index ${high}. Initializing i = ${i}.`,
        code: "pivot = arr[high]; i = low - 1",
      });

      for (let j = low; j < high; j++) {
        // Push comparison step
        steps.push({
          array: [...array],
          low,
          high,
          pivot: high,
          i,
          j,
          action: `Comparing element ${array[j]} at index ${j} with pivot ${pivot}.`,
          code: "if (arr[j] < pivot)",
        });

        // If current element is smaller than the pivot
        if (array[j] < pivot) {
          i++; // increment index of smaller element
          
          // Push before swap step
          steps.push({
            array: [...array],
            low,
            high,
            pivot: high,
            i,
            j,
            action: `Element ${array[j]} is smaller than pivot. Incrementing i to ${i}. Preparing to swap with element at ${i}.`,
            code: "i++; swap(arr[i], arr[j])",
          });

          // Swap elements
          [array[i], array[j]] = [array[j], array[i]];
          
          // Push after swap step
          steps.push({
            array: [...array],
            low,
            high,
            pivot: high,
            i,
            j,
            action: `Swapped elements at indices ${i} and ${j}. Array: [${array.join(", ")}]`,
            code: "// Swap completed",
          });
        } else {
          steps.push({
            array: [...array],
            low,
            high,
            pivot: high,
            i,
            j,
            action: `Element ${array[j]} is greater than or equal to pivot. No swap needed.`,
            code: "// No swap needed",
          });
        }
      }

      // Push final swap preparation step
      steps.push({
        array: [...array],
        low,
        high,
        pivot: high,
        i: i + 1,
        j: high,
        action: `Placing pivot in correct position by swapping elements at ${i + 1} and ${high}.`,
        code: "swap(arr[i+1], arr[high])",
      });

      // Swap the pivot element with the element at i+1
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      
      // Push final swap complete step
      steps.push({
        array: [...array],
        low,
        high,
        pivot: i + 1,
        i: -1,
        j: -1,
        action: `Pivot ${pivot} placed at correct position ${i + 1}. Partition complete.`,
        code: "return i + 1",
      });

      return i + 1; // Return the partition index
    }

    quickSortRecursive(tempArray, 0, tempArray.length - 1);

    steps.push({
      array: [...tempArray],
      low: -1,
      high: -1,
      pivot: -1,
      i: -1,
      j: -1,
      action: "QuickSort complete! The entire array is now sorted.",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        low: -1,
        high: -1,
        pivot: -1,
        i: -1,
        j: -1,
        action: "Click Next to start sorting",
        code: "quickSort(arr)",
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
    if (index === stepData.pivot) {
      return "#f59e0b"; // Orange for pivot
    } else if (index === stepData.i) {
      return "#10b981"; // Green for i pointer
    } else if (index === stepData.j) {
      return "#3b82f6"; // Blue for j pointer
    } else if (stepData.low !== -1 && stepData.high !== -1) {
      if (index >= stepData.low && index <= stepData.high) {
        return "#8b5cf6"; // Purple for current partition range
      }
      return "#3b82f6"; // Blue for other elements
    } else {
      return "#3b82f6"; // Blue by default
    }
  };

  const algorithm = `function quickSort(arr, low, high) {
  if (low < high) {
    // pi is partitioning index
    const pi = partition(arr, low, high);
    
    // Recursively sort elements before
    // and after partition
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  // Choose rightmost element as pivot
  const pivot = arr[high];
  let i = low - 1; // Index of smaller element
  
  for (let j = low; j < high; j++) {
    // If current element is smaller than pivot
    if (arr[j] < pivot) {
      i++; // increment index of smaller element
      swap(arr[i], arr[j]);
    }
  }
  
  // Swap pivot with element at i+1
  swap(arr[i + 1], arr[high]);
  return i + 1;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "quickSort(arr)" && line.includes("quickSort(arr, low, high)")) {
        highlight = true;
      }

      if (stepData.code === "if (low < high)" && line.includes("if (low < high)")) {
        highlight = true;
      }

      if (stepData.code === "pivot = partition(arr, low, high)" && line.includes("const pi = partition(arr, low, high);")) {
        highlight = true;
      }

      if (stepData.code === "quickSort(arr, low, pivot - 1)" && line.includes("quickSort(arr, low, pi - 1);")) {
        highlight = true;
      }

      if (stepData.code === "quickSort(arr, pivot + 1, high)" && line.includes("quickSort(arr, pi + 1, high);")) {
        highlight = true;
      }

      if (stepData.code === "pivot = arr[high]; i = low - 1" && line.includes("const pivot = arr[high];")) {
        highlight = true;
      }

      if (stepData.code === "if (arr[j] < pivot)" && line.includes("if (arr[j] < pivot)")) {
        highlight = true;
      }

      if (stepData.code === "i++; swap(arr[i], arr[j])" && line.includes("i++; // increment index of smaller element")) {
        highlight = true;
      }

      if (stepData.code === "swap(arr[i+1], arr[high])" && line.includes("swap(arr[i + 1], arr[high]);")) {
        highlight = true;
      }

      if (stepData.code === "return i + 1" && line.includes("return i + 1")) {
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
    <div className="quick-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">QuickSort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About QuickSort</h2>
              <p className="card-content">
                <strong>QuickSort</strong> is a divide-and-conquer algorithm that works by selecting a 'pivot' element and partitioning the array around the pivot, such that elements smaller than the pivot come before it and elements greater come after. It's one of the fastest sorting algorithms in practice.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n log n) - Good pivot selection</li>
                    <li>Average: O(n log n)</li>
                    <li>Worst: O(n²) - Poor pivot selection</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(log n) - Recursion stack space</li>
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
                  <li>• Not stable (may change order of equal elements)</li>
                  <li>• In-place sorting (requires only O(log n) extra space)</li>
                  <li>• Typically faster than Merge Sort in practice</li>
                  <li>• Performance depends heavily on pivot selection</li>
                  <li>• Cache-efficient due to in-place partitioning</li>
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
                            index === stepData.i || index === stepData.j || index === stepData.pivot
                              ? "scale(1.1)"
                              : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.i && (
                          <div className="i-indicator">i</div>
                        )}
                        {index === stepData.j && (
                          <div className="j-indicator">j</div>
                        )}
                        {index === stepData.pivot && (
                          <div className="pivot-indicator">Pivot</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {stepData.pivot !== -1 && (
                    <div className="pivot-display">
                      <div className="pivot-label">Current Pivot:</div>
                      <div className="pivot-value">
                        {stepData.array[stepData.pivot]}
                      </div>
                    </div>
                  )}
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Range</div>
                    <div className="status-value blue-title">
                      {stepData.low !== -1 ? `[${stepData.low}, ${stepData.high}]` : "N/A"}
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
                  <span className="legend-text">Current Partition</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span className="legend-text">Pivot</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">i Pointer</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="legend-text">j Pointer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSort;