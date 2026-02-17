import React, { useState, useEffect } from "react";
import "./TravellingSalesmanBB.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(level, path, cost, bound, reducedMatrix, parent = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.level = level;
    this.path = [...path];
    this.cost = cost;
    this.bound = bound;
    this.reducedMatrix = reducedMatrix
      ? reducedMatrix.map((row) => [...row])
      : null;
    this.parent = parent;
    this.children = [];
    this.isPruned = false;
    this.isBestPath = false;
    this.isExplored = false;
    this.x = 0;
    this.y = 0;
  }
}

const TravellingSalesmanBB = () => {
  const [inputN, setInputN] = useState("3");
  const [n, setN] = useState(3);
  const [costMatrix, setCostMatrix] = useState([
    [0, 10, 15],
    [10, 0, 35],
    [15, 35, 0],
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [matrixHistory, setMatrixHistory] = useState([]);

  const generateCostMatrix = (size) => {
    const matrix = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        if (i === j) {
          row.push(0);
        } else {
          row.push(Math.floor(Math.random() * 40) + 10);
        }
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
    if (!isNaN(parsedN) && parsedN > 0 && parsedN <= 6) {
      const newMatrix = generateCostMatrix(parsedN);
      setN(parsedN);
      setCostMatrix(newMatrix);
      setCurrentStep(0);
      setIsPlaying(false);
      setExpandedNodes(new Set());
      setMatrixHistory([]);
    }
  };

  const copyMatrix = (matrix) => {
    return matrix.map((row) => [...row]);
  };

  const reduceMatrix = (matrix, size) => {
    let totalReduction = 0;
    const reduced = copyMatrix(matrix);

    // Row reduction
    for (let i = 0; i < size; i++) {
      let minVal = Infinity;
      for (let j = 0; j < size; j++) {
        if (reduced[i][j] !== Infinity && reduced[i][j] < minVal) {
          minVal = reduced[i][j];
        }
      }
      if (minVal !== 0 && minVal !== Infinity) {
        totalReduction += minVal;
        for (let j = 0; j < size; j++) {
          if (reduced[i][j] !== Infinity) {
            reduced[i][j] -= minVal;
          }
        }
      }
    }

    // Column reduction
    for (let j = 0; j < size; j++) {
      let minVal = Infinity;
      for (let i = 0; i < size; i++) {
        if (reduced[i][j] !== Infinity && reduced[i][j] < minVal) {
          minVal = reduced[i][j];
        }
      }
      if (minVal !== 0 && minVal !== Infinity) {
        totalReduction += minVal;
        for (let i = 0; i < size; i++) {
          if (reduced[i][j] !== Infinity) {
            reduced[i][j] -= minVal;
          }
        }
      }
    }

    return { reduced, totalReduction };
  };

  const getReductionDetails = (
    matrix,
    size,
    fromCity = null,
    toCity = null,
  ) => {
    const details = [];
    const rowMinValues = [];
    const colMinValues = [];
    let totalReduction = 0;
    let explanation = [];

    // Track matrix state before reduction
    const beforeMatrix = copyMatrix(matrix);

    // Row reduction details
    for (let i = 0; i < size; i++) {
      let minVal = Infinity;
      for (let j = 0; j < size; j++) {
        if (matrix[i][j] !== Infinity && matrix[i][j] < minVal) {
          minVal = matrix[i][j];
        }
      }
      if (minVal !== 0 && minVal !== Infinity) {
        rowMinValues.push({ row: i, min: minVal });
        totalReduction += minVal;
        details.push(`Row ${i}: subtract ${minVal}`);
        explanation.push(
          `Row ${i} had minimum value ${minVal} - subtracted from all entries`,
        );
      }
    }

    // Apply row reduction
    const afterRowReduction = copyMatrix(matrix);
    rowMinValues.forEach(({ row, min }) => {
      for (let j = 0; j < size; j++) {
        if (afterRowReduction[row][j] !== Infinity) {
          afterRowReduction[row][j] -= min;
        }
      }
    });

    // Column reduction details
    for (let j = 0; j < size; j++) {
      let minVal = Infinity;
      for (let i = 0; i < size; i++) {
        if (
          afterRowReduction[i][j] !== Infinity &&
          afterRowReduction[i][j] < minVal
        ) {
          minVal = afterRowReduction[i][j];
        }
      }
      if (minVal !== 0 && minVal !== Infinity) {
        colMinValues.push({ col: j, min: minVal });
        totalReduction += minVal;
        details.push(`Col ${j}: subtract ${minVal}`);
        explanation.push(
          `Column ${j} had minimum value ${minVal} - subtracted from all entries`,
        );
      }
    }

    // Generate full explanation
    let fullExplanation = "";
    if (fromCity !== null && toCity !== null) {
      fullExplanation = `Matrix after setting edge from ${fromCity} → ${toCity}:`;
      fullExplanation += `\n• Row ${fromCity} and Column ${toCity} set to ∞`;
      fullExplanation += `\n• Cell [${toCity}][${fromCity}] set to ∞ to prevent immediate return`;
      fullExplanation += `\n\nReduction Process:`;
    } else {
      fullExplanation = `Initial Matrix Reduction Process:`;
    }

    if (rowMinValues.length > 0 || colMinValues.length > 0) {
      explanation.forEach((exp, idx) => {
        fullExplanation += `\n${idx + 1}. ${exp}`;
      });
      fullExplanation += `\n\nTotal Reduction Value: ${totalReduction}`;
      fullExplanation += `\nThis reduction value is added to the lower bound.`;
    } else {
      fullExplanation += `\n• No reduction possible - matrix already reduced`;
      fullExplanation += `\n\nTotal Reduction Value: 0`;
    }

    return {
      details,
      totalReduction,
      rowMinValues,
      colMinValues,
      fullExplanation,
      beforeMatrix,
      afterRowReduction,
    };
  };

  useEffect(() => {
    if (
      costMatrix.length === n &&
      costMatrix[0] &&
      costMatrix[0].length === n
    ) {
      const { generatedSteps, generatedRoot } = generateSteps(costMatrix, n);
      setSteps(generatedSteps);
      setRoot(generatedRoot);
      setTotalSteps(generatedSteps.length);
      setExpandedNodes(new Set());
      if (generatedRoot) {
        positionTree(generatedRoot, 600, 50, 200, 120);
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
    let bestPath = [];
    let nodesExplored = 0;

    // Initialize root node
    const initialMatrix = copyMatrix(matrix);
    const { reduced: rootReduced, totalReduction: rootReduction } =
      reduceMatrix(initialMatrix, size);
    const generatedRoot = new Node(0, [0], 0, rootReduction, rootReduced);

    const reductionDetails = getReductionDetails(initialMatrix, size);

    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting Branch and Bound TSP. Root node created with path [0]. Reducing cost matrix...`,
      code: "Start",
      bestCost: Infinity,
      bestPath: [],
      nodesExplored: 0,
      nodesPruned: 0,
      expandedNodes: new Set([generatedRoot.id]),
      reductionDetails: reductionDetails.details,
      matrixExplanation: reductionDetails.fullExplanation,
      currentMatrix: rootReduced,
      matrixType: "reduced",
      fromCity: null,
      toCity: null,
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
        action: `Selected node with lowest bound (${current.bound}). Path: [${current.path.join(" → ")}], Cost: ${current.cost}`,
        code: "Explore",
        bestCost,
        bestPath: [...bestPath],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        reductionDetails: [],
        matrixExplanation: `Current node: Path [${current.path.join(" → ")}], Lower bound: ${current.bound}, Cost: ${current.cost}`,
        currentMatrix: current.reducedMatrix,
        matrixType: "current",
        fromCity: null,
        toCity: null,
      });

      if (current.bound >= bestCost) {
        current.isPruned = true;
        generatedSteps.push({
          nodeId: current.id,
          action: `Pruning node. Bound ${current.bound} ≥ Best Cost ${bestCost}.`,
          code: "Prune",
          bestCost,
          bestPath: [...bestPath],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(newExpandedSet),
          reductionDetails: [],
          matrixExplanation: `Node pruned - bound (${current.bound}) >= current best cost (${bestCost})`,
          currentMatrix: current.reducedMatrix,
          matrixType: "current",
          fromCity: null,
          toCity: null,
        });
        continue;
      }

      // Check if we've visited all cities
      if (current.level === size - 1) {
        // Complete the tour by returning to start
        const lastCity = current.path[current.path.length - 1];
        const returnCost = matrix[lastCity][0];

        if (returnCost !== Infinity) {
          const totalCost = current.cost + returnCost;
          const completePath = [...current.path, 0];

          if (totalCost < bestCost) {
            bestCost = totalCost;
            bestPath = [...completePath];
            generatedSteps.push({
              nodeId: current.id,
              action: `Reached leaf node. Returning to city 0. New best solution! Path: [${completePath.join(" → ")}], Cost: ${totalCost}`,
              code: "Solution",
              bestCost,
              bestPath: [...bestPath],
              nodesExplored,
              nodesPruned: countPrunedNodes(generatedRoot),
              expandedNodes: new Set(newExpandedSet),
              reductionDetails: [],
              matrixExplanation: `Found complete tour! Total cost: ${totalCost}`,
              currentMatrix: current.reducedMatrix,
              matrixType: "current",
              fromCity: null,
              toCity: null,
            });
          }
        }
        continue;
      }

      // Find available cities
      const visited = new Set(current.path);
      const available = [];
      for (let i = 0; i < size; i++) {
        if (!visited.has(i)) {
          available.push(i);
        }
      }

      generatedSteps.push({
        nodeId: current.id,
        action: `Expanding node. Available cities: [${available.join(", ")}]. Creating children...`,
        code: "Expand",
        bestCost,
        bestPath: [...bestPath],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        reductionDetails: [],
        matrixExplanation: `Current path: [${current.path.join(" → ")}], Next possible cities: ${available.join(", ")}`,
        currentMatrix: current.reducedMatrix,
        matrixType: "current",
        fromCity: null,
        toCity: null,
      });

      const lastCity = current.path[current.path.length - 1];

      for (let nextCity of available) {
        const reducedEdgeCost = current.reducedMatrix[lastCity][nextCity];
        const actualEdgeCost = matrix[lastCity][nextCity]; // Get actual cost from original matrix

        if (reducedEdgeCost === Infinity) continue;

        const newPath = [...current.path, nextCity];
        const newCost = current.cost + actualEdgeCost; // Use ACTUAL cost for path cost

        // Create new reduced matrix
        const newMatrix = copyMatrix(current.reducedMatrix);

        // Set row lastCity and column nextCity to infinity
        for (let i = 0; i < size; i++) {
          newMatrix[lastCity][i] = Infinity;
          newMatrix[i][nextCity] = Infinity;
        }
        newMatrix[nextCity][lastCity] = Infinity; // Prevent immediate return

        const { reduced: childReduced, totalReduction: childReduction } =
          reduceMatrix(newMatrix, size);

        // IMPORTANT: Bound = parent bound + ACTUAL edge cost + child reduction
        const childBound = current.bound + actualEdgeCost + childReduction;

        const child = new Node(
          current.level + 1,
          newPath,
          newCost,
          childBound,
          childReduced,
          current,
        );

        current.children.push(child);

        const childExpandedSet = new Set(newExpandedSet);
        childExpandedSet.add(child.id);

        const childReductionDetails = getReductionDetails(
          newMatrix,
          size,
          lastCity,
          nextCity,
        );

        generatedSteps.push({
          nodeId: child.id,
          action: `Created child: ${lastCity} → ${nextCity}. Reduced edge cost: ${reducedEdgeCost}, Actual cost: ${actualEdgeCost}, Reduction: ${childReduction}, Bound: ${current.bound} + ${actualEdgeCost} + ${childReduction} = ${childBound}`,
          code: "Create",
          bestCost,
          bestPath: [...bestPath],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(childExpandedSet),
          reductionDetails: childReductionDetails.details,
          matrixExplanation: childReductionDetails.fullExplanation,
          currentMatrix: childReduced,
          matrixType: "reduced",
          fromCity: lastCity,
          toCity: nextCity,
        });

        if (child.bound < bestCost) {
          liveNodes.push(child);
          generatedSteps.push({
            nodeId: child.id,
            action: `Bound ${child.bound} < Best Cost ${bestCost}. Child added to live nodes.`,
            code: "Enqueue",
            bestCost,
            bestPath: [...bestPath],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(childExpandedSet),
            reductionDetails: [],
            matrixExplanation: `Child node with bound ${child.bound} added to live nodes for exploration`,
            currentMatrix: childReduced,
            matrixType: "reduced",
            fromCity: lastCity,
            toCity: nextCity,
          });
        } else {
          child.isPruned = true;
          generatedSteps.push({
            nodeId: child.id,
            action: `Child pruned. Bound ${child.bound} ≥ Best Cost ${bestCost}.`,
            code: "Prune",
            bestCost,
            bestPath: [...bestPath],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(childExpandedSet),
            reductionDetails: [],
            matrixExplanation: `Child pruned - bound (${child.bound}) >= current best cost (${bestCost})`,
            currentMatrix: childReduced,
            matrixType: "reduced",
            fromCity: lastCity,
            toCity: nextCity,
          });
        }
      }
    }

    const markBestPath = (node) => {
      if (node.level === size - 1 && !node.isPruned) {
        const lastCity = node.path[node.path.length - 1];
        const returnCost = matrix[lastCity][0];
        if (returnCost !== Infinity) {
          const totalCost = node.cost + returnCost;
          if (totalCost === bestCost) {
            let current = node;
            while (current) {
              current.isBestPath = true;
              current = current.parent;
            }
          }
        }
      }
      node.children.forEach((child) => markBestPath(child));
    };
    markBestPath(generatedRoot);

    generatedSteps.push({
      nodeId: null,
      action: `Branch and Bound complete. Optimal Path: [${bestPath.join(" → ")}], Cost: ${bestCost}`,
      code: "Complete",
      bestCost,
      bestPath: [...bestPath],
      nodesExplored,
      nodesPruned: countPrunedNodes(generatedRoot),
      expandedNodes: getAllNodeIds(generatedRoot),
      reductionDetails: [],
      matrixExplanation: `Algorithm complete! Optimal solution found with cost ${bestCost}`,
      currentMatrix: null,
      matrixType: null,
      fromCity: null,
      toCity: null,
    });

    return { generatedSteps, generatedRoot };
  };

  const positionTree = (node, x = 0, y = 0, dx = 200, dy = 120) => {
    node.x = x;
    node.y = y;

    const numChildren = node.children.length;
    if (numChildren === 0) return;

    const totalWidth = (numChildren - 1) * dx;
    const startX = x - totalWidth / 2;

    node.children.forEach((child, idx) => {
      const childX = startX + idx * dx;
      positionTree(child, childX, y + dy, dx * 0.7, dy);
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
        bestPath: [],
        nodesExplored: 0,
        nodesPruned: 0,
        expandedNodes: new Set(),
        reductionDetails: [],
        matrixExplanation: "",
        currentMatrix: null,
        matrixType: null,
        fromCity: null,
        toCity: null,
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
            r={40}
            fill={getNodeFill(node)}
            stroke="#1f2937"
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y - 15}
            textAnchor="middle"
            fontSize={10}
            fill="#1f2937"
            fontWeight="bold"
          >
            C:{node.cost}
          </text>
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            fontSize={10}
            fill="#1f2937"
            fontWeight="bold"
          >
            B:{node.bound}
          </text>
          <text
            x={node.x}
            y={node.y + 15}
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
            [{node.path.join(",")}]
          </text>
        </g>,
      );

      node.children.forEach((child) => {
        if (!expandedNodes.has(child.id)) return;

        lines.push(
          <line
            key={`${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y + 40}
            x2={child.x}
            y2={child.y - 40}
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

  const algorithm = `function branchAndBoundTSP(costMatrix, n) {
  let bestCost = Infinity;
  let bestPath = [];
  
  // Reduce initial matrix and create root
  const { reduced, totalReduction } = reduceMatrix(costMatrix, n);
  const root = new Node(0, [0], 0, totalReduction, reduced);
  
  const liveNodes = [root];
  
  while (liveNodes.length > 0) {
    // Select node with minimum bound
    let current = findMinBoundNode(liveNodes);
    
    if (current.bound >= bestCost) {
      continue; // Prune
    }
    
    // Check if tour is complete
    if (current.level === n - 1) {
      const lastCity = current.path[current.level];
      const returnCost = costMatrix[lastCity][0];
      const totalCost = current.cost + returnCost;
      
      if (totalCost < bestCost) {
        bestCost = totalCost;
        bestPath = [...current.path, 0];
      }
      continue;
    }
    
    // Expand node - create children for unvisited cities
    const lastCity = current.path[current.level];
    const visited = new Set(current.path);
    
    for (let city = 0; city < n; city++) {
      if (visited.has(city)) continue;
      
      const edgeCost = current.reducedMatrix[lastCity][city];
      if (edgeCost === Infinity) continue;
      
      // Create new matrix and reduce
      const newMatrix = createChildMatrix(
        current.reducedMatrix, lastCity, city, n
      );
      const { reduced, totalReduction } = reduceMatrix(newMatrix, n);
      
      const child = new Node(
        current.level + 1,
        [...current.path, city],
        current.cost + costMatrix[lastCity][city],
        current.bound + edgeCost + totalReduction,
        reduced
      );
      
      if (child.bound < bestCost) {
        liveNodes.push(child);
      }
    }
  }
  
  return { bestCost, bestPath };
}

function reduceMatrix(matrix, n) {
  let totalReduction = 0;
  const reduced = copyMatrix(matrix);
  
  // Row reduction
  for (let i = 0; i < n; i++) {
    let min = Math.min(...reduced[i].filter(v => v !== Infinity));
    if (min !== 0 && min !== Infinity) {
      totalReduction += min;
      for (let j = 0; j < n; j++) {
        if (reduced[i][j] !== Infinity) {
          reduced[i][j] -= min;
        }
      }
    }
  }
  
  // Column reduction
  for (let j = 0; j < n; j++) {
    let min = Infinity;
    for (let i = 0; i < n; i++) {
      if (reduced[i][j] < min) min = reduced[i][j];
    }
    if (min !== 0 && min !== Infinity) {
      totalReduction += min;
      for (let i = 0; i < n; i++) {
        if (reduced[i][j] !== Infinity) {
          reduced[i][j] -= min;
        }
      }
    }
  }
  
  return { reduced, totalReduction };
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (
        stepData.code === "Start" &&
        (line.includes("reduceMatrix(costMatrix") ||
          line.includes("const root = new Node"))
      ) {
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
        (line.includes("bestCost = totalCost") || line.includes("bestPath = ["))
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Create" &&
        (line.includes("const child = new Node") ||
          line.includes("reduceMatrix(newMatrix"))
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Enqueue" &&
        line.includes("liveNodes.push(child)")
      ) {
        highlight = true;
      }
      if (stepData.code === "Expand" && line.includes("for (let city = 0")) {
        highlight = true;
      }
      if (stepData.code === "Complete" && line.includes("return { bestCost")) {
        highlight = true;
      }
      return (
        <div
          key={index}
          className={highlight ? "tsp-bb-highlighted-line" : "tsp-bb-code-line"}
        >
          {line}
        </div>
      );
    });
  };

  const renderMatrix = (matrix) => {
    if (!matrix) return null;

    return (
      <table className="tsp-bb-display-matrix">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: n }, (_, j) => (
              <th key={j}>{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="tsp-bb-row-header">{i}</td>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cell === Infinity ? "tsp-bb-infinity-cell" : ""}
                  style={{
                    backgroundColor:
                      stepData.fromCity === i && stepData.toCity === j
                        ? "#fef9c3"
                        : stepData.fromCity === i
                          ? "#fee2e2"
                          : stepData.toCity === j
                            ? "#fee2e2"
                            : stepData.fromCity !== null &&
                                stepData.toCity !== null &&
                                i === stepData.toCity &&
                                j === stepData.fromCity
                              ? "#fed7aa"
                              : "transparent",
                  }}
                >
                  {cell === Infinity ? "∞" : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderMatrixExplanation = () => {
    if (!stepData.currentMatrix) return null;

    return (
      <div className="tsp-bb-matrix-explanation-section">
        <div className="tsp-bb-matrix-explanation-header">
          <h3 className="tsp-bb-array-title">
            Matrix Transformation Explanation
          </h3>
        </div>
        <div className="tsp-bb-matrix-explanation-content">
          {stepData.matrixExplanation ? (
            <pre className="tsp-bb-matrix-explanation-text">
              {stepData.matrixExplanation}
            </pre>
          ) : (
            <pre className="tsp-bb-matrix-explanation-text">
              Current cost matrix for node with path [
              {stepData.currentNode?.path?.join(" → ") || "0"}]
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tsp-bb-container">
      <div className="tsp-bb-max-width">
        <div className="tsp-bb-header">
          <h1 className="tsp-bb-title">TSP - Branch and Bound</h1>
        </div>
        <div className="tsp-bb-main-grid">
          <div className="tsp-bb-left-column">
            <div className="tsp-bb-card">
              <h2 className="tsp-bb-card-title">About TSP Branch and Bound</h2>
              <p className="tsp-bb-card-content">
                The <strong>Traveling Salesperson Problem (TSP)</strong> using
                Branch and Bound finds the shortest possible route visiting each
                city exactly once and returning to the origin. This algorithm
                uses matrix reduction and lower bound calculation to prune
                branches that cannot lead to optimal solutions.
              </p>
              <div className="tsp-bb-complexity-grid">
                <div className="tsp-bb-complexity-card tsp-bb-blue-card">
                  <h3 className="tsp-bb-complexity-title tsp-bb-blue-title">
                    Time Complexity
                  </h3>
                  <ul className="tsp-bb-complexity-list tsp-bb-blue-text">
                    <li>Brute Force: O(n!)</li>
                    <li>Branch & Bound: O(n² × 2ⁿ) worst</li>
                    <li>Best case: O(n² × n) with pruning</li>
                  </ul>
                </div>
                <div className="tsp-bb-complexity-card tsp-bb-green-card">
                  <h3 className="tsp-bb-complexity-title tsp-bb-green-title">
                    Space Complexity
                  </h3>
                  <ul className="tsp-bb-complexity-list tsp-bb-green-text">
                    <li>Live Nodes: O(n!)</li>
                    <li>Matrix Storage: O(n²)</li>
                  </ul>
                </div>
              </div>
              <div
                className="tsp-bb-complexity-card tsp-bb-yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="tsp-bb-complexity-title tsp-bb-yellow-title">
                  Key Characteristics
                </h3>
                <ul className="tsp-bb-characteristics-list tsp-bb-yellow-text">
                  <li>• Uses cost matrix reduction</li>
                  <li>• Lower bound pruning strategy</li>
                  <li>• Selects minimum bound node</li>
                  <li>• Guaranteed optimal solution</li>
                  <li>• Applications in routing, logistics</li>
                </ul>
              </div>
            </div>

            <div className="tsp-bb-card">
              <h2 className="tsp-bb-card-title">Input</h2>
              <form onSubmit={handleSubmit} className="tsp-bb-input-form">
                <div className="tsp-bb-input-group">
                  <label htmlFor="n">Number of Cities (n):</label>
                  <input
                    type="text"
                    id="n"
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    placeholder="Enter n (max 6)"
                  />
                </div>
                <button type="submit" className="tsp-bb-submit-button">
                  Generate Matrix
                </button>
              </form>
              <div style={{ marginTop: "20px" }}>
                <h3 className="tsp-bb-array-title">
                  Cost Matrix ({n}×{n})
                </h3>
                <div className="tsp-bb-matrix-container">
                  <table className="tsp-bb-cost-matrix">
                    <thead>
                      <tr>
                        <th></th>
                        {Array.from({ length: n }, (_, j) => (
                          <th key={j}>{j}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {costMatrix.map((row, i) => (
                        <tr key={i}>
                          <td className="tsp-bb-row-header">{i}</td>
                          {row.map((cell, j) => (
                            <td key={j}>
                              <input
                                type="number"
                                value={cell}
                                onChange={(e) =>
                                  handleMatrixChange(i, j, e.target.value)
                                }
                                className="tsp-bb-matrix-input"
                                min="0"
                                disabled={i === j}
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

            <div className="tsp-bb-card">
              <h2 className="tsp-bb-card-title">
                Current Matrix & Explanation
              </h2>
              <div className="tsp-bb-matrix-display-section">
                <h3 className="tsp-bb-array-title">
                  {stepData.matrixType === "reduced"
                    ? "Reduced Cost Matrix"
                    : "Current Matrix"}
                  {stepData.fromCity !== null && stepData.toCity !== null && (
                    <span className="tsp-bb-edge-indicator">
                      Edge: {stepData.fromCity} → {stepData.toCity}
                    </span>
                  )}
                </h3>
                <div className="tsp-bb-matrix-display-container">
                  {renderMatrix(stepData.currentMatrix || costMatrix)}
                </div>
                {renderMatrixExplanation()}
              </div>
              {stepData.reductionDetails &&
                stepData.reductionDetails.length > 0 && (
                  <div className="tsp-bb-reduction-details-section">
                    <h3 className="tsp-bb-array-title">
                      Reduction Steps Summary
                    </h3>
                    <div className="tsp-bb-reduction-details-container">
                      {stepData.reductionDetails.map((detail, idx) => (
                        <div key={idx} className="tsp-bb-reduction-detail-item">
                          • {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="tsp-bb-code-visualization-grid">
              <div className="tsp-bb-card">
                <h2 className="tsp-bb-card-title">Algorithm Code</h2>
                <div className="tsp-bb-code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              <div className="tsp-bb-card">
                <h2 className="tsp-bb-card-title">Visualization</h2>
                <div className="tsp-bb-visualization-area">
                  <div className="tsp-bb-tree-section">
                    <h3 className="tsp-bb-array-title">State Space Tree</h3>
                    <div className="tsp-bb-tree-container">{renderTree()}</div>
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
                      <span>[path] = City path</span>
                    </div>
                  </div>

                  <div className="tsp-bb-solutions-section">
                    <h3 className="tsp-bb-array-title">Best Solution</h3>
                    <div className="tsp-bb-solutions-container">
                      {stepData.bestCost !== Infinity ? (
                        <>
                          <div>
                            <strong>Total Cost:</strong> {stepData.bestCost}
                          </div>
                          <div>
                            <strong>Path:</strong>
                          </div>
                          <div className="tsp-bb-path-display">
                            {stepData.bestPath.join(" → ")}
                          </div>
                        </>
                      ) : (
                        "Exploring..."
                      )}
                    </div>
                  </div>
                </div>

                <div className="tsp-bb-status-grid">
                  <div className="tsp-bb-status-card tsp-bb-blue-card">
                    <div className="tsp-bb-status-label tsp-bb-blue-text">
                      Best Cost
                    </div>
                    <div className="tsp-bb-status-value tsp-bb-blue-title">
                      {stepData.bestCost === Infinity ? "∞" : stepData.bestCost}
                    </div>
                  </div>
                  <div className="tsp-bb-status-card tsp-bb-green-card">
                    <div className="tsp-bb-status-label tsp-bb-green-text">
                      Nodes Explored
                    </div>
                    <div className="tsp-bb-status-value tsp-bb-green-title">
                      {stepData.nodesExplored}
                    </div>
                  </div>
                  <div className="tsp-bb-status-card tsp-bb-yellow-card">
                    <div className="tsp-bb-status-label tsp-bb-yellow-text">
                      Nodes Pruned
                    </div>
                    <div className="tsp-bb-status-value tsp-bb-yellow-title">
                      {stepData.nodesPruned}
                    </div>
                  </div>
                  <div className="tsp-bb-status-card tsp-bb-purple-card">
                    <div className="tsp-bb-status-label tsp-bb-purple-text">
                      Steps
                    </div>
                    <div className="tsp-bb-status-value tsp-bb-purple-title">
                      {currentStep + 1} / {totalSteps}
                    </div>
                  </div>
                </div>

                <div className="tsp-bb-action-container">
                  <div className="tsp-bb-action-label">Current Action:</div>
                  <div className="tsp-bb-action-text">{stepData.action}</div>
                </div>

                <div className="tsp-bb-controls-container">
                  <div className="tsp-bb-speed-control">
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
                    className={`tsp-bb-control-button tsp-bb-gray-button ${
                      currentStep === 0 ? "tsp-bb-disabled-button" : ""
                    }`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`tsp-bb-control-button tsp-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "tsp-bb-disabled-button"
                        : ""
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`tsp-bb-control-button tsp-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "tsp-bb-disabled-button"
                        : ""
                    }`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="tsp-bb-control-button tsp-bb-red-button"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="tsp-bb-card">
              <h2 className="tsp-bb-card-title">Color Legend</h2>
              <div className="tsp-bb-legend-grid">
                <div className="tsp-bb-legend-item">
                  <div
                    className="tsp-bb-legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="tsp-bb-legend-text">Current Node</span>
                </div>
                <div className="tsp-bb-legend-item">
                  <div
                    className="tsp-bb-legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="tsp-bb-legend-text">Best Path</span>
                </div>
                <div className="tsp-bb-legend-item">
                  <div
                    className="tsp-bb-legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="tsp-bb-legend-text">Pruned Node</span>
                </div>
                <div className="tsp-bb-legend-item">
                  <div
                    className="tsp-bb-legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="tsp-bb-legend-text">Expanded Node</span>
                </div>
                <div className="tsp-bb-legend-item">
                  <div
                    className="tsp-bb-legend-color"
                    style={{ backgroundColor: "#fee2e2" }}
                  ></div>
                  <span className="tsp-bb-legend-text">
                    Row/Column being set to ∞
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravellingSalesmanBB;