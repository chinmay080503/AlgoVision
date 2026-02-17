import React, { useState, useEffect } from "react";
import "./StringPermutation.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(index, currentStr, remaining, decision) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.index = index;
    this.currentStr = currentStr;
    this.remaining = remaining;
    this.decision = decision;
    this.children = [];
    this.isSolution = false;
    this.createdAt = 0;
    this.x = 0;
    this.y = 0;
  }
}

const StringPermutation = () => {
  const [inputString, setInputString] = useState("ABC");
  const [originalString, setOriginalString] = useState("ABC");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);
  const [solutions, setSolutions] = useState([]);
  const [visibleNodes, setVisibleNodes] = useState(new Set());
  const [visibleBranches, setVisibleBranches] = useState(new Set());

  useEffect(() => {
    const { generatedSteps, generatedRoot, generatedSolutions } =
      generateSteps(originalString);
    setSteps(generatedSteps);
    setRoot(generatedRoot);
    setSolutions(generatedSolutions);
    setTotalSteps(generatedSteps.length);
    setVisibleNodes(new Set());
    setVisibleBranches(new Set());
    if (generatedRoot) {
      positionTree(generatedRoot, 600, 50, 200, 100);
    }
  }, [originalString]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedString = inputString.trim().toUpperCase();
    if (parsedString.length > 0 && parsedString.length <= 6) {
      setOriginalString(parsedString);
      setCurrentStep(0);
      setIsPlaying(false);
      setVisibleNodes(new Set());
      setVisibleBranches(new Set());
    }
  };

  const generateSteps = (str) => {
    const generatedSteps = [];
    const generatedSolutions = [];
    const chars = str.split("");

    const generatedRoot = new Node(0, "", chars.join(""), null);
    generatedRoot.createdAt = 0;

    // Initial step - only root visible
    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting permutation generation for "${str}"`,
      code: "Start backtrack",
      solutions: [...generatedSolutions],
      visibleNodes: new Set([generatedRoot.id]),
      visibleBranches: new Set(),
      lastCreatedBranch: null,
    });

    let stepCounter = 1;

    function buildTree(node, visibleSet, visibleBranchSet) {
      if (node.remaining.length === 0) {
        node.isSolution = true;
        generatedSolutions.push(node.currentStr);

        const newVisibleSet = new Set([...visibleSet, node.id]);
        generatedSteps.push({
          nodeId: node.id,
          action: `Found permutation: "${node.currentStr}"`,
          code: "Found solution",
          solutions: [...generatedSolutions],
          visibleNodes: newVisibleSet,
          visibleBranches: new Set(visibleBranchSet),
          lastCreatedBranch: null,
        });
        return;
      }

      // Step 1: Show current node state
      generatedSteps.push({
        nodeId: node.id,
        action: `At depth ${node.index}, current: "${node.currentStr}", remaining: "${node.remaining}"`,
        code: "Enter backtrack",
        solutions: [...generatedSolutions],
        visibleNodes: new Set(visibleSet),
        visibleBranches: new Set(visibleBranchSet),
        lastCreatedBranch: null,
      });

      // Generate branches for each remaining character
      const remainingChars = node.remaining.split("");

      remainingChars.forEach((char, idx) => {
        const newCurrent = node.currentStr + char;
        const newRemaining = remainingChars
          .filter((_, i) => i !== idx)
          .join("");
        const child = new Node(node.index + 1, newCurrent, newRemaining, char);
        child.createdAt = stepCounter++;
        node.children.push(child);

        // Step 2: Show branch being created
        const branchVisibleSet = new Set(visibleSet);
        branchVisibleSet.add(child.id);

        const branchSet = new Set(visibleBranchSet);
        branchSet.add(`${node.id}-${child.id}`);

        generatedSteps.push({
          nodeId: child.id,
          action: `Choosing '${char}'. New current: "${newCurrent}", remaining: "${newRemaining}"`,
          code: "Choose",
          solutions: [...generatedSolutions],
          visibleNodes: branchVisibleSet,
          visibleBranches: branchSet,
          lastCreatedBranch: { from: node.id, to: child.id, decision: char },
        });

        // Recursively build subtree
        buildTree(child, branchVisibleSet, branchSet);
      });

      // Backtrack step
      generatedSteps.push({
        nodeId: node.id,
        action: `Backtracking from depth ${node.index}`,
        code: "Backtrack",
        solutions: [...generatedSolutions],
        visibleNodes: new Set(visibleSet),
        visibleBranches: new Set(visibleBranchSet),
        lastCreatedBranch: null,
      });
    }

    buildTree(generatedRoot, new Set([generatedRoot.id]), new Set());

    // Mark solution paths
    const markSolutionPath = (node) => {
      if (node.isSolution) {
        let current = node;
        while (current) {
          current.isOnSolutionPath = true;
          current = current.parent;
        }
      }
      node.children.forEach((child) => {
        child.parent = node;
        markSolutionPath(child);
      });
    };
    markSolutionPath(generatedRoot);

    // Final step
    generatedSteps.push({
      nodeId: null,
      action: `Permutation generation complete. Found ${generatedSolutions.length} permutations.`,
      code: "Complete",
      solutions: [...generatedSolutions],
      visibleNodes: new Set(),
      visibleBranches: new Set(),
      lastCreatedBranch: null,
    });

    return { generatedSteps, generatedRoot, generatedSolutions };
  };

  const positionTree = (node, x = 0, y = 0, dx = 200, dy = 100) => {
    node.x = x;
    node.y = y;

    const numChildren = node.children.length;
    if (numChildren === 0) return;

    const totalWidth = (numChildren - 1) * dx;
    const startX = x - totalWidth / 2;

    node.children.forEach((child, idx) => {
      const childX = startX + idx * dx;
      positionTree(child, childX, y + dy, dx * 0.65, dy);
    });
  };

  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    for (let child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0 || !root) {
      return {
        originalString,
        action: "Click Next to start permutation generation",
        code: "Start backtrack",
        currentNode: root,
        solutions: [],
        visibleNodes: new Set(),
        visibleBranches: new Set(),
        lastCreatedBranch: null,
      };
    }
    const step = steps[Math.min(currentStep, steps.length - 1)];
    return {
      ...step,
      currentNode: step.nodeId ? findNodeById(root, step.nodeId) : null,
    };
  };

  const stepData = getCurrentStepData();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (steps[currentStep + 1]?.visibleNodes) {
        setVisibleNodes(steps[currentStep + 1].visibleNodes);
      }
      if (steps[currentStep + 1]?.visibleBranches) {
        setVisibleBranches(steps[currentStep + 1].visibleBranches);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (steps[currentStep - 1]?.visibleNodes) {
        setVisibleNodes(steps[currentStep - 1].visibleNodes);
      }
      if (steps[currentStep - 1]?.visibleBranches) {
        setVisibleBranches(steps[currentStep - 1].visibleBranches);
      }
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (steps[0]?.visibleNodes) {
      setVisibleNodes(steps[0].visibleNodes);
    }
    if (steps[0]?.visibleBranches) {
      setVisibleBranches(steps[0].visibleBranches);
    }
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
          const nextStep = prev + 1;
          if (steps[nextStep]?.visibleNodes) {
            setVisibleNodes(steps[nextStep].visibleNodes);
          }
          if (steps[nextStep]?.visibleBranches) {
            setVisibleBranches(steps[nextStep].visibleBranches);
          }
          return nextStep;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed, steps]);

  const getNodeFill = (node) => {
    if (stepData.currentNode && stepData.currentNode.id === node.id) {
      return "#3b82f6"; // Blue for current node
    }
    if (node.isSolution || node.isOnSolutionPath) {
      return "#10b981"; // Green for solution
    }
    if (visibleNodes.has(node.id)) {
      return "#f3f4f6"; // Light gray for visible nodes
    }
    return "white";
  };

  const renderTree = () => {
    if (!root) return null;

    const lines = [];
    const labels = [];
    const nodes = [];

    const traverse = (node) => {
      if (!visibleNodes.has(node.id) && node !== root) return;

      const isSolution = node.isSolution || node.isOnSolutionPath;

      nodes.push(
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={35}
            fill={getNodeFill(node)}
            stroke="#1f2937"
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y - 8}
            textAnchor="middle"
            fontSize={12}
            fill={isSolution ? "white" : "#1f2937"}
            fontWeight="bold"
          >
            Curr: {node.currentStr || '" "'}
          </text>
          <text
            x={node.x}
            y={node.y + 10}
            textAnchor="middle"
            fontSize={10}
            fill={isSolution ? "white" : "#1f2937"}
          >
            Rem: {node.remaining || '""'}
          </text>
        </g>,
      );

      node.children.forEach((child) => {
        const branchId = `${node.id}-${child.id}`;

        if (!visibleBranches.has(branchId)) return;

        const lineColor = "#1f2937";
        const lineWidth = 1.5;

        lines.push(
          <line
            key={`${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y + 35}
            x2={child.x}
            y2={child.y - 35}
            stroke={lineColor}
            strokeWidth={lineWidth}
          />,
        );

        const midX = (node.x + child.x) / 2;
        const midY = (node.y + child.y) / 2;

        // If nodes are vertically aligned (similar x coordinates)
        if (Math.abs(node.x - child.x) < 10) {
          // Place label to the right for vertical lines
          labels.push(
            <text
              key={`${node.id}-${child.id}-label`}
              x={midX + 25}
              y={midY - 5}
              fontSize={11}
              fill="#000000"
              textAnchor="start"
              dominantBaseline="middle"
              fontWeight="bold"
              style={{
                backgroundColor: "white",
                paintOrder: "stroke",
                stroke: "white",
                strokeWidth: "2px",
              }}
            >
              {child.decision}
            </text>,
          );
        } else {
          // For diagonal lines, place above
          labels.push(
            <text
              key={`${node.id}-${child.id}-label`}
              x={midX}
              y={midY - 15}
              fontSize={11}
              fill="#000000"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
              style={{
                backgroundColor: "white",
                paintOrder: "stroke",
                stroke: "white",
                strokeWidth: "2px",
              }}
            >
              {child.decision}
            </text>,
          );
        }

        traverse(child);
      });
    };

    traverse(root);

    const bounds = getTreeBounds(root, visibleNodes);
    const width = bounds.maxX - bounds.minX + 200;
    const height = bounds.maxY - bounds.minY + 200;
    const viewBox = `${bounds.minX - 100} ${bounds.minY - 100} ${width} ${height}`;

    return (
      <svg
        viewBox={viewBox}
        style={{ width: "100%", height: "auto", minHeight: "600px" }}
      >
        {lines}
        {labels}
        {nodes}
      </svg>
    );
  };

  const getTreeBounds = (
    node,
    visibleSet,
    bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  ) => {
    if (visibleSet.has(node.id) || node === root) {
      bounds.minX = Math.min(bounds.minX, node.x);
      bounds.maxX = Math.max(bounds.maxX, node.x);
      bounds.minY = Math.min(bounds.minY, node.y);
      bounds.maxY = Math.max(bounds.maxY, node.y);

      node.children.forEach((child) => {
        if (visibleSet.has(child.id)) {
          getTreeBounds(child, visibleSet, bounds);
        }
      });
    }
    return bounds;
  };

  const algorithm = `function stringPermutation(str) {
  const permutations = [];
  
  function backtrack(current, remaining) {
    // Base case: no remaining characters
    if (remaining.length === 0) {
      permutations.push(current);
      return;
    }
    
    // Try each remaining character
    for (let i = 0; i < remaining.length; i++) {
      // Choose character at index i
      const char = remaining[i];
      const newCurrent = current + char;
      const newRemaining = remaining.slice(0, i) + remaining.slice(i + 1);
      
      // Recurse with updated strings
      backtrack(newCurrent, newRemaining);
    }
  }
  
  backtrack("", str);
  return permutations;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (
        stepData.code === "Start backtrack" &&
        line.includes('backtrack("", str)')
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Enter backtrack" &&
        line.includes("function backtrack")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Found solution" &&
        line.includes("permutations.push")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Choose" &&
        line.includes("const char = remaining[i]")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Backtrack" &&
        line.includes("// Recurse with updated strings")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Complete" &&
        line.includes("return permutations")
      ) {
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
    <div className="sp-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">String Permutation Problem</h1>
        </div>
        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About String Permutation</h2>
              <p className="card-content">
                The <strong>String Permutation</strong> problem generates all
                possible arrangements of characters in a given string. It uses
                backtracking to explore all possibilities, building permutations
                character by character. This is a fundamental combinatorial
                problem with applications in cryptography, pattern matching, and
                generating test cases.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>O(n! × n) for generating all permutations</li>
                    <li>O(n!) unique permutations</li>
                    <li>n = length of string</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>O(n) for recursion stack</li>
                    <li>O(n! × n) to store all permutations</li>
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
                  <li>• Classic backtracking algorithm</li>
                  <li>• State space tree visualization</li>
                  <li>• Each branch chooses a character</li>
                  <li>• n! permutations for n unique chars</li>
                  <li>• Used in combinatorics and optimization</li>
                </ul>
              </div>
            </div>
            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Input</h2>
              <form onSubmit={handleSubmit} className="input-form">
                <div className="input-group">
                  <label htmlFor="string">
                    String (max 6 chars, uppercase):
                  </label>
                  <input
                    type="text"
                    id="string"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Enter string (e.g., ABC)"
                    maxLength="6"
                    pattern="[A-Za-z]+"
                  />
                </div>
                <button type="submit" className="submit-button">
                  Generate Permutations
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
                  {/* Input Display */}
                  <div className="strings-section">
                    <div className="string-container">
                      <div className="string-label">String:</div>
                      <div className="string-value">"{originalString}"</div>
                    </div>
                    <div className="string-container">
                      <div className="string-label">Length:</div>
                      <div className="string-value">
                        {originalString.length}
                      </div>
                    </div>
                  </div>
                  {/* Tree Section */}
                  <div className="tree-section">
                    <h3 className="array-title">State Space Tree</h3>
                    <div className="tree-container">{renderTree()}</div>
                  </div>
                  {/* Solutions Section */}
                  <div className="solutions-section">
                    <h3 className="array-title">All Permutations</h3>
                    <div className="solutions-container">
                      {stepData.solutions.length > 0
                        ? stepData.solutions.map((perm, idx) => (
                            <div key={idx} className="permutation-item">
                              "{perm}"
                            </div>
                          ))
                        : "Generating permutations..."}
                    </div>
                  </div>
                </div>
                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Phase</div>
                    <div className="status-value blue-title">
                      {currentStep === 0
                        ? "Initial"
                        : currentStep < steps.length - 1
                          ? "Exploring"
                          : "Complete"}
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
                  <div className="speed-control">
                    <label>Speed:</label>
                    <select value={speed} onChange={handleSpeedChange}>
                      <option value={500}>Fast</option>
                      <option value={1000}>Medium</option>
                      <option value={1800}>Slow</option>
                    </select>
                  </div>
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
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="legend-text">Optimal Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringPermutation;
