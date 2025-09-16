import React, { useState, useEffect } from "react";
import "./ShellSort.css";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const ShellSort = () => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90, 53, 78, 9, 17, 42]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [gapSequence, setGapSequence] = useState([]);

  useEffect(() => {
    // Generate gap sequence (using Marcin Ciura's sequence)
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1].filter(g => g < array.length);
    setGapSequence(gaps);
    
    const generatedSteps = generateSteps(array, gaps);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [array]);

  const generateSteps = (arr, gaps) => {
    const steps = [];
    const tempArray = [...arr];
    const n = tempArray.length;

    // Initial state
    steps.push({
      array: [...tempArray],
      gap: -1,
      currentGapIndex: -1,
      currentIndex: -1,
      comparing: [],
      action: "Starting ShellSort algorithm. We'll sort the array using decreasing gap sizes.",
      code: "shellSort(arr)",
    });

    for (let gapIndex = 0; gapIndex < gaps.length; gapIndex++) {
      const gap = gaps[gapIndex];

      steps.push({
        array: [...tempArray],
        gap,
        currentGapIndex: gapIndex,
        currentIndex: -1,
        comparing: [],
        action: `Starting sorting with gap size ${gap}.`,
        code: `gap = ${gap}`,
      });

      // Do a gapped insertion sort for this gap size
      for (let i = gap; i < n; i++) {
        const temp = tempArray[i];
        let j;

        steps.push({
          array: [...tempArray],
          gap,
          currentGapIndex: gapIndex,
          currentIndex: i,
          comparing: [],
          action: `Looking at element ${temp} at index ${i} to insert in its correct position in the subarray with gap ${gap}.`,
          code: "temp = arr[i]; j = i",
        });

        for (j = i; j >= gap && tempArray[j - gap] > temp; j -= gap) {
          steps.push({
            array: [...tempArray],
            gap,
            currentGapIndex: gapIndex,
            currentIndex: i,
            comparing: [j, j - gap],
            action: `Comparing ${tempArray[j - gap]} at index ${j - gap} with ${temp}. Since ${tempArray[j - gap]} > ${temp}, we'll shift it right.`,
            code: "while (j >= gap && arr[j - gap] > temp)",
          });

          tempArray[j] = tempArray[j - gap];

          steps.push({
            array: [...tempArray],
            gap,
            currentGapIndex: gapIndex,
            currentIndex: i,
            comparing: [j, j - gap],
            action: `Shifted ${tempArray[j - gap]} from index ${j - gap} to index ${j}.`,
            code: "arr[j] = arr[j - gap]; j -= gap",
          });
        }

        if (j !== i) {
          tempArray[j] = temp;

          steps.push({
            array: [...tempArray],
            gap,
            currentGapIndex: gapIndex,
            currentIndex: j,
            comparing: [],
            action: `Inserted ${temp} at its correct position in the subarray at index ${j}.`,
            code: "arr[j] = temp",
          });
        } else {
          steps.push({
            array: [...tempArray],
            gap,
            currentGapIndex: gapIndex,
            currentIndex: i,
            comparing: [],
            action: `Element ${temp} is already in correct position in its subarray.`,
            code: "// Already in correct position",
          });
        }
      }

      steps.push({
        array: [...tempArray],
        gap,
        currentGapIndex: gapIndex,
        currentIndex: -1,
        comparing: [],
        action: `Finished sorting with gap size ${gap}. The array is now partially sorted.`,
        code: `// Gap ${gap} complete`,
      });
    }

    steps.push({
      array: [...tempArray],
      gap: -1,
      currentGapIndex: -1,
      currentIndex: -1,
      comparing: [],
      action: "ShellSort complete! The array is now fully sorted.",
      code: "return arr",
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        array: array,
        gap: -1,
        currentGapIndex: -1,
        currentIndex: -1,
        comparing: [],
        action: "Click Next to start sorting",
        code: "shellSort(arr)",
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
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length]);

  const getBarColor = (index) => {
    if (index === stepData.currentIndex) {
      return "#f59e0b"; // Orange for current element
    } else if (stepData.comparing.includes(index)) {
      return "#ef4444"; // Red for comparing elements
    } else if (stepData.gap !== -1 && stepData.currentGapIndex !== -1) {
      // Highlight elements in the current subarray
      const subarrayIndices = [];
      for (let i = index % stepData.gap; i < array.length; i += stepData.gap) {
        subarrayIndices.push(i);
      }
      if (subarrayIndices.includes(index)) {
        return "#8b5cf6"; // Purple for current subarray
      }
    }
    return "#3b82f6"; // Blue for other elements
  };

  const algorithm = `function shellSort(arr) {
  // Marcin Ciura's gap sequence
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1];
  
  for (const gap of gaps) {
    if (gap >= arr.length) continue;
    
    // Do a gapped insertion sort
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j;
      
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        arr[j] = arr[j - gap];
      }
      arr[j] = temp;
    }
  }
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "shellSort(arr)" && line.includes("shellSort(arr)")) {
        highlight = true;
      }

      if (stepData.code.startsWith("gap = ") && line.includes("const gap of gaps")) {
        highlight = true;
      }

      if (stepData.code === "temp = arr[i]; j = i" && line.includes("const temp = arr[i]")) {
        highlight = true;
      }

      if (stepData.code === "while (j >= gap && arr[j - gap] > temp)" && line.includes("j >= gap && arr[j - gap] > temp")) {
        highlight = true;
      }

      if (stepData.code === "arr[j] = arr[j - gap]; j -= gap" && line.includes("arr[j] = arr[j - gap]")) {
        highlight = true;
      }

      if (stepData.code === "arr[j] = temp" && line.includes("arr[j] = temp")) {
        highlight = true;
      }

      if (stepData.code === "// Already in correct position" && line.includes("}")) {
        highlight = true;
      }

      if (stepData.code.startsWith("// Gap ") && line.includes("}")) {
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

  const renderSubarrays = () => {
    if (stepData.gap === -1 || stepData.currentGapIndex === -1) return null;

    const subarrays = [];
    for (let offset = 0; offset < stepData.gap; offset++) {
      const subarrayIndices = [];
      for (let i = offset; i < array.length; i += stepData.gap) {
        subarrayIndices.push(i);
      }

      subarrays.push(
        <div key={offset} className="subarray">
          <div className="subarray-label">Subarray {offset + 1}:</div>
          <div className="subarray-indices">
            {subarrayIndices.map((idx) => (
              <div
                key={idx}
                className={`subarray-index ${stepData.currentIndex === idx ? "current" : ""}`}
              >
                {idx}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="subarrays-container">
        <h4>Current Gap: {stepData.gap}</h4>
        <div className="subarrays-grid">{subarrays}</div>
      </div>
    );
  };

  return (
    <div className="shell-sort-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Shell Sort Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Shell Sort</h2>
              <p className="card-content">
                <strong>Shell Sort</strong> is an optimization of Insertion Sort that allows the exchange of items that are far apart. It works by sorting elements that are distant from each other and progressively reducing this gap until it becomes 1, at which point the algorithm becomes a standard Insertion Sort.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Best: O(n log n) - Using best gap sequence</li>
                    <li>Average: Depends on gap sequence</li>
                    <li>Worst: O(n²) - With poor gap sequence</li>
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
                  <li>• Performance depends heavily on gap sequence</li>
                  <li>• More efficient than Insertion Sort for medium-sized arrays</li>
                  <li>• Often used in embedded systems due to low memory usage</li>
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
                            index === stepData.currentIndex || stepData.comparing.includes(index)
                              ? "scale(1.1)"
                              : "scale(1)",
                        }}
                      >
                        <span className="bar-value">{value}</span>
                        {index === stepData.currentIndex && (
                          <div className="current-indicator">Current</div>
                        )}
                        {stepData.comparing.includes(index) && (
                          <div className="comparing-indicator">
                            {index === stepData.comparing[0] ? "Comparing" : "Compared"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {renderSubarrays()}

                  <div className="gap-sequence">
                    <h4>Gap Sequence:</h4>
                    <div className="gaps">
                      {gapSequence.map((gap, idx) => (
                        <div
                          key={gap}
                          className={`gap ${stepData.currentGapIndex === idx ? "active" : ""}`}
                        >
                          {gap}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Gap</div>
                    <div className="status-value blue-title">
                      {stepData.gap !== -1 ? stepData.gap : "N/A"}
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
                  <span className="legend-text">Current Subarray</span>
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

export default ShellSort;