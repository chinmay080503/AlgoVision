import React, { useState, useEffect } from "react";
import "./SumOfSubsets.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";

class Node {
  constructor(index, sum, path, decision) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.index = index;
    this.sum = sum;
    this.path = [...path];
    this.decision = decision;
    this.children = [];
    this.isSolution = false;
    this.createdAt = 0;
  }
}

const SumOfSubsets = () => {
  const [inputNumbers, setInputNumbers] = useState("10,20,30");
  const [inputTarget, setInputTarget] = useState("30");
  const [set, setSet] = useState([10,20,30]);
  const [target, setTarget] = useState(30);
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
    const { generatedSteps, generatedRoot, generatedSolutions } = generateSteps(set, target);
    setSteps(generatedSteps);
    setRoot(generatedRoot);
    setSolutions(generatedSolutions);
    setTotalSteps(generatedSteps.length);
    setVisibleNodes(new Set());
    setVisibleBranches(new Set());
    if (generatedRoot) {
      positionTree(generatedRoot, 600, 50, 180, 100);
    }
  }, [set, target]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedSet = inputNumbers.split(',').map(Number).filter(n => !isNaN(n));
    const parsedTarget = parseInt(inputTarget);
    if (parsedSet.length > 0 && !isNaN(parsedTarget)) {
      setSet(parsedSet);
      setTarget(parsedTarget);
      setCurrentStep(0);
      setIsPlaying(false);
      setVisibleNodes(new Set());
      setVisibleBranches(new Set());
    }
  };

  const generateSteps = (set, target) => {
    const generatedSteps = [];
    const generatedSolutions = [];
    const generatedRoot = new Node(0, 0, [], null);
    generatedRoot.createdAt = 0;
    
    // Initial step - only root visible
    generatedSteps.push({
      nodeId: generatedRoot.id,
      action: "Starting backtracking from root.",
      code: "Start backtrack",
      solutions: [...generatedSolutions],
      visibleNodes: new Set([generatedRoot.id]),
      visibleBranches: new Set(),
      lastCreatedBranch: null
    });

    let stepCounter = 1;

    function buildTree(node, visibleSet, visibleBranchSet) {
      if (node.index === set.length) {
        if (node.sum === target) {
          node.isSolution = true;
          generatedSolutions.push([...node.path]);
          const newVisibleSet = new Set([...visibleSet, node.id]);
          generatedSteps.push({
            nodeId: node.id,
            action: `Found solution: [${node.path.join(', ')}]`,
            code: "Found solution",
            solutions: [...generatedSolutions],
            visibleNodes: newVisibleSet,
            visibleBranches: new Set(visibleBranchSet),
            lastCreatedBranch: null
          });
        } else {
          generatedSteps.push({
            nodeId: node.id,
            action: `Leaf reached. Sum ${node.sum} ≠ ${target}.`,
            code: "Check sum",
            solutions: [...generatedSolutions],
            visibleNodes: new Set(visibleSet),
            visibleBranches: new Set(visibleBranchSet),
            lastCreatedBranch: null
          });
        }
        return;
      }

      // Step 1: Show current node considering next element (no branches)
      generatedSteps.push({
        nodeId: node.id,
        action: `At level ${node.index}, current sum: ${node.sum}. Considering ${set[node.index]}.`,
        code: "Enter backtrack",
        solutions: [...generatedSolutions],
        visibleNodes: new Set(visibleSet),
        visibleBranches: new Set(visibleBranchSet),
        lastCreatedBranch: null
      });

      // Include branch (left branch)
      if (node.sum + set[node.index] <= target) {
        const includePath = [...node.path, set[node.index]];
        const includeChild = new Node(node.index + 1, node.sum + set[node.index], includePath, 'include');
        includeChild.createdAt = stepCounter++;
        node.children.push(includeChild);
        
        // Step 2: Show include branch being created (only include branch visible)
        const includeVisibleSet = new Set(visibleSet);
        includeVisibleSet.add(includeChild.id);
        
        const includeBranchSet = new Set(visibleBranchSet);
        includeBranchSet.add(`${node.id}-${includeChild.id}`);
        
        generatedSteps.push({
          nodeId: includeChild.id,
          action: `Including ${set[node.index]}. New sum: ${includeChild.sum}.`,
          code: "Include",
          solutions: [...generatedSolutions],
          visibleNodes: includeVisibleSet,
          visibleBranches: includeBranchSet,
          lastCreatedBranch: { from: node.id, to: includeChild.id, decision: 'include' }
        });
        
        // Recursively build include subtree
        buildTree(includeChild, includeVisibleSet, includeBranchSet);
      } else {
        // Step 2 (pruned): Show prune message with no new branch
        generatedSteps.push({
          nodeId: node.id,
          action: `Pruning include branch for ${set[node.index]} as sum (${node.sum} + ${set[node.index]} = ${node.sum + set[node.index]}) would exceed ${target}.`,
          code: "Prune",
          solutions: [...generatedSolutions],
          visibleNodes: new Set(visibleSet),
          visibleBranches: new Set(visibleBranchSet),
          lastCreatedBranch: null
        });
      }

      // Exclude branch (right branch) - only create after include branch exploration
      const excludeChild = new Node(node.index + 1, node.sum, node.path, 'exclude');
      excludeChild.createdAt = stepCounter++;
      node.children.push(excludeChild);
      
      // Step 3: Show exclude branch being created (only exclude branch visible)
      const excludeVisibleSet = new Set(visibleSet);
      // Add all previously created nodes except this new one might already be added
      const addAllExistingNodes = (n) => {
        if (n.id !== excludeChild.id && n.createdAt < excludeChild.createdAt) {
          excludeVisibleSet.add(n.id);
          n.children.forEach(child => addAllExistingNodes(child));
        }
      };
      addAllExistingNodes(generatedRoot);
      excludeVisibleSet.add(excludeChild.id);
      
      const excludeBranchSet = new Set(visibleBranchSet);
      // Remove any previous branches at this level? No, we want to keep them
      // But for the current step, we only show the exclude branch being created
      // We need to ensure we don't show the include branch during exclude step
      
      // Create a fresh branch set that only includes branches from previous levels
      // and the new exclude branch
      const newExcludeBranchSet = new Set();
      // Add all branches except the include branch at current node
      visibleBranchSet.forEach(branchId => {
        if (!branchId.startsWith(`${node.id}-`)) {
          newExcludeBranchSet.add(branchId);
        }
      });
      // Add the new exclude branch
      newExcludeBranchSet.add(`${node.id}-${excludeChild.id}`);
      
      generatedSteps.push({
        nodeId: excludeChild.id,
        action: `Excluding ${set[node.index]}. Moving to next level.`,
        code: "Exclude",
        solutions: [...generatedSolutions],
        visibleNodes: excludeVisibleSet,
        visibleBranches: newExcludeBranchSet,
        lastCreatedBranch: { from: node.id, to: excludeChild.id, decision: 'exclude' }
      });
      
      // Recursively build exclude subtree
      buildTree(excludeChild, excludeVisibleSet, newExcludeBranchSet);

      // Backtrack step
      generatedSteps.push({
        nodeId: node.id,
        action: `Backtracking from level ${node.index}.`,
        code: "Backtrack",
        solutions: [...generatedSolutions],
        visibleNodes: new Set(visibleSet),
        visibleBranches: new Set(visibleBranchSet),
        lastCreatedBranch: null
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
      node.children.forEach(child => {
        child.parent = node;
        markSolutionPath(child);
      });
    };
    markSolutionPath(generatedRoot);

    // Final step
    generatedSteps.push({
      nodeId: null,
      action: "Backtracking complete. All solutions found.",
      code: "Complete",
      solutions: [...generatedSolutions],
      visibleNodes: new Set(),
      visibleBranches: new Set(),
      lastCreatedBranch: null
    });

    return { generatedSteps, generatedRoot, generatedSolutions };
  };

  const positionTree = (node, x = 0, y = 0, dx = 180, dy = 100) => {
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
        set,
        target,
        action: "Click Next to start backtracking",
        code: "Start backtrack",
        currentNode: root,
        solutions: [],
        visibleNodes: new Set(),
        visibleBranches: new Set(),
        lastCreatedBranch: null
      };
    }
    const step = steps[Math.min(currentStep, steps.length - 1)];
    return {
      ...step,
      currentNode: step.nodeId ? findNodeById(root, step.nodeId) : null
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
          <circle cx={node.x} cy={node.y} r={30} fill={getNodeFill(node)} stroke="#1f2937" strokeWidth={2} />
          <text x={node.x} y={node.y - 5} textAnchor="middle" fontSize={11} fill={isSolution ? "white" : "#1f2937"} fontWeight="bold">
            Sum: {node.sum}
          </text>
          <text x={node.x} y={node.y + 10} textAnchor="middle" fontSize={9} fill={isSolution ? "white" : "#1f2937"}>
            {node.path.join(',') || '[]'}
          </text>
        </g>
      );

      node.children.forEach((child) => {
        const branchId = `${node.id}-${child.id}`;
        
        // Only show branch if it's in visibleBranches
        if (!visibleBranches.has(branchId)) return;
        
        // Both solid and dashed lines are black
        const lineColor = "#1f2937";
        const lineWidth = 1.5;
        
        lines.push(
          <line 
            key={`${node.id}-${child.id}`} 
            x1={node.x} 
            y1={node.y + 30} 
            x2={child.x} 
            y2={child.y - 30} 
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray={child.decision === 'exclude' ? "5,5" : "none"}
          />
        );
        
        const midX = (node.x + child.x) / 2;
        const midY = (node.y + child.y) / 2;
        
        // Simple text labels without rectangle
        labels.push(
          <text 
            key={`${node.id}-${child.id}-label`}
            x={midX} 
            y={midY} 
            fontSize={10} 
            fill={child.decision === 'include' ? "#10b981" : "#ef4444"} 
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            {child.decision} {set[node.index]}
          </text>
        );
        
        traverse(child);
      });
    };

    traverse(root);

    const bounds = getTreeBounds(root, visibleNodes);
    const width = bounds.maxX - bounds.minX + 200;
    const height = bounds.maxY - bounds.minY + 200;
    const viewBox = `${bounds.minX - 100} ${bounds.minY - 100} ${width} ${height}`;

    return (
      <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', minHeight: '600px' }}>
        {lines}
        {labels}
        {nodes}
      </svg>
    );
  };

  const getTreeBounds = (node, visibleSet, bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }) => {
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

  const algorithm = `function sumOfSubsets(set, target) {
  const solutions = [];
  
  function backtrack(index, currentSum, path) {
    if (index === set.length) {
      if (currentSum === target) {
        solutions.push([...path]);
      }
      return;
    }
    
    // INCLUDE branch (left in visualization)
    if (currentSum + set[index] <= target) {
      path.push(set[index]);
      backtrack(index + 1, currentSum + set[index], path);
      path.pop();
    }
    
    // EXCLUDE branch (right in visualization)
    backtrack(index + 1, currentSum, path);
  }
  
  backtrack(0, 0, []);
  return solutions;
}`;

  const getHighlightedCode = () => {
    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;
      if (stepData.code === "Start backtrack" && line.includes("backtrack(0, 0, [])")) {
        highlight = true;
      }
      if (stepData.code === "Enter backtrack" && line.includes("function backtrack")) {
        highlight = true;
      }
      if (stepData.code === "Check sum" && line.includes("if (index === set.length)")) {
        highlight = true;
      }
      if (stepData.code === "Found solution" && line.includes("solutions.push")) {
        highlight = true;
      }
      if (stepData.code === "Exclude" && line.includes("// EXCLUDE branch")) {
        highlight = true;
      }
      if (stepData.code === "Include" && line.includes("path.push(set[index])")) {
        highlight = true;
      }
      if (stepData.code === "Prune" && line.includes("if (currentSum + set[index] <= target)")) {
        highlight = true;
      }
      if (stepData.code === "Backtrack" && line.includes("path.pop()")) {
        highlight = true;
      }
      if (stepData.code === "Complete" && line.includes("return solutions")) {
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
    <div className="sos-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Sum of Subsets</h1>
        </div>
        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Sum of Subsets</h2>
              <p className="card-content">
                The <strong>Sum of Subsets</strong> problem is to find all subsets of a given set of integers that sum to a target value. It uses backtracking to explore the state space tree, pruning branches where the sum exceeds the target. It's a classic NP-complete problem with applications in optimization, knapsack variants, and partition problems.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">
                    Time Complexity
                  </h3>
                  <ul className="complexity-list blue-text">
                    <li>Backtracking: O(2<sup>n</sup>)</li>
                    <li>With Pruning: Still O(2<sup>n</sup>) worst-case</li>
                    <li>DP Solution: O(n × target)</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">
                    Space Complexity
                  </h3>
                  <ul className="complexity-list green-text">
                    <li>Backtracking: O(n) (recursion depth)</li>
                    <li>DP Solution: O(target)</li>
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
                  <li>• Pruning for optimization</li>
                  <li>• NP-complete (Subset Sum)</li>
                  <li>• Used in combinatorial optimization</li>
                </ul>
              </div>
            </div>
            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Input</h2>
              <form onSubmit={handleSubmit} className="input-form">
                <div className="input-group">
                  <label htmlFor="numbers">Numbers (comma-separated):</label>
                  <input
                    type="text"
                    id="numbers"
                    value={inputNumbers}
                    onChange={(e) => setInputNumbers(e.target.value)}
                    placeholder="Enter numbers"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="target">Target Sum:</label>
                  <input
                    type="text"
                    id="target"
                    value={inputTarget}
                    onChange={(e) => setInputTarget(e.target.value)}
                    placeholder="Enter target"
                  />
                </div>
                <button type="submit" className="submit-button">
                  Run Backtracking
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
                      <div className="string-label">Set:</div>
                      <div className="string-value">{set.join(', ')}</div>
                    </div>
                    <div className="string-container">
                      <div className="string-label">Target:</div>
                      <div className="string-value">{target}</div>
                    </div>
                  </div>
                  {/* Tree Section */}
                  <div className="tree-section">
                    <h3 className="array-title">State Space Tree</h3>
                    <div className="tree-container">
                      {renderTree()}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                      <span style={{ marginRight: "15px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>include</span> = solid line
                      </span>
                      <span>
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>exclude</span> = dashed line
                      </span>
                    </div>
                  </div>
                  {/* Solutions Section */}
                  <div className="solutions-section">
                    <h3 className="array-title">Solutions</h3>
                    <div className="solutions-container">
                      {stepData.solutions.length > 0 
                        ? stepData.solutions.map((sol, idx) => <div key={idx}>[{sol.join(', ')}]</div>)
                        : "Exploring..."}
                    </div>
                  </div>
                </div>
                <div className="status-grid">
                  <div className="status-card blue-card">
                    <div className="status-label blue-text">Current Phase</div>
                    <div className="status-value blue-title">
                      {currentStep === 0 ? "Initial" :
                       currentStep < steps.length - 1 ? "Exploring" : "Complete"}
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
                  <span className="legend-text">Solution Path</span>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "#f3f4f6" }}
                  ></div>
                  <span className="legend-text">Visible Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SumOfSubsets;