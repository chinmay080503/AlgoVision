import React, { useState, useEffect } from "react";
import "./MatrixChainMultiplication.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

const MatrixChainMultiplication = () => {
  const [inputDimensions, setInputDimensions] = useState("40,20,30,10,30");
  const [dimensions, setDimensions] = useState([40, 20, 30, 10, 30]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);

  useEffect(() => {
    const generatedSteps = generateSteps(dimensions);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [dimensions]);

  const handleDimensionsSubmit = (e) => {
    e.preventDefault();
    try {
      const dims = inputDimensions.split(',').map(d => parseInt(d.trim()));
      if (dims.length < 2) throw new Error("At least 2 dimensions required");
      setDimensions(dims);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (error) {
      alert("Invalid input format. Please enter comma-separated numbers (e.g., '40,20,30,10,30')");
    }
  };

  const generateSteps = (dims) => {
    const steps = [];
    const n = dims.length - 1; // Number of matrices
    const dp = Array(n).fill().map(() => Array(n).fill(0));
    const split = Array(n).fill().map(() => Array(n).fill(0));
    
    // Initial state
    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      split: JSON.parse(JSON.stringify(split)),
      i: -1,
      j: -1,
      k: -1,
      action: "Initializing DP and split tables for matrix chain multiplication.",
      code: "Initialize tables",
      showResult: false,
      currentChain: ""
    });

    // Fill DP table
    for (let len = 2; len <= n; len++) { // Subsequence lengths
      for (let i = 0; i < n - len + 1; i++) {
        const j = i + len - 1;
        dp[i][j] = Infinity;
        
        steps.push({
          dp: JSON.parse(JSON.stringify(dp)),
          split: JSON.parse(JSON.stringify(split)),
          i,
          j,
          k: -1,
          action: `Calculating minimum multiplications for matrices ${i+1} to ${j+1}`,
          code: "Outer loops",
          showResult: false,
          currentChain: ""
        });

        for (let k = i; k < j; k++) {
          const cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1];
          
          steps.push({
            dp: JSON.parse(JSON.stringify(dp)),
            split: JSON.parse(JSON.stringify(split)),
            i,
            j,
            k,
            action: `Testing split at ${k+1}: cost = dp[${i+1}][${k+1}] + dp[${k+2}][${j+1}] + ${dims[i]}×${dims[k+1]}×${dims[j+1]} = ${cost}`,
            code: "Inner split evaluation",
            showResult: false,
            currentChain: ""
          });

          if (cost < dp[i][j]) {
            dp[i][j] = cost;
            split[i][j] = k;
            
            steps.push({
              dp: JSON.parse(JSON.stringify(dp)),
              split: JSON.parse(JSON.stringify(split)),
              i,
              j,
              k,
              action: `New minimum found! Updating dp[${i+1}][${j+1}] to ${cost} with split at ${k+1}`,
              code: "Update minimum",
              showResult: false,
              currentChain: ""
            });
          }
        }
      }
    }

    // Traceback to find optimal parenthesization
    const traceSteps = [];
    let currentChain = "";

    const traceback = (i, j) => {
      if (i === j) {
        currentChain += `A${i+1}`;
        traceSteps.push({
          dp: JSON.parse(JSON.stringify(dp)),
          split: JSON.parse(JSON.stringify(split)),
          i,
          j,
          k: split[i][j],
          action: `Base case: single matrix A${i+1}`,
          code: "Traceback - base",
          showResult: true,
          currentChain: currentChain
        });
        return;
      }

      currentChain += "(";
      traceSteps.push({
        dp: JSON.parse(JSON.stringify(dp)),
        split: JSON.parse(JSON.stringify(split)),
        i,
        j,
        k: split[i][j],
        action: `Adding opening parenthesis before split at ${split[i][j]+1}`,
        code: "Traceback - open",
        showResult: true,
        currentChain: currentChain
      });

      traceback(i, split[i][j]);

      traceSteps.push({
        dp: JSON.parse(JSON.stringify(dp)),
        split: JSON.parse(JSON.stringify(split)),
        i,
        j,
        k: split[i][j],
        action: `Adding multiplication operator after first group`,
        code: "Traceback - multiply",
        showResult: true,
        currentChain: currentChain + " × "
      });
      currentChain += " × ";

      traceback(split[i][j]+1, j);

      currentChain += ")";
      traceSteps.push({
        dp: JSON.parse(JSON.stringify(dp)),
        split: JSON.parse(JSON.stringify(split)),
        i,
        j,
        k: split[i][j],
        action: `Adding closing parenthesis after second group`,
        code: "Traceback - close",
        showResult: true,
        currentChain: currentChain
      });
    };

    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      split: JSON.parse(JSON.stringify(split)),
      i: -1,
      j: -1,
      k: -1,
      action: "DP table complete. Starting traceback to find optimal parenthesization.",
      code: "Start traceback",
      showResult: true,
      currentChain: ""
    });

    traceback(0, n-1);

    steps.push(...traceSteps);

    steps.push({
      dp: JSON.parse(JSON.stringify(dp)),
      split: JSON.parse(JSON.stringify(split)),
      i: -1,
      j: -1,
      k: -1,
      action: `Optimal parenthesization found! Minimum multiplications: ${dp[0][n-1]}`,
      code: "Complete",
      showResult: true,
      currentChain: currentChain
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        dp: Array(dimensions.length - 1).fill().map(() => Array(dimensions.length - 1).fill(0)),
        split: Array(dimensions.length - 1).fill().map(() => Array(dimensions.length - 1).fill(0)),
        i: -1,
        j: -1,
        k: -1,
        action: "Click Next to start matrix chain multiplication calculation",
        code: "Initialize tables",
        showResult: false,
        currentChain: ""
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

  const getCellColor = (row, col) => {
    if (stepData.showResult && stepData.i === row && stepData.j === col) {
      return "#f59e0b"; // Orange for current trace cell
    }
    if (stepData.i === row && stepData.j === col) {
      return "#3b82f6"; // Blue for current DP cell
    }
    if (stepData.k !== -1 && row === stepData.i && col === stepData.k) {
      return "#10b981"; // Green for left split
    }
    if (stepData.k !== -1 && row === stepData.k+1 && col === stepData.j) {
      return "#8b5cf6"; // Purple for right split
    }
    return "transparent";
  };

  const algorithm = `function matrixChainMultiplication(dims) {
  const n = dims.length - 1;
  const dp = Array(n).fill().map(() => Array(n).fill(0));
  const split = Array(n).fill().map(() => Array(n).fill(0));

  // Fill DP table
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i < n - len + 1; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k+1][j] 
                   + dims[i] * dims[k+1] * dims[j+1];
        
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
        }
      }
    }
  }

  // Traceback to find optimal parenthesization
  function traceback(i, j) {
    if (i === j) return \`A\${i+1}\`;
    return \`(\${traceback(i, split[i][j])} × \${traceback(split[i][j]+1, j)})\`;
  }

  const optimalParenthesization = traceback(0, n-1);
  return {
    minMultiplications: dp[0][n-1],
    optimalParenthesization
  };
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Initialize tables" && line.includes("const dp = Array")) {
        highlight = true;
      }

      if (stepData.code === "Outer loops" && line.includes("for (let len = 2; len <= n; len++)")) {
        highlight = true;
      }

      if (stepData.code === "Inner split evaluation" && line.includes("const cost = dp[i][k] + dp[k+1][j]")) {
        highlight = true;
      }

      if (stepData.code === "Update minimum" && line.includes("if (cost < dp[i][j])")) {
        highlight = true;
      }

      if (stepData.code.includes("Traceback") && line.includes("function traceback(i, j)")) {
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
    <div className="mcm-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Matrix Chain Multiplication</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Matrix Chain Multiplication</h2>
              <p className="card-content">
                The <strong>Matrix Chain Multiplication</strong> problem aims to find the most efficient way to multiply a sequence of matrices by determining the optimal parenthesization that minimizes the number of scalar multiplications. It's a classic dynamic programming problem with applications in computer graphics, numerical linear algebra, and compiler optimization.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>DP Solution: O(n³)</li>
                    <li>Naive Recursive: O(2ⁿ)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>DP Solution: O(n²)</li>
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
                  <li>• Solves the optimal parenthesization problem</li>
                  <li>• Reduces time complexity from exponential to polynomial</li>
                  <li>• Uses a DP table to store intermediate results</li>
                  <li>• Requires a traceback step to find the solution</li>
                </ul>
              </div>
            </div>

            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Matrix Dimensions</h2>
              <form onSubmit={handleDimensionsSubmit} className="input-form">
                <div className="input-group">
                  <label htmlFor="dimensions">Dimensions (comma-separated):</label>
                  <input
                    type="text"
                    id="dimensions"
                    value={inputDimensions}
                    onChange={(e) => setInputDimensions(e.target.value)}
                    placeholder="e.g., 40,20,30,10,30"
                  />
                </div>
                <button type="submit" className="submit-button">
                  Calculate
                </button>
              </form>
              <div className="matrices-info">
                <h3>Matrices:</h3>
                <div className="matrices-list">
                  {dimensions.length > 1 && (
                    <>
                      {dimensions.slice(0, -1).map((d, i) => (
                        <div key={i} className="matrix-item">
                          A{i+1}: {d} × {dimensions[i+1]}
                        </div>
                      ))}
                    </>
                  )}
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
                    <h3 className="array-title">DP Table (Minimum Multiplications)</h3>
                    <div className="dp-table-container">
                      <table className="dp-table">
                        <thead>
                          <tr>
                            <th></th>
                            {Array.from({ length: dimensions.length - 1 }, (_, i) => (
                              <th key={`col-${i}`}>{i+1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stepData.dp.map((row, i) => (
                            <tr key={`row-${i}`}>
                              <th>{i+1}</th>
                              {row.map((cell, j) => (
                                <td 
                                  key={`cell-${i}-${j}`}
                                  style={{ 
                                    backgroundColor: getCellColor(i, j),
                                    position: 'relative'
                                  }}
                                >
                                  {cell === 0 && i !== j ? "" : cell}
                                  {stepData.split[i]?.[j] !== 0 && (
                                    <div className="direction-arrow">{stepData.split[i]?.[j]}</div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Split Table */}
                  <div className="dp-table-section">
                    <h3 className="array-title">Split Table (Optimal k values)</h3>
                    <div className="dp-table-container">
                      <table className="dp-table">
                        <thead>
                          <tr>
                            <th></th>
                            {Array.from({ length: dimensions.length - 1 }, (_, i) => (
                              <th key={`col-${i}`}>{i+1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stepData.split.map((row, i) => (
                            <tr key={`row-${i}`}>
                              <th>{i+1}</th>
                              {row.map((cell, j) => (
                                <td 
                                  key={`cell-${i}-${j}`}
                                  style={{ 
                                    backgroundColor: getCellColor(i, j),
                                    position: 'relative'
                                  }}
                                >
                                  {cell === 0 && i !== j ? "" : cell}
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
                    <h3 className="array-title">Optimal Parenthesization</h3>
                    <div className="result-container">
                      {stepData.showResult ? (
                        stepData.currentChain || "Calculating..."
                      ) : "Will be shown during traceback"}
                    </div>
                    {stepData.dp[0] && stepData.dp[0][dimensions.length - 2] > 0 && stepData.showResult && (
                      <div className="min-multiplications">
                        Minimum multiplications: <strong>{stepData.dp[0][dimensions.length - 2]}</strong>
                      </div>
                    )}
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
                  <span className="legend-text">Current Trace Cell</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Left Split</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Right Split</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixChainMultiplication;