import React, { useState, useEffect, useRef } from "react";
import "./HamiltonianCycle.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Trash2, AlertTriangle } from "lucide-react";

class TreeNode {
  constructor(nodeId, path, isLeaf = false) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.nodeId = nodeId;
    this.path = [...path];
    this.children = [];
    this.isSolution = false;
    this.isPruned = false;
    this.isLeaf = isLeaf;
    this.x = 0;
    this.y = 0;
  }
}

const HamiltonianCycle = () => {
  // Default graph
  const defaultGraph = {
    nodes: [1, 2, 3, 4, 5],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 5 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
      { from: 4, to: 5 }
    ]
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
  const [noPathExists, setNoPathExists] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const graphRef = useRef(null);

  useEffect(() => {
    const { generatedSteps, generatedRoot, noPath } = generateSteps(graph);
    setSteps(generatedSteps);
    setRoot(generatedRoot);
    setTotalSteps(generatedSteps.length);
    setExpandedNodes(new Set([generatedRoot?.id]));
    setNoPathExists(noPath);

    if (generatedRoot) {
      positionTree(generatedRoot, 600, 50, 180, 100);
    }
  }, [graph]);

  const generateSteps = (graph) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return { generatedSteps: [], generatedRoot: null, noPath: true };
    }

    const { nodes, edges } = graph;
    const steps = [];
    const foundCycles = [];
    let cyclesFound = 0;

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

    const generatedRoot = new TreeNode(nodes[0], [nodes[0]]);

    steps.push({
      nodeId: generatedRoot.id,
      action: `Starting Hamiltonian Cycle search from node ${nodes[0]}`,
      code: "Initialize",
      path: [nodes[0]],
      visitedNodes: new Set([nodes[0]]),
      currentGraphNode: nodes[0],
      edgeBeingChecked: null,
      cyclesFound: 0,
      foundCycles: [],
      expandedNodes: new Set([generatedRoot.id])
    });

    // DFS to build tree and find cycles
    function dfs(treeNode, currentNode, path, visited, startNode, expandedSet) {
      // Generate list of unvisited neighbors
      const unvisited = adjacency[currentNode]
        .filter(neighbor => !visited.has(neighbor))
        .sort((a, b) => a - b);

      if (path.length === nodes.length) {
        // All nodes visited - check if we can return to start
        if (adjacency[currentNode].includes(startNode)) {
          treeNode.isSolution = true;
          const cycle = [...path, startNode];
          foundCycles.push(cycle);
          cyclesFound++;

          steps.push({
            nodeId: treeNode.id,
            action: `Found Hamiltonian Cycle: [${cycle.join(' → ')}]`,
            code: "Cycle found",
            path: cycle,
            visitedNodes: new Set(visited),
            currentGraphNode: currentNode,
            edgeBeingChecked: { from: currentNode, to: startNode },
            cyclesFound,
            foundCycles: [...foundCycles],
            expandedNodes: new Set(expandedSet)
          });
        } else {
          steps.push({
            nodeId: treeNode.id,
            action: `All nodes visited but no edge back to start. Backtracking from ${currentNode}.`,
            code: "No return",
            path: [...path],
            visitedNodes: new Set(visited),
            currentGraphNode: currentNode,
            edgeBeingChecked: null,
            cyclesFound,
            foundCycles: [...foundCycles],
            expandedNodes: new Set(expandedSet)
          });
        }
      } else if (unvisited.length > 0) {
        // Process each unvisited neighbor
        unvisited.forEach((neighbor, index) => {
          steps.push({
            nodeId: treeNode.id,
            action: `At node ${currentNode}, exploring neighbor ${neighbor}. Unvisited neighbors: [${unvisited.join(', ')}]`,
            code: "Explore",
            path: [...path],
            visitedNodes: new Set(visited),
            currentGraphNode: currentNode,
            edgeBeingChecked: { from: currentNode, to: neighbor },
            cyclesFound,
            foundCycles: [...foundCycles],
            expandedNodes: new Set(expandedSet)
          });

          // Create child node for this neighbor
          const childPath = [...path, neighbor];
          const childNode = new TreeNode(neighbor, childPath);
          treeNode.children.push(childNode);

          const newExpandedSet = new Set(expandedSet);
          newExpandedSet.add(childNode.id);

          steps.push({
            nodeId: childNode.id,
            action: `Visiting node ${neighbor}. Current path: [${childPath.join(' → ')}]`,
            code: "Visit",
            path: childPath,
            visitedNodes: new Set([...visited, neighbor]),
            currentGraphNode: neighbor,
            edgeBeingChecked: null,
            cyclesFound,
            foundCycles: [...foundCycles],
            expandedNodes: newExpandedSet
          });

          // Recursively explore
          visited.add(neighbor);
          dfs(childNode, neighbor, childPath, visited, startNode, newExpandedSet);
          visited.delete(neighbor);
        });

        steps.push({
          nodeId: treeNode.id,
          action: `Backtracking from node ${currentNode}.`,
          code: "Backtrack",
          path: [...path],
          visitedNodes: new Set(visited),
          currentGraphNode: currentNode,
          edgeBeingChecked: null,
          cyclesFound,
          foundCycles: [...foundCycles],
          expandedNodes: new Set(expandedSet)
        });
      } else {
        // Dead end - no unvisited neighbors
        treeNode.isPruned = true;
        steps.push({
          nodeId: treeNode.id,
          action: `Dead end at node ${currentNode}: no unvisited neighbors. Backtracking.`,
          code: "Dead end",
          path: [...path],
          visitedNodes: new Set(visited),
          currentGraphNode: currentNode,
          edgeBeingChecked: null,
          cyclesFound,
          foundCycles: [...foundCycles],
          expandedNodes: new Set(expandedSet)
        });
      }
    }

    // Start DFS
    const startNode = nodes[0];
    dfs(generatedRoot, startNode, [startNode], new Set([startNode]), startNode, new Set([generatedRoot.id]));

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
    if (foundCycles.length === 0) {
      steps.push({
        nodeId: null,
        action: "Hamiltonian cycle search complete. No cycles found.",
        code: "Complete",
        path: [],
        visitedNodes: new Set(),
        currentGraphNode: null,
        edgeBeingChecked: null,
        cyclesFound: 0,
        foundCycles: [],
        expandedNodes: new Set()
      });
      return { generatedSteps: steps, generatedRoot, noPath: true };
    } else {
      steps.push({
        nodeId: null,
        action: `Hamiltonian cycle search complete. Found ${foundCycles.length} cycle(s).`,
        code: "Complete",
        path: foundCycles[0],
        visitedNodes: new Set(foundCycles[0]),
        currentGraphNode: null,
        edgeBeingChecked: null,
        cyclesFound,
        foundCycles,
        expandedNodes: new Set()
      });
      return { generatedSteps: steps, generatedRoot, noPath: false };
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
        action: "Click Next to start Hamiltonian Cycle algorithm",
        code: "Initialize",
        path: [],
        visitedNodes: new Set(),
        currentGraphNode: null,
        edgeBeingChecked: null,
        cyclesFound: 0,
        foundCycles: [],
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
    const algorithm = `function hamiltonianCycle(graph) {
  const nodes = graph.nodes;
  const adj = buildAdjacency(graph);
  const cycles = [];
  
  function dfs(node, path, visited) {
    if (path.length === nodes.length) {
      if (adj[node].includes(path[0])) {
        cycles.push([...path, path[0]]);
      }
      return;
    }
    
    for (let neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfs(neighbor, path, visited);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }
  
  dfs(nodes[0], [nodes[0]], {nodes[0]});
  return cycles;
}`;

    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Visit" && line.includes("path.push(neighbor)")) {
        highlight = true;
      }

      if (stepData.code === "Explore" && line.includes("for (let neighbor")) {
        highlight = true;
      }

      if (stepData.code === "Cycle found" && line.includes("cycles.push")) {
        highlight = true;
      }

      if (stepData.code === "Backtrack" && line.includes("path.pop()")) {
        highlight = true;
      }

      if (stepData.code === "Dead end" && line.includes("visited.delete")) {
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
      const isSolution = node.isSolution;
      const isOnSolutionPath = node.isOnSolutionPath;

      let fillColor = "white";
      if (isCurrent) fillColor = "#3b82f6";
      else if (isSolution || isOnSolutionPath) fillColor = "#10b981";
      else if (expandedNodes.has(node.id)) fillColor = "#f3f4f6";

      nodes.push(
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={30} fill={fillColor} stroke="#1f2937" strokeWidth={2} />
          <text x={node.x} y={node.y - 5} textAnchor="middle" fontSize={12} fill={isSolution || isOnSolutionPath ? "white" : "#1f2937"} fontWeight="bold">
            {node.nodeId}
          </text>
          <text x={node.x} y={node.y + 10} textAnchor="middle" fontSize={10} fill={isSolution || isOnSolutionPath ? "white" : "#1f2937"}>
            L:{node.path.length}
          </text>
        </g>
      );

      node.children.forEach((child) => {
        if (!expandedNodes.has(child.id)) return;

        const lineColor = (child.isSolution || child.isOnSolutionPath) ? "#10b981" : "#1f2937";

        lines.push(
          <line
            key={`${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y + 30}
            x2={child.x}
            y2={child.y - 30}
            stroke={lineColor}
            strokeWidth={child.isOnSolutionPath ? 2.5 : 1.5}
          />
        );

        const midX = (node.x + child.x) / 2;
        const midY = (node.y + child.y) / 2;
        labels.push(
          <g key={`${node.id}-${child.id}-label`}>
            <rect
              x={midX - 12}
              y={midY - 10}
              width={24}
              height={20}
              fill="white"
              stroke="#6b7280"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={midX}
              y={midY + 4}
              fontSize={10}
              fill="#6b7280"
              textAnchor="middle"
              fontWeight="bold"
            >
              {child.nodeId}
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
    <div className="hc-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Hamiltonian Cycle</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Hamiltonian Cycle</h2>
              <p className="card-content">
                A <strong>Hamiltonian Cycle</strong> is a cycle in a graph that visits every vertex exactly once and returns to the starting vertex. Finding Hamiltonian cycles is an NP-complete problem with applications in routing, scheduling, and DNA sequencing. This visualization uses backtracking to explore the state space tree.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>O(N!) - Brute Force</li>
                    <li>Exponential time complexity</li>
                    <li>NP-complete problem</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(N) - Recursion depth</li>
                    <li>Visited set storage</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Visits all vertices exactly once</li>
                  <li>• Returns to starting vertex</li>
                  <li>• NP-complete decision problem</li>
                  <li>• Backtracking approach</li>
                  <li>• Dynamic cycle discovery</li>
                </ul>
              </div>
            </div>

            {/* Input Section */}
            <div className="card">
              <h2 className="card-title">Graph Input</h2>

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
                  {/* No path warning */}
                  {noPathExists && currentStep === steps.length - 1 && (
                    <div className="no-cycle-warning">
                      <AlertTriangle size={20} />
                      <span>No Hamiltonian cycles found in this graph!</span>
                    </div>
                  )}

                  {/* Graph visualization */}
                  {graph.nodes && graph.nodes.length > 0 && (
                    <div className="graph-visualization-container">
                      <div className="graph-canvas" ref={graphRef}>
                        <svg className="graph-svg">
                          {/* Render edges */}
                          {graph.edges.map((edge, index) => {
                            const isActive = stepData.edgeBeingChecked &&
                              ((stepData.edgeBeingChecked.from === edge.from && stepData.edgeBeingChecked.to === edge.to) ||
                               (stepData.edgeBeingChecked.from === edge.to && stepData.edgeBeingChecked.to === edge.from));

                            const isPathEdge = stepData.path && stepData.path.length > 1 &&
                              ((stepData.path.indexOf(edge.from) !== -1 && stepData.path.indexOf(edge.to) !== -1) &&
                               Math.abs(stepData.path.indexOf(edge.from) - stepData.path.indexOf(edge.to)) === 1);

                            return (
                              <g key={`edge-${index}`}>
                                <path
                                  d={getEdgePath(edge.from, edge.to)}
                                  className={`
                                    edge
                                    ${isActive ? 'active-edge' : ''}
                                    ${isPathEdge ? 'path-edge' : ''}
                                  `}
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
                          const isVisited = stepData.visitedNodes && stepData.visitedNodes.has(node);
                          const isCurrent = stepData.currentGraphNode === node;
                          const isPathNode = stepData.path && stepData.path.includes(node);

                          return (
                            <div
                              key={`node-${node}`}
                              className={`
                                graph-node
                                ${isCurrent ? 'current-node' : ''}
                                ${isVisited && !isCurrent ? 'visited-node' : ''}
                                ${isPathNode && !isCurrent && !isVisited ? 'path-node' : ''}
                              `}
                              style={{
                                left: `${nodePositions[node]?.x}px`,
                                top: `${nodePositions[node]?.y}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            >
                              <div className="node-id">{node}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* State Space Tree */}
                  <div className="tree-section">
                    <h3 className="array-title">State Space Tree</h3>
                    <div className="tree-container">
                      {renderTree()}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                      Nodes labeled with (nodeId / L:depth). Blue = current, Green = solution path, Gray = explored.
                    </div>
                  </div>

                  {/* Cycles Found */}
                  <div className="cycles-section">
                    <h3 className="array-title">Hamiltonian Cycles Found: {stepData.foundCycles.length}</h3>
                    <div className="cycles-container">
                      {stepData.foundCycles && stepData.foundCycles.length > 0
                        ? stepData.foundCycles.map((cycle, idx) => (
                            <div key={idx} className="cycle-item">
                              [{cycle.join(' → ')}]
                            </div>
                          ))
                        : "No cycles found yet..."}
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Cycles Found</div>
                      <div className="status-value blue-title">
                        {stepData.cyclesFound}
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
                  <div className="legend-color current-node"></div>
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color visited-node"></div>
                  <span className="legend-text">Visited Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color path-node"></div>
                  <span className="legend-text">Path Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color active-edge"></div>
                  <span className="legend-text">Active Edge</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color path-edge"></div>
                  <span className="legend-text">Path Edge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamiltonianCycle;