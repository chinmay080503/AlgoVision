import React, { useState, useEffect, useRef } from "react";
import "./AllPairsShortestPath.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Trash2 } from "lucide-react";

const AllPairsShortestPath = () => {
  // Default graph (4 nodes)
  const defaultGraph = {
    nodes: [1, 2, 3, 4],
    edges: [
      { from: 1, to: 2, weight: 3 },
      { from: 1, to: 4, weight: 7 },
      { from: 2, to: 1, weight: 8 },
      { from: 2, to: 3, weight: 2 },
      { from: 3, to: 1, weight: 5 },
      { from: 3, to: 4, weight: 1 },
      { from: 4, to: 1, weight: 2 }
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
  const graphRef = useRef(null);

  useEffect(() => {
    const generatedSteps = generateSteps(graph);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
  }, [graph]);

  const initializeMatrix = (nodes) => {
    if (!nodes || nodes.length === 0) return { dist: [], next: [] };
    
    const n = nodes.length;
    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
    const next = Array(n).fill().map(() => Array(n).fill(null));
    
    // Set diagonal to 0
    for (let i = 0; i < n; i++) {
      dist[i][i] = 0;
    }
    
    return { dist, next };
  };

  const generateSteps = (graph) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return [];
    
    const { nodes, edges } = graph;
    const { dist, next } = initializeMatrix(nodes);
    const steps = [];
    
    // Set initial edges
    edges.forEach(edge => {
      const fromIdx = nodes.indexOf(edge.from);
      const toIdx = nodes.indexOf(edge.to);
      if (fromIdx !== -1 && toIdx !== -1) {
        dist[fromIdx][toIdx] = edge.weight;
        next[fromIdx][toIdx] = toIdx;
      }
    });

    steps.push({
      dist: JSON.parse(JSON.stringify(dist)),
      next: JSON.parse(JSON.stringify(next)),
      k: -1,
      i: -1,
      j: -1,
      action: "Initialized distance matrix with direct edges and diagonal set to 0",
      code: "Initialize",
      showPath: false,
      path: []
    });

    // Floyd-Warshall algorithm
    for (let k = 0; k < nodes.length; k++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          // Skip if any indices are invalid
          if (i >= dist.length || j >= dist.length || k >= dist.length) continue;
          
          steps.push({
            dist: JSON.parse(JSON.stringify(dist)),
            next: JSON.parse(JSON.stringify(next)),
            k,
            i,
            j,
            action: `Checking if path from ${nodes[i]} to ${nodes[j]} through ${nodes[k]} is shorter`,
            code: "Check path",
            showPath: false,
            path: []
          });

          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            next[i][j] = next[i][k];
            
            steps.push({
              dist: JSON.parse(JSON.stringify(dist)),
              next: JSON.parse(JSON.stringify(next)),
              k,
              i,
              j,
              action: `Found shorter path from ${nodes[i]} to ${nodes[j]} through ${nodes[k]} (New distance: ${dist[i][j]})`,
              code: "Update distance",
              showPath: false,
              path: []
            });
          }
        }
      }
    }

    // Path reconstruction examples
    for (let i = 0; i < Math.min(nodes.length, 3); i++) {
      for (let j = 0; j < Math.min(nodes.length, 3); j++) {
        if (i !== j && dist[i] && dist[i][j] < Infinity) {
          const path = reconstructPath(nodes, next, i, j);
          steps.push({
            dist: JSON.parse(JSON.stringify(dist)),
            next: JSON.parse(JSON.stringify(next)),
            k: -1,
            i,
            j,
            action: `Reconstructing path from ${nodes[i]} to ${nodes[j]}`,
            code: "Reconstruct path",
            showPath: true,
            path
          });
        }
      }
    }

    steps.push({
      dist: JSON.parse(JSON.stringify(dist)),
      next: JSON.parse(JSON.stringify(next)),
      k: -1,
      i: -1,
      j: -1,
      action: "All-pairs shortest paths calculation complete",
      code: "Complete",
      showPath: false,
      path: []
    });

    return steps;
  };

  const reconstructPath = (nodes, next, i, j) => {
    if (!next[i] || next[i][j] === null) return [];
    let path = [nodes[i]];
    while (i !== j) {
      i = next[i][j];
      path.push(nodes[i]);
    }
    return path;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0 || !graph.nodes || graph.nodes.length === 0) {
      const { dist, next } = initializeMatrix(graph.nodes);
      return {
        dist,
        next,
        k: -1,
        i: -1,
        j: -1,
        action: "Click Next to start Floyd-Warshall algorithm",
        code: "Initialize",
        showPath: false,
        path: []
      };
    }
    return steps[Math.min(currentStep, steps.length - 1)];
  };

  const stepData = getCurrentStepData();

  // Graph manipulation functions
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
    const weight = parseInt(newEdge.weight);
    
    if (isNaN(from) || isNaN(to) || isNaN(weight)) return;
    if (!graph.nodes.includes(from) || !graph.nodes.includes(to)) return;
    
    const edgeExists = graph.edges.some(
      e => e.from === from && e.to === to
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
      nodes: prev.nodes.filter(n => n !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    }));
    setCurrentStep(0);
  };

  const removeEdge = (from, to) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => !(e.from === from && e.to === to))
    }));
    setCurrentStep(0);
  };

  const resetToDefault = () => {
    setGraph(defaultGraph);
    setCurrentStep(0);
    setIsPlaying(false);
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
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = dist * 0.2;
    
    const ctrlX = fromPos.x + dx * 0.5 - dy * 0.2;
    const ctrlY = fromPos.y + dy * 0.5 + dx * 0.2;
    
    return `M${fromPos.x},${fromPos.y} Q${ctrlX},${ctrlY} ${toPos.x},${toPos.y}`;
  };

  const getHighlightedCode = () => {
    const algorithm = `function floydWarshall(graph) {
  const { nodes, edges } = graph;
  const n = nodes.length;
  const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
  const next = Array(n).fill().map(() => Array(n).fill(null));
  
  // Initialize
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }
  
  edges.forEach(edge => {
    const fromIdx = nodes.indexOf(edge.from);
    const toIdx = nodes.indexOf(edge.to);
    dist[fromIdx][toIdx] = edge.weight;
    next[fromIdx][toIdx] = toIdx;
  });

  // Floyd-Warshall algorithm
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  return { dist, next };
}`;

    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Initialize" && line.includes("dist[i][i] = 0")) {
        highlight = true;
      }

      if (stepData.code === "Check path" && line.includes("for (let k = 0; k < n; k++)")) {
        highlight = true;
      }

      if (stepData.code === "Update distance" && line.includes("if (dist[i][k] + dist[k][j] < dist[i][j])")) {
        highlight = true;
      }

      if (stepData.code === "Reconstruct path" && line.includes("return { dist, next }")) {
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

  // Render the distance matrix with proper checks
  const renderDistanceMatrix = () => {
    if (!stepData.dist || stepData.dist.length === 0) return null;
    
    return (
      <div className="matrix-section">
        <h3>Distance Matrix</h3>
        <table className="matrix-table">
          <thead>
            <tr>
              <th></th>
              {graph.nodes.map(node => (
                <th key={`col-${node}`}>{node}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stepData.dist.map((row, i) => (
              <tr key={`row-${i}`}>
                <th>{graph.nodes[i]}</th>
                {row.map((cell, j) => (
                  <td 
                    key={`cell-${i}-${j}`}
                    className={`
                      ${stepData.k === i && stepData.i === i && stepData.j === j ? 'current-cell' : ''}
                      ${stepData.k >= 0 && (i === stepData.k || j === stepData.k) ? 'active-row-col' : ''}
                    `}
                  >
                    {cell === Infinity ? '∞' : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="apsp-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">All-Pairs Shortest Path (Floyd-Warshall)</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Floyd-Warshall Algorithm</h2>
              <p className="card-content">
                The <strong>Floyd-Warshall algorithm</strong> finds shortest paths between all pairs of vertices in a weighted graph. It handles both positive and negative weights (but no negative cycles) and has O(V³) time complexity, making it suitable for dense graphs.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>O(V³) - Cubic time</li>
                    <li>Where V is number of vertices</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(V²) - Quadratic space</li>
                    <li>For distance and path matrices</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Finds all pairs shortest paths</li>
                  <li>• Works with negative weights</li>
                  <li>• Detects negative cycles</li>
                  <li>• Dynamic programming approach</li>
                  <li>• Better for dense graphs</li>
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
                    <h3>Edges</h3>
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
                      <input
                        type="number"
                        placeholder="Weight"
                        value={newEdge.weight}
                        onChange={(e) => setNewEdge({...newEdge, weight: e.target.value})}
                      />
                      <button onClick={addEdge} className="add-button">
                        <Plus size={16} /> Add Edge
                      </button>
                    </div>
                    <div className="edge-list">
                      {graph.edges.map((edge, index) => (
                        <div key={index} className="edge-item">
                          <span>{edge.from} → {edge.to} (weight: {edge.weight})</span>
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
                  {graph.nodes && graph.nodes.length > 0 && (
                    <div className="graph-visualization-container">
                      <div className="graph-canvas" ref={graphRef}>
                        <svg className="graph-svg">
                          {/* Render edges */}
                          {graph.edges.map((edge, index) => {
                            const isActive = stepData.showPath && 
                              stepData.path && 
                              stepData.path.includes(edge.from) && 
                              stepData.path.includes(edge.to) &&
                              stepData.path.indexOf(edge.from) < stepData.path.indexOf(edge.to);
                            
                            return (
                              <g key={`edge-${index}`}>
                                <path
                                  d={getEdgePath(edge.from, edge.to)}
                                  className={`edge ${isActive ? 'active-path' : ''}`}
                                  markerEnd="url(#arrowhead)"
                                />
                                <text
                                  className="edge-weight"
                                  x={(nodePositions[edge.from]?.x + nodePositions[edge.to]?.x) / 2}
                                  y={(nodePositions[edge.from]?.y + nodePositions[edge.to]?.y) / 2}
                                  dy="-5"
                                  textAnchor="middle"
                                  fontWeight="bold"
                                >
                                  {edge.weight}
                                </text>
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
                          const isActive = stepData.showPath && stepData.path && stepData.path.includes(node);
                          const isCurrent = stepData.i !== -1 && graph.nodes[stepData.i] === node;
                          const nodeIndex = graph.nodes.indexOf(node);
                          
                          return (
                            <div
                              key={`node-${node}`}
                              className={`graph-node ${isActive ? 'active-node' : ''} ${isCurrent ? 'current-node' : ''}`}
                              style={{
                                left: `${nodePositions[node]?.x}px`,
                                top: `${nodePositions[node]?.y}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            >
                              <div className="node-id">{node}</div>
                              <div className="node-distance">
                                {stepData.dist && stepData.dist.length > 0 && (
                                  <>
                                    {stepData.i === nodeIndex && stepData.j !== -1 ? (
                                      <span>{stepData.dist[stepData.i]?.[stepData.j]}</span>
                                    ) : (
                                      <span>{stepData.dist[nodeIndex]?.[nodeIndex]}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Distance Matrix */}
                  {renderDistanceMatrix()}

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Current Phase</div>
                      <div className="status-value blue-title">
                        {currentStep === 0 ? "Initial" : 
                         currentStep < steps.findIndex(step => step.code === "Start trace") ? "DP Calculation" :
                         currentStep < steps.length - 1 ? "Path Tracing" : "Complete"}
                      </div>
                    </div>
                    <div className="status-card green-card">
                      <div className="status-label green-text">Steps</div>
                      <div className="status-value green-title">
                        {currentStep + 1} / {totalSteps}
                      </div>
                    </div>
                  </div>

                  {/* Path Reconstruction */}
                  {stepData.showPath && stepData.path && (
                    <div className="path-result">
                      <h3>Shortest Path from {graph.nodes[stepData.i]} to {graph.nodes[stepData.j]}</h3>
                      <div className="path">
                        {stepData.path.join(' → ')} (Total: {stepData.dist[stepData.i]?.[stepData.j]})
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
                  <div className="legend-color current-node"></div>
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color active-node"></div>
                  <span className="legend-text">Path Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color active-path"></div>
                  <span className="legend-text">Path Edge</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color current-cell"></div>
                  <span className="legend-text">Current Cell</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color active-row-col"></div>
                  <span className="legend-text">Active Row/Column</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPairsShortestPath;