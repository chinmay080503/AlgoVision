import React, { useState, useEffect, useRef } from "react";
import "./MColoring.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Trash2, AlertTriangle } from "lucide-react";

class TreeNode {
  constructor(vertex, color = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.vertex = vertex;
    this.color = color;
    this.children = [];
    this.x = 0;
    this.y = 0;
  }
}

const MColoring = () => {
  // Default graph
  const defaultGraph = {
    nodes: [1, 2, 3, 4, 5],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 }
    ]
  };

  const colorNames = ["red", "green", "blue"];
  const colorValues = {
    red: "#ef4444",
    green: "#10b981",
    blue: "#3b82f6"
  };

  const [graph, setGraph] = useState(defaultGraph);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1200);
  const [inputMode, setInputMode] = useState("visual");
  const [newNodeId, setNewNodeId] = useState("");
  const [newEdge, setNewEdge] = useState({ from: "", to: "" });
  const [colorCount, setColorCount] = useState(3);
  const [noSolutionExists, setNoSolutionExists] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const graphRef = useRef(null);

  useEffect(() => {
    const { generatedSteps, generatedRoot, noSolution } = generateSteps(graph, colorCount);
    setSteps(generatedSteps);
    setRoot(generatedRoot);
    setTotalSteps(generatedSteps.length);
    setExpandedNodes(new Set([generatedRoot?.id]));
    setNoSolutionExists(noSolution);

    if (generatedRoot) {
      positionTree(generatedRoot, 600, 50, 180, 100);
    }
  }, [graph, colorCount]);

  const generateSteps = (graph, numColors) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return { generatedSteps: [], generatedRoot: null, noSolution: true };
    }

    const { nodes, edges } = graph;
    const steps = [];
    let coloringSolution = null;

    // Build adjacency list
    const adjacency = {};
    nodes.forEach(node => {
      adjacency[node] = [];
    });
    edges.forEach(edge => {
      if (nodes.includes(edge.from) && nodes.includes(edge.to)) {
        adjacency[edge.from].push(edge.to);
        adjacency[edge.to].push(edge.from);
      }
    });

    const generatedRoot = new TreeNode(nodes[0], null);
    const colorMap = {}; // Maps vertex to color

    steps.push({
      nodeId: generatedRoot.id,
      action: `Starting M-coloring with ${numColors} color(s) for ${nodes.length} vertices`,
      code: "Initialize",
      currentVertex: nodes[0],
      attemptedColor: null,
      colorAssignment: {},
      isConflict: false,
      isSolution: false,
      expandedNodes: new Set([generatedRoot.id])
    });

    // DFS to color graph
    function dfs(treeNode, vertexIndex, assignments, expandedSet) {
      if (vertexIndex === nodes.length) {
        // All vertices colored successfully
        coloringSolution = { ...assignments };

        steps.push({
          nodeId: treeNode.id,
          action: `Solution found! Successfully colored all ${nodes.length} vertices with ${numColors} color(s)!`,
          code: "Solution found",
          currentVertex: null,
          attemptedColor: null,
          colorAssignment: { ...assignments },
          isConflict: false,
          isSolution: true,
          expandedNodes: new Set(expandedSet)
        });
        return true;
      }

      const vertex = nodes[vertexIndex];
      const neighbors = adjacency[vertex] || [];
      
      // Get colors used by neighbors
      const usedColors = new Set();
      neighbors.forEach(neighbor => {
        if (assignments[neighbor] !== undefined) {
          usedColors.add(assignments[neighbor]);
        }
      });

      // Try each color
      for (let colorIdx = 0; colorIdx < numColors; colorIdx++) {
        const colorName = colorNames[colorIdx];

        // Check if color is valid
        const isValid = !usedColors.has(colorName);

        if (isValid) {
          // Create child node for this color choice
          const childNode = new TreeNode(vertex, colorName);
          treeNode.children.push(childNode);

          const newAssignments = { ...assignments, [vertex]: colorName };
          const newExpandedSet = new Set(expandedSet);
          newExpandedSet.add(childNode.id);

          steps.push({
            nodeId: treeNode.id,
            action: `At vertex ${vertex}, trying color ${colorName.toUpperCase()}`,
            code: "Try color",
            currentVertex: vertex,
            attemptedColor: colorName,
            colorAssignment: { ...assignments },
            isConflict: false,
            isSolution: false,
            expandedNodes: new Set(expandedSet)
          });

          steps.push({
            nodeId: childNode.id,
            action: `Assigned color ${colorName.toUpperCase()} to vertex ${vertex}. Moving to vertex ${nodes[vertexIndex + 1] || "complete"}`,
            code: "Assign color",
            currentVertex: vertex,
            attemptedColor: colorName,
            colorAssignment: newAssignments,
            isConflict: false,
            isSolution: false,
            expandedNodes: newExpandedSet
          });

          // Recursively color next vertex
          if (dfs(childNode, vertexIndex + 1, newAssignments, newExpandedSet)) {
            return true;
          }

          steps.push({
            nodeId: treeNode.id,
            action: `Backtracking: color ${colorName.toUpperCase()} for vertex ${vertex} did not lead to solution`,
            code: "Backtrack",
            currentVertex: vertex,
            attemptedColor: colorName,
            colorAssignment: { ...assignments },
            isConflict: false,
            isSolution: false,
            expandedNodes: new Set(expandedSet)
          });
        } else {
          steps.push({
            nodeId: treeNode.id,
            action: `Color ${colorName.toUpperCase()} invalid for vertex ${vertex}: neighbor(s) already use this color`,
            code: "Color conflict",
            currentVertex: vertex,
            attemptedColor: colorName,
            colorAssignment: { ...assignments },
            isConflict: true,
            isSolution: false,
            expandedNodes: new Set(expandedSet)
          });
        }
      }

      steps.push({
        nodeId: treeNode.id,
        action: `No valid color found for vertex ${vertex}. Backtracking.`,
        code: "Dead end",
        currentVertex: vertex,
        attemptedColor: null,
        colorAssignment: { ...assignments },
        isConflict: true,
        isSolution: false,
        expandedNodes: new Set(expandedSet)
      });

      return false;
    }

    // Start coloring
    const startVertex = nodes[0];
    dfs(generatedRoot, 0, {}, new Set([generatedRoot.id]));

    // Final step
    if (coloringSolution === null) {
      steps.push({
        nodeId: null,
        action: `M-coloring impossible with ${numColors} color(s) for this graph`,
        code: "No solution",
        currentVertex: null,
        attemptedColor: null,
        colorAssignment: {},
        isConflict: true,
        isSolution: false,
        expandedNodes: new Set()
      });
      return { generatedSteps: steps, generatedRoot, noSolution: true };
    } else {
      steps.push({
        nodeId: null,
        action: `M-coloring complete! Graph successfully colored using ${numColors} color(s).`,
        code: "Complete",
        currentVertex: null,
        attemptedColor: null,
        colorAssignment: coloringSolution,
        isConflict: false,
        isSolution: true,
        expandedNodes: new Set()
      });
      return { generatedSteps: steps, generatedRoot, noSolution: false };
    }
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
        action: "Click Next to start M-coloring algorithm",
        code: "Initialize",
        currentVertex: null,
        attemptedColor: null,
        colorAssignment: {},
        isConflict: false,
        isSolution: false,
        expandedNodes: new Set([root?.id])
      };
    }
    const step = steps[Math.min(currentStep, steps.length - 1)];
    return {
      ...step,
      currentNode: step.nodeId ? findNodeById(root, step.nodeId) : null
    };
  };

  const stepData = getCurrentStepData();

  // Graph manipulation
  const addNode = () => {
    const nodeId = parseInt(newNodeId);
    if (isNaN(nodeId)) return;
    if (graph.nodes.includes(nodeId)) return;

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, nodeId].sort((a, b) => a - b)
    }));
    setNewNodeId("");
    setCurrentStep(0);
  };

  const addEdge = () => {
    const from = parseInt(newEdge.from);
    const to = parseInt(newEdge.to);

    if (isNaN(from) || isNaN(to)) return;
    if (!graph.nodes.includes(from) || !graph.nodes.includes(to)) return;
    if (from === to) return;

    const edgeExists = graph.edges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (edgeExists) return;

    setGraph(prev => ({
      ...prev,
      edges: [
        ...prev.edges,
        { from, to }
      ]
    }));
    setNewEdge({ from: "", to: "" });
    setCurrentStep(0);
  };

  const removeNode = (nodeId) => {
    setGraph(prev => ({
      nodes: prev.nodes.filter(n => n !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    }));
    setCurrentStep(0);
  };

  const removeEdge = (from, to) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => !(
        (e.from === from && e.to === to) || (e.from === to && e.to === from)
      ))
    }));
    setCurrentStep(0);
  };

  const resetToDefault = () => {
    setGraph(defaultGraph);
    setCurrentStep(0);
    setIsPlaying(false);
  };

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
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

  const calculateNodePositions = () => {
    if (!graphRef.current || !graph.nodes || graph.nodes.length === 0) return {};
    const container = graphRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) * 0.35;

    const positions = {};
    const angleStep = (2 * Math.PI) / graph.nodes.length;

    graph.nodes.forEach((node, index) => {
      const angle = index * angleStep - Math.PI / 2;
      positions[node] = {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });

    return positions;
  };

  const nodePositions = calculateNodePositions();

  const getEdgePath = (from, to) => {
    const fromPos = nodePositions[from];
    const toPos = nodePositions[to];
    if (!fromPos || !toPos) return "";

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;

    const ctrlX = fromPos.x + dx * 0.5 - dy * 0.15;
    const ctrlY = fromPos.y + dy * 0.5 + dx * 0.15;

    return `M${fromPos.x},${fromPos.y} Q${ctrlX},${ctrlY} ${toPos.x},${toPos.y}`;
  };

  const getHighlightedCode = () => {
    const algorithm = `function graphColoring(graph, m) {
  const colors = new Array(graph.nodes.length);
  
  function isSafe(vertex, color) {
    const neighbors = graph[vertex];
    for (let neighbor of neighbors) {
      if (colors[neighbor] === color) {
        return false;
      }
    }
    return true;
  }
  
  function colorGraph(vertex) {
    if (vertex === graph.nodes.length) {
      return true; // All colored
    }
    
    for (let color = 0; color < m; color++) {
      if (isSafe(vertex, color)) {
        colors[vertex] = color;
        if (colorGraph(vertex + 1)) {
          return true;
        }
        colors[vertex] = -1; // Backtrack
      }
    }
    return false;
  }
  
  return colorGraph(0);
}`;

    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Try color" && line.includes("for (let color")) {
        highlight = true;
      }

      if (stepData.code === "Assign color" && line.includes("colors[vertex]")) {
        highlight = true;
      }

      if (stepData.code === "Solution found" && line.includes("return true")) {
        highlight = true;
      }

      if (stepData.code === "Backtrack" && line.includes("colors[vertex] = -1")) {
        highlight = true;
      }

      if (stepData.code === "Color conflict" && line.includes("isSafe")) {
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

  const renderTree = () => {
    if (!root) return null;

    const lines = [];
    const labels = [];
    const nodes = [];

    const traverse = (node) => {
      if (!expandedNodes.has(node.id) && node !== root) return;

      const isCurrent = stepData.currentNode && stepData.currentNode.id === node.id;

      let fillColor = "white";
      if (isCurrent) fillColor = "#3b82f6";
      else if (node.color && expandedNodes.has(node.id)) fillColor = colorValues[node.color];
      else if (expandedNodes.has(node.id)) fillColor = "#f3f4f6";

      nodes.push(
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={30} fill={fillColor} stroke="#1f2937" strokeWidth={2} />
          <text x={node.x} y={node.y - 5} textAnchor="middle" fontSize={12} fill={node.color ? "white" : "#1f2937"} fontWeight="bold">
            V{node.vertex}
          </text>
          {node.color && (
            <text x={node.x} y={node.y + 10} textAnchor="middle" fontSize={11} fill="white" fontWeight="bold">
              {node.color[0].toUpperCase()}
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
            y1={node.y + 30}
            x2={child.x}
            y2={child.y - 30}
            stroke="#1f2937"
            strokeWidth={1.5}
          />
        );

        const midX = (node.x + child.x) / 2;
        const midY = (node.y + child.y) / 2;
        
        const edgeLabel = child.color ? child.color[0].toUpperCase() : "?";

        labels.push(
          <g key={`${node.id}-${child.id}-label`}>
            <rect
              x={midX - 12}
              y={midY - 10}
              width={24}
              height={20}
              fill="white"
              stroke={child.color ? colorValues[child.color] : "#6b7280"}
              strokeWidth={1}
              rx={4}
            />
            <text
              x={midX}
              y={midY + 4}
              fontSize={10}
              fill={child.color ? colorValues[child.color] : "#6b7280"}
              textAnchor="middle"
              fontWeight="bold"
            >
              {edgeLabel}
            </text>
          </g>
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
      <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', minHeight: '500px' }}>
        {lines}
        {labels}
        {nodes}
      </svg>
    );
  };

  const getTreeBounds = (node, expandedSet, bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }) => {
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

  return (
    <div className="mc-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">M-Coloring Problem</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About M-Coloring</h2>
              <p className="card-content">
                The <strong>M-Coloring Problem</strong> determines if a graph can be colored using at most M colors such that no two adjacent vertices have the same color. This is a classic backtracking problem with applications in scheduling, register allocation, and map coloring. The problem is NP-complete.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>O(M^N) - Backtracking</li>
                    <li>M colors, N vertices</li>
                    <li>Exponential in worst case</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(N) - Recursion depth</li>
                    <li>Color assignment storage</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Constraint satisfaction problem</li>
                  <li>• Backtracking approach</li>
                  <li>• NP-complete decision problem</li>
                  <li>• Applications in scheduling & allocation</li>
                  <li>• Progressive coloring discovery</li>
                </ul>
              </div>
            </div>

            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Graph Input</h2>

              <div className="color-selection">
                <label>Number of Colors (M):</label>
                <div className="color-buttons">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      className={`color-button ${colorCount === num ? 'active' : ''}`}
                      onClick={() => setColorCount(num)}
                    >
                      {num} Color{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-mode-toggle">
                <button
                  className={`toggle-button ${inputMode === 'visual' ? 'active' : ''}`}
                  onClick={() => setInputMode('visual')}
                >
                  Visual Editor
                </button>
                <button
                  className={`toggle-button ${inputMode === 'json' ? 'active' : ''}`}
                  onClick={() => setInputMode('json')}
                >
                  JSON Editor
                </button>
              </div>

              {inputMode === 'visual' ? (
                <div className="visual-input">
                  <div className="input-group">
                    <h3>Nodes</h3>
                    <div className="input-row">
                      <input
                        type="number"
                        placeholder="Node ID"
                        value={newNodeId}
                        onChange={(e) => setNewNodeId(e.target.value)}
                      />
                      <button onClick={addNode} className="add-button">
                        <Plus size={16} /> Add Node
                      </button>
                    </div>
                    <div className="node-list">
                      {graph.nodes.map(node => (
                        <div key={node} className="node-item">
                          <span>Node {node}</span>
                          <button
                            onClick={() => removeNode(node)}
                            className="remove-button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <h3>Edges (Undirected)</h3>
                    <div className="input-row">
                      <select
                        value={newEdge.from}
                        onChange={(e) => setNewEdge({...newEdge, from: e.target.value})}
                      >
                        <option value="">From</option>
                        {graph.nodes.map(node => (
                          <option key={`from-${node}`} value={node}>{node}</option>
                        ))}
                      </select>
                      <select
                        value={newEdge.to}
                        onChange={(e) => setNewEdge({...newEdge, to: e.target.value})}
                      >
                        <option value="">To</option>
                        {graph.nodes.map(node => (
                          <option key={`to-${node}`} value={node}>{node}</option>
                        ))}
                      </select>
                      <button onClick={addEdge} className="add-button">
                        <Plus size={16} /> Add Edge
                      </button>
                    </div>
                    <div className="edge-list">
                      {graph.edges.map((edge, index) => (
                        <div key={index} className="edge-item">
                          <span>{edge.from} ↔ {edge.to}</span>
                          <button
                            onClick={() => removeEdge(edge.from, edge.to)}
                            className="remove-button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="json-input">
                  <textarea
                    value={JSON.stringify(graph, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setGraph(parsed);
                      } catch (err) {
                        // Ignore invalid JSON
                      }
                    }}
                    className="graph-textarea"
                  />
                </div>
              )}

              <div className="button-group">
                <button onClick={resetToDefault} className="gray-button">
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Code and Visualization Grid */}
            <div className="code-visualization-grid">
              {/* Code Section */}
              <div className="card">
                <h2 className="card-title">Algorithm Code</h2>
                <div className="code-container">
                  {getHighlightedCode()}
                </div>
              </div>

              {/* Visualization Section */}
              <div className="card">
                <h2 className="card-title">Visualization</h2>
                <div className="visualization-area">
                  {/* No solution warning */}
                  {noSolutionExists && currentStep === steps.length - 1 && (
                    <div className="no-solution-warning">
                      <AlertTriangle size={20} />
                      <span>Graph cannot be colored with {colorCount} color(s)!</span>
                    </div>
                  )}

                  {/* Graph visualization */}
                  {graph.nodes && graph.nodes.length > 0 && (
                    <div className="graph-visualization-container">
                      <div className="graph-canvas" ref={graphRef}>
                        <svg className="graph-svg">
                          {/* Render edges */}
                          {graph.edges.map((edge, index) => {
                            return (
                              <g key={`edge-${index}`}>
                                <path
                                  d={getEdgePath(edge.from, edge.to)}
                                  className="edge"
                                  markerEnd="url(#arrowhead)"
                                />
                              </g>
                            );
                          })}

                          <defs>
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                            </marker>
                          </defs>
                        </svg>

                        {/* Render nodes */}
                        {graph.nodes.map(node => {
                          const assignedColor = stepData.colorAssignment[node];
                          const isCurrent = stepData.currentVertex === node;

                          return (
                            <div
                              key={`node-${node}`}
                              className={`
                                graph-node
                                ${isCurrent ? 'current-node' : ''}
                                ${assignedColor ? `colored-${assignedColor}` : ''}
                              `}
                              style={{
                                left: `${nodePositions[node]?.x}px`,
                                top: `${nodePositions[node]?.y}px`,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: assignedColor ? colorValues[assignedColor] : undefined
                              }}
                            >
                              <div className="node-id">{node}</div>
                              {assignedColor && <div className="node-color">{assignedColor[0].toUpperCase()}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* State Space Tree */}
                  <div className="tree-section">
                    <h3 className="array-title">State Space Tree (V = Vertex)</h3>
                    <div className="tree-container">
                      {renderTree()}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                      Nodes colored with assigned colors. Blue = current, Gray = explored, White = unvisited.
                    </div>
                  </div>

                  {/* Current Coloring */}
                  <div className="coloring-section">
                    <h3 className="array-title">Current Coloring</h3>
                    <div className="coloring-container">
                      {Object.keys(stepData.colorAssignment).length > 0
                        ? Object.entries(stepData.colorAssignment).map(([vertex, color]) => (
                            <div key={vertex} className="coloring-item">
                              <span className="vertex-label">V{vertex}:</span>
                              <span 
                                className="color-tag"
                                style={{ backgroundColor: colorValues[color] }}
                              >
                                {color.toUpperCase()}
                              </span>
                            </div>
                          ))
                        : "No vertices colored yet..."}
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Colors Used</div>
                      <div className="status-value blue-title">
                        {new Set(Object.values(stepData.colorAssignment)).size} / {colorCount}
                      </div>
                    </div>
                    <div className="status-card green-card">
                      <div className="status-label green-text">Steps</div>
                      <div className="status-value green-title">
                        {currentStep + 1} / {totalSteps}
                      </div>
                    </div>
                  </div>

                  {/* Action Container */}
                  <div className="action-container">
                    <div className="action-label">Current Action:</div>
                    <div className="action-text">{stepData.action}</div>
                  </div>
                </div>

                {/* Controls */}
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
                    className={`control-button gray-button ${currentStep === 0 ? 'disabled-button' : ''}`}
                  >
                    <SkipBack size={16} /> Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={currentStep >= steps.length - 1}
                    className={`control-button blue-button ${currentStep >= steps.length - 1 ? 'disabled-button' : ''}`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= steps.length - 1}
                    className={`control-button blue-button ${currentStep >= steps.length - 1 ? 'disabled-button' : ''}`}
                  >
                    Next <SkipForward size={16} />
                  </button>
                  <button
                    onClick={reset}
                    className="control-button red-button"
                  >
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
                  <div className="legend-color" style={{ backgroundColor: colorValues.red }}></div>
                  <span className="legend-text">Red</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: colorValues.green }}></div>
                  <span className="legend-text">Green</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: colorValues.blue }}></div>
                  <span className="legend-text">Blue</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
                  <span className="legend-text">Current Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MColoring;