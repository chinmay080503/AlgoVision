import React, { useState, useEffect } from "react";
import "./KnapsackBB.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(
    level,
    profit,
    weight,
    bound,
    items,
    parent = null,
    includeState = null,
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.level = level;
    this.profit = profit;
    this.weight = weight;
    this.bound = bound;
    this.items = [...items];
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

const KnapsackBB = () => {
  const [weights, setWeights] = useState("1, 2, 3");
  const [values, setValues] = useState("6, 10, 12");
  const [capacity, setCapacity] = useState("5");
  const [items, setItems] = useState([
    { weight: 1, value: 6 },
    { weight: 2, value: 10 },
    { weight: 3, value: 12 },
  ]);
  const [knapsackCapacity, setKnapsackCapacity] = useState(5);
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
      const weightArray = weights.split(",").map((w) => parseInt(w.trim()));
      const valueArray = values.split(",").map((v) => parseInt(v.trim()));

      if (weightArray.length !== valueArray.length) {
        throw new Error("Number of weights must match number of values");
      }

      if (weightArray.length === 0) {
        throw new Error("Please enter at least one item");
      }

      const newItems = weightArray.map((weight, i) => ({
        weight,
        value: valueArray[i],
      }));

      setItems(newItems);
      setKnapsackCapacity(parseInt(capacity));
      setCurrentStep(0);
      setIsPlaying(false);
      setExpandedNodes(new Set());
    } catch (error) {
      alert("Invalid input format. Please enter comma-separated numbers.");
    }
  };

  const calculateBound = (node, n, W, items) => {
    if (node.weight >= W) return 0;

    let profitBound = node.profit;
    let j = node.level + 1;
    let totalWeight = node.weight;

    // Add items while they fit completely
    while (j < n && totalWeight + items[j].weight <= W) {
      totalWeight += items[j].weight;
      profitBound += items[j].value;
      j++;
    }

    // Add fraction of next item
    if (j < n) {
      profitBound += (W - totalWeight) * (items[j].value / items[j].weight);
    }

    return profitBound;
  };

  const getBoundDetailsWithMatrix = (node, n, W, items) => {
    if (node.weight >= W)
      return {
        bound: 0,
        details: ["Weight exceeds capacity - bound = 0"],
        highlightedItems: [],
        selectedItems: [],
        excludedItems: [],
      };

    const details = [];
    let profitBound = node.profit;
    let j = node.level + 1;
    let totalWeight = node.weight;

    // Track which items are used in bound calculation
    const highlightedItems = [];
    const selectedItems = [];
    const excludedItems = [...node.items]; // Items already assigned

    details.push(`Current profit = ${node.profit}`);
    details.push(
      `Current weight = ${node.weight}, Remaining capacity = ${W - node.weight}`,
    );

    if (j < n) {
      details.push(
        `\nConsidering remaining items (sorted by value/weight ratio):`,
      );
    }

    // Add items while they fit completely
    while (j < n && totalWeight + items[j].weight <= W) {
      totalWeight += items[j].weight;
      profitBound += items[j].value;
      selectedItems.push(items[j].originalIndex);
      highlightedItems.push(items[j].originalIndex);
      details.push(
        `• Add Item ${items[j].originalIndex} (w=${items[j].weight}, v=${items[j].value}) completely → +${items[j].value}`,
      );
      j++;
    }

    // Add fraction of next item
    if (j < n) {
      const remaining = W - totalWeight;
      if (remaining > 0) {
        const fraction = remaining / items[j].weight;
        const fractionalValue = fraction * items[j].value;
        highlightedItems.push(items[j].originalIndex);
        details.push(
          `• Add ${(fraction * 100).toFixed(1)}% of Item ${items[j].originalIndex} → +${fractionalValue.toFixed(2)}`,
        );
        profitBound += fractionalValue;
      }
    }

    details.push(`\nTotal bound = ${profitBound.toFixed(2)}`);

    return {
      bound: profitBound,
      details,
      highlightedItems,
      selectedItems,
      excludedItems,
    };
  };

  useEffect(() => {
    if (items.length > 0 && knapsackCapacity > 0) {
      // Sort items by value/weight ratio in descending order
      const sortedItems = [...items]
        .map((item, idx) => ({
          ...item,
          originalIndex: idx + 1,
          ratio: item.value / item.weight,
        }))
        .sort((a, b) => b.ratio - a.ratio);

      const { generatedSteps, generatedRoot } = generateSteps(
        sortedItems,
        knapsackCapacity,
      );
      setSteps(generatedSteps);
      setRoot(generatedRoot);
      setTotalSteps(generatedSteps.length);

      if (generatedRoot) {
        positionTree(generatedRoot, 600, 50, 180, 120);
      }

      // Initialize expanded nodes with root
      if (generatedSteps.length > 0 && generatedSteps[0].expandedNodes) {
        setExpandedNodes(generatedSteps[0].expandedNodes);
      }
    }
  }, [items, knapsackCapacity]);

  const getAllNodeIds = (root) => {
    const ids = new Set();
    const traverse = (node) => {
      ids.add(node.id);
      node.children.forEach((child) => traverse(child));
    };
    if (root) traverse(root);
    return ids;
  };

  const generateSteps = (sortedItems, W) => {
    const generatedSteps = [];
    let bestProfit = 0;
    let bestItems = [];
    let nodesExplored = 0;
    let nodesPruned = 0; // Track incrementally
    const n = sortedItems.length;

    // Create root node
    const generatedRoot = new Node(-1, 0, 0, 0, [], null, null);
    const rootBoundDetails = getBoundDetailsWithMatrix(
      generatedRoot,
      n,
      W,
      sortedItems,
    );
    generatedRoot.bound = rootBoundDetails.bound;

    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: `Starting Branch and Bound for 0/1 Knapsack. Items sorted by value/weight ratio.`,
      code: "Start",
      bestProfit: 0,
      bestItems: [],
      nodesExplored: 0,
      nodesPruned: 0,
      expandedNodes: new Set([generatedRoot.id]),
      prunedNodes: new Set(), // Track which nodes are pruned at this step
      boundDetails: rootBoundDetails.details,
      itemHighlight: rootBoundDetails,
    });

    const liveNodes = [generatedRoot];
    const allNodes = new Map();
    allNodes.set(generatedRoot.id, generatedRoot);

    while (liveNodes.length > 0) {
      // Find node with maximum bound
      let maxBound = -Infinity;
      let maxIndex = -1;
      for (let i = 0; i < liveNodes.length; i++) {
        if (liveNodes[i].bound > maxBound) {
          maxBound = liveNodes[i].bound;
          maxIndex = i;
        }
      }

      const current = liveNodes.splice(maxIndex, 1)[0];
      current.isExplored = true;
      nodesExplored++;

      const newExpandedSet = new Set(
        generatedSteps[generatedSteps.length - 1].expandedNodes,
      );
      newExpandedSet.add(current.id);
      
      const newPrunedSet = new Set(
        generatedSteps[generatedSteps.length - 1].prunedNodes,
      );

      generatedSteps.push({
        nodeId: current.id,
        action: `Selected node with maximum bound (${current.bound.toFixed(2)}). Level: ${current.level + 1}, Profit: ${current.profit}, Weight: ${current.weight}`,
        code: "Explore",
        bestProfit,
        bestItems: [...bestItems],
        nodesExplored,
        nodesPruned,
        expandedNodes: new Set(newExpandedSet),
        prunedNodes: new Set(newPrunedSet),
        boundDetails: [],
        itemHighlight: null,
      });

      // Check if this node's profit is better than current best
      if (current.profit > bestProfit && current.weight <= W) {
        bestProfit = current.profit;
        bestItems = [...current.items];

        generatedSteps.push({
          nodeId: current.id,
          action: `New best solution found! Profit: ${bestProfit}, Items: [${bestItems.join(", ")}]`,
          code: "Solution",
          bestProfit,
          bestItems: [...bestItems],
          nodesExplored,
          nodesPruned,
          expandedNodes: new Set(newExpandedSet),
          prunedNodes: new Set(newPrunedSet),
          boundDetails: [],
          itemHighlight: null,
        });
      }

      if (current.bound <= bestProfit) {
        // Check if this is a leaf node with the optimal solution
        const isOptimalLeaf = 
          current.level === n - 1 && 
          current.profit === bestProfit &&
          current.weight <= W;
        
        if (!isOptimalLeaf) {
          current.isPruned = true;
          nodesPruned++; // Increment when pruning
          newPrunedSet.add(current.id); // Add to pruned set
          generatedSteps.push({
            nodeId: current.id,
            action: `Pruning node. Bound ${current.bound.toFixed(2)} ≤ Best Profit ${bestProfit}.`,
            code: "Prune",
            bestProfit,
            bestItems: [...bestItems],
            nodesExplored,
            nodesPruned,
            expandedNodes: new Set(newExpandedSet),
            prunedNodes: new Set(newPrunedSet),
            boundDetails: [],
            itemHighlight: null,
          });
        }
        continue;
      }

      // Check if we've considered all items
      if (current.level === n - 1) {
        continue;
      }

      const nextLevel = current.level + 1;
      const nextItem = sortedItems[nextLevel];

      generatedSteps.push({
        nodeId: current.id,
        action: `Expanding node. Next item: ${nextItem.originalIndex} (w=${nextItem.weight}, v=${nextItem.value}, ratio=${nextItem.ratio.toFixed(2)})`,
        code: "Expand",
        bestProfit,
        bestItems: [...bestItems],
        nodesExplored,
        nodesPruned,
        expandedNodes: new Set(newExpandedSet),
        prunedNodes: new Set(newPrunedSet),
        boundDetails: [],
        itemHighlight: null,
      });

      // Include current item (if it fits)
      if (current.weight + nextItem.weight <= W) {
        const includeNode = new Node(
          nextLevel,
          current.profit + nextItem.value,
          current.weight + nextItem.weight,
          0,
          [...current.items, nextItem.originalIndex],
          current,
          "include",
        );

        const includeBoundDetails = getBoundDetailsWithMatrix(
          includeNode,
          n,
          W,
          sortedItems,
        );
        includeNode.bound = includeBoundDetails.bound;
        allNodes.set(includeNode.id, includeNode);

        current.children.push(includeNode);

        const includeExpandedSet = new Set(newExpandedSet);
        includeExpandedSet.add(includeNode.id);
        
        const includePrunedSet = new Set(newPrunedSet);

        generatedSteps.push({
          nodeId: includeNode.id,
          action: `Created INCLUDE child for Item ${nextItem.originalIndex}. Profit: ${includeNode.profit}, Weight: ${includeNode.weight}. Calculating bound...`,
          code: "Create",
          bestProfit,
          bestItems: [...bestItems],
          nodesExplored,
          nodesPruned,
          expandedNodes: new Set(includeExpandedSet),
          prunedNodes: new Set(includePrunedSet),
          boundDetails: includeBoundDetails.details,
          itemHighlight: includeBoundDetails,
        });

        // Check if this new node gives a better solution
        if (includeNode.profit > bestProfit) {
          bestProfit = includeNode.profit;
          bestItems = [...includeNode.items];

          generatedSteps.push({
            nodeId: includeNode.id,
            action: `New best solution found from INCLUDE branch! Profit: ${bestProfit}, Items: [${bestItems.join(", ")}]`,
            code: "Solution",
            bestProfit,
            bestItems: [...bestItems],
            nodesExplored,
            nodesPruned,
            expandedNodes: new Set(includeExpandedSet),
            prunedNodes: new Set(includePrunedSet),
            boundDetails: [],
            itemHighlight: null,
          });
        }

        if (includeNode.bound > bestProfit) {
          liveNodes.push(includeNode);
          generatedSteps.push({
            nodeId: includeNode.id,
            action: `Bound ${includeNode.bound.toFixed(2)} > Best Profit ${bestProfit}. Node added to live nodes.`,
            code: "Enqueue",
            bestProfit,
            bestItems: [...bestItems],
            nodesExplored,
            nodesPruned,
            expandedNodes: new Set(includeExpandedSet),
            prunedNodes: new Set(includePrunedSet),
            boundDetails: [],
            itemHighlight: null,
          });
        } else {
          // Check if this is the optimal solution
          const isOptimalSolution = 
            includeNode.profit === bestProfit &&
            includeNode.weight <= W &&
            includeNode.level === n - 1;
          
          if (!isOptimalSolution) {
            includeNode.isPruned = true;
            nodesPruned++; // Increment when pruning
            includePrunedSet.add(includeNode.id); // Add to pruned set
            generatedSteps.push({
              nodeId: includeNode.id,
              action: `Include node pruned. Bound ${includeNode.bound.toFixed(2)} ≤ Best Profit ${bestProfit}.`,
              code: "Prune",
              bestProfit,
              bestItems: [...bestItems],
              nodesExplored,
              nodesPruned,
              expandedNodes: new Set(includeExpandedSet),
              prunedNodes: new Set(includePrunedSet),
              boundDetails: [],
              itemHighlight: null,
            });
          }
        }
      } else {
        generatedSteps.push({
          nodeId: current.id,
          action: `Item ${nextItem.originalIndex} doesn't fit (${current.weight} + ${nextItem.weight} > ${W}). Skipping INCLUDE branch.`,
          code: "Skip",
          bestProfit,
          bestItems: [...bestItems],
          nodesExplored,
          nodesPruned,
          expandedNodes: new Set(newExpandedSet),
          prunedNodes: new Set(newPrunedSet),
          boundDetails: [],
          itemHighlight: null,
        });
      }

      // Exclude current item
      const excludeNode = new Node(
        nextLevel,
        current.profit,
        current.weight,
        0,
        [...current.items],
        current,
        "exclude",
      );

      const excludeBoundDetails = getBoundDetailsWithMatrix(
        excludeNode,
        n,
        W,
        sortedItems,
      );
      excludeNode.bound = excludeBoundDetails.bound;
      allNodes.set(excludeNode.id, excludeNode);

      current.children.push(excludeNode);

      const excludeExpandedSet = new Set(newExpandedSet);
      excludeExpandedSet.add(excludeNode.id);
      
      const excludePrunedSet = new Set(newPrunedSet);

      generatedSteps.push({
        nodeId: excludeNode.id,
        action: `Created EXCLUDE child for Item ${nextItem.originalIndex}. Profit: ${excludeNode.profit}, Weight: ${excludeNode.weight}. Calculating bound...`,
        code: "Create",
        bestProfit,
        bestItems: [...bestItems],
        nodesExplored,
        nodesPruned,
        expandedNodes: new Set(excludeExpandedSet),
        prunedNodes: new Set(excludePrunedSet),
        boundDetails: excludeBoundDetails.details,
        itemHighlight: excludeBoundDetails,
      });

      if (excludeNode.bound > bestProfit) {
        liveNodes.push(excludeNode);
        generatedSteps.push({
          nodeId: excludeNode.id,
          action: `Bound ${excludeNode.bound.toFixed(2)} > Best Profit ${bestProfit}. Node added to live nodes.`,
          code: "Enqueue",
          bestProfit,
          bestItems: [...bestItems],
          nodesExplored,
          nodesPruned,
          expandedNodes: new Set(excludeExpandedSet),
          prunedNodes: new Set(excludePrunedSet),
          boundDetails: [],
          itemHighlight: null,
        });
      } else {
        // Check if this is the optimal solution
        const isOptimalSolution = 
          excludeNode.profit === bestProfit &&
          excludeNode.weight <= W &&
          excludeNode.level === n - 1;
        
        if (!isOptimalSolution) {
          excludeNode.isPruned = true;
          nodesPruned++; // Increment when pruning
          excludePrunedSet.add(excludeNode.id); // Add to pruned set
          generatedSteps.push({
            nodeId: excludeNode.id,
            action: `Exclude node pruned. Bound ${excludeNode.bound.toFixed(2)} ≤ Best Profit ${bestProfit}.`,
            code: "Prune",
            bestProfit,
            bestItems: [...bestItems],
            nodesExplored,
            nodesPruned,
            expandedNodes: new Set(excludeExpandedSet),
            prunedNodes: new Set(excludePrunedSet),
            boundDetails: [],
            itemHighlight: null,
          });
        }
      }
    }

    // Mark best path
    const markBestPath = (node) => {
      // Check if this node's items match the best solution
      const itemsMatch =
        bestItems.length === node.items.length &&
        bestItems.every((item) => node.items.includes(item));

      if (node.profit === bestProfit && itemsMatch) {
        let current = node;
        while (current) {
          current.isBestPath = true;
          // Keep isPruned flag as is - don't change it
          // The visual rendering will prioritize isBestPath over isPruned
          current = current.parent;
        }
      }
      node.children.forEach((child) => markBestPath(child));
    };
    markBestPath(generatedRoot);

    generatedSteps.push({
      nodeId: null,
      action: `Branch and Bound complete. Optimal Profit: ${bestProfit}, Items: [${bestItems.join(", ")}]`,
      code: "Complete",
      bestProfit,
      bestItems: [...bestItems],
      nodesExplored,
      nodesPruned,
      expandedNodes: getAllNodeIds(generatedRoot),
      prunedNodes: new Set(
        generatedSteps[generatedSteps.length - 1].prunedNodes
      ),
      boundDetails: [],
      itemHighlight: null,
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
        bestProfit: 0,
        bestItems: [],
        nodesExplored: 0,
        nodesPruned: 0,
        expandedNodes: new Set(),
        prunedNodes: new Set(),
        boundDetails: [],
        itemHighlight: null,
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

  const isNodeOnBestPath = (node) => {
    if (!stepData.bestItems || stepData.bestItems.length === 0) return false;

    // Check if this node's items are a prefix of bestItems
    return (
      node.items.every((item) => stepData.bestItems.includes(item)) &&
      node.profit <= stepData.bestProfit &&
      !node.isPruned
    );
  };

  const getNodeFill = (node) => {
    if (!node) return "white";
    if (stepData.currentNode && stepData.currentNode.id === node.id) {
      return "#3b82f6";
    }
    if (node.isBestPath) {
      return "#10b981";
    }
    // Use the step-specific prunedNodes set instead of node.isPruned
    if (stepData.prunedNodes && stepData.prunedNodes.has(node.id)) {
      return "#ef4444";
    }
    if (expandedNodes.has(node.id)) {
      return "#f3f4f6";
    }
    return "white";
  };

  const getItemClass = (itemIndex) => {
    if (!stepData.itemHighlight) return "";

    const { excludedItems, highlightedItems, selectedItems } =
      stepData.itemHighlight;

    if (excludedItems.includes(itemIndex)) return "ks-bb-excluded-item";
    if (selectedItems.includes(itemIndex)) return "ks-bb-selected-item";
    if (highlightedItems.includes(itemIndex)) return "ks-bb-highlighted-item";

    return "";
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
            P:{node.profit}
          </text>
          <text
            x={node.x}
            y={node.y + 6}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
          >
            W:{node.weight}
          </text>
          <text
            x={node.x}
            y={node.y + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#1f2937"
            fontWeight="bold"
          >
            B:{node.bound.toFixed(1)}
          </text>
          {node.items.length > 0 && (
            <text
              x={node.x}
              y={node.y + 30}
              textAnchor="middle"
              fontSize={8}
              fill="#1f2937"
            >
              [{node.items.join(",")}]
            </text>
          )}
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
              stepData.prunedNodes && stepData.prunedNodes.has(child.id)
                ? "#ef4444"
                : child.isBestPath
                  ? "#10b981"
                  : "#1f2937"
            }
            strokeWidth={child.isBestPath ? 3 : 1.5}
            strokeDasharray={
              stepData.prunedNodes && stepData.prunedNodes.has(child.id)
                ? "5,5"
                : "none"
            }
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

  const algorithm = `function knapsackBranchBound(items, W) {
  // Sort items by value/weight ratio (descending)
  items.sort((a, b) => (b.value/b.weight) - (a.value/a.weight));
  
  let bestProfit = 0;
  let bestItems = [];
  
  const root = new Node(-1, 0, 0);
  root.bound = calculateBound(root);
  const liveNodes = [root];
  
  while (liveNodes.length > 0) {
    // Select node with maximum bound
    let current = liveNodes.reduce((max, node) => 
      node.bound > max.bound ? node : max
    );
    liveNodes.splice(liveNodes.indexOf(current), 1);
    
    // Update best solution if current node is better
    if (current.profit > bestProfit && current.weight <= W) {
      bestProfit = current.profit;
      bestItems = current.items;
    }
    
    if (current.bound <= bestProfit) {
      continue; // Prune
    }
    
    if (current.level === items.length - 1) {
      continue;
    }
    
    const nextItem = items[current.level + 1];
    
    // Include branch
    if (current.weight + nextItem.weight <= W) {
      const includeNode = new Node(
        current.level + 1,
        current.profit + nextItem.value,
        current.weight + nextItem.weight,
        [...current.items, nextItem.id]
      );
      includeNode.bound = calculateBound(includeNode);
      
      if (includeNode.bound > bestProfit) {
        liveNodes.push(includeNode);
      }
    }
    
    // Exclude branch
    const excludeNode = new Node(
      current.level + 1,
      current.profit,
      current.weight,
      current.items
    );
    excludeNode.bound = calculateBound(excludeNode);
    
    if (excludeNode.bound > bestProfit) {
      liveNodes.push(excludeNode);
    }
  }
  
  return { bestProfit, bestItems };
}
`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (
        stepData.code === "Start" &&
        (line.includes("items.sort") || line.includes("const root = new Node"))
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
        line.includes("bestProfit = current.profit")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Prune" &&
        line.includes("current.bound <= bestProfit")
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
        line.includes("const nextItem = items")
      ) {
        highlight = true;
      }
      if (
        stepData.code === "Complete" &&
        line.includes("return { bestProfit")
      ) {
        highlight = true;
      }
      return (
        <div
          key={index}
          className={highlight ? "ks-bb-highlighted-line" : "ks-bb-code-line"}
        >
          {line}
        </div>
      );
    });
  };

  // Get sorted items for display
  const sortedItems = [...items]
    .map((item, idx) => ({
      ...item,
      originalIndex: idx + 1,
      ratio: item.value / item.weight,
    }))
    .sort((a, b) => b.ratio - a.ratio);

  // Calculate total weight of best items
  const bestItemsTotalWeight = stepData.bestItems.reduce((sum, itemId) => {
    const item = sortedItems.find((it) => it.originalIndex === itemId);
    return sum + (item ? item.weight : 0);
  }, 0);

  return (
    <div className="ks-bb-container">
      <div className="ks-bb-max-width">
        <div className="ks-bb-header">
          <h1 className="ks-bb-title">0/1 Knapsack - Branch and Bound</h1>
        </div>
        <div className="ks-bb-main-grid">
          <div className="ks-bb-left-column">
            <div className="ks-bb-card">
              <h2 className="ks-bb-card-title">
                About 0/1 Knapsack Branch and Bound
              </h2>
              <p className="ks-bb-card-content">
                The <strong>0/1 Knapsack Problem</strong> using Branch and Bound
                finds the optimal selection of items to maximize value without
                exceeding capacity. Items are sorted by value/weight ratio, and
                the algorithm uses upper bound estimation (allowing fractional
                items) to prune branches that cannot improve the current best
                solution.
              </p>
              <div className="ks-bb-complexity-grid">
                <div className="ks-bb-complexity-card ks-bb-blue-card">
                  <h3 className="ks-bb-complexity-title ks-bb-blue-title">
                    Time Complexity
                  </h3>
                  <ul className="ks-bb-complexity-list ks-bb-blue-text">
                    <li>Worst Case: O(2ⁿ)</li>
                    <li>With pruning: Much better in practice</li>
                  </ul>
                </div>
                <div className="ks-bb-complexity-card ks-bb-green-card">
                  <h3 className="ks-bb-complexity-title ks-bb-green-title">
                    Space Complexity
                  </h3>
                  <ul className="ks-bb-complexity-list ks-bb-green-text">
                    <li>Tree Storage: O(2ⁿ)</li>
                    <li>Live Nodes Queue: O(n)</li>
                  </ul>
                </div>
              </div>
              <div
                className="ks-bb-complexity-card ks-bb-yellow-card"
                style={{ marginTop: "16px" }}
              >
                <h3 className="ks-bb-complexity-title ks-bb-yellow-title">
                  Key Characteristics
                </h3>
                <ul className="ks-bb-characteristics-list ks-bb-yellow-text">
                  <li>• Uses greedy bound calculation (fractional knapsack)</li>
                  <li>• Selects node with maximum bound for expansion</li>
                  <li>• Binary tree structure (include/exclude decisions)</li>
                  <li>• Guaranteed optimal solution</li>
                  <li>• Prunes branches that cannot beat current best</li>
                </ul>
              </div>
            </div>

            <div className="ks-bb-card">
              <h2 className="ks-bb-card-title">Problem Input</h2>
              <form onSubmit={handleInputSubmit} className="ks-bb-input-form">
                <div className="ks-bb-input-group">
                  <label htmlFor="weights">
                    Item Weights (comma-separated):
                  </label>
                  <input
                    type="text"
                    id="weights"
                    value={weights}
                    onChange={(e) => setWeights(e.target.value)}
                    placeholder="e.g., 1,2,3"
                  />
                </div>
                <div className="ks-bb-input-group">
                  <label htmlFor="values">Item Values (comma-separated):</label>
                  <input
                    type="text"
                    id="values"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    placeholder="e.g., 6,10,12"
                  />
                </div>
                <div className="ks-bb-input-group">
                  <label htmlFor="capacity">Knapsack Capacity:</label>
                  <input
                    type="text"
                    id="capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
                <button type="submit" className="ks-bb-submit-button">
                  Calculate
                </button>
              </form>
              <div className="ks-bb-items-info">
                <h3>Items (Sorted by Value/Weight Ratio):</h3>
                <div className="ks-bb-items-list">
                  {sortedItems.map((item, i) => (
                    <div key={i} className="ks-bb-item-card">
                      <div className="ks-bb-item-header">
                        Item {item.originalIndex}
                      </div>
                      <div className="ks-bb-item-details">
                        <span>W: {item.weight}</span>
                        <span>V: {item.value}</span>
                        <span>R: {item.ratio.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ks-bb-code-visualization-grid">
              <div className="ks-bb-card">
                <h2 className="ks-bb-card-title">Algorithm Code</h2>
                <div className="ks-bb-code-container">
                  <div>{getHighlightedCode()}</div>
                </div>
              </div>

              <div className="ks-bb-card">
                <h2 className="ks-bb-card-title">Visualization</h2>
                <div className="ks-bb-visualization-area">
                  {stepData.boundDetails &&
                    stepData.boundDetails.length > 0 && (
                      <div className="ks-bb-bound-details-section">
                        <h3 className="ks-bb-array-title">
                          Upper Bound Calculation Steps
                        </h3>
                        <div className="ks-bb-bound-details-container">
                          {stepData.boundDetails.map((detail, idx) => (
                            <div key={idx} className="ks-bb-bound-detail-item">
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="ks-bb-tree-section">
                    <h3 className="ks-bb-array-title">State Space Tree</h3>
                    <div className="ks-bb-tree-container">{renderTree()}</div>
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ marginRight: "15px" }}>
                        P = Profit, W = Weight, B = Bound
                      </span>
                      <span>[items] = Selected items</span>
                    </div>
                  </div>

                  <div className="ks-bb-solutions-section">
                    <h3 className="ks-bb-array-title">Best Solution Found</h3>
                    <div className="ks-bb-solutions-container">
                      {stepData.bestProfit > 0 ? (
                        <>
                          <div>
                            <strong>Maximum Profit:</strong>{" "}
                            {stepData.bestProfit}
                          </div>
                          <div>
                            <strong>Selected Items:</strong>{" "}
                            {stepData.bestItems.length > 0
                              ? stepData.bestItems
                                  .map((id) => `Item ${id}`)
                                  .join(", ")
                              : "None"}
                          </div>
                          {stepData.bestItems.length > 0 && (
                            <div>
                              <strong>Total Weight:</strong>{" "}
                              {bestItemsTotalWeight} / {knapsackCapacity}
                            </div>
                          )}
                        </>
                      ) : (
                        "No solution found yet"
                      )}
                    </div>
                  </div>
                </div>

                <div className="ks-bb-status-grid">
                  <div className="ks-bb-status-card ks-bb-blue-card">
                    <div className="ks-bb-status-label ks-bb-blue-text">
                      Best Profit
                    </div>
                    <div className="ks-bb-status-value ks-bb-blue-title">
                      {stepData.bestProfit}
                    </div>
                  </div>
                  <div className="ks-bb-status-card ks-bb-green-card">
                    <div className="ks-bb-status-label ks-bb-green-text">
                      Nodes Explored
                    </div>
                    <div className="ks-bb-status-value ks-bb-green-title">
                      {stepData.nodesExplored}
                    </div>
                  </div>
                  <div className="ks-bb-status-card ks-bb-yellow-card">
                    <div className="ks-bb-status-label ks-bb-yellow-text">
                      Nodes Pruned
                    </div>
                    <div className="ks-bb-status-value ks-bb-yellow-title">
                      {stepData.nodesPruned}
                    </div>
                  </div>
                  <div className="ks-bb-status-card ks-bb-purple-card">
                    <div className="ks-bb-status-label ks-bb-purple-text">
                      Step
                    </div>
                    <div className="ks-bb-status-value ks-bb-purple-title">
                      {currentStep + 1} / {totalSteps}
                    </div>
                  </div>
                </div>

                <div className="ks-bb-action-container">
                  <div className="ks-bb-action-label">Current Action:</div>
                  <div className="ks-bb-action-text">{stepData.action}</div>
                </div>

                <div className="ks-bb-controls-container">
                  <div className="ks-bb-speed-control">
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
                    className={`ks-bb-control-button ks-bb-gray-button ${
                      currentStep === 0 ? "ks-bb-disabled-button" : ""
                    }`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`ks-bb-control-button ks-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ks-bb-disabled-button"
                        : ""
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`ks-bb-control-button ks-bb-blue-button ${
                      currentStep >= steps.length - 1
                        ? "ks-bb-disabled-button"
                        : ""
                    }`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="ks-bb-control-button ks-bb-red-button"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="ks-bb-card">
              <h2 className="ks-bb-card-title">Color Legend</h2>
              <div className="ks-bb-legend-grid">
                <div className="ks-bb-legend-item">
                  <div
                    className="ks-bb-legend-color"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="ks-bb-legend-text">Current Node</span>
                </div>
                <div className="ks-bb-legend-item">
                  <div
                    className="ks-bb-legend-color"
                    style={{ backgroundColor: "#10b981" }}
                  ></div>
                  <span className="ks-bb-legend-text">Optimal Path</span>
                </div>
                <div className="ks-bb-legend-item">
                  <div
                    className="ks-bb-legend-color"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="ks-bb-legend-text">Pruned Node</span>
                </div>
                <div className="ks-bb-legend-item">
                  <div
                    className="ks-bb-legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="ks-bb-legend-text">Explored Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnapsackBB;