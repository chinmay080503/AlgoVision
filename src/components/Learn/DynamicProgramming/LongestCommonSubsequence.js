import React, { useState, useEffect } from "react";
import "./LongestCommonSubsequence.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

const LongestCommonSubsequence = () => {
  const [inputString1, setInputString1] = useState("ABCDEF");
  const [inputString2, setInputString2] = useState("BCD");
  const [string1, setString1] = useState("ABCDEF");
  const [string2, setString2] = useState("BCD");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);

  useEffect(() => {
    const generatedSteps = generateSteps(string1, string2);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [string1, string2]);

  const handleStringSubmit = (e) => {
    e.preventDefault();
    setString1(inputString1);
    setString2(inputString2);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const generateSteps = (str1, str2) => {
    const steps = [];
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    const direction = Array(m + 1).fill().map(() => Array(n + 1).fill(''));

    // Initial state
    steps.push({
      str1,
      str2,
      dp: JSON.parse(JSON.stringify(dp)),
      direction: JSON.parse(JSON.stringify(direction)),
      i: -1,
      j: -1,
      action: "Initializing DP table for LCS calculation.",
      code: "Initialize DP table",
      lcs: "",
      showLCS: false
    });

    // Fill DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          direction[i][j] = '↖';
          
          steps.push({
            str1,
            str2,
            dp: JSON.parse(JSON.stringify(dp)),
            direction: JSON.parse(JSON.stringify(direction)),
            i,
            j,
            action: `Match found: ${str1[i-1]} at str1[${i-1}] and str2[${j-1}]. DP[${i}][${j}] = DP[${i-1}][${j-1}] + 1 = ${dp[i][j]}`,
            code: "Characters match",
            lcs: "",
            showLCS: false
          });
        } else {
          if (dp[i - 1][j] >= dp[i][j - 1]) {
            dp[i][j] = dp[i - 1][j];
            direction[i][j] = '↑';
            
            steps.push({
              str1,
              str2,
              dp: JSON.parse(JSON.stringify(dp)),
              direction: JSON.parse(JSON.stringify(direction)),
              i,
              j,
              action: `No match. Taking value from top (DP[${i-1}][${j}] = ${dp[i-1][j]})`,
              code: "Take from top",
              lcs: "",
              showLCS: false
            });
          } else {
            dp[i][j] = dp[i][j - 1];
            direction[i][j] = '←';
            
            steps.push({
              str1,
              str2,
              dp: JSON.parse(JSON.stringify(dp)),
              direction: JSON.parse(JSON.stringify(direction)),
              i,
              j,
              action: `No match. Taking value from left (DP[${i}][${j-1}] = ${dp[i][j-1]})`,
              code: "Take from left",
              lcs: "",
              showLCS: false
            });
          }
        }
      }
    }

    // Traceback to find LCS
    let i = m, j = n;
    let lcs = "";
    const traceSteps = [];

    steps.push({
      str1,
      str2,
      dp: JSON.parse(JSON.stringify(dp)),
      direction: JSON.parse(JSON.stringify(direction)),
      i: -1,
      j: -1,
      action: "DP table complete. Starting traceback to find LCS.",
      code: "Start traceback",
      lcs: "",
      showLCS: true
    });

    while (i > 0 && j > 0) {
      if (direction[i][j] === '↖') {
        lcs = str1[i - 1] + lcs;
        traceSteps.push({
          str1,
          str2,
          dp: JSON.parse(JSON.stringify(dp)),
          direction: JSON.parse(JSON.stringify(direction)),
          i,
          j,
          action: `Adding ${str1[i-1]} to LCS. Moving diagonally to DP[${i-1}][${j-1}]`,
          code: "Traceback - diagonal",
          lcs,
          tracing: true,
          showLCS: true
        });
        i--;
        j--;
      } else if (direction[i][j] === '↑') {
        traceSteps.push({
          str1,
          str2,
          dp: JSON.parse(JSON.stringify(dp)),
          direction: JSON.parse(JSON.stringify(direction)),
          i,
          j,
          action: `Moving up to DP[${i-1}][${j}]`,
          code: "Traceback - up",
          lcs,
          tracing: true,
          showLCS: true
        });
        i--;
      } else {
        traceSteps.push({
          str1,
          str2,
          dp: JSON.parse(JSON.stringify(dp)),
          direction: JSON.parse(JSON.stringify(direction)),
          i,
          j,
          action: `Moving left to DP[${i}][${j-1}]`,
          code: "Traceback - left",
          lcs,
          tracing: true,
          showLCS: true
        });
        j--;
      }
    }

    steps.push(...traceSteps);

    steps.push({
      str1,
      str2,
      dp: JSON.parse(JSON.stringify(dp)),
      direction: JSON.parse(JSON.stringify(direction)),
      i: -1,
      j: -1,
      action: `LCS found: ${lcs}`,
      code: "LCS complete",
      lcs,
      showLCS: true
    });

    return steps;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0)
      return {
        str1: string1,
        str2: string2,
        dp: Array(string1.length + 1).fill().map(() => Array(string2.length + 1).fill(0)),
        direction: Array(string1.length + 1).fill().map(() => Array(string2.length + 1).fill('')),
        i: -1,
        j: -1,
        action: "Click Next to start LCS calculation",
        code: "Initialize DP table",
        lcs: "",
        showLCS: false
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
    if (stepData.tracing) {
      if (row === stepData.i && col === stepData.j) {
        return "#f59e0b"; // Orange for current tracing cell
      }
      return "transparent";
    }
    
    if (row === stepData.i && col === stepData.j) {
      return "#3b82f6"; // Blue for current DP cell
    }
    if (row === stepData.i - 1 && col === stepData.j - 1 && stepData.direction[row+1]?.[col+1] === '↖') {
      return "#10b981"; // Green for diagonal reference
    }
    if (row === stepData.i - 1 && col === stepData.j && stepData.direction[row+1]?.[col] === '↑') {
      return "#8b5cf6"; // Purple for top reference
    }
    if (row === stepData.i && col === stepData.j - 1 && stepData.direction[row]?.[col+1] === '←') {
      return "#ef4444"; // Red for left reference
    }
    return "transparent";
  };

  const algorithm = `function longestCommonSubsequence(str1, str2) {
  const m = str1.length, n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  
  // Traceback to find LCS
  let i = m, j = n;
  let lcs = "";
  
  while (i > 0 && j > 0) {
    if (str1[i-1] === str2[j-1]) {
      lcs = str1[i-1] + lcs;
      i--; j--;
    } else if (dp[i-1][j] > dp[i][j-1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");

    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Initialize DP table" && line.includes("const dp = Array")) {
        highlight = true;
      }

      if (stepData.code === "Characters match" && line.includes("dp[i][j] = dp[i-1][j-1] + 1")) {
        highlight = true;
      }

      if ((stepData.code === "Take from top" || stepData.code === "Take from left") && 
          line.includes("dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])")) {
        highlight = true;
      }

      if (stepData.code.includes("Traceback") && line.includes("while (i > 0 && j > 0)")) {
        highlight = true;
      }

      if (stepData.code === "Traceback - diagonal" && line.includes("lcs = str1[i-1] + lcs")) {
        highlight = true;
      }

      if (stepData.code === "LCS complete" && line.includes("return lcs")) {
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
    <div className="lcs-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Longest Common Subsequence</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About LCS</h2>
              <p className="card-content">
                The <strong>Longest Common Subsequence (LCS)</strong> problem is to find the longest subsequence present in given two sequences in the same order, but not necessarily contiguous. It's widely used in bioinformatics (DNA sequence alignment), version control systems (diff utility), and data comparison.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>DP Solution: O(m×n)</li>
                    <li>Space Optimized DP: O(min(m,n))</li>
                    <li>Naive Recursive: O(2<sup>n</sup>)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>DP Solution: O(m×n)</li>
                    <li>Space Optimized DP: O(min(m,n))</li>
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
                  <li>• Solvable in polynomial time</li>
                  <li>• Used in diff tools and version control</li>
                  <li>• Basis for more complex sequence alignment algorithms</li>
                  <li>• Not to be confused with Longest Common Substring</li>
                </ul>
              </div>
            </div>

            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Input Strings</h2>
              <form onSubmit={handleStringSubmit} className="input-form">
                <div className="input-group">
                  <label htmlFor="string1">String 1:</label>
                  <input
                    type="text"
                    id="string1"
                    value={inputString1}
                    onChange={(e) => setInputString1(e.target.value)}
                    placeholder="Enter first string"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="string2">String 2:</label>
                  <input
                    type="text"
                    id="string2"
                    value={inputString2}
                    onChange={(e) => setInputString2(e.target.value)}
                    placeholder="Enter second string"
                  />
                </div>
                <button type="submit" className="submit-button">
                  Calculate LCS
                </button>
              </form>
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
                  {/* Input Strings */}
                  <div className="strings-section">
                    <div className="string-container">
                      <div className="string-label">String 1:</div>
                      <div className="string-value">{string1}</div>
                    </div>
                    <div className="string-container">
                      <div className="string-label">String 2:</div>
                      <div className="string-value">{string2}</div>
                    </div>
                  </div>

                  {/* DP Table */}
                  <div className="dp-table-section">
                    <h3 className="array-title">DP Table</h3>
                    <div className="dp-table-container">
                      <table className="dp-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th></th>
                            {stepData.str2.split('').map((char, j) => (
                              <th key={`header-${j}`}>{char}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stepData.dp.map((row, i) => (
                            <tr key={`row-${i}`}>
                              <td>{i > 0 ? stepData.str1[i-1] : ''}</td>
                              {row.map((cell, j) => (
                                <td 
                                  key={`cell-${i}-${j}`}
                                  style={{ 
                                    backgroundColor: getCellColor(i, j),
                                    position: 'relative'
                                  }}
                                >
                                  {cell}
                                  {stepData.direction[i]?.[j] && (
                                    <div className="direction-arrow">{stepData.direction[i][j]}</div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LCS Result */}
                  <div className="lcs-result-section">
                    <h3 className="array-title">Longest Common Subsequence</h3>
                    <div className="lcs-container">
                      {stepData.showLCS ? (stepData.lcs || "Calculating...") : "Will be shown during traceback"}
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
                  <span className="legend-text">Current Trace Cell</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Diagonal Reference</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#8b5cf6" }}
                  ></div>
                  <span className="legend-text">Top Reference</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="legend-text">Left Reference</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongestCommonSubsequence;