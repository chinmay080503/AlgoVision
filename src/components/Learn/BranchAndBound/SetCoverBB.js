import React, { useState, useEffect } from "react";
import "./SetCoverBB.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(
    level,
    selectedSets,
    coveredElements,
    cost,
    bound,
    parent = null,
    includeState = null,
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.level = level;
    this.selectedSets = [...selectedSets];
    this.coveredElements = new Set(coveredElements);
    this.cost = cost;
    this.bound = bound;
    this.parent = parent;
    this.children = [];
    this.isPruned = false;
    this.isBestPath = false;
    this.isExplored = false;
    this.includeState = includeState; // 'include', 'exclude', or null for root
    this.x = 0;
    this.y = 0;
  }
}

const SetCoverBB = () => {
  const [universeSizeInput, setUniverseSizeInput] = useState("5");
  const [setsInput, setSetsInput] = useState(
    "1,2,3:2; 2,4:3; 3,4:1; 4,5:2"
  );
  const [universeSize, setUniverseSize] = useState(5);
  const [sets, setSets] = useState([
    { id: 1, elements: [1, 2, 3], cost: 2 },
    { id: 2, elements: [2, 4], cost: 3 },
    { id: 3, elements: [3, 4], cost: 1 },
    { id: 4, elements: [4, 5], cost: 2 },
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
      const size = parseInt(universeSizeInput);
      if (isNaN(size) || size <= 0) {
        throw new Error("Universe size must be a positive number");
      }

      // Parse sets: format "1,2,3:2; 2,4:3" means set {1,2,3} with cost 2, set {2,4} with cost 3
      const setStrings = setsInput.split(";").map((s) => s.trim());
      const parsedSets = setStrings.map((setStr, idx) => {
        const [elementsStr, costStr] = setStr.split(":").map((s) => s.trim());
        const elements = elementsStr
          .split(",")
          .map((e) => parseInt(e.trim()))
          .filter((e) => !isNaN(e) && e >= 1 && e <= size);
        const cost = parseInt(costStr);

        if (elements.length === 0) {
          throw new Error(`Set ${idx + 1} has no valid elements`);
        }
        if (isNaN(cost) || cost <= 0) {
          throw new Error(`Set ${idx + 1} has invalid cost`);
        }

        return { id: idx + 1, elements, cost };
      });

      if (parsedSets.length === 0) {
        throw new Error("Please enter at least one set");
      }

      setUniverseSize(size);
      setSets(parsedSets);
      setCurrentStep(0);
      setIsPlaying(false);
      setExpandedNodes(new Set());
    } catch (error) {
      alert(error.message || "Invalid input format");
    }
  };

  const calculateBound = (node, remainingSets, allElements) => {
    // If all elements are covered, bound equals current cost
    if (node.coveredElements.size === allElements.size) {
      return node.cost;
    }

    let bound = node.cost;
    const uncovered = new Set(
      [...allElements].filter((e) => !node.coveredElements.has(e))
    );

    // Greedy: sort remaining sets by cost-effectiveness (elements covered per unit cost)
    const sortedRemaining = remainingSets
      .map((set) => {
        const newlyCovered = set.elements.filter((e) => uncovered.has(e));
        const effectiveness =
          newlyCovered.length > 0 ? newlyCovered.length / set.cost : 0;
        return { ...set, newlyCovered, effectiveness };
      })
      .filter((s) => s.effectiveness > 0)
      .sort((a, b) => b.effectiveness - a.effectiveness);

    const tempCovered = new Set(node.coveredElements);
    for (const set of sortedRemaining) {
      if (tempCovered.size === allElements.size) break;

      const willCover = set.elements.filter((e) => !tempCovered.has(e));
      if (willCover.length > 0) {
        bound += set.cost;
        willCover.forEach((e) => tempCovered.add(e));
      }
    }

    return bound;
  };

  const getBoundDetails = (node, remainingSets, allElements) => {
    const details = [];
    details.push(`Current cost: ${node.cost}`);
    details.push(
      `Covered elements: ${node.coveredElements.size}/${allElements.size}`
    );

    if (node.coveredElements.size === allElements.size) {
      details.push("All elements covered - bound equals current cost");
      return { bound: node.cost, details };
    }

    const uncovered = new Set(
      [...allElements].filter((e) => !node.coveredElements.has(e))
    );
    details.push(`Uncovered: {${[...uncovered].sort((a, b) => a - b).join(", ")}}`);

    let bound = node.cost;
    const sortedRemaining = remainingSets
      .map((set) => {
        const newlyCovered = set.elements.filter((e) => uncovered.has(e));
        const effectiveness =
          newlyCovered.length > 0 ? newlyCovered.length / set.cost : 0;
        return { ...set, newlyCovered, effectiveness };
      })
      .filter((s) => s.effectiveness > 0)
      .sort((a, b) => b.effectiveness - a.effectiveness);

    details.push("\nGreedy lower bound calculation:");
    const tempCovered = new Set(node.coveredElements);

    for (const set of sortedRemaining) {
      if (tempCovered.size === allElements.size) break;

      const willCover = set.elements.filter((e) => !tempCovered.has(e));
      if (willCover.length > 0) {
        details.push(
          `• Add Set ${set.id} (cost=${set.cost}, covers ${willCover.length} new) → +${set.cost}`
        );
        bound += set.cost;
        willCover.forEach((e) => tempCovered.add(e));
      }
    }

    details.push(`\nTotal bound = ${bound}`);
    return { bound, details };
  };

  useEffect(() => {
    if (sets.length > 0 && universeSize > 0) {
      const allElements = new Set(
        Array.from({ length: universeSize }, (_, i) => i + 1)
      );

      const { generatedSteps, generatedRoot } = generateSteps(
        sets,
        allElements
      );
      setSteps(generatedSteps);
      setRoot(generatedRoot);
      setTotalSteps(generatedSteps.length);

      if (generatedRoot) {
        positionTree(generatedRoot, 600, 50, 180, 120);
      }

      if (generatedSteps.length > 0 && generatedSteps[0].expandedNodes) {
        setExpandedNodes(generatedSteps[0].expandedNodes);
      }
    }
  }, [sets, universeSize]);

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

  const generateSteps = (inputSets, allElements) => {
    const generatedSteps = [];
    let bestCost = Infinity;
    let bestSolution = [];
    let nodesExplored = 0;
    const n = inputSets.length;

    // Create root node
    const generatedRoot = new Node(-1, [], new Set(), 0, 0, null, null);
    const rootBoundDetails = getBoundDetails(
      generatedRoot,
      inputSets,
      allElements
    );
    generatedRoot.bound = rootBoundDetails.bound;

    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting Branch and Bound for Set Cover Problem. Universe size: ${allElements.size}`,
      code: "Start",
      bestCost: Infinity,
      bestSolution: [],
      nodesExplored: 0,
      nodesPruned: 0,
      expandedNodes: new Set([generatedRoot.id]),
      boundDetails: rootBoundDetails.details,
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
        generatedSteps[generatedSteps.length - 1].expandedNodes
      );
      newExpandedSet.add(current.id);

      generatedSteps.push({
        nodeId: current.id,
        action: `Selected node with minimum bound (${current.bound}). Level: ${current.level + 1}, Cost: ${current.cost}, Covered: ${current.coveredElements.size}/${allElements.size}`,
        code: "Explore",
        bestCost,
        bestSolution: [...bestSolution],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
      });

      // Check if this is a complete solution
      if (current.coveredElements.size === allElements.size) {
        if (current.cost < bestCost) {
          bestCost = current.cost;
          bestSolution = [...current.selectedSets];

          generatedSteps.push({
            nodeId: current.id,
            action: `New best solution found! Cost: ${bestCost}, Sets: [${bestSolution.join(", ")}]`,
            code: "Solution",
            bestCost,
            bestSolution: [...bestSolution],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(newExpandedSet),
            boundDetails: [],
          });
        }
        continue;
      }

      if (current.bound >= bestCost) {
        current.isPruned = true;
        generatedSteps.push({
          nodeId: current.id,
          action: `Pruning node. Bound ${current.bound} ≥ Best Cost ${bestCost === Infinity ? "∞" : bestCost}.`,
          code: "Prune",
          bestCost,
          bestSolution: [...bestSolution],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(newExpandedSet),
          boundDetails: [],
        });
        continue;
      }

      // Check if we've considered all sets
      if (current.level === n - 1) {
        continue;
      }

      const nextLevel = current.level + 1;
      const nextSet = inputSets[nextLevel];

      generatedSteps.push({
        nodeId: current.id,
        action: `Expanding node. Next set: ${nextSet.id} (elements={${nextSet.elements.join(", ")}}, cost=${nextSet.cost})`,
        code: "Expand",
        bestCost,
        bestSolution: [...bestSolution],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(newExpandedSet),
        boundDetails: [],
      });

      // Include current set
      const newCovered = new Set(current.coveredElements);
      nextSet.elements.forEach((e) => newCovered.add(e));

      const includeNode = new Node(
        nextLevel,
        [...current.selectedSets, nextSet.id],
        newCovered,
        current.cost + nextSet.cost,
        0,
        current,
        "include"
      );

      const remainingSets = inputSets.slice(nextLevel + 1);
      const includeBoundDetails = getBoundDetails(
        includeNode,
        remainingSets,
        allElements
      );
      includeNode.bound = includeBoundDetails.bound;

      current.children.push(includeNode);

      const includeExpandedSet = new Set(newExpandedSet);
      includeExpandedSet.add(includeNode.id);

      generatedSteps.push({
        nodeId: includeNode.id,
        action: `Created INCLUDE child for Set ${nextSet.id}. Cost: ${includeNode.cost}, Covered: ${includeNode.coveredElements.size}/${allElements.size}. Calculating bound...`,
        code: "Create",
        bestCost,
        bestSolution: [...bestSolution],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(includeExpandedSet),
        boundDetails: includeBoundDetails.details,
      });

      // Check if this gives a complete solution
      if (includeNode.coveredElements.size === allElements.size) {
        if (includeNode.cost < bestCost) {
          bestCost = includeNode.cost;
          bestSolution = [...includeNode.selectedSets];

          generatedSteps.push({
            nodeId: includeNode.id,
            action: `New best solution from INCLUDE branch! Cost: ${bestCost}, Sets: [${bestSolution.join(", ")}]`,
            code: "Solution",
            bestCost,
            bestSolution: [...bestSolution],
            nodesExplored,
            nodesPruned: countPrunedNodes(generatedRoot),
            expandedNodes: new Set(includeExpandedSet),
            boundDetails: [],
          });
        }
      }

      if (includeNode.bound < bestCost) {
        liveNodes.push(includeNode);
        generatedSteps.push({
          nodeId: includeNode.id,
          action: `Bound ${includeNode.bound} < Best Cost ${bestCost === Infinity ? "∞" : bestCost}. Node added to live nodes.`,
          code: "Enqueue",
          bestCost,
          bestSolution: [...bestSolution],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(includeExpandedSet),
          boundDetails: [],
        });
      } else {
        includeNode.isPruned = true;
        generatedSteps.push({
          nodeId: includeNode.id,
          action: `Include node pruned. Bound ${includeNode.bound} ≥ Best Cost ${bestCost === Infinity ? "∞" : bestCost}.`,
          code: "Prune",
          bestCost,
          bestSolution: [...bestSolution],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(includeExpandedSet),
          boundDetails: [],
        });
      }

      // Exclude current set
      const excludeNode = new Node(
        nextLevel,
        [...current.selectedSets],
        new Set(current.coveredElements),
        current.cost,
        0,
        current,
        "exclude"
      );

      const excludeBoundDetails = getBoundDetails(
        excludeNode,
        remainingSets,
        allElements
      );
      excludeNode.bound = excludeBoundDetails.bound;

      current.children.push(excludeNode);

      const excludeExpandedSet = new Set(newExpandedSet);
      excludeExpandedSet.add(excludeNode.id);

      generatedSteps.push({
        nodeId: excludeNode.id,
        action: `Created EXCLUDE child for Set ${nextSet.id}. Cost: ${excludeNode.cost}, Covered: ${excludeNode.coveredElements.size}/${allElements.size}. Calculating bound...`,
        code: "Create",
        bestCost,
        bestSolution: [...bestSolution],
        nodesExplored,
        nodesPruned: countPrunedNodes(generatedRoot),
        expandedNodes: new Set(excludeExpandedSet),
        boundDetails: excludeBoundDetails.details,
      });

      if (excludeNode.bound < bestCost) {
        liveNodes.push(excludeNode);
        generatedSteps.push({
          nodeId: excludeNode.id,
          action: `Bound ${excludeNode.bound} < Best Cost ${bestCost === Infinity ? "∞" : bestCost}. Node added to live nodes.`,
          code: "Enqueue",
          bestCost,
          bestSolution: [...bestSolution],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(excludeExpandedSet),
          boundDetails: [],
        });
      } else {
        excludeNode.isPruned = true;
        generatedSteps.push({
          nodeId: excludeNode.id,
          action: `Exclude node pruned. Bound ${excludeNode.bound} ≥ Best Cost ${bestCost === Infinity ? "∞" : bestCost}.`,
          code: "Prune",
          bestCost,
          bestSolution: [...bestSolution],
          nodesExplored,
          nodesPruned: countPrunedNodes(generatedRoot),
          expandedNodes: new Set(excludeExpandedSet),
          boundDetails: [],
        });
      }
    }

    // Mark best path
    const markBestPath = (node) => {
      const setsMatch =
        bestSolution.length === node.selectedSets.length &&
        bestSolution.every((s) => node.selectedSets.includes(s));

      if (
        node.cost === bestCost &&
        setsMatch &&
        node.coveredElements.size === allElements.size
      ) {
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

    generatedSteps.push({
      nodeId: null,
      action: `Branch and Bound complete. Optimal Cost: ${bestCost === Infinity ? "No solution" : bestCost}, Sets: [${bestSolution.join(", ")}]`,
      code: "Complete",
      bestCost,
      bestSolution: [...bestSolution],
      nodesExplored,
      nodesPruned: countPrunedNodes(generatedRoot),
      expandedNodes: getAllNodeIds(generatedRoot),
      boundDetails: [],
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
        bestCost: Infinity,
        bestSolution: [],
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

      const displayLabel =
        node.includeState === null
          ? "Root"
          : node.includeState === "include"
            ? "Include"
            : "Exclude";

      nodes.push(
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={40}
            fill={getNodeFill(node)}
            stroke="#1f2937"
            strokeWidth={node.isBestPath ? 3 : 2}
          />
          <text
            x={node.x}
            y={node.y - 18}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            {displayLabel}
          </text>
          <text
            x={node.x}
            y={node.y - 6}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
          >
            Cost:{node.cost}
          </text>
          <text
            x={node.x}
            y={node.y + 6}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
          >
            Cov:{node.coveredElements.size}
          </text>
          <text
            x={node.x}
            y={node.y + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            B:{node.bound}
          </text>
          {node.selectedSets.length > 0 && (
            <text
              x={node.x}
              y={node.y + 30}
              textAnchor="middle"
              fontSize={8}
              fill="#1f2937"
            >
              [{node.selectedSets.join(",")}]
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

  const algorithm = `function setCoverBranchBound(sets, universe) {
  let bestCost = Infinity;
  let bestSolution = [];
  
  const root = new Node(-1, [], new Set(), 0);
  root.bound = calculateBound(root, sets, universe);
  const liveNodes = [root];
  
  while (liveNodes.length > 0) {
    // Select node with minimum bound
    let current = liveNodes.reduce((min, node) => 
      node.bound < min.bound ? node : min
    );
    liveNodes.splice(liveNodes.indexOf(current), 1);
    
    // Check if complete solution
    if (current.covered.size === universe.size) {
      if (current.cost < bestCost) {
        bestCost = current.cost;
        bestSolution = current.sets;
      }
      continue;
    }
    
    if (current.bound >= bestCost) {
      continue; // Prune
    }
    
    if (current.level === sets.length - 1) {
      continue;
    }
    
    const nextSet = sets[current.level + 1];
    
    // Include branch
    const newCovered = new Set([...current.covered, ...nextSet.elements]);
    const includeNode = new Node(
      current.level + 1,
      [...current.sets, nextSet.id],
      newCovered,
      current.cost + nextSet.cost
    );
    includeNode.bound = calculateBound(includeNode, sets, universe);
    
    if (includeNode.bound < bestCost) {
      liveNodes.push(includeNode);
    }
    
    // Exclude branch
    const excludeNode = new Node(
      current.level + 1,
      current.sets,
      current.covered,
      current.cost
    );
    excludeNode.bound = calculateBound(excludeNode, sets, universe);
    
    if (excludeNode.bound < bestCost) {
      liveNodes.push(excludeNode);
    }
  }
  
  return { bestCost, bestSolution };
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (
        stepData.code === "Start" &&
        (line.includes("const root = new Node") ||
          line.includes("calculateBound"))
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
        line.includes("bestCost = current.cost")
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
        stepData.code === "Create" &&
        (line.includes("const includeNode = new Node") ||
          line.includes("const excludeNode = new Node"))
      ) {
        highlight = true;
      }
      if (stepData.code === "Enqueue" && line.includes("liveNodes.push")) {
        highlight = true;
      }
      if (
        stepData.code === "Expand" &&
        line.includes("const nextSet = sets")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Complete" &&
        line.includes("return { bestCost")
      ) {
        highlight = true;
      }
      return (
        <div
          key={index}
          className={
            highlight ? "sc-bb-highlighted-line" : "sc-bb-code-line"
          }
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="sc-bb-container">
      <div className="sc-bb-max-width">
        <div className="sc-bb-header">
          <h1 className="sc-bb-title">Set Cover Problem</h1>
        </div>
        <div className="sc-bb-main-grid">
          <div className="sc-bb-left-column">
            <div className="sc-bb-card">
              <h2 className="sc-bb-card-title">
                About Set Cover Problem
              </h2>
              <p className="sc-bb-card-content">
                The <strong>Set Cover Problem</strong> using Branch and Bound
                finds the minimum cost collection of sets that covers all
                elements in a universe. The algorithm uses greedy lower bound
                estimation to prune branches that cannot improve the current
                best solution.
              </p>
              <div className="sc-bb-complexity-grid">
                <div className="sc-bb-complexity-card sc-bb-blue-card">
                  <h3 className="sc-bb-complexity-title sc-bb-blue-title">
                    Time Complexity
                  </h3>
                  <ul className="sc-bb-complexity-list sc-bb-blue-text">
                    <li>Worst Case: O(2ⁿ)</li>
                    <li>With pruning: Much better in practice</li>
                  </ul>
                </div>
                <div className="sc-bb-complexity-card sc-bb-green-card">
                  <h3 className="sc-bb-complexity-title sc-bb-green-title">
                    Space Complexity
                  </h3>
                  <ul className="sc-bb-complexity-list sc-bb-green-text">
                    <li>Tree Storage: O(2ⁿ)</li>
                    <li>Live Nodes Queue: O(n)</li>
                  </ul>
                </div>
              </div>
              <div
                className="sc-bb-complexity-card sc-bb-yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="sc-bb-complexity-title sc-bb-yellow-title">
                  Key Characteristics
                </h3>
                <ul className="sc-bb-characteristics-list sc-bb-yellow-text">
                  <li>• Uses greedy bound calculation for lower bound</li>
                  <li>• Selects node with minimum bound for expansion</li>
                  <li>• Binary tree structure (include/exclude decisions)</li>
                  <li>• NP-complete problem</li>
                  <li>• Prunes branches that cannot beat current best</li>
                </ul>
              </div>
            </div>

            <div className="sc-bb-card">
              <h2 className="sc-bb-card-title">Problem Input</h2>
              <form onSubmit={handleInputSubmit} className="sc-bb-input-form">
                <div className="sc-bb-input-group">
                  <label htmlFor="universeSize">Universe Size:</label>
                  <input
                    type="text"
                    id="universeSize"
                    value={universeSizeInput}
                    onChange={(e) => setUniverseSizeInput(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="sc-bb-input-group">
                  <label htmlFor="sets">
                    Sets (format: elements:cost; separated by semicolon):
                  </label>
                  <textarea
                    id="sets"
                    value={setsInput}
                    onChange={(e) => setSetsInput(e.target.value)}
                    placeholder="e.g., 1,2,3:2; 2,4:3; 3,4:1; 4,5:2"
                    rows={3}
                    className="sc-bb-textarea"
                  />
                  <small className="sc-bb-input-hint">
                    Example: "1,2,3:2" means a set containing elements {"{"}1,
                    2, 3{"}"} with cost 2
                  </small>
                </div>
                <button type="submit" className="sc-bb-submit-button">
                  Calculate
                </button>
              </form>
              <div className="sc-bb-items-info">
                <h3>Sets:</h3>
                <div className="sc-bb-items-list">
                  {sets.map((set, i) => (
                    <div key={i} className="sc-bb-item-card">
                      <div className="sc-bb-item-header">Set {set.id}</div>
                      <div className="sc-bb-item-details">
                        <span>Elements: {"{" + set.elements.join(", ") + "}"}</span>
                        <span>Cost: {set.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sc-bb-universe-info">
                  <strong>Universe:</strong> {"{"}
                  {Array.from({ length: universeSize }, (_, i) => i + 1).join(
                    ", "
                  )}
                  {"}"}
                </div>
              </div>
            </div>

            <div className="sc-bb-code-visualization-grid">
              <div className="sc-bb-card">
                <h2 className="sc-bb-card-title">Algorithm Code</h2>
                <div className="sc-bb-code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              <div className="sc-bb-card">
                <h2 className="sc-bb-card-title">Visualization</h2>
                <div className="sc-bb-visualization-area">
                  {stepData.boundDetails && stepData.boundDetails.length > 0 && (
                    <div className="sc-bb-bound-details-section">
                      <h3 className="sc-bb-array-title">
                        Lower Bound Calculation Steps
                      </h3>
                      <div className="sc-bb-bound-details-container">
                        {stepData.boundDetails.map((detail, idx) => (
                          <div key={idx} className="sc-bb-bound-detail-item">
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="sc-bb-tree-section">
                    <h3 className="sc-bb-array-title">State Space Tree</h3>
                    <div className="sc-bb-tree-container">{renderTree()}</div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ marginRight: "15px" }}>
                        Cost = Total Cost, Cov = Covered Elements, B = Bound
                      </span>
                      <span>[sets] = Selected sets</span>
                    </div>
                  </div>

                  <div className="sc-bb-solutions-section">
                    <h3 className="sc-bb-array-title">Best Solution Found</h3>
                    <div className="sc-bb-solutions-container">
                      {stepData.bestCost !== Infinity ? (
                        <>
                          <div>
                            <strong>Minimum Cost:</strong> {stepData.bestCost}
                          </div>
                          <div>
                            <strong>Selected Sets:</strong>{" "}
                            {stepData.bestSolution.length > 0
                              ? stepData.bestSolution
                                  .map((id) => `Set ${id}`)
                                  .join(", ")
                              : "None"}
                          </div>
                          {stepData.bestSolution.length > 0 && (
                            <div>
                              <strong>Coverage:</strong> All {universeSize}{" "}
                              elements covered
                            </div>
                          )}
                        </>
                      ) : (
                        "No solution found yet"
                      )}
                    </div>
                  </div>
                </div>

                <div className="sc-bb-status-grid">
                  <div className="sc-bb-status-card sc-bb-blue-card">
                    <div className="sc-bb-status-label sc-bb-blue-text">
                      Best Cost
                    </div>
                    <div className="sc-bb-status-value sc-bb-blue-title">
                      {stepData.bestCost === Infinity ? "∞" : stepData.bestCost}
                    </div>
                  </div>
                  <div className="sc-bb-status-card sc-bb-green-card">
                    <div className="sc-bb-status-label sc-bb-green-text">
                      Nodes Explored
                    </div>
                    <div className="sc-bb-status-value sc-bb-green-title">
                      {stepData.nodesExplored}
                    </div>
                  </div>
                  <div className="sc-bb-status-card sc-bb-yellow-card">
                    <div className="sc-bb-status-label sc-bb-yellow-text">
                      Nodes Pruned
                    </div>
                    <div className="sc-bb-status-value sc-bb-yellow-title">
                      {stepData.nodesPruned}
                    </div>
                  </div>
                  <div className="sc-bb-status-card sc-bb-purple-card">
                    <div className="sc-bb-status-label sc-bb-purple-text">
                      Step
                    </div>
                    <div className="sc-bb-status-value sc-bb-purple-title">
                      {currentStep + 1} / {totalSteps}
                    </div>
                  </div>
                </div>

                <div className="sc-bb-action-container">
                  <div className="sc-bb-action-label">Current Action:</div>
                  <div className="sc-bb-action-text">{stepData.action}</div>
                </div>

                <div className="sc-bb-controls-container">
                  <div className="sc-bb-speed-control">
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
                    className={`sc-bb-control-button sc-bb-gray-button ${
                      currentStep === 0 ? "sc-bb-disabled-button" : ""
                    }`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`sc-bb-control-button sc-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "sc-bb-disabled-button"
                        : ""
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`sc-bb-control-button sc-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "sc-bb-disabled-button"
                        : ""
                    }`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="sc-bb-control-button sc-bb-red-button"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="sc-bb-card">
              <h2 className="sc-bb-card-title">Color Legend</h2>
              <div className="sc-bb-legend-grid">
                <div className="sc-bb-legend-item">
                  <div
                    className="sc-bb-legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="sc-bb-legend-text">Current Node</span>
                </div>
                <div className="sc-bb-legend-item">
                  <div
                    className="sc-bb-legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="sc-bb-legend-text">Optimal Path</span>
                </div>
                <div className="sc-bb-legend-item">
                  <div
                    className="sc-bb-legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="sc-bb-legend-text">Pruned Node</span>
                </div>
                <div className="sc-bb-legend-item">
                  <div
                    className="sc-bb-legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="sc-bb-legend-text">Explored Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetCoverBB;