import React, { useState, useEffect } from "react";
import "./Knapsack01.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

const Knapsack01 = () => {
  const [weights, setWeights] = useState("1, 2, 3");
  const [values, setValues] = useState("6, 10, 12");
  const [capacity, setCapacity] = useState("5");
  const [items, setItems] = useState([
    { weight: 1, value: 6 },
    { weight: 2, value: 10 },
    { weight: 3, value: 12 }
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const generatedSteps = generateSteps(items, knapsackCapacity);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [items, knapsackCapacity]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    try {
      const weightArray = weights.split(',').map(w => parseInt(w.trim()));
      const valueArray = values.split(',').map(v => parseInt(v.trim()));
      
      if (weightArray.length !== valueArray.length) {
        throw new Error("Number of weights must match number of values");
      }
      
      const newItems = weightArray.map((weight, i) => ({
        weight,
        value: valueArray[i]
      }));
      
      setItems(newItems);
      setKnapsackCapacity(parseInt(capacity));
      setCurrentStep(0);
      setIsPlaying(false);
      setSelectedItems([]);
    } catch (error) {
      alert("Invalid input format. Please enter comma-separated numbers for weights and values, and a single number for capacity.");
    }
  };

  const generateSteps = (items, W) => {
    const steps = [];
    const n = items.length;
    const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    const keep = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    
    // Initial state
    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      keep: JSON.parse(JSON.stringify(keep)),
      i: -1,
      w: -1,
      action: "Initializing DP table for 0/1 Knapsack problem.",
      code: "Initialize DP table",
      showResult: false,
      selectedItems: []
    });

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      const { weight: wi, value: vi } = items[i - 1];
      
      for (let w = 0; w <= W; w++) {
        steps.push({
          dp: JSON.parse(JSON.stringify(dp)),
          keep: JSON.parse(JSON.stringify(keep)),
          i,
          w,
          action: `Considering item ${i} (weight: ${wi}, value: ${vi}) with capacity ${w}`,
          code: "Outer loop - item",
          showResult: false,
          selectedItems: []
        });

        if (wi <= w) {
          const include = vi + dp[i - 1][w - wi];
          const exclude = dp[i - 1][w];
          
          steps.push({
            dp: JSON.parse(JSON.stringify(dp)),
            keep: JSON.parse(JSON.stringify(keep)),
            i,
            w,
            action: `Item fits (${wi} ≤ ${w}). Comparing: include (${vi} + ${dp[i-1][w-wi]} = ${include}) vs exclude (${exclude})`,
            code: "Item fits comparison",
            showResult: false,
            selectedItems: []
          });

          if (include > exclude) {
            dp[i][w] = include;
            keep[i][w] = 1;
            
            steps.push({
              dp: JSON.parse(JSON.stringify(dp)),
              keep: JSON.parse(JSON.stringify(keep)),
              i,
              w,
              action: `Including item ${i} gives better value (${include} > ${exclude})`,
              code: "Include item",
              showResult: false,
              selectedItems: []
            });
          } else {
            dp[i][w] = exclude;
            
            steps.push({
              dp: JSON.parse(JSON.stringify(dp)),
              keep: JSON.parse(JSON.stringify(keep)),
              i,
              w,
              action: `Excluding item ${i} gives better or equal value (${exclude} ≥ ${include})`,
              code: "Exclude item",
              showResult: false,
              selectedItems: []
            });
          }
        } else {
          dp[i][w] = dp[i - 1][w];
          
          steps.push({
            dp: JSON.parse(JSON.stringify(dp)),
            keep: JSON.parse(JSON.stringify(keep)),
            i,
            w,
            action: `Item ${i} doesn't fit (${wi} > ${w}), carrying forward value ${dp[i-1][w]}`,
            code: "Item doesn't fit",
            showResult: false,
            selectedItems: []
          });
        }
      }
    }

    // Traceback to find selected items
    const traceSteps = [];
    let currentSelectedItems = [];
    let remainingWeight = W;

    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      keep: JSON.parse(JSON.stringify(keep)),
      i: -1,
      w: -1,
      action: "DP table complete. Starting traceback to find selected items.",
      code: "Start traceback",
      showResult: true,
      selectedItems: []
    });

    for (let i = n; i > 0; i--) {
      if (keep[i][remainingWeight] === 1) {
        currentSelectedItems.push(i);
        remainingWeight -= items[i - 1].weight;
        
        traceSteps.push({
          dp: JSON.parse(JSON.stringify(dp)),
          keep: JSON.parse(JSON.stringify(keep)),
          i,
          w: remainingWeight,
          action: `Selected item ${i} (weight: ${items[i-1].weight}, value: ${items[i-1].value}). Remaining capacity: ${remainingWeight}`,
          code: "Traceback - include",
          showResult: true,
          selectedItems: [...currentSelectedItems]
        });
      } else {
        traceSteps.push({
          dp: JSON.parse(JSON.stringify(dp)),
          keep: JSON.parse(JSON.stringify(keep)),
          i,
          w: remainingWeight,
          action: `Skipped item ${i}. Remaining capacity: ${remainingWeight}`,
          code: "Traceback - exclude",
          showResult: true,
          selectedItems: [...currentSelectedItems]
        });
      }
    }

    steps.push(...traceSteps);

    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      keep: JSON.parse(JSON.stringify(keep)),
      i: -1,
      w: -1,
      action: `Optimal solution found! Maximum value: ${dp[n][W]}`,
      code: "Complete",
      showResult: true,
      selectedItems: currentSelectedItems
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        dp: Array(items.length + 1).fill().map(() => Array(knapsackCapacity + 1).fill(0)),
        keep: Array(items.length + 1).fill().map(() => Array(knapsackCapacity + 1).fill(0)),
        i: -1,
        w: -1,
        action: "Click Next to start 0/1 Knapsack calculation",
        code: "Initialize DP table",
        showResult: false,
        selectedItems: []
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

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value));
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
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  const getCellColor = (i, w) => {
    if (stepData.showResult && stepData.selectedItems.includes(i)) {
      return "#f59e0b"; // Orange for selected items
    }
    if (i === stepData.i && w === stepData.w) {
      return "#3b82f6"; // Blue for current DP cell
    }
    if (i === stepData.i - 1 && w === stepData.w) {
      return "#10b981"; // Green for top reference
    }
    if (i === stepData.i - 1 && w === stepData.w - (items[i-1]?.weight || 0)) {
      return "#8b5cf6"; // Purple for diagonal reference
    }
    return "transparent";
  };

  const algorithm = `function knapsack01(weights, values, W) {
  const n = weights.length;
  const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
  const keep = Array(n + 1).fill().map(() => Array(W + 1).fill(0));

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const wi = weights[i-1], vi = values[i-1];
    
    for (let w = 0; w <= W; w++) {
      if (wi <= w) {
        const include = vi + dp[i-1][w-wi];
        const exclude = dp[i-1][w];
        
        if (include > exclude) {
          dp[i][w] = include;
          keep[i][w] = 1;
        } else {
          dp[i][w] = exclude;
        }
      } else {
        dp[i][w] = dp[i-1][w];
      }
    }
  }

  // Traceback to find selected items
  let selectedItems = [];
  let remainingWeight = W;
  
  for (let i = n; i > 0; i--) {
    if (keep[i][remainingWeight] === 1) {
      selectedItems.push(i);
      remainingWeight -= weights[i-1];
    }
  }

  return {
    maxValue: dp[n][W],
    selectedItems: selectedItems.reverse()
  };
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Initialize DP table" && line.includes("const dp = Array")) {
        highlight = true;
      }

      if (stepData.code === "Outer loop - item" && line.includes("for (let i = 1; i <= n; i++)")) {
        highlight = true;
      }

      if (stepData.code === "Item fits comparison" && line.includes("if (wi <= w)")) {
        highlight = true;
      }

      if ((stepData.code === "Include item" || stepData.code === "Exclude item") && 
          line.includes("if (include > exclude)")) {
        highlight = true;
      }

      if (stepData.code.includes("Traceback") && line.includes("for (let i = n; i > 0; i--)")) {
        highlight = true;
      }

      if (stepData.code === "Complete" && line.includes("return {")) {
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
    <div className="ks-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">0/1 Knapsack Problem</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About 0/1 Knapsack</h2>
              <p className="card-content">
                The <strong>0/1 Knapsack Problem</strong> is a classic optimization problem where given a set of items with weights and values, we must determine the most valuable combination of items that can fit into a knapsack of fixed capacity. Each item can either be included (1) or not (0), hence the name.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>DP Solution: O(n×W)</li>
                    <li>Naive Recursive: O(2ⁿ)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>DP Solution: O(n×W)</li>
                    <li>Space Optimized DP: O(W)</li>
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
                  <li>• Classic dynamic programming problem</li>
                  <li>• NP-Complete (no known polynomial solution)</li>
                  <li>• Pseudo-polynomial time solution exists</li>
                  <li>• Used in resource allocation, portfolio optimization</li>
                  <li>• Basis for many real-world optimization problems</li>
                </ul>
              </div>
            </div>

            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Problem Input</h2>
              <form onSubmit={handleInputSubmit} className="input-form">
                <div className="input-group">
                  <label htmlFor="weights">Item Weights (comma-separated):</label>
                  <input
                    type="text"
                    id="weights"
                    value={weights}
                    onChange={(e) => setWeights(e.target.value)}
                    placeholder="e.g., 1,3,4,5"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="values">Item Values (comma-separated):</label>
                  <input
                    type="text"
                    id="values"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    placeholder="e.g., 1,4,5,7"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="capacity">Knapsack Capacity:</label>
                  <input
                    type="text"
                    id="capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g., 7"
                  />
                </div>
                <button type="submit" className="submit-button">
                  Calculate
                </button>
              </form>
              <div className="items-info">
                <h3>Items:</h3>
                <div className="items-list">
                  {items.map((item, i) => (
                    <div key={i} className="item-card">
                      <div className="item-header">Item {i+1}</div>
                      <div className="item-details">
                        <span>Weight: {item.weight}</span>
                        <span>Value: {item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {/* DP Table */}
                  <div className="dp-table-section">
                    <h3 className="array-title">DP Table (Maximum Values)</h3>
                    <div className="dp-table-container">
                      <table className="dp-table">
                        <thead>
                          <tr>
                            <th>Item \ Weight</th>
                            {Array.from({ length: knapsackCapacity + 1 }, (_, w) => (
                              <th key={`col-${w}`}>{w}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stepData.dp.map((row, i) => (
                            <tr key={`row-${i}`}>
                              <th>{i > 0 ? i : ""}</th>
                              {row.map((cell, w) => (
                                <td 
                                  key={`cell-${i}-${w}`}
                                  style={{ 
                                    backgroundColor: getCellColor(i, w),
                                    position: 'relative'
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Keep Table */}
                  <div className="dp-table-section">
                    <h3 className="array-title">Keep Table (Inclusion Decisions)</h3>
                    <div className="dp-table-container">
                      <table className="dp-table">
                        <thead>
                          <tr>
                            <th>Item \ Weight</th>
                            {Array.from({ length: knapsackCapacity + 1 }, (_, w) => (
                              <th key={`col-${w}`}>{w}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stepData.keep.map((row, i) => (
                            <tr key={`row-${i}`}>
                              <th>{i > 0 ? i : ""}</th>
                              {row.map((cell, w) => (
                                <td 
                                  key={`cell-${i}-${w}`}
                                  style={{ 
                                    backgroundColor: getCellColor(i, w),
                                    position: 'relative'
                                  }}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="result-section">
                    <h3 className="array-title">Optimal Solution</h3>
                    <div className="result-container">
                      {stepData.showResult ? (
                        stepData.selectedItems.length > 0 ? (
                          <>
                            <div>Selected Items: {stepData.selectedItems.sort((a,b) => a-b).join(', ')}</div>
                            <div>Total Value: {stepData.dp[items.length]?.[knapsackCapacity] || 0}</div>
                            <div>Total Weight: {
                              stepData.selectedItems.reduce((sum, item) => sum + items[item-1].weight, 0)
                            }</div>
                          </>
                        ) : "No items selected"
                      ) : "Will be shown during traceback"}
                    </div>
                  </div>
                </div>

                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Phase</div>
                    <div className="status-value blue-title">
                      {currentStep === 0 ? "Initial" : 
                       currentStep < steps.findIndex(step => step.code === "Start traceback") ? "Filling DP Table" :
                       currentStep < steps.length - 1 ? "Traceback" : "Complete"}
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
                  <span className="legend-text">Current DP Cell</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span className="legend-text">Selected Item</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Top Reference</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Diagonal Reference</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knapsack01;