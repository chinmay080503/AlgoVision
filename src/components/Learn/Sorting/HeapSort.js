import React, { useState, useEffect } from "react";
import "./HeapSort.css";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const HeapSort = () => {
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

    // Initial state
    steps.push({
      array: [...tempArray],
      heapSize: n,
      currentIndex: -1,
      comparing: [],
      action: "Starting HeapSort algorithm. First, we'll build a max heap.",
      code: "heapSort(arr)",
    });

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(tempArray, n, i, steps);
    }

    steps.push({
      array: [...tempArray],
      heapSize: n,
      currentIndex: -1,
      comparing: [],
      action: "Max heap construction complete. Now we'll extract elements one by one.",
      code: "// Heap built, now sorting",
    });

    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
      // Move current root to end
      [tempArray[0], tempArray[i]] = [tempArray[i], tempArray[0]];

      steps.push({
        array: [...tempArray],
        heapSize: i,
        currentIndex: i,
        comparing: [0, i],
        action: `Swapped root ${tempArray[i]} with last element ${tempArray[0]} at index ${i}.`,
        code: "swap(arr[0], arr[i])",
      });

      // Call max heapify on the reduced heap
      heapify(tempArray, i, 0, steps);
    }

    steps.push({
      array: [...tempArray],
      heapSize: 0,
      currentIndex: -1,
      comparing: [],
      action: "HeapSort complete! The array is now sorted in ascending order.",
      code: "return arr",
    });

    return steps;
  };

  const heapify = (arr, n, i, steps) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    steps.push({
      array: [...arr],
      heapSize: n,
      currentIndex: i,
      comparing: [left, right, largest],
      action: `Heapifying node at index ${i} (value: ${arr[i]}). Checking children at ${left} and ${right}.`,
      code: "largest = i; left = 2*i+1; right = 2*i+2",
    });

    // If left child is larger than root
    if (left < n && arr[left] > arr[largest]) {
      largest = left;
      steps.push({
        array: [...arr],
        heapSize: n,
        currentIndex: i,
        comparing: [left, largest],
        action: `Left child ${arr[left]} is larger than current largest ${arr[i]}. New largest is ${left}.`,
        code: "if (left < n && arr[left] > arr[largest])",
      });
    }

    // If right child is larger than largest so far
    if (right < n && arr[right] > arr[largest]) {
      largest = right;
      steps.push({
        array: [...arr],
        heapSize: n,
        currentIndex: i,
        comparing: [right, largest],
        action: `Right child ${arr[right]} is larger than current largest ${arr[largest]}. New largest is ${right}.`,
        code: "if (right < n && arr[right] > arr[largest])",
      });
    }

    // If largest is not root
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];

      steps.push({
        array: [...arr],
        heapSize: n,
        currentIndex: i,
        comparing: [i, largest],
        action: `Swapped node ${arr[i]} at ${i} with ${arr[largest]} at ${largest}.`,
        code: "swap(arr[i], arr[largest])",
      });

      // Recursively heapify the affected sub-tree
      heapify(arr, n, largest, steps);
    } else {
      steps.push({
        array: [...arr],
        heapSize: n,
        currentIndex: i,
        comparing: [],
        action: `Heap property satisfied at index ${i}. No swaps needed.`,
        code: "// Heap property satisfied",
      });
    }
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        heapSize: array.length,
        currentIndex: -1,
        comparing: [],
        action: "Click Next to start sorting",
        code: "heapSort(arr)",
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
    if (index === stepData.currentIndex) {
      return "#f59e0b"; // Orange for current node
    } else if (stepData.comparing.includes(index)) {
      return "#ef4444"; // Red for comparing nodes
    } else if (index >= stepData.heapSize) {
      return "#10b981"; // Green for sorted elements
    } else {
      return "#3b82f6"; // Blue for unsorted heap elements
    }
  };

  const algorithm = `function heapSort(arr) {
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    // Move root to end
    swap(arr[0], arr[i]);
    
    // Heapify reduced heap
    heapify(arr, i, 0);
  }
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // If left child is larger
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  // If right child is larger
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  // If largest is not root
  if (largest !== i) {
    swap(arr[i], arr[largest]);
    
    // Recursively heapify affected subtree
    heapify(arr, n, largest);
  }
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "heapSort(arr)" && line.includes("heapSort(arr)")) {
        highlight = true;
      }

      if (stepData.code === "// Heap built, now sorting" && line.includes("// Extract elements from heap")) {
        highlight = true;
      }

      if (stepData.code === "swap(arr[0], arr[i])" && line.includes("swap(arr[0], arr[i])")) {
        highlight = true;
      }

      if (stepData.code === "largest = i; left = 2*i+1; right = 2*i+2" && line.includes("let largest = i;")) {
        highlight = true;
      }

      if (stepData.code.includes("if (left < n && arr[left] > arr[largest])") && line.includes("if (left < n && arr[left] > arr[largest])")) {
        highlight = true;
      }

      if (stepData.code.includes("if (right < n && arr[right] > arr[largest])") && line.includes("if (right < n && arr[right] > arr[largest])")) {
        highlight = true;
      }

      if (stepData.code === "swap(arr[i], arr[largest])" && line.includes("swap(arr[i], arr[largest])")) {
        highlight = true;
      }

      if (stepData.code === "// Heap property satisfied" && line.includes("heapify(arr, n, largest);")) {
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

  const renderHeapTree = () => {
    const heapArray = stepData.array.slice(0, stepData.heapSize);
    const levels = Math.ceil(Math.log2(heapArray.length + 1));
    const tree = [];
    
    for (let level = 0; level < levels; level++) {
      const levelNodes = [];
      const start = Math.pow(2, level) - 1;
      const end = Math.min(Math.pow(2, level + 1) - 1, heapArray.length);
      
      for (let i = start; i < end; i++) {
        if (i >= heapArray.length) break;
        
        const nodeColor = getBarColor(i);
        const isHighlighted = i === stepData.currentIndex || stepData.comparing.includes(i);
        
        levelNodes.push(
          <div 
            key={i}
            className="heap-node"
            style={{
              backgroundColor: nodeColor,
              transform: isHighlighted ? "scale(1.1)" : "scale(1)",
              border: isHighlighted ? "2px solid white" : "none"
            }}
          >
            {heapArray[i]}
            {i === stepData.currentIndex && <div className="node-label">Current</div>}
            {stepData.comparing.includes(i) && i !== stepData.currentIndex && (
              <div className="node-label">
                {i === stepData.comparing[0] ? "Left" : "Right"}
              </div>
            )}
          </div>
        );
      }
      
      tree.push(
        <div key={level} className="heap-level">
          {levelNodes}
        </div>
      );
    }
    
    return <div className="heap-tree">{tree}</div>;
  };

  return (
    <div className="heap-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Heap Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Heap Sort</h2>
              <p className="card-content">
                <strong>Heap Sort</strong> is a comparison-based sorting algorithm that uses a binary heap data structure. It consists of two main phases: building a max heap from the input data, and repeatedly extracting the maximum element from the heap and rebuilding the heap.
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
                    <li>O(1) - In-place sorting</li>
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
                  <li>• In-place sorting (requires only O(1) extra space)</li>
                  <li>• Typically slower than QuickSort but has guaranteed O(n log n) performance</li>
                  <li>• Efficient for finding the kth largest element</li>
                  <li>• Used in priority queue implementations</li>
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
                  {/* Heap Tree Visualization */}
                  <div className="heap-container">
                    <h3 className="heap-title">Heap Structure</h3>
                    {renderHeapTree()}
                  </div>
                  
                  {/* Array Visualization */}
                  <div className="array-visualization">
                    <h3 className="array-title">Array Representation</h3>
                    <div className="array-container">
                      {stepData.array.map((value, index) => (
                        <div
                          key={index}
                          className="bar"
                          style={{
                            height: `${(value / Math.max(...array)) * 200}px`,
                            backgroundColor: getBarColor(index),
                            transform: stepData.comparing.includes(index) || index === stepData.currentIndex
                              ? "scale(1.1)"
                              : "scale(1)",
                          }}
                        >
                          <span className="bar-value">{value}</span>
                          {index === stepData.currentIndex && (
                            <div className="current-indicator">Current</div>
                          )}
                          {stepData.comparing.includes(index) && index !== stepData.currentIndex && (
                            <div className="comparing-indicator">
                              {index === stepData.comparing[0] ? "Left" : "Right"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="heap-size-indicator">
                      Heap Size: {stepData.heapSize} / {array.length}
                    </div>
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Heap Phase</div>
                    <div className="status-value blue-title">
                      {currentStep === 0 ? "Initial" : 
                       currentStep < steps.length - 1 ? 
                       (stepData.heapSize === array.length ? "Building" : "Sorting") : 
                       "Complete"}
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
                  <span className="legend-text">Heap Elements</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Comparing Nodes</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Sorted Elements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeapSort;