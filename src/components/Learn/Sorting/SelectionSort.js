import React, { useState, useEffect } from "react";
import "./SelectionSort.css";
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const SelectionSort = () => {
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

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      
      // Add step for starting new pass
      steps.push({
        array: [...tempArray],
        currentIndex: i,
        minIndex: minIndex,
        comparing: -1,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        pass: i + 1,
        action: `Pass ${i + 1}: Finding minimum in unsorted portion starting at index ${i}`,
        code: "minIndex = i",
      });

      // Find minimum element in remaining unsorted array
      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          minIndex: minIndex,
          comparing: j,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pass: i + 1,
          action: `Comparing element at index ${j} (${tempArray[j]}) with current minimum at index ${minIndex} (${tempArray[minIndex]})`,
          code: "if (arr[j] < arr[minIndex])",
        });

        if (tempArray[j] < tempArray[minIndex]) {
          minIndex = j;
          steps.push({
            array: [...tempArray],
            currentIndex: i,
            minIndex: minIndex,
            comparing: j,
            sortedIndices: Array.from({ length: i }, (_, k) => k),
            pass: i + 1,
            action: `New minimum found! Element ${tempArray[j]} at index ${j} is smaller than previous minimum`,
            code: "minIndex = j",
          });
        }
      }

      // Swap if needed
      if (minIndex !== i) {
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          minIndex: minIndex,
          comparing: -1,
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pass: i + 1,
          action: `Swapping minimum element ${tempArray[minIndex]} at index ${minIndex} with element ${tempArray[i]} at index ${i}`,
          code: "swap(arr[i], arr[minIndex])",
        });
        
        [tempArray[i], tempArray[minIndex]] = [tempArray[minIndex], tempArray[i]];
        
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          minIndex: -1,
          comparing: -1,
          sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
          pass: i + 1,
          action: `Swap complete! Element ${tempArray[i]} is now in its correct position at index ${i}`,
          code: "// Element placed in correct position",
        });
      } else {
        steps.push({
          array: [...tempArray],
          currentIndex: i,
          minIndex: -1,
          comparing: -1,
          sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
          pass: i + 1,
          action: `Element ${tempArray[i]} at index ${i} is already in correct position, no swap needed`,
          code: "// No swap needed",
        });
      }
    }

    steps.push({
      array: [...tempArray],
      currentIndex: -1,
      minIndex: -1,
      comparing: -1,
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      pass: n,
      action: "Selection sort complete! All elements are now in sorted order.",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        currentIndex: -1,
        minIndex: -1,
        comparing: -1,
        sortedIndices: [],
        pass: 0,
        action: "Click Next to start sorting",
        code: "selectionSort(arr)",
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
    if (stepData.sortedIndices.includes(index)) {
      return "#10b981"; // Green for sorted
    } else if (index === stepData.currentIndex) {
      return "#8b5cf6"; // Purple for current position
    } else if (index === stepData.minIndex) {
      return "#f59e0b"; // Orange for current minimum
    } else if (index === stepData.comparing) {
      return "#ef4444"; // Red for comparing
    } else {
      return "#3b82f6"; // Blue for unsorted
    }
  };

  const algorithm = `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split('\n');

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === 'minIndex = i' && line.includes('minIndex = i')) {
        highlight = true;
      }

      if (stepData.code === 'if (arr[j] < arr[minIndex])' && line.includes('if (arr[j] < arr[minIndex])')) {
        highlight = true;
      }

      if (stepData.code === 'minIndex = j' && line.includes('minIndex = j')) {
        highlight = true;
      }

      if (stepData.code === 'swap(arr[i], arr[minIndex])' && line.includes('[arr[i], arr[minIndex]]')) {
        highlight = true;
      }

      if (stepData.code === 'return arr' && line.includes('return arr')) {
        highlight = true;
      }

      return (
        <div
          key={index}
          className={highlight ? 'highlighted-line' : 'code-line'}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="selection-sort-container">
      <div className="max-width">
        <div className="header">
          <button 
            className="back-button"
            onClick={() => console.log('Navigate back')}
          >
            <ChevronLeft size={16} />
            Back to Learn
          </button>
          <h1 className="title">Selection Sort Algorithm</h1>
          <div className="spacer"></div>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Selection Sort</h2>
              <p className="card-content">
                <strong>Selection Sort</strong> is a simple sorting algorithm that divides the input list into two parts: 
                a sorted portion at the left end and an unsorted portion at the right end. It repeatedly finds the minimum 
                element from the unsorted portion and moves it to the end of the sorted portion.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n²)</li>
                    <li>Average: O(n²)</li>
                    <li>Worst: O(n²)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(1) - In-place sorting</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: '16px' }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Not stable (relative order of equal elements may change)</li>
                  <li>• In-place sorting (requires only O(1) extra space)</li>
                  <li>• Simple to understand and implement</li>
                  <li>• Performs well on small lists</li>
                  <li>• Minimizes the number of swaps (at most n-1 swaps)</li>
                </ul>
              </div>
            </div>

            {/* Code and Visualization Grid */}
            <div className="code-visualization-grid">
              {/* Code Section */}
              <div className="card">
                <h2 className="card-title">Algorithm Code</h2>
                <div className="code-container">
                  <div>
                    {getHighlightedCode()}
                  </div>
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
                          transform: (index === stepData.comparing || index === stepData.minIndex || index === stepData.currentIndex)
                            ? "scale(1.1)"
                            : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.currentIndex && (
                          <div className="selection-indicator"></div>
                        )}
                        {index === stepData.minIndex && stepData.minIndex !== -1 && (
                          <div className="minimum-indicator"></div>
                        )}
                        {index === stepData.comparing && stepData.comparing !== -1 && (
                          <div className="comparing-indicator"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Pass</div>
                    <div className="status-value blue-title">{stepData.pass}</div>
                  </div>
                  <div className="status-card green-card">
                    <div className="status-label green-text">Steps</div>
                    <div className="status-value green-title">{currentStep + 1} / {totalSteps}</div>
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
                    className={`control-button gray-button ${currentStep === 0 ? 'disabled-button' : ''}`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`control-button blue-button ${currentStep >= steps.length - 1 ? 'disabled-button' : ''}`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`control-button blue-button ${currentStep >= steps.length - 1 ? 'disabled-button' : ''}`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button 
                    onClick={reset} 
                    className="control-button red-button"
                  >
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
                  <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="legend-text">Unsorted</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <span className="legend-text">Current Position</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="legend-text">Current Minimum</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="legend-text">Comparing</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="legend-text">Sorted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionSort;