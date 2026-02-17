import React, { useState, useEffect } from "react";
import "./AssignmentProblem.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(level, assigned, cost, bound, parent = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.level = level;
    this.assigned = [...assigned];
    this.cost = cost;
    this.bound = bound;
    this.parent = parent;
    this.children = [];
    this.isPruned = false;
    this.isBestPath = false;
    this.isExplored = false;
    this.x = 0;
    this.y = 0;
  }
}

const AssignmentProblem = () => {
  const [inputN, setInputN] = useState("3");
  const [n, setN] = useState(3);
  const [costMatrix, setCostMatrix] = useState([
    [9, 2, 7],
    [6, 4, 3],
    [5, 8, 1],
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const generateCostMatrix = (size) => {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.floor(Math.random() * 10) + 1);
      }
      matrix.push(row);
    }
    return matrix;
  };

  const handleMatrixChange = (i, j, value) => {
    const newMatrix = costMatrix.map((row) => [...row]);
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      newMatrix[i][j] = num;
      setCostMatrix(newMatrix);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedN = parseInt(inputN);
    if (!isNaN(parsedN) && parsedN > 0 && parsedN <= 5) {
      const newMatrix = generateCostMatrix(parsedN);
      setN(parsedN);
      setCostMatrix(newMatrix);
      setCurrentStep(0);
      setIsPlaying(false);
      setExpandedNodes(new Set());
    }
  };

  const getLowerBoundDetailsWithMatrix = (node, matrix, size) => {
    const available = new Set();
    for (let j = 0; j < size; j++) {
      available.add(j);
    }
    node.assigned.forEach((job) => available.delete(job));

    const details = [];
    const highlightedCells = [];
    const selectedCells = [];
    const excludedRows = [];
    const excludedCols = [];
    let bound = node.cost;

    for (let i = 0; i < node.level; i++) {
      excludedRows.push(i);
      if (node.assigned[i] !== undefined) {
        excludedCols.push(node.assigned[i]);
      }
    }

    for (let i = node.level; i < size; i++) {
      let minCost = Infinity;
      let minJob = -1;

      const rowCells = [];
      for (let job of available) {
        rowCells.push({ row: i, col: job });
        if (matrix[i] && matrix[i][job] !== undefined && matrix[i][job] < minCost) {
          minCost = matrix[i][job];
          minJob = job;
        }
      }

      if (minCost !== Infinity) {
        highlightedCells.push(...rowCells);
        selectedCells.push({ row: i, col: minJob, value: minCost });
        details.push(`Person ${i} → min cost ${minCost} (Job ${minJob})`);
        bound += minCost;
      }
    }

    return {
      bound,
      details,
      highlightedCells,
      selectedCells,
      excludedRows,
      excludedCols,
    };
  };

  useEffect(() => {
    if (costMatrix.length === n && costMatrix[0] && costMatrix[0].length === n) {
      const { generatedSteps, generatedRoot } = generateSteps(costMatrix, n);
      setSteps(generatedSteps);
      setRoot(generatedRoot);
      setTotalSteps(generatedSteps.length);
      setExpandedNodes(new Set());
      if (generatedRoot) {
        positionTree(generatedRoot, 600, 50, 180, 120);
      }
    }
  }, [costMatrix, n]);

  const getAllNodeIds = (root) => {
    const ids = new Set();
    const traverse = (node) => {
      ids.add(node.id);
      node.children.forEach((child) => traverse(child));
    };
    if (root) traverse(root);
    return ids;
  };

  const countPrunedNodes = (root) => {
    let count = 0;
    const traverse = (node) => {
      if (node.isPruned) count++;
      node.children.forEach((child) => traverse(child));
    };
    if (root) traverse(root);
    return count;
  };

  const generateSteps = (matrix, size) => {
    const generatedSteps = [];
    let bestCost = Infinity;
    let bestAssignment = [];
    let nodesExplored = 0;

    const generatedRoot = new Node(0, [], 0, 0);
    const rootBoundDetails = getLowerBoundDetailsWithMatrix(
      generatedRoot,
      matrix,
      size,
    );
    generatedRoot.bound = rootBoundDetails.bound;

    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting Branch and Bound. Calculating root lower bound...`,
      code: "Start",
      bestCost: Infinity,
      bestAssignment: [],
      nodesExplored: 0,
      nodesPruned: 0,
      expandedNodes: new Set([generatedRoot.id]),
      boundDetails: rootBoundDetails.details,
      matrixHighlight: rootBoundDetails,
    });

    const liveNodes = [generatedRoot];

    while (liveNodes.length > 0) {
      // Find node with minimum bound
      let minBound = Infinity;
      let minIndex = -1;
      for (let i = 0; i < liveNodes.length; i++) {
        if (liveNodes[i].bound < minBound) {
          minBound = liveNodes[i].bound;
          minIndex = i;
        }
      }

      const current = liveNodes.splice(minIndex, 1)[0];
      current.isExplored = true;
      nodesExplored++;

      const newExpandedSet = new Set(
        generatedSteps[generatedSteps.length - 1].expandedNodes,
      );
      newExpandedSet.add(current.id);

      generatedSteps.push({
        nodeId: current.id,
        action: `Selected node with lowest bound (${current.bound}). Level: ${current.level}, Assignment: [${current.assigned.join(", ") || "empty"}], Cost: ${current.cost}`,
        code: "Explore",
        bestCost,
        bestAssignment: [...bestAssignment],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
        matrixHighlight: null,
      });

      if (current.bound >= bestCost) {
        current.isPruned = true;
        generatedSteps.push({
          nodeId: current.id,
          action: `Pruning node. Bound ${current.bound} >= Best Cost ${bestCost}.`,
          code: "Prune",
          bestCost,
          bestAssignment: [...bestAssignment],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(newExpandedSet),
          boundDetails: [],
          matrixHighlight: null,
        });
        continue;
      }

      if (current.level === size) {
        if (current.cost < bestCost) {
          bestCost = current.cost;
          bestAssignment = [...current.assigned];
          generatedSteps.push({
            nodeId: current.id,
            action: `Reached leaf node. New best solution! Cost: ${bestCost}`,
            code: "Solution",
            bestCost,
            bestAssignment: [...bestAssignment],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(newExpandedSet),
            boundDetails: [],
            matrixHighlight: null,
          });
        }
        continue;
      }

      const available = new Set();
      for (let j = 0; j < size; j++) {
        available.add(j);
      }
      current.assigned.forEach((job) => available.delete(job));

      generatedSteps.push({
        nodeId: current.id,
        action: `Expanding node. Available jobs: [${Array.from(available).join(", ")}]. Creating children...`,
        code: "Expand",
        bestCost,
        bestAssignment: [...bestAssignment],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
        matrixHighlight: null,
      });

      for (let job of available) {
        const newAssigned = [...current.assigned, job];
        const newCost = current.cost + matrix[current.level][job];
        const child = new Node(
          current.level + 1,
          newAssigned,
          newCost,
          0,
          current,
        );
        const childBoundDetails = getLowerBoundDetailsWithMatrix(
          child,
          matrix,
          size,
        );
        child.bound = childBoundDetails.bound;
        current.children.push(child);

        const childExpandedSet = new Set(newExpandedSet);
        childExpandedSet.add(child.id);

        generatedSteps.push({
          nodeId: child.id,
          action: `Created child: Person ${current.level} → Job ${job}. Cost: ${newCost}. Calculating lower bound...`,
          code: "Create",
          bestCost,
          bestAssignment: [...bestAssignment],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(childExpandedSet),
          boundDetails: childBoundDetails.details,
          matrixHighlight: childBoundDetails,
        });

        if (child.bound < bestCost) {
          liveNodes.push(child);
          generatedSteps.push({
            nodeId: child.id,
            action: `Bound ${child.bound} < Best Cost ${bestCost}. Child added to live nodes.`,
            code: "Enqueue",
            bestCost,
            bestAssignment: [...bestAssignment],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(childExpandedSet),
            boundDetails: [],
            matrixHighlight: null,
          });
        } else {
          child.isPruned = true;
          generatedSteps.push({
            nodeId: child.id,
            action: `Child pruned. Bound ${child.bound} >= Best Cost ${bestCost}.`,
            code: "Prune",
            bestCost,
            bestAssignment: [...bestAssignment],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(childExpandedSet),
            boundDetails: [],
            matrixHighlight: null,
          });
        }
      }
    }

    const markBestPath = (node) => {
      if (node.level === size && node.cost === bestCost && !node.isPruned) {
        let current = node;
        while (current) {
          current.isBestPath = true;
          current = current.parent;
        }
      }
      node.children.forEach((child) => markBestPath(child));
    };
    markBestPath(generatedRoot);

    generatedSteps.push({
      nodeId: null,
      action: `Branch and Bound complete. Optimal Cost: ${bestCost}`,
      code: "Complete",
      bestCost,
      bestAssignment: [...bestAssignment],
      nodesExplored,
      nodesPruned: countPrunedNodes(generatedRoot),
      expandedNodes: getAllNodeIds(generatedRoot),
      boundDetails: [],
      matrixHighlight: null,
    });

    return { generatedSteps, generatedRoot };
  };

  const positionTree = (node, x = 0, y = 0, dx = 180, dy = 120) => {
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
        action: "Click Start to begin",
        code: "Start",
        currentNode: root,
        bestCost: Infinity,
        bestAssignment: [],
        nodesExplored: 0,
        nodesPruned: 0,
        expandedNodes: new Set(),
        boundDetails: [],
        matrixHighlight: null,
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
      if (steps[currentStep + 1]?.expandedNodes) {
        setExpandedNodes(steps[currentStep + 1].expandedNodes);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (steps[currentStep - 1]?.expandedNodes) {
        setExpandedNodes(steps[currentStep - 1].expandedNodes);
      }
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (steps[0]?.expandedNodes) {
      setExpandedNodes(steps[0].expandedNodes);
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
          if (steps[nextStep]?.expandedNodes) {
            setExpandedNodes(steps[nextStep].expandedNodes);
          }
          return nextStep;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed, steps]);

  const getNodeFill = (node) => {
    if (stepData.currentNode && stepData.currentNode.id === node.id) {
      return "#3b82f6";
    }
    if (node.isBestPath) {
      return "#10b981";
    }
    if (node.isPruned) {
      return "#ef4444";
    }
    if (expandedNodes.has(node.id)) {
      return "#f3f4f6";
    }
    return "white";
  };

  const getCellClass = (i, j) => {
    if (!stepData.matrixHighlight) return "";

    const { excludedRows, excludedCols, highlightedCells, selectedCells } =
      stepData.matrixHighlight;

    if (excludedRows.includes(i)) return "ap-excluded-cell";
    if (excludedCols.includes(j)) return "ap-excluded-cell";

    const isSelected = selectedCells.some(
      (cell) => cell.row === i && cell.col === j,
    );
    if (isSelected) return "ap-selected-cell";

    const isHighlighted = highlightedCells.some(
      (cell) => cell.row === i && cell.col === j,
    );
    if (isHighlighted) return "ap-highlighted-cell";

    return "";
  };

  const renderTree = () => {
    if (!root) return null;

    const lines = [];
    const nodes = [];

    const traverse = (node) => {
      if (!expandedNodes.has(node.id) && node !== root) return;

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
            y={node.y - 12}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            C:{node.cost}
          </text>
          <text
            x={node.x}
            y={node.y + 2}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            B:{node.bound}
          </text>
          <text
            x={node.x}
            y={node.y + 16}
            textAnchor="middle"
            fontSize={9}
            fill="#1f2937"
          >
            L:{node.level}
          </text>
          <text
            x={node.x}
            y={node.y + 28}
            textAnchor="middle"
            fontSize={8}
            fill="#1f2937"
          >
            [{node.assigned.join(",")}]
          </text>
        </g>,
      );

      node.children.forEach((child) => {
        if (!expandedNodes.has(child.id)) return;

        lines.push(
          <line
            key={`${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y + 35}
            x2={child.x}
            y2={child.y - 35}
            stroke={
              child.isPruned
                ? "#ef4444"
                : child.isBestPath
                  ? "#10b981"
                  : "#1f2937"
            }
            strokeWidth={child.isBestPath ? 3 : 1}
            strokeDasharray={child.isPruned ? "5,5" : "none"}
          />,
        );
        traverse(child);
      });
    };

    traverse(root);

    const bounds = getTreeBounds(root, expandedNodes);
    const width = bounds.maxX - bounds.minX + 200;
    const height = bounds.maxY - bounds.minY + 200;
    const viewBox = `${bounds.minX - 100} ${bounds.minY - 100} ${width} ${height}`;

    return (
      <svg
        viewBox={viewBox}
        style={{ width: "100%", height: "auto", minHeight: "700px" }}
      >
        {lines}
        {nodes}
      </svg>
    );
  };

  const getTreeBounds = (
    node,
    expandedSet,
    bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    },
  ) => {
    if (expandedSet.has(node.id) || node === root) {
      bounds.minX = Math.min(bounds.minX, node.x);
      bounds.maxX = Math.max(bounds.maxX, node.x);
      bounds.minY = Math.min(bounds.minY, node.y);
      bounds.maxY = Math.max(bounds.maxY, node.y);

      node.children.forEach((child) => {
        if (expandedSet.has(child.id)) {
          getTreeBounds(child, expandedSet, bounds);
        }
      });
    }
    return bounds;
  };

  const algorithm = `function branchAndBoundAssignment(costMatrix, n) {
  let bestCost = Infinity;
  let bestAssignment = [];
  
  const root = new Node(0, [], 0, 0);
  root.bound = calculateBound(root, costMatrix, n);
  
  const liveNodes = [root];
  
  while (liveNodes.length > 0) {
    // Select node with minimum bound
    let current = findMinBoundNode(liveNodes);
    
    if (current.bound >= bestCost) {
      continue; // Prune
    }
    
    if (current.level === n) {
      if (current.cost < bestCost) {
        bestCost = current.cost;
        bestAssignment = current.assigned;
      }
      continue;
    }
    
    // Create children for available jobs
    for (let job of getAvailableJobs(current, n)) {
      const child = new Node(
        current.level + 1,
        [...current.assigned, job],
        current.cost + costMatrix[current.level][job],
        0
      );
      child.bound = calculateBound(child, costMatrix, n);
      
      if (child.bound < bestCost) {
        liveNodes.push(child);
      }
    }
  }
  
  return { bestCost, bestAssignment };
}

function calculateBound(node, matrix, n) {
  let bound = node.cost;
  const available = getAvailableJobs(node, n);
  
  for (let i = node.level; i < n; i++) {
    let minCost = Infinity;
    for (let job of available) {
      minCost = Math.min(minCost, matrix[i][job]);
    }
    bound += minCost;
  }
  
  return bound;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (stepData.code === "Start" && line.includes("const liveNodes = [root]")) {
        highlight = true;
      }
      if (
        stepData.code === "Explore" &&
        line.includes("let current = findMinBoundNode")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Prune" &&
        line.includes("current.bound >= bestCost")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Solution" &&
        line.includes("bestCost = current.cost")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Create" &&
        line.includes("const child = new Node")
      ) {
        highlight = true;
      }
      if (stepData.code === "Enqueue" && line.includes("liveNodes.push(child)")) {
        highlight = true;
      }
      if (
        stepData.code === "Expand" &&
        line.includes("for (let job of getAvailableJobs")
      ) {
        highlight = true;
      }
      if (stepData.code === "Complete" && line.includes("return { bestCost")) {
        highlight = true;
      }
      return (
        <div
          key={index}
          className={highlight ? "ap-highlighted-line" : "ap-code-line"}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="ap-container">
      <div className="ap-max-width">
        <div className="ap-header">
          <h1 className="ap-title">Assignment Problem</h1>
        </div>
        <div className="ap-main-grid">
          <div className="ap-left-column">
            <div className="ap-card">
              <h2 className="ap-card-title">About Assignment Problem</h2>
              <p className="ap-card-content">
                The <strong>Assignment Problem</strong> is a fundamental
                combinatorial optimization problem where n persons must be
                assigned to n jobs, minimizing total cost. Branch and Bound
                explores the state space tree systematically, using lower bounds
                to prune branches that cannot lead to better solutions. Each
                level represents assigning one person to an available job.
              </p>
              <div className="ap-complexity-grid">
                <div className="ap-complexity-card ap-blue-card">
                  <h3 className="ap-complexity-title ap-blue-title">
                    Time Complexity
                  </h3>
                  <ul className="ap-complexity-list ap-blue-text">
                    <li>Brute Force: O(n!)</li>
                    <li>Branch & Bound: O(n! × n) worst-case</li>
                    <li>Hungarian Algorithm: O(n³)</li>
                  </ul>
                </div>
                <div className="ap-complexity-card ap-green-card">
                  <h3 className="ap-complexity-title ap-green-title">
                    Space Complexity
                  </h3>
                  <ul className="ap-complexity-list ap-green-text">
                    <li>Live Nodes: O(n!)</li>
                    <li>Tree Storage: O(n × n!)</li>
                  </ul>
                </div>
              </div>
              <div
                className="ap-complexity-card ap-yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="ap-complexity-title ap-yellow-title">
                  Key Characteristics
                </h3>
                <ul className="ap-characteristics-list ap-yellow-text">
                  <li>• Min-cost bipartite matching</li>
                  <li>• Uses lower bound pruning</li>
                  <li>• Selects minimum bound node</li>
                  <li>• Guaranteed optimal solution</li>
                  <li>• Used in resource allocation</li>
                </ul>
              </div>
            </div>

            <div className="ap-card">
              <h2 className="ap-card-title">Input</h2>
              <form onSubmit={handleSubmit} className="ap-input-form">
                <div className="ap-input-group">
                  <label htmlFor="n">Number of Persons/Jobs (n):</label>
                  <input
                    type="text"
                    id="n"
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    placeholder="Enter n (max 5)"
                  />
                </div>
                <button type="submit" className="ap-submit-button">
                  Generate Matrix
                </button>
              </form>
              <div style={{ marginTop: "20px" }}>
                <h3 className="ap-array-title">
                  Cost Matrix ({n}×{n})
                </h3>
                <div className="ap-matrix-container">
                  <table className="ap-cost-matrix">
                    <thead>
                      <tr>
                        <th></th>
                        {Array.from({ length: n }, (_, j) => (
                          <th key={j}>J{j}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {costMatrix.map((row, i) => (
                        <tr key={i}>
                          <td className="ap-row-header">P{i}</td>
                          {row.map((cell, j) => (
                            <td key={j}>
                              <input
                                type="number"
                                value={cell}
                                onChange={(e) =>
                                  handleMatrixChange(i, j, e.target.value)
                                }
                                className="ap-matrix-input"
                                min="0"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="ap-code-visualization-grid">
              <div className="ap-card">
                <h2 className="ap-card-title">Algorithm Code</h2>
                <div className="ap-code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              <div className="ap-card">
                <h2 className="ap-card-title">Visualization</h2>
                <div className="ap-visualization-area">
                  {stepData.matrixHighlight && (
                    <div className="ap-bound-matrix-section">
                      <h3 className="ap-array-title">
                        Lower Bound Calculation - Cost Matrix
                      </h3>
                      <div className="ap-bound-matrix-container">
                        <table className="ap-bound-matrix">
                          <thead>
                            <tr>
                              <th></th>
                              {Array.from({ length: n }, (_, j) => (
                                <th key={j}>J{j}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {costMatrix.map((row, i) => (
                              <tr key={i}>
                                <td className="ap-bound-row-header">P{i}</td>
                                {row.map((cell, j) => (
                                  <td key={j} className={getCellClass(i, j)}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="ap-matrix-legend">
                        <span>
                          <span className="ap-legend-box ap-excluded-box"></span>{" "}
                          Excluded (assigned)
                        </span>
                        <span>
                          <span className="ap-legend-box ap-highlighted-box"></span>{" "}
                          Available
                        </span>
                        <span>
                          <span className="ap-legend-box ap-selected-box"></span>{" "}
                          Min selected
                        </span>
                      </div>
                    </div>
                  )}

                  {stepData.boundDetails &&
                    stepData.boundDetails.length > 0 && (
                      <div className="ap-bound-details-section">
                        <h3 className="ap-array-title">
                          Lower Bound Calculation Steps
                        </h3>
                        <div className="ap-bound-details-container">
                          <div className="ap-bound-detail-item">
                            Current Cost: {stepData.currentNode?.cost || 0}
                          </div>
                          {stepData.boundDetails.map((detail, idx) => (
                            <div key={idx} className="ap-bound-detail-item">
                              + {detail}
                            </div>
                          ))}
                          <div className="ap-bound-detail-item ap-bound-total">
                            = Total Bound: {stepData.currentNode?.bound || 0}
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="ap-tree-section">
                    <h3 className="ap-array-title">State Space Tree</h3>
                    <div className="ap-tree-container">{renderTree()}</div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ marginRight: "15px" }}>
                        C = Cost, B = Lower Bound, L = Level
                      </span>
                      <span>[jobs] = Assignments</span>
                    </div>
                  </div>

                  <div className="ap-solutions-section">
                    <h3 className="ap-array-title">Best Solution</h3>
                    <div className="ap-solutions-container">
                      {stepData.bestCost !== Infinity ? (
                        <>
                          <div>
                            <strong>Cost:</strong> {stepData.bestCost}
                          </div>
                          <div>
                            <strong>Assignment:</strong>
                          </div>
                          {stepData.bestAssignment.map((job, person) => (
                            <div key={person} className="ap-assignment-item">
                              Person {person} → Job {job}
                            </div>
                          ))}
                        </>
                      ) : (
                        "Exploring..."
                      )}
                    </div>
                  </div>
                </div>

                <div className="ap-status-grid">
                  <div className="ap-status-card ap-blue-card">
                    <div className="ap-status-label ap-blue-text">
                      Best Cost
                    </div>
                    <div className="ap-status-value ap-blue-title">
                      {stepData.bestCost === Infinity ? "∞" : stepData.bestCost}
                    </div>
                  </div>
                  <div className="ap-status-card ap-green-card">
                    <div className="ap-status-label ap-green-text">
                      Nodes Explored
                    </div>
                    <div className="ap-status-value ap-green-title">
                      {stepData.nodesExplored}
                    </div>
                  </div>
                  <div className="ap-status-card ap-yellow-card">
                    <div className="ap-status-label ap-yellow-text">
                      Nodes Pruned
                    </div>
                    <div className="ap-status-value ap-yellow-title">
                      {stepData.nodesPruned}
                    </div>
                  </div>
                  <div className="ap-status-card ap-purple-card">
                    <div className="ap-status-label ap-purple-text">Steps</div>
                    <div className="ap-status-value ap-purple-title">
                      {currentStep + 1} / {totalSteps}
                    </div>
                  </div>
                </div>

                <div className="ap-action-container">
                  <div className="ap-action-label">Current Action:</div>
                  <div className="ap-action-text">{stepData.action}</div>
                </div>

                <div className="ap-controls-container">
                  <div className="ap-speed-control">
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
                    className={`ap-control-button ap-gray-button ${
                      currentStep === 0 ? "ap-disabled-button" : ""
                    }`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`ap-control-button ap-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ap-disabled-button"
                        : ""
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`ap-control-button ap-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ap-disabled-button"
                        : ""
                    }`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="ap-control-button ap-red-button"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="ap-card">
              <h2 className="ap-card-title">Color Legend</h2>
              <div className="ap-legend-grid">
                <div className="ap-legend-item">
                  <div
                    className="ap-legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="ap-legend-text">Current Node</span>
                </div>
                <div className="ap-legend-item">
                  <div
                    className="ap-legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="ap-legend-text">Best Path</span>
                </div>
                <div className="ap-legend-item">
                  <div
                    className="ap-legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="ap-legend-text">Pruned Node</span>
                </div>
                <div className="ap-legend-item">
                  <div
                    className="ap-legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="ap-legend-text">Expanded Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentProblem;