import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Trash2 } from "lucide-react";
import "./TravellingSalesman.css";

const TravellingSalesman = () => {
  // Default graph with 5 cities
  const defaultGraph = {
    nodes: [
      { id: 1, x: 100, y: 100 },
      { id: 2, x: 200, y: 300 },
      { id: 3, x: 400, y: 200 },
      { id: 4, x: 300, y: 50 },
      { id: 5, x: 500, y: 100 }
    ],
    edges: [
      { from: 1, to: 2, weight: 10 },
      { from: 1, to: 3, weight: 15 },
      { from: 1, to: 4, weight: 20 },
      { from: 2, to: 3, weight: 35 },
      { from: 2, to: 4, weight: 25 },
      { from: 3, to: 4, weight: 30 },
      { from: 1, to: 5, weight: 50 },
      { from: 2, to: 5, weight: 45 },
      { from: 3, to: 5, weight: 40 },
      { from: 4, to: 5, weight: 55 }
    ]
  };

  const [graph, setGraph] = useState(defaultGraph);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [inputMode, setInputMode] = useState("visual");
  const [newNodeId, setNewNodeId] = useState("");
  const [newEdge, setNewEdge] = useState({ from: "", to: "", weight: "" });
  const [algorithm, setAlgorithm] = useState("bruteforce");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const graphRef = useRef(null);

  // Generate all possible paths for brute force approach
  const generatePaths = (nodes) => {
    if (nodes.length <= 1) return [nodes];
    
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      const current = nodes[i];
      const remaining = [...nodes.slice(0, i), ...nodes.slice(i + 1)];
      const remainingPerms = generatePaths(remaining);
      
      for (const perm of remainingPerms) {
        result.push([current, ...perm]);
      }
    }
    
    return result;
  };

  // Calculate the total distance of a path
  const calculatePathDistance = (path) => {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = graph.edges.find(e => 
        (e.from === from && e.to === to) || (e.from === to && e.to === from)
      );
      if (edge) {
        distance += edge.weight;
      } else {
        return Infinity; // No connection between these nodes
      }
    }
    // Return to starting city
    const returnEdge = graph.edges.find(e => 
      (e.from === path[path.length - 1] && e.to === path[0]) || 
      (e.from === path[0] && e.to === path[path.length - 1])
    );
    if (returnEdge) {
      distance += returnEdge.weight;
    } else {
      return Infinity;
    }
    return distance;
  };

  // Generate steps for brute force algorithm
  const generateBruteForceSteps = () => {
    const steps = [];
    const nodeIds = graph.nodes.map(n => n.id);
    
    steps.push({
      action: "Starting brute force approach - generating all possible paths",
      currentPath: [],
      bestPath: [],
      bestDistance: Infinity,
      code: "start",
      evaluatedPaths: 0
    });

    const allPaths = generatePaths(nodeIds);
    
    allPaths.forEach((path, index) => {
      steps.push({
        action: `Evaluating path: ${path.join(" → ")}`,
        currentPath: [...path],
        bestPath: [...(steps[steps.length - 1].bestPath)],
        bestDistance: steps[steps.length - 1].bestDistance,
        code: "evaluate",
        evaluatedPaths: index + 1
      });

      const distance = calculatePathDistance(path);
      
      if (distance < steps[steps.length - 1].bestDistance) {
        steps.push({
          action: `Found new best path: ${path.join(" → ")} (Distance: ${distance})`,
          currentPath: [...path],
          bestPath: [...path],
          bestDistance: distance,
          code: "newbest",
          evaluatedPaths: index + 1
        });
      }
    });

    steps.push({
      action: `Brute force complete! Best path found: ${steps[steps.length - 1].bestPath.join(" → ")} (Distance: ${steps[steps.length - 1].bestDistance})`,
      currentPath: [],
      bestPath: [...steps[steps.length - 1].bestPath],
      bestDistance: steps[steps.length - 1].bestDistance,
      code: "complete",
      evaluatedPaths: allPaths.length
    });

    return steps;
  };

  // Nearest neighbor heuristic
  const generateNearestNeighborSteps = () => {
    const steps = [];
    const nodes = [...graph.nodes.map(n => n.id)];
    const startNode = nodes[0];
    let path = [startNode];
    let remainingNodes = nodes.filter(n => n !== startNode);
    let totalDistance = 0;

    steps.push({
      action: `Starting nearest neighbor algorithm from city ${startNode}`,
      currentPath: [...path],
      remainingNodes: [...remainingNodes],
      totalDistance: 0,
      code: "start"
    });

    while (remainingNodes.length > 0) {
      const lastNode = path[path.length - 1];
      let nearestNode = null;
      let nearestDistance = Infinity;

      // Find nearest neighbor
      for (const node of remainingNodes) {
        const edge = graph.edges.find(e => 
          (e.from === lastNode && e.to === node) || 
          (e.from === node && e.to === lastNode)
        );
        if (edge && edge.weight < nearestDistance) {
          nearestNode = node;
          nearestDistance = edge.weight;
        }
      }

      if (nearestNode) {
        path.push(nearestNode);
        remainingNodes = remainingNodes.filter(n => n !== nearestNode);
        totalDistance += nearestDistance;

        steps.push({
          action: `Moving from ${lastNode} to nearest neighbor ${nearestNode} (distance: ${nearestDistance})`,
          currentPath: [...path],
          remainingNodes: [...remainingNodes],
          totalDistance: totalDistance,
          code: "move"
        });
      } else {
        // No connection found
        steps.push({
          action: `No connection found from ${lastNode} to remaining cities`,
          currentPath: [...path],
          remainingNodes: [...remainingNodes],
          totalDistance: Infinity,
          code: "deadend"
        });
        break;
      }
    }

    // Return to start if possible
    if (path.length === nodes.length) {
      const returnEdge = graph.edges.find(e => 
        (e.from === path[path.length - 1] && e.to === path[0]) || 
        (e.from === path[0] && e.to === path[path.length - 1])
      );
      if (returnEdge) {
        totalDistance += returnEdge.weight;
        steps.push({
          action: `Returning to starting city ${path[0]} (distance: ${returnEdge.weight})`,
          currentPath: [...path, path[0]],
          remainingNodes: [],
          totalDistance: totalDistance,
          code: "return"
        });
      } else {
        steps.push({
          action: `No return path from ${path[path.length - 1]} to ${path[0]}`,
          currentPath: [...path],
          remainingNodes: [],
          totalDistance: Infinity,
          code: "noreturn"
        });
      }
    }

    steps.push({
      action: `Nearest neighbor complete! Final path: ${steps[steps.length - 1].currentPath.join(" → ")} (Total distance: ${steps[steps.length - 1].totalDistance})`,
      currentPath: [...steps[steps.length - 1].currentPath],
      remainingNodes: [],
      totalDistance: steps[steps.length - 1].totalDistance,
      code: "complete"
    });

    return steps;
  };

  useEffect(() => {
    let generatedSteps = [];
    if (algorithm === "bruteforce") {
      generatedSteps = generateBruteForceSteps();
    } else {
      generatedSteps = generateNearestNeighborSteps();
    }
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [graph, algorithm]);

  const getCurrentStepData = () => {
    if (steps.length === 0 || graph.nodes.length === 0) {
      return {
        action: "Click Next to start the algorithm",
        currentPath: [],
        bestPath: [],
        bestDistance: Infinity,
        code: "initialize",
        evaluatedPaths: 0
      };
    }
    return steps[Math.min(currentStep, steps.length - 1)];
  };

  const stepData = getCurrentStepData();

  // Graph manipulation functions
  const addNode = () => {
    const nodeId = parseInt(newNodeId);
    if (isNaN(nodeId)) return;
    if (graph.nodes.some(n => n.id === nodeId)) return;
    
    // Default position in the center of the canvas
    const container = graphRef.current;
    const x = container ? container.clientWidth / 2 : 100;
    const y = container ? container.clientHeight / 2 : 100;
    
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: nodeId, x, y }]
    }));
    setNewNodeId("");
    setCurrentStep(0);
  };

  const addEdge = () => {
    const from = parseInt(newEdge.from);
    const to = parseInt(newEdge.to);
    const weight = parseInt(newEdge.weight);
    
    if (isNaN(from) || isNaN(to) || isNaN(weight)) return;
    if (!graph.nodes.some(n => n.id === from) || !graph.nodes.some(n => n.id === to)) return;
    if (from === to) return;
    
    const edgeExists = graph.edges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (edgeExists) return;

    setGraph(prev => ({
      ...prev,
      edges: [
        ...prev.edges,
        { from, to, weight }
      ]
    }));
    setNewEdge({ from: "", to: "", weight: "" });
    setCurrentStep(0);
  };

  const removeNode = (nodeId) => {
    setGraph(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    }));
    setCurrentStep(0);
  };

  const removeEdge = (from, to) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => !(
        (e.from === from && e.to === to) || (e.from === to && e.to === from))
      )
    }));
    setCurrentStep(0);
  };

  const resetToDefault = () => {
    setGraph(defaultGraph);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Handle node dragging
  const handleNodeMouseDown = (nodeId, e) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setIsDragging(true);
  };

  const handleNodeMouseMove = (e) => {
    if (!isDragging || !selectedNode) return;
    
    const container = graphRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === selectedNode ? { ...n, x, y } : n
      )
    }));
  };

  const handleNodeMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
    setCurrentStep(0);
  };

  // Animation control
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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
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

  // Calculate edge path for SVG
  const getEdgePath = (from, to) => {
    const fromNode = graph.nodes.find(n => n.id === from);
    const toNode = graph.nodes.find(n => n.id === to);
    if (!fromNode || !toNode) return "";
    
    return `M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`;
  };

  // Check if an edge is in the current path
  const isEdgeInPath = (from, to) => {
    if (!stepData.currentPath || stepData.currentPath.length < 2) return false;
    
    for (let i = 0; i < stepData.currentPath.length - 1; i++) {
      if ((stepData.currentPath[i] === from && stepData.currentPath[i + 1] === to) ||
          (stepData.currentPath[i] === to && stepData.currentPath[i + 1] === from)) {
        return true;
      }
    }
    
    // Check return to start
    if (stepData.currentPath.length > 1 && 
        ((stepData.currentPath[stepData.currentPath.length - 1] === from && stepData.currentPath[0] === to) ||
        (stepData.currentPath[stepData.currentPath.length - 1] === to && stepData.currentPath[0] === from))) {
      return true;
    }
    
    return false;
  };

  // Check if an edge is in the best path
  const isEdgeInBestPath = (from, to) => {
    if (!stepData.bestPath || stepData.bestPath.length < 2) return false;
    
    for (let i = 0; i < stepData.bestPath.length - 1; i++) {
      if ((stepData.bestPath[i] === from && stepData.bestPath[i + 1] === to) ||
          (stepData.bestPath[i] === to && stepData.bestPath[i + 1] === from)) {
        return true;
      }
    }
    
    // Check return to start
    if (stepData.bestPath.length > 1 && 
        ((stepData.bestPath[stepData.bestPath.length - 1] === from && stepData.bestPath[0] === to) ||
        (stepData.bestPath[stepData.bestPath.length - 1] === to && stepData.bestPath[0] === from))) {
      return true;
    }
    
    return false;
  };

  // Get highlighted code based on current step
  const getHighlightedCode = () => {
    const bruteForceCode = `function bruteForceTSP(cities) {
  let bestPath = [];
  let bestDistance = Infinity;
  
  // Generate all possible permutations
  const allPaths = generatePermutations(cities);
  
  // Evaluate each path
  for (const path of allPaths) {
    const distance = calculatePathDistance(path);
    
    // Update best path if found
    if (distance < bestDistance) {
      bestPath = [...path];
      bestDistance = distance;
    }
  }
  
  return { bestPath, bestDistance };
}`;

    const nearestNeighborCode = `function nearestNeighborTSP(cities, start) {
  let path = [start];
  let remaining = cities.filter(c => c !== start);
  let totalDistance = 0;
  
  while (remaining.length > 0) {
    const last = path[path.length - 1];
    let nearest = null;
    let minDist = Infinity;
    
    // Find nearest unvisited city
    for (const city of remaining) {
      const dist = getDistance(last, city);
      if (dist < minDist) {
        nearest = city;
        minDist = dist;
      }
    }
    
    if (nearest) {
      path.push(nearest);
      remaining = remaining.filter(c => c !== nearest);
      totalDistance += minDist;
    } else {
      break; // No connection found
    }
  }
  
  // Return to start if possible
  const returnDist = getDistance(path[path.length - 1], start);
  if (returnDist < Infinity) {
    totalDistance += returnDist;
    path.push(start);
  }
  
  return { path, totalDistance };
}`;

    const code = algorithm === "bruteforce" ? bruteForceCode : nearestNeighborCode;
    const lines = code.split("\n");
    
    return lines.map((line, index) => {
      let highlight = false;
      
      if (stepData.code === "start" && line.includes("let bestPath") || line.includes("let path")) {
        highlight = true;
      }
      
      if (stepData.code === "evaluate" && line.includes("for (const path of allPaths)")) {
        highlight = true;
      }
      
      if (stepData.code === "newbest" && line.includes("bestPath = [...path]")) {
        highlight = true;
      }
      
      if (stepData.code === "move" && line.includes("path.push(nearest)")) {
        highlight = true;
      }
      
      if (stepData.code === "complete" && line.includes("return")) {
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
    <div className="tsp-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Traveling Salesperson Problem</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About TSP</h2>
              <p className="card-content">
                The <strong>Traveling Salesperson Problem</strong> asks: Given a list of cities and distances between them, 
                what is the shortest possible route that visits each city exactly once and returns to the origin city?
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Brute Force</h3>
                  <ul className="complexity-list blue-text">
                    <li>O(n!) time complexity</li>
                    <li>Evaluates all possible paths</li>
                    <li>Guaranteed optimal solution</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Nearest Neighbor</h3>
                  <ul className="complexity-list green-text">
                    <li>O(n²) time complexity</li>
                    <li>Heuristic approach</li>
                    <li>Not always optimal</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• NP-Hard problem</li>
                  <li>• Exact solutions impractical for n greater than 20</li>
                  <li>• Many heuristic approaches exist</li>
                  <li>• Applications in logistics, manufacturing</li>
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

              <div className="algorithm-toggle">
                <button
                  className={`toggle-button ${algorithm === 'bruteforce' ? 'active' : ''}`}
                  onClick={() => setAlgorithm('bruteforce')}
                >
                  Brute Force
                </button>
                <button
                  className={`toggle-button ${algorithm === 'nearestneighbor' ? 'active' : ''}`}
                  onClick={() => setAlgorithm('nearestneighbor')}
                >
                  Nearest Neighbor
                </button>
              </div>

              {inputMode === 'visual' ? (
                <div className="visual-input">
                  <div className="input-group">
                    <h3>Cities</h3>
                    <div className="input-row">
                      <input
                        type="number"
                        placeholder="City ID"
                        value={newNodeId}
                        onChange={(e) => setNewNodeId(e.target.value)}
                      />
                      <button onClick={addNode} className="add-button">
                        <Plus size={16} /> Add City
                      </button>
                    </div>
                    <div className="node-list">
                      {graph.nodes.map(node => (
                        <div key={node.id} className="node-item">
                          <span>City {node.id}</span>
                          <button 
                            onClick={() => removeNode(node.id)}
                            className="remove-button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <h3>Connections</h3>
                    <div className="input-row">
                      <select
                        value={newEdge.from}
                        onChange={(e) => setNewEdge({...newEdge, from: e.target.value})}
                      >
                        <option value="">From</option>
                        {graph.nodes.map(node => (
                          <option key={`from-${node.id}`} value={node.id}>{node.id}</option>
                        ))}
                      </select>
                      <select
                        value={newEdge.to}
                        onChange={(e) => setNewEdge({...newEdge, to: e.target.value})}
                      >
                        <option value="">To</option>
                        {graph.nodes.map(node => (
                          <option key={`to-${node.id}`} value={node.id}>{node.id}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Distance"
                        value={newEdge.weight}
                        onChange={(e) => setNewEdge({...newEdge, weight: e.target.value})}
                      />
                      <button onClick={addEdge} className="add-button">
                        <Plus size={16} /> Add Connection
                      </button>
                    </div>
                    <div className="edge-list">
                      {graph.edges.map((edge, index) => (
                        <div key={index} className="edge-item">
                          <span>{edge.from} ↔ {edge.to} (distance: {edge.weight})</span>
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
                        // Ignore invalid JSON during typing
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
                  {/* Graph visualization */}
                  <div className="graph-visualization-container">
                    <div 
                      className="graph-canvas" 
                      ref={graphRef}
                      onMouseMove={handleNodeMouseMove}
                      onMouseUp={handleNodeMouseUp}
                      onMouseLeave={handleNodeMouseUp}
                    >
                      <svg className="graph-svg">
                        {/* Render edges */}
                        {graph.edges.map((edge, index) => {
                          const isCurrent = isEdgeInPath(edge.from, edge.to);
                          const isBest = isEdgeInBestPath(edge.from, edge.to);
                          
                          return (
                            <g key={`edge-${index}`}>
                              <path
                                d={getEdgePath(edge.from, edge.to)}
                                className={`
                                  edge 
                                  ${isCurrent ? 'current-path' : ''}
                                  ${isBest ? 'best-path' : ''}
                                `}
                              />
                              <text
                                className="edge-weight"
                                x={(graph.nodes.find(n => n.id === edge.from).x + graph.nodes.find(n => n.id === edge.to).x) / 2}
                                y={(graph.nodes.find(n => n.id === edge.from).y + graph.nodes.find(n => n.id === edge.to).y) / 2}
                                dy="-5"
                                textAnchor="middle"
                                fontWeight="bold"
                              >
                                {edge.weight}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Render nodes */}
                      {graph.nodes.map(node => {
                        const isCurrent = stepData.currentPath && stepData.currentPath.includes(node.id);
                        const isBest = stepData.bestPath && stepData.bestPath.includes(node.id);
                        
                        return (
                          <div
                            key={`node-${node.id}`}
                            className={`
                              graph-node 
                              ${isCurrent ? 'current-node' : ''}
                              ${isBest ? 'best-node' : ''}
                            `}
                            style={{
                              left: `${node.x}px`,
                              top: `${node.y}px`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                          >
                            <div className="node-id">{node.id}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Algorithm</div>
                      <div className="status-value blue-title">
                        {algorithm === "bruteforce" ? "Brute Force" : "Nearest Neighbor"}
                      </div>
                    </div>
                    <div className="status-card green-card">
                      <div className="status-label green-text">Steps</div>
                      <div className="status-value green-title">
                        {currentStep + 1} / {totalSteps}
                      </div>
                    </div>
                    {algorithm === "bruteforce" && (
                      <div className="status-card yellow-card">
                        <div className="status-label yellow-text">Paths Evaluated</div>
                        <div className="status-value yellow-title">
                          {stepData.evaluatedPaths || 0}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Path */}
                  {stepData.currentPath && stepData.currentPath.length > 0 && (
                    <div className="path-result">
                      <h3>Current Path</h3>
                      <div className="path">
                        {stepData.currentPath.join(' → ')}
                        {stepData.totalDistance !== undefined && stepData.totalDistance < Infinity && (
                          <span className="path-distance"> (Distance: {stepData.totalDistance})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Best Path */}
                  {stepData.bestPath && stepData.bestPath.length > 0 && stepData.bestDistance < Infinity && (
                    <div className="path-result best-path-result">
                      <h3>Best Path Found</h3>
                      <div className="path">
                        {stepData.bestPath.join(' → ')}
                        <span className="path-distance"> (Distance: {stepData.bestDistance})</span>
                      </div>
                    </div>
                  )}

                  {/* Action Container */}
                  <div className="action-container">
                    <div className="action-label">Current Action:</div>
                    <div className="action-text">{stepData.action}</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="controls-container">
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
                  <div className="legend-color graph-node"></div>
                  <span className="legend-text">City</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color current-node"></div>
                  <span className="legend-text">Current Path City</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color best-node"></div>
                  <span className="legend-text">Best Path City</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color edge"></div>
                  <span className="legend-text">Connection</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color current-path"></div>
                  <span className="legend-text">Current Path</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color best-path"></div>
                  <span className="legend-text">Best Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravellingSalesman;