import React, { useState, useEffect } from "react";
import "./IntegerProgrammingBB.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(
    level,
    variables,
    objectiveValue,
    bound,
    constraints,
    parent = null,
    branchType = null,
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.level = level;
    this.variables = { ...variables }; // Current variable assignments
    this.objectiveValue = objectiveValue;
    this.bound = bound;
    this.constraints = [...constraints]; // Additional constraints from branching
    this.parent = parent;
    this.children = [];
    this.isPruned = false;
    this.isBestPath = false;
    this.isExplored = false;
    this.branchType = branchType; // 'left' (≤), 'right' (≥), or null for root
    this.x = 0;
    this.y = 0;
    this.isInfeasible = false;
  }
}

const IntegerProgrammingBB = () => {
  // Example: Maximize 5x1 + 4x2 subject to x1 + x2 ≤ 5, 10x1 + 6x2 ≤ 45
  const [objectiveInput, setObjectiveInput] = useState("5, 4");
  const [constraintsInput, setConstraintsInput] = useState("1,1:5; 10,6:45");
  const [isMaximize, setIsMaximize] = useState(true);
  
  const [objective, setObjective] = useState([5, 4]);
  const [constraints, setConstraints] = useState([
    { coefficients: [1, 1], rhs: 5 },
    { coefficients: [10, 6], rhs: 45 },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1800);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const handleInputSubmit = (e) => {
    e.preventDefault();
    try {
      // Parse objective coefficients
      const objCoeffs = objectiveInput
        .split(",")
        .map((c) => parseFloat(c.trim()))
        .filter((c) => !isNaN(c));

      if (objCoeffs.length === 0) {
        throw new Error("Please enter at least one objective coefficient");
      }

      // Parse constraints: format "1,1:5; 10,6:45" means 1*x1 + 1*x2 <= 5, 10*x1 + 6*x2 <= 45
      const constraintStrings = constraintsInput.split(";").map((s) => s.trim());
      const parsedConstraints = constraintStrings.map((cStr, idx) => {
        const [coeffsStr, rhsStr] = cStr.split(":").map((s) => s.trim());
        const coefficients = coeffsStr
          .split(",")
          .map((c) => parseFloat(c.trim()))
          .filter((c) => !isNaN(c));
        const rhs = parseFloat(rhsStr);

        if (coefficients.length !== objCoeffs.length) {
          throw new Error(
            `Constraint ${idx + 1} must have ${objCoeffs.length} coefficients`
          );
        }
        if (isNaN(rhs)) {
          throw new Error(`Constraint ${idx + 1} has invalid RHS`);
        }

        return { coefficients, rhs };
      });

      if (parsedConstraints.length === 0) {
        throw new Error("Please enter at least one constraint");
      }

      setObjective(objCoeffs);
      setConstraints(parsedConstraints);
      setCurrentStep(0);
      setIsPlaying(false);
      setExpandedNodes(new Set());
    } catch (error) {
      alert(error.message || "Invalid input format");
    }
  };

  // Solve LP relaxation using simplex (simplified version)
  const solveLPRelaxation = (objCoeffs, constrs, additionalConstraints = []) => {
    const n = objCoeffs.length;
    
    // Simple LP solver for 2D case (can be extended)
    if (n !== 2) {
      // Fallback for higher dimensions
      return { variables: Array(n).fill(0), objectiveValue: 0, isFeasible: true };
    }

    // For 2D: find feasible region and maximize/minimize
    let bestValue = isMaximize ? -Infinity : Infinity;
    let bestVars = { x1: 0, x2: 0 };
    let isFeasible = false;

    // Convert additional constraints to standard format
    const standardAdditionalConstraints = additionalConstraints.map((c) => {
      const coefficients = [0, 0];
      coefficients[c.variableIndex] = 1;
      return { coefficients, rhs: c.rhs, type: c.type };
    });

    // Generate candidate points by finding intersections
    const allConstraints = [...constrs, ...standardAdditionalConstraints];
    const points = [];

    // Add origin
    points.push({ x1: 0, x2: 0 });

    // Add axis intercepts for original constraints
    constrs.forEach((c) => {
      if (c.coefficients && c.coefficients[0] !== 0) {
        points.push({ x1: c.rhs / c.coefficients[0], x2: 0 });
      }
      if (c.coefficients && c.coefficients[1] !== 0) {
        points.push({ x1: 0, x2: c.rhs / c.coefficients[1] });
      }
    });

    // Add constraint intersections
    for (let i = 0; i < allConstraints.length; i++) {
      for (let j = i + 1; j < allConstraints.length; j++) {
        const c1 = allConstraints[i];
        const c2 = allConstraints[j];
        
        if (!c1.coefficients || !c2.coefficients) continue;
        
        // Solve system: c1.coef * x = c1.rhs, c2.coef * x = c2.rhs
        const det =
          c1.coefficients[0] * c2.coefficients[1] -
          c1.coefficients[1] * c2.coefficients[0];
        
        if (Math.abs(det) > 1e-10) {
          const x1 =
            (c1.rhs * c2.coefficients[1] - c2.rhs * c1.coefficients[1]) / det;
          const x2 =
            (c1.coefficients[0] * c2.rhs - c2.coefficients[0] * c1.rhs) / det;
          points.push({ x1, x2 });
        }
      }
    }

    // Check each point for feasibility and optimality
    points.forEach((point) => {
      const { x1, x2 } = point;
      
      // Check non-negativity
      if (x1 < -1e-6 || x2 < -1e-6) return;

      // Check all constraints
      let feasible = true;
      for (const c of allConstraints) {
        if (!c.coefficients) continue;
        
        const lhs = c.coefficients[0] * x1 + c.coefficients[1] * x2;
        if (c.type === "<=") {
          if (lhs > c.rhs + 1e-6) feasible = false;
        } else if (c.type === ">=") {
          if (lhs < c.rhs - 1e-6) feasible = false;
        } else {
          // default <=
          if (lhs > c.rhs + 1e-6) feasible = false;
        }
      }

      if (feasible) {
        isFeasible = true;
        const objValue = objCoeffs[0] * x1 + objCoeffs[1] * x2;
        
        if (
          (isMaximize && objValue > bestValue) ||
          (!isMaximize && objValue < bestValue)
        ) {
          bestValue = objValue;
          bestVars = { x1, x2 };
        }
      }
    });

    if (!isFeasible) {
      return { variables: { x1: 0, x2: 0 }, objectiveValue: 0, isFeasible: false };
    }

    return { variables: bestVars, objectiveValue: bestValue, isFeasible: true };
  };

  const calculateBound = (node) => {
    // Solve LP relaxation with current constraints
    const additionalConstraints = node.constraints;
    const result = solveLPRelaxation(objective, constraints, additionalConstraints);
    
    return result;
  };

  const getBoundDetails = (node) => {
    const details = [];
    const result = calculateBound(node);
    
    if (!result.isFeasible) {
      details.push("Infeasible - No solution satisfies all constraints");
      return { bound: isMaximize ? -Infinity : Infinity, details, result };
    }

    details.push("LP Relaxation Solution:");
    Object.keys(result.variables).forEach((varName) => {
      details.push(`  ${varName} = ${result.variables[varName].toFixed(3)}`);
    });
    details.push(`  Objective = ${result.objectiveValue.toFixed(3)}`);

    if (node.constraints.length > 0) {
      details.push("\nAdditional constraints from branching:");
      node.constraints.forEach((c, idx) => {
        const varName = `x${c.variableIndex + 1}`;
        const op = c.type === "<=" ? "≤" : "≥";
        details.push(`  ${varName} ${op} ${c.rhs}`);
      });
    }

    return { bound: result.objectiveValue, details, result };
  };

  useEffect(() => {
    if (objective.length > 0 && constraints.length > 0) {
      const { generatedSteps, generatedRoot } = generateSteps(objective, constraints);
      setSteps(generatedSteps);
      setRoot(generatedRoot);
      setTotalSteps(generatedSteps.length);

      if (generatedRoot) {
        positionTree(generatedRoot, 600, 50, 200, 120);
      }

      if (generatedSteps.length > 0 && generatedSteps[0].expandedNodes) {
        setExpandedNodes(generatedSteps[0].expandedNodes);
      }
    }
  }, [objective, constraints, isMaximize]);

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

  const isInteger = (value) => {
    return Math.abs(value - Math.round(value)) < 1e-6;
  };

  const generateSteps = (objCoeffs, constrs) => {
    const generatedSteps = [];
    let bestValue = isMaximize ? -Infinity : Infinity;
    let bestSolution = null;
    let nodesExplored = 0;
    const n = objCoeffs.length;

    // Create root node
    const generatedRoot = new Node(-1, {}, 0, 0, [], null, null);
    const rootBoundDetails = getBoundDetails(generatedRoot);
    generatedRoot.bound = rootBoundDetails.bound;
    generatedRoot.objectiveValue = rootBoundDetails.result.objectiveValue;
    generatedRoot.variables = rootBoundDetails.result.variables;

    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting Branch and Bound for Integer Programming. ${isMaximize ? "Maximizing" : "Minimizing"} objective function.`,
      code: "Start",
      bestValue: isMaximize ? -Infinity : Infinity,
      bestSolution: null,
      nodesExplored: 0,
      nodesPruned: 0,
      expandedNodes: new Set([generatedRoot.id]),
      boundDetails: rootBoundDetails.details,
    });

    const liveNodes = [generatedRoot];

    while (liveNodes.length > 0) {
      // Find node with best bound (max for maximization, min for minimization)
      let bestBound = isMaximize ? -Infinity : Infinity;
      let bestIndex = -1;
      
      for (let i = 0; i < liveNodes.length; i++) {
        const nodeBound = liveNodes[i].bound;
        if (
          (isMaximize && nodeBound > bestBound) ||
          (!isMaximize && nodeBound < bestBound)
        ) {
          bestBound = nodeBound;
          bestIndex = i;
        }
      }

      const current = liveNodes.splice(bestIndex, 1)[0];
      current.isExplored = true;
      nodesExplored++;

      const newExpandedSet = new Set(
        generatedSteps[generatedSteps.length - 1].expandedNodes
      );
      newExpandedSet.add(current.id);

      generatedSteps.push({
        nodeId: current.id,
        action: `Selected node with ${isMaximize ? "maximum" : "minimum"} bound (${current.bound.toFixed(3)}). Level: ${current.level + 1}`,
        code: "Explore",
        bestValue,
        bestSolution,
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
      });

      // Check if solution is integer feasible
      const allInteger = Object.values(current.variables).every((v) => isInteger(v));

      if (allInteger && current.objectiveValue !== 0) {
        const isImprovement =
          (isMaximize && current.objectiveValue > bestValue) ||
          (!isMaximize && current.objectiveValue < bestValue);

        if (isImprovement) {
          bestValue = current.objectiveValue;
          bestSolution = { ...current.variables };

          generatedSteps.push({
            nodeId: current.id,
            action: `New best integer solution found! Objective: ${bestValue.toFixed(3)}`,
            code: "Solution",
            bestValue,
            bestSolution,
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(newExpandedSet),
            boundDetails: [],
          });
        }
        continue;
      }

      // Check if node should be pruned by bound
      const shouldPrune =
        (isMaximize && current.bound <= bestValue) ||
        (!isMaximize && current.bound >= bestValue);

      if (shouldPrune && bestValue !== Infinity && bestValue !== -Infinity) {
        current.isPruned = true;
        generatedSteps.push({
          nodeId: current.id,
          action: `Pruning node by bound. Bound ${current.bound.toFixed(3)} ${isMaximize ? "≤" : "≥"} Best Value ${bestValue.toFixed(3)}.`,
          code: "Prune",
          bestValue,
          bestSolution,
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(newExpandedSet),
          boundDetails: [],
        });
        continue;
      }

      // Find first fractional variable to branch on
      let branchVar = null;
      let branchVarIndex = -1;
      
      for (let i = 0; i < n; i++) {
        const varName = `x${i + 1}`;
        const varValue = current.variables[varName];
        if (varValue !== undefined && !isInteger(varValue)) {
          branchVar = varName;
          branchVarIndex = i;
          break;
        }
      }

      if (branchVar === null) {
        // All integer but we didn't catch it above (shouldn't happen)
        continue;
      }

      const branchValue = current.variables[branchVar];
      const floorValue = Math.floor(branchValue);
      const ceilValue = Math.ceil(branchValue);

      generatedSteps.push({
        nodeId: current.id,
        action: `Branching on ${branchVar} = ${branchValue.toFixed(3)} → ${branchVar} ≤ ${floorValue} and ${branchVar} ≥ ${ceilValue}`,
        code: "Expand",
        bestValue,
        bestSolution,
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
      });

      // Create left child (x <= floor)
      const leftNode = new Node(
        current.level + 1,
        {},
        0,
        0,
        [
          ...current.constraints,
          { variableIndex: branchVarIndex, type: "<=", rhs: floorValue },
        ],
        current,
        "left"
      );

      const leftBoundDetails = getBoundDetails(leftNode);
      leftNode.bound = leftBoundDetails.bound;
      leftNode.variables = leftBoundDetails.result.variables;
      leftNode.objectiveValue = leftBoundDetails.result.objectiveValue;
      leftNode.isInfeasible = !leftBoundDetails.result.isFeasible;

      current.children.push(leftNode);

      const leftExpandedSet = new Set(newExpandedSet);
      leftExpandedSet.add(leftNode.id);

      generatedSteps.push({
        nodeId: leftNode.id,
        action: `Created LEFT child: ${branchVar} ≤ ${floorValue}. ${leftNode.isInfeasible ? "INFEASIBLE" : `Bound: ${leftNode.bound.toFixed(3)}`}`,
        code: "Create",
        bestValue,
        bestSolution,
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(leftExpandedSet),
        boundDetails: leftBoundDetails.details,
      });

      if (leftNode.isInfeasible) {
        leftNode.isPruned = true;
        generatedSteps.push({
          nodeId: leftNode.id,
          action: `Left child pruned (infeasible).`,
          code: "Prune",
          bestValue,
          bestSolution,
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(leftExpandedSet),
          boundDetails: [],
        });
      } else {
        const leftShouldPrune =
          (isMaximize && leftNode.bound <= bestValue) ||
          (!isMaximize && leftNode.bound >= bestValue);

        if (leftShouldPrune && bestValue !== Infinity && bestValue !== -Infinity) {
          leftNode.isPruned = true;
          generatedSteps.push({
            nodeId: leftNode.id,
            action: `Left child pruned by bound. Bound ${leftNode.bound.toFixed(3)} ${isMaximize ? "≤" : "≥"} Best Value ${bestValue.toFixed(3)}.`,
            code: "Prune",
            bestValue,
            bestSolution,
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(leftExpandedSet),
            boundDetails: [],
          });
        } else {
          liveNodes.push(leftNode);
          generatedSteps.push({
            nodeId: leftNode.id,
            action: `Left child added to live nodes.`,
            code: "Enqueue",
            bestValue,
            bestSolution,
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(leftExpandedSet),
            boundDetails: [],
          });
        }
      }

      // Create right child (x >= ceil)
      const rightNode = new Node(
        current.level + 1,
        {},
        0,
        0,
        [
          ...current.constraints,
          { variableIndex: branchVarIndex, type: ">=", rhs: ceilValue },
        ],
        current,
        "right"
      );

      const rightBoundDetails = getBoundDetails(rightNode);
      rightNode.bound = rightBoundDetails.bound;
      rightNode.variables = rightBoundDetails.result.variables;
      rightNode.objectiveValue = rightBoundDetails.result.objectiveValue;
      rightNode.isInfeasible = !rightBoundDetails.result.isFeasible;

      current.children.push(rightNode);

      const rightExpandedSet = new Set(newExpandedSet);
      rightExpandedSet.add(rightNode.id);

      generatedSteps.push({
        nodeId: rightNode.id,
        action: `Created RIGHT child: ${branchVar} ≥ ${ceilValue}. ${rightNode.isInfeasible ? "INFEASIBLE" : `Bound: ${rightNode.bound.toFixed(3)}`}`,
        code: "Create",
        bestValue,
        bestSolution,
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(rightExpandedSet),
        boundDetails: rightBoundDetails.details,
      });

      if (rightNode.isInfeasible) {
        rightNode.isPruned = true;
        generatedSteps.push({
          nodeId: rightNode.id,
          action: `Right child pruned (infeasible).`,
          code: "Prune",
          bestValue,
          bestSolution,
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(rightExpandedSet),
          boundDetails: [],
        });
      } else {
        const rightShouldPrune =
          (isMaximize && rightNode.bound <= bestValue) ||
          (!isMaximize && rightNode.bound >= bestValue);

        if (rightShouldPrune && bestValue !== Infinity && bestValue !== -Infinity) {
          rightNode.isPruned = true;
          generatedSteps.push({
            nodeId: rightNode.id,
            action: `Right child pruned by bound. Bound ${rightNode.bound.toFixed(3)} ${isMaximize ? "≤" : "≥"} Best Value ${bestValue.toFixed(3)}.`,
            code: "Prune",
            bestValue,
            bestSolution,
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(rightExpandedSet),
            boundDetails: [],
          });
        } else {
          liveNodes.push(rightNode);
          generatedSteps.push({
            nodeId: rightNode.id,
            action: `Right child added to live nodes.`,
            code: "Enqueue",
            bestValue,
            bestSolution,
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(rightExpandedSet),
            boundDetails: [],
          });
        }
      }
    }

    // Mark best path
    const markBestPath = (node) => {
      if (bestSolution === null) return;

      const allInteger = Object.values(node.variables).every((v) => isInteger(v));
      const solutionMatches = Object.keys(bestSolution).every((key) => {
        return Math.abs(node.variables[key] - bestSolution[key]) < 1e-6;
      });

      if (allInteger && solutionMatches && Math.abs(node.objectiveValue - bestValue) < 1e-6) {
        let current = node;
        while (current) {
          current.isBestPath = true;
          current.isPruned = false;
          current = current.parent;
        }
      }
      node.children.forEach((child) => markBestPath(child));
    };
    markBestPath(generatedRoot);

    const resultStr = bestSolution
      ? `Objective: ${bestValue.toFixed(3)}, Solution: ${Object.entries(bestSolution)
          .map(([k, v]) => `${k}=${v.toFixed(3)}`)
          .join(", ")}`
      : "No integer solution found";

    generatedSteps.push({
      nodeId: null,
      action: `Branch and Bound complete. ${resultStr}`,
      code: "Complete",
      bestValue,
      bestSolution,
      nodesExplored,
      nodesPruned: countPrunedNodes(generatedRoot),
      expandedNodes: getAllNodeIds(generatedRoot),
      boundDetails: [],
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
      positionTree(child, childX, y + dy, dx * 0.65, dy);
    });
  };

  const findNodeById = (node, id) => {
    if (!node) return null;
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
        action: "Click Calculate to start",
        code: "Start",
        currentNode: null,
        bestValue: isMaximize ? -Infinity : Infinity,
        bestSolution: null,
        nodesExplored: 0,
        nodesPruned: 0,
        expandedNodes: new Set(),
        boundDetails: [],
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
    if (!node) return "white";
    if (stepData.currentNode && stepData.currentNode.id === node.id) {
      return "#3b82f6";
    }
    if (node.isBestPath) {
      return "#10b981";
    }
    if (node.isPruned || node.isInfeasible) {
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

      const displayLabel =
        node.branchType === null
          ? "Root"
          : node.branchType === "left"
            ? "≤"
            : "≥";

      const varsStr = Object.entries(node.variables)
        .map(([k, v]) => `${k}:${v.toFixed(2)}`)
        .join(",");

      nodes.push(
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={45}
            fill={getNodeFill(node)}
            stroke="#1f2937"
            strokeWidth={node.isBestPath ? 3 : 2}
          />
          <text
            x={node.x}
            y={node.y - 20}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            {displayLabel}
          </text>
          <text
            x={node.x}
            y={node.y - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#1f2937"
          >
            Obj:{node.objectiveValue.toFixed(2)}
          </text>
          <text
            x={node.x}
            y={node.y + 4}
            textAnchor="middle"
            fontSize={10}
            fill="#1f2937"
          >
            Bnd:{node.bound.toFixed(2)}
          </text>
          {varsStr && (
            <text
              x={node.x}
              y={node.y + 18}
              textAnchor="middle"
              fontSize={8}
              fill="#1f2937"
            >
              {varsStr.length > 20 ? varsStr.substring(0, 20) + "..." : varsStr}
            </text>
          )}
          {node.isInfeasible && (
            <text
              x={node.x}
              y={node.y + 30}
              textAnchor="middle"
              fontSize={9}
              fill="#ef4444"
              fontWeight="bold"
            >
              INFEAS
            </text>
          )}
        </g>
      );

      node.children.forEach((child) => {
        if (!expandedNodes.has(child.id)) return;

        lines.push(
          <line
            key={`${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y + 45}
            x2={child.x}
            y2={child.y - 45}
            stroke={
              child.isPruned || child.isInfeasible
                ? "#ef4444"
                : child.isBestPath
                  ? "#10b981"
                  : "#1f2937"
            }
            strokeWidth={child.isBestPath ? 3 : 1.5}
            strokeDasharray={child.isPruned ? "5,5" : "none"}
          />
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
    }
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

  const algorithm = `function integerProgrammingBB(objective, constraints) {
  let bestValue = maximize ? -Infinity : Infinity;
  let bestSolution = null;
  
  const root = new Node(-1, {}, 0, []);
  root.bound = solveLPRelaxation(objective, constraints, []);
  const liveNodes = [root];
  
  while (liveNodes.length > 0) {
    // Select node with best bound
    let current = liveNodes.reduce((best, node) => 
      maximize ? 
        (node.bound > best.bound ? node : best) :
        (node.bound < best.bound ? node : best)
    );
    liveNodes.splice(liveNodes.indexOf(current), 1);
    
    // Check if all variables are integer
    if (allVariablesInteger(current.variables)) {
      if (isBetter(current.objective, bestValue)) {
        bestValue = current.objective;
        bestSolution = current.variables;
      }
      continue;
    }
    
    // Prune by bound
    if (cannotImprove(current.bound, bestValue)) {
      continue;
    }
    
    // Find fractional variable to branch on
    const fracVar = findFractionalVariable(current.variables);
    const value = current.variables[fracVar];
    
    // Create two children: x <= floor(value) and x >= ceil(value)
    const leftChild = createNode(
      [...current.constraints, {var: fracVar, op: "<=", val: floor(value)}]
    );
    leftChild.bound = solveLPRelaxation(objective, constraints, leftChild.constraints);
    
    const rightChild = createNode(
      [...current.constraints, {var: fracVar, op: ">=", val: ceil(value)}]
    );
    rightChild.bound = solveLPRelaxation(objective, constraints, rightChild.constraints);
    
    if (leftChild.feasible && !shouldPrune(leftChild.bound, bestValue)) {
      liveNodes.push(leftChild);
    }
    
    if (rightChild.feasible && !shouldPrune(rightChild.bound, bestValue)) {
      liveNodes.push(rightChild);
    }
  }
  
  return { bestValue, bestSolution };
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (
        stepData.code === "Start" &&
        (line.includes("const root = new Node") ||
          line.includes("solveLPRelaxation"))
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Explore" &&
        line.includes("let current = liveNodes.reduce")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Solution" &&
        line.includes("bestValue = current.objective")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Prune" &&
        line.includes("cannotImprove")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Create" &&
        (line.includes("const leftChild = createNode") ||
          line.includes("const rightChild = createNode"))
      ) {
        highlight = true;
      }
      if (stepData.code === "Enqueue" && line.includes("liveNodes.push")) {
        highlight = true;
      }
      if (
        stepData.code === "Expand" &&
        line.includes("findFractionalVariable")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Complete" &&
        line.includes("return { bestValue")
      ) {
        highlight = true;
      }
      return (
        <div
          key={index}
          className={
            highlight ? "ip-bb-highlighted-line" : "ip-bb-code-line"
          }
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="ip-bb-container">
      <div className="ip-bb-max-width">
        <div className="ip-bb-header">
          <h1 className="ip-bb-title">Integer Programming Problem</h1>
        </div>
        <div className="ip-bb-main-grid">
          <div className="ip-bb-left-column">
            <div className="ip-bb-card">
              <h2 className="ip-bb-card-title">
                About Integer Programming Problem
              </h2>
              <p className="ip-bb-card-content">
                <strong>Integer Programming</strong> using Branch and Bound
                finds optimal solutions where all variables must be integers.
                The algorithm solves LP relaxations at each node and branches
                on fractional variables until an optimal integer solution is
                found.
              </p>
              <div className="ip-bb-complexity-grid">
                <div className="ip-bb-complexity-card ip-bb-blue-card">
                  <h3 className="ip-bb-complexity-title ip-bb-blue-title">
                    Time Complexity
                  </h3>
                  <ul className="ip-bb-complexity-list ip-bb-blue-text">
                    <li>Worst Case: Exponential</li>
                    <li>With pruning: Much better in practice</li>
                  </ul>
                </div>
                <div className="ip-bb-complexity-card ip-bb-green-card">
                  <h3 className="ip-bb-complexity-title ip-bb-green-title">
                    Space Complexity
                  </h3>
                  <ul className="ip-bb-complexity-list ip-bb-green-text">
                    <li>Tree Storage: Exponential</li>
                    <li>Live Nodes Queue: O(n)</li>
                  </ul>
                </div>
              </div>
              <div
                className="ip-bb-complexity-card ip-bb-yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="ip-bb-complexity-title ip-bb-yellow-title">
                  Key Characteristics
                </h3>
                <ul className="ip-bb-characteristics-list ip-bb-yellow-text">
                  <li>• Solves LP relaxation at each node</li>
                  <li>• Branches on fractional variables</li>
                  <li>• Uses best-bound node selection</li>
                  <li>• Guaranteed optimal integer solution</li>
                  <li>• Prunes infeasible and dominated nodes</li>
                </ul>
              </div>
            </div>

            <div className="ip-bb-card">
              <h2 className="ip-bb-card-title">Problem Input</h2>
              <form onSubmit={handleInputSubmit} className="ip-bb-input-form">
                <div className="ip-bb-input-group">
                  <label>Optimization Type:</label>
                  <div className="ip-bb-radio-group">
                    <label className="ip-bb-radio-label">
                      <input
                        type="radio"
                        checked={isMaximize}
                        onChange={() => setIsMaximize(true)}
                      />
                      Maximize
                    </label>
                    <label className="ip-bb-radio-label">
                      <input
                        type="radio"
                        checked={!isMaximize}
                        onChange={() => setIsMaximize(false)}
                      />
                      Minimize
                    </label>
                  </div>
                </div>
                <div className="ip-bb-input-group">
                  <label htmlFor="objective">
                    Objective Coefficients (comma-separated):
                  </label>
                  <input
                    type="text"
                    id="objective"
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    placeholder="e.g., 5,4"
                  />
                  <small className="ip-bb-input-hint">
                    Example: "5,4" means {isMaximize ? "maximize" : "minimize"}{" "}
                    5x₁ + 4x₂
                  </small>
                </div>
                <div className="ip-bb-input-group">
                  <label htmlFor="constraints">
                    Constraints (format: coefficients:rhs; separated by
                    semicolon):
                  </label>
                  <textarea
                    id="constraints"
                    value={constraintsInput}
                    onChange={(e) => setConstraintsInput(e.target.value)}
                    placeholder="e.g., 1,1:5; 10,6:45"
                    rows={3}
                    className="ip-bb-textarea"
                  />
                  <small className="ip-bb-input-hint">
                    Example: "1,1:5" means x₁ + x₂ ≤ 5
                  </small>
                </div>
                <button type="submit" className="ip-bb-submit-button">
                  Calculate
                </button>
              </form>
              <div className="ip-bb-items-info">
                <h3>Problem Formulation:</h3>
                <div className="ip-bb-problem-display">
                  <div className="ip-bb-objective-display">
                    <strong>{isMaximize ? "Maximize:" : "Minimize:"}</strong>{" "}
                    {objective
                      .map((c, i) => `${c}x${i + 1}`)
                      .join(" + ")}
                  </div>
                  <div className="ip-bb-constraints-display">
                    <strong>Subject to:</strong>
                    {constraints.map((c, i) => (
                      <div key={i}>
                        {c.coefficients
                          .map((coef, j) => `${coef}x${j + 1}`)
                          .join(" + ")}{" "}
                        ≤ {c.rhs}
                      </div>
                    ))}
                    <div>x₁, x₂, ... ≥ 0 and integer</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ip-bb-code-visualization-grid">
              <div className="ip-bb-card">
                <h2 className="ip-bb-card-title">Algorithm Code</h2>
                <div className="ip-bb-code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              <div className="ip-bb-card">
                <h2 className="ip-bb-card-title">Visualization</h2>
                <div className="ip-bb-visualization-area">
                  {stepData.boundDetails && stepData.boundDetails.length > 0 && (
                    <div className="ip-bb-bound-details-section">
                      <h3 className="ip-bb-array-title">
                        LP Relaxation Details
                      </h3>
                      <div className="ip-bb-bound-details-container">
                        {stepData.boundDetails.map((detail, idx) => (
                          <div key={idx} className="ip-bb-bound-detail-item">
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="ip-bb-tree-section">
                    <h3 className="ip-bb-array-title">Branch and Bound Tree</h3>
                    <div className="ip-bb-tree-container">{renderTree()}</div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ marginRight: "15px" }}>
                        Obj = Objective Value, Bnd = LP Bound, ≤/≥ = Branch
                        Direction
                      </span>
                    </div>
                  </div>

                  <div className="ip-bb-solutions-section">
                    <h3 className="ip-bb-array-title">
                      Best Integer Solution Found
                    </h3>
                    <div className="ip-bb-solutions-container">
                      {stepData.bestSolution ? (
                        <>
                          <div>
                            <strong>Objective Value:</strong>{" "}
                            {stepData.bestValue.toFixed(3)}
                          </div>
                          <div>
                            <strong>Solution:</strong>{" "}
                            {Object.entries(stepData.bestSolution)
                              .map(([k, v]) => `${k} = ${v.toFixed(3)}`)
                              .join(", ")}
                          </div>
                        </>
                      ) : (
                        "No integer solution found yet"
                      )}
                    </div>
                  </div>
                </div>

                <div className="ip-bb-status-grid">
                  <div className="ip-bb-status-card ip-bb-blue-card">
                    <div className="ip-bb-status-label ip-bb-blue-text">
                      Best Value
                    </div>
                    <div className="ip-bb-status-value ip-bb-blue-title">
                      {stepData.bestValue === Infinity ||
                      stepData.bestValue === -Infinity
                        ? "N/A"
                        : stepData.bestValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="ip-bb-status-card ip-bb-green-card">
                    <div className="ip-bb-status-label ip-bb-green-text">
                      Nodes Explored
                    </div>
                    <div className="ip-bb-status-value ip-bb-green-title">
                      {stepData.nodesExplored}
                    </div>
                  </div>
                  <div className="ip-bb-status-card ip-bb-yellow-card">
                    <div className="ip-bb-status-label ip-bb-yellow-text">
                      Nodes Pruned
                    </div>
                    <div className="ip-bb-status-value ip-bb-yellow-title">
                      {stepData.nodesPruned}
                    </div>
                  </div>
                  <div className="ip-bb-status-card ip-bb-purple-card">
                    <div className="ip-bb-status-label ip-bb-purple-text">
                      Step
                    </div>
                    <div className="ip-bb-status-value ip-bb-purple-title">
                      {currentStep + 1} / {totalSteps}
                    </div>
                  </div>
                </div>

                <div className="ip-bb-action-container">
                  <div className="ip-bb-action-label">Current Action:</div>
                  <div className="ip-bb-action-text">{stepData.action}</div>
                </div>

                <div className="ip-bb-controls-container">
                  <div className="ip-bb-speed-control">
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
                    className={`ip-bb-control-button ip-bb-gray-button ${
                      currentStep === 0 ? "ip-bb-disabled-button" : ""
                    }`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`ip-bb-control-button ip-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ip-bb-disabled-button"
                        : ""
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`ip-bb-control-button ip-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ip-bb-disabled-button"
                        : ""
                    }`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="ip-bb-control-button ip-bb-red-button"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="ip-bb-card">
              <h2 className="ip-bb-card-title">Color Legend</h2>
              <div className="ip-bb-legend-grid">
                <div className="ip-bb-legend-item">
                  <div
                    className="ip-bb-legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="ip-bb-legend-text">Current Node</span>
                </div>
                <div className="ip-bb-legend-item">
                  <div
                    className="ip-bb-legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="ip-bb-legend-text">Optimal Path</span>
                </div>
                <div className="ip-bb-legend-item">
                  <div
                    className="ip-bb-legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="ip-bb-legend-text">Pruned/Infeasible</span>
                </div>
                <div className="ip-bb-legend-item">
                  <div
                    className="ip-bb-legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="ip-bb-legend-text">Explored Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegerProgrammingBB;