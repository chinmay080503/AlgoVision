import React, { useState, useEffect, useRef } from "react";
import "./BellmanFord.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Plus, Trash2, AlertTriangle } from "lucide-react";

const BellmanFord = () => {
  // Default graph (5 nodes)
  const defaultGraph = {
    nodes: [1, 2, 3, 4, 5],
    edges: [
      { from: 1, to: 2, weight: 6 },
      { from: 1, to: 3, weight: 5 },
      { from: 1, to: 4, weight: 5 },
      { from: 2, to: 5, weight: -1 },
      { from: 3, to: 2, weight: -2 },
      { from: 3, to: 5, weight: 1 },
      { from: 4, to: 3, weight: -2 },
      { from: 4, to: 6, weight: -1 },
      { from: 5, to: 7, weight: 3 },
      { from: 6, to: 7, weight: 3 }
    ],
    startNode: 1
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
  const [startNode, setStartNode] = useState(1);
  const [hasNegativeCycle, setHasNegativeCycle] = useState(false);
  const graphRef = useRef(null);

  useEffect(() => {
    const generatedSteps = generateSteps(graph);
    setSteps(generatedSteps);
    setTotalSteps(generatedSteps.length);
    setHasNegativeCycle(false);
  }, [graph, graph.startNode]);

  const initializeDistances = (nodes, start) => {
    if (!nodes || nodes.length === 0) return {};
    
    const distances = {};
    nodes.forEach(node => {
      distances[node] = node === start ? 0 : Infinity;
    });
    
    return distances;
  };

  const generateSteps = (graph) => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) return [];
    
    const { nodes, edges, startNode } = graph;
    const steps = [];
    const distances = initializeDistances(nodes, startNode);
    const predecessors = {};
    
    // Initialize predecessors
    nodes.forEach(node => {
      predecessors[node] = null;
    });

    steps.push({
      distances: { ...distances },
      predecessors: { ...predecessors },
      iteration: 0,
      edgeIndex: -1,
      action: `Initialized distances (${startNode} → 0, others → ∞)`,
      code: "Initialize",
      relaxedEdge: null,
      updatedNodes: [],
      negativeCycle: false
    });

    // Bellman-Ford algorithm
    for (let i = 0; i < nodes.length - 1; i++) {
      let updatedNodes = [];
      
      edges.forEach((edge, edgeIdx) => {
        const { from, to, weight } = edge;
        
        // Skip if either node doesn't exist
        if (!nodes.includes(from) || !nodes.includes(to)) return;
        
        // Show the edge being considered
        steps.push({
          distances: { ...distances },
          predecessors: { ...predecessors },
          iteration: i + 1,
          edgeIndex: edgeIdx,
          action: `Considering edge ${from} → ${to} (weight: ${weight})`,
          code: "Check edge",
          relaxedEdge: null,
          updatedNodes: [],
          negativeCycle: false
        });

        if (distances[from] + weight < distances[to]) {
          distances[to] = distances[from] + weight;
          predecessors[to] = from;
          updatedNodes.push(to);
          
          steps.push({
            distances: { ...distances },
            predecessors: { ...predecessors },
            iteration: i + 1,
            edgeIndex: edgeIdx,
            action: `Relaxed edge ${from} → ${to}: distance to ${to} updated to ${distances[to]}`,
            code: "Relax edge",
            relaxedEdge: { from, to },
            updatedNodes: [...updatedNodes],
            negativeCycle: false
          });
        }
      });
      
      // Show end of iteration
      if (updatedNodes.length > 0) {
        steps.push({
          distances: { ...distances },
          predecessors: { ...predecessors },
          iteration: i + 1,
          edgeIndex: -1,
          action: `Completed iteration ${i + 1}, updated nodes: ${updatedNodes.join(', ')}`,
          code: "End iteration",
          relaxedEdge: null,
          updatedNodes: [...updatedNodes],
          negativeCycle: false
        });
      } else {
        steps.push({
          distances: { ...distances },
          predecessors: { ...predecessors },
          iteration: i + 1,
          edgeIndex: -1,
          action: `Completed iteration ${i + 1}, no updates (early termination possible)`,
          code: "End iteration",
          relaxedEdge: null,
          updatedNodes: [],
          negativeCycle: false
        });
        
        // Early termination if no updates
        break;
      }
    }

    // Check for negative cycles
    let negativeCycleFound = false;
    edges.forEach((edge, edgeIdx) => {
      const { from, to, weight } = edge;
      
      if (!nodes.includes(from) || !nodes.includes(to)) return;
      
      if (distances[from] + weight < distances[to]) {
        negativeCycleFound = true;
        steps.push({
          distances: { ...distances },
          predecessors: { ...predecessors },
          iteration: nodes.length,
          edgeIndex: edgeIdx,
          action: `Negative cycle detected! Edge ${from} → ${to} can still be relaxed`,
          code: "Negative cycle",
          relaxedEdge: { from, to },
          updatedNodes: [],
          negativeCycle: true
        });
      }
    });

    if (!negativeCycleFound) {
      // Show final distances
      steps.push({
        distances: { ...distances },
        predecessors: { ...predecessors },
        iteration: nodes.length,
        edgeIndex: -1,
        action: `Algorithm completed with no negative cycles detected`,
        code: "Complete",
        relaxedEdge: null,
        updatedNodes: [],
        negativeCycle: false
      });

      // Show paths to some nodes
      const nodesToShow = nodes.filter(n => n !== startNode).slice(0, 3);
      nodesToShow.forEach(node => {
        if (distances[node] < Infinity) {
          const path = reconstructPath(predecessors, startNode, node);
          steps.push({
            distances: { ...distances },
            predecessors: { ...predecessors },
            iteration: nodes.length,
            edgeIndex: -1,
            action: `Shortest path from ${startNode} to ${node}: ${path.join(' → ')} (distance: ${distances[node]})`,
            code: "Show path",
            relaxedEdge: null,
            updatedNodes: [],
            path,
            negativeCycle: false
          });
        } else {
          steps.push({
            distances: { ...distances },
            predecessors: { ...predecessors },
            iteration: nodes.length,
            edgeIndex: -1,
            action: `No path exists from ${startNode} to ${node}`,
            code: "Show path",
            relaxedEdge: null,
            updatedNodes: [],
            path: [],
            negativeCycle: false
          });
        }
      });
    } else {
      setHasNegativeCycle(true);
    }

    return steps;
  };

  const reconstructPath = (predecessors, start, end) => {
    const path = [];
    let current = end;
    
    while (current !== null && current !== undefined) {
      path.unshift(current);
      current = predecessors[current];
      
      // Prevent infinite loops in case of cycles
      if (path.length > Object.keys(predecessors).length) {
        return ['cycle detected'];
      }
    }
    
    if (path[0] !== start) return ['no path'];
    return path;
  };

  const getCurrentStepData = () => {
    if (steps.length === 0 || !graph.nodes || graph.nodes.length === 0) {
      const distances = initializeDistances(graph.nodes, graph.startNode);
      const predecessors = {};
      graph.nodes.forEach(node => {
        predecessors[node] = null;
      });
      
      return {
        distances,
        predecessors,
        iteration: 0,
        edgeIndex: -1,
        action: "Click Next to start Bellman-Ford algorithm",
        code: "Initialize",
        relaxedEdge: null,
        updatedNodes: [],
        negativeCycle: false
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
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId),
      startNode: prev.startNode === nodeId ? (prev.nodes[0] || 1) : prev.startNode
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
    setHasNegativeCycle(false);
  };

  const setAsStartNode = (nodeId) => {
    setGraph(prev => ({
      ...prev,
      startNode: nodeId
    }));
    setCurrentStep(0);
    setHasNegativeCycle(false);
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
    const algorithm = `function bellmanFord(graph, start) {
  const { nodes, edges } = graph;
  const distances = {};
  const predecessors = {};
  
  // Initialize distances
  nodes.forEach(node => {
    distances[node] = node === start ? 0 : Infinity;
    predecessors[node] = null;
  });

  // Relax edges repeatedly
  for (let i = 0; i < nodes.length - 1; i++) {
    let updated = false;
    
    edges.forEach(edge => {
      const { from, to, weight } = edge;
      if (distances[from] + weight < distances[to]) {
        distances[to] = distances[from] + weight;
        predecessors[to] = from;
        updated = true;
      }
    });
    
    if (!updated) break; // Early termination
  }

  // Check for negative cycles
  edges.forEach(edge => {
    const { from, to, weight } = edge;
    if (distances[from] + weight < distances[to]) {
      throw new Error("Graph contains a negative cycle");
    }
  });

  return { distances, predecessors };
}`;

    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Initialize" && line.includes("distances[node] = node === start ? 0 : Infinity")) {
        highlight = true;
      }

      if (stepData.code === "Check edge" && line.includes("edges.forEach(edge => {")) {
        highlight = true;
      }

      if (stepData.code === "Relax edge" && line.includes("if (distances[from] + weight < distances[to])")) {
        highlight = true;
      }

      if (stepData.code === "Negative cycle" && line.includes("throw new Error(")) {
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

  const renderDistanceTable = () => {
    if (!stepData.distances || Object.keys(stepData.distances).length === 0) return null;
    
    return (
      <div className="distance-section">
        <h3>Current Distances</h3>
        <table className="distance-table">
          <thead>
            <tr>
              <th>Node</th>
              <th>Distance</th>
              <th>Predecessor</th>
            </tr>
          </thead>
          <tbody>
            {graph.nodes.map(node => {
              const isUpdated = stepData.updatedNodes.includes(node);
              const isCurrent = stepData.relaxedEdge && 
                (stepData.relaxedEdge.to === node || stepData.relaxedEdge.from === node);
              
              return (
                <tr 
                  key={`row-${node}`}
                  className={`
                    ${isUpdated ? 'updated-row' : ''}
                    ${isCurrent ? 'current-row' : ''}
                  `}
                >
                  <td>{node === graph.startNode ? `${node} (start)` : node}</td>
                  <td>
                    {stepData.distances[node] === Infinity ? '∞' : stepData.distances[node]}
                  </td>
                  <td>
                    {stepData.predecessors[node] || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bf-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">Bellman-Ford Algorithm</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About Bellman-Ford Algorithm</h2>
              <p className="card-content">
                The <strong>Bellman-Ford algorithm</strong> computes shortest paths from a single source vertex to all other vertices in a weighted graph. It can handle negative weights and detect negative cycles, with O(VE) time complexity.
              </p>
              <div className="complexity-grid">
                <div className="complexity-card blue-card">
                  <h3 className="complexity-title blue-title">Time Complexity</h3>
                  <ul className="complexity-list blue-text">
                    <li>O(VE) - Typically</li>
                    <li>Where V is vertices, E is edges</li>
                  </ul>
                </div>
                <div className="complexity-card green-card">
                  <h3 className="complexity-title green-title">Space Complexity</h3>
                  <ul className="complexity-list green-text">
                    <li>O(V) - Linear space</li>
                    <li>For distance and predecessor arrays</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Single-source shortest paths</li>
                  <li>• Works with negative weights</li>
                  <li>• Detects negative cycles</li>
                  <li>• Slower than Dijkstra's but more versatile</li>
                  <li>• Better for sparse graphs</li>
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
                          <div className="node-actions">
                            <button 
                              onClick={() => setAsStartNode(node)}
                              className={`start-button ${graph.startNode === node ? 'active-start' : ''}`}
                            >
                              {graph.startNode === node ? 'Start' : 'Set Start'}
                            </button>
                            <button 
                              onClick={() => removeNode(node)}
                              className="remove-button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
                  {/* Negative cycle warning */}
                  {hasNegativeCycle && (
                    <div className="negative-cycle-warning">
                      <AlertTriangle size={20} />
                      <span>Negative cycle detected in the graph!</span>
                    </div>
                  )}

                  {/* Graph visualization */}
                  {graph.nodes && graph.nodes.length > 0 && (
                    <div className="graph-visualization-container">
                      <div className="graph-canvas" ref={graphRef}>
                        <svg className="graph-svg">
                          {/* Render edges */}
                          {graph.edges.map((edge, index) => {
                            const isActive = stepData.relaxedEdge && 
                              stepData.relaxedEdge.from === edge.from && 
                              stepData.relaxedEdge.to === edge.to;
                            
                            const isPathEdge = stepData.path && 
                              stepData.path.includes(edge.from) && 
                              stepData.path.includes(edge.to) &&
                              stepData.path.indexOf(edge.from) < stepData.path.indexOf(edge.to);
                            
                            return (
                              <g key={`edge-${index}`}>
                                <path
                                  d={getEdgePath(edge.from, edge.to)}
                                  className={`
                                    edge 
                                    ${isActive ? 'active-edge' : ''}
                                    ${isPathEdge ? 'path-edge' : ''}
                                    ${stepData.negativeCycle && isActive ? 'negative-cycle-edge' : ''}
                                  `}
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
                          const isActive = stepData.updatedNodes.includes(node);
                          const isCurrent = stepData.relaxedEdge && 
                            (stepData.relaxedEdge.to === node || stepData.relaxedEdge.from === node);
                          const isStart = node === graph.startNode;
                          const isPathNode = stepData.path && stepData.path.includes(node);
                          
                          return (
                            <div
                              key={`node-${node}`}
                              className={`
                                graph-node 
                                ${isStart ? 'start-node' : ''}
                                ${isActive ? 'updated-node' : ''}
                                ${isCurrent ? 'current-node' : ''}
                                ${isPathNode ? 'path-node' : ''}
                              `}
                              style={{
                                left: `${nodePositions[node]?.x}px`,
                                top: `${nodePositions[node]?.y}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            >
                              <div className="node-id">{node}</div>
                              <div className="node-distance">
                                {stepData.distances && stepData.distances[node] !== undefined ? (
                                  <span>{stepData.distances[node] === Infinity ? '∞' : stepData.distances[node]}</span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Distance Table */}
                  {renderDistanceTable()}

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Current Iteration</div>
                      <div className="status-value blue-title">
                        {stepData.iteration} / {graph.nodes ? graph.nodes.length - 1 : 0}
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
                  {stepData.path && stepData.path.length > 0 && (
                    <div className="path-result">
                      <h3>Shortest Path</h3>
                      <div className="path">
                        {stepData.path.join(' → ')} (Total: {stepData.distances[stepData.path[stepData.path.length - 1]]})
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
                  <div className="legend-color start-node"></div>
                  <span className="legend-text">Start Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color current-node"></div>
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color updated-node"></div>
                  <span className="legend-text">Updated Node</span>
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
                <div className="legend-item">
                  <div className="legend-color negative-cycle-edge"></div>
                  <span className="legend-text">Negative Cycle</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color updated-row"></div>
                  <span className="legend-text">Updated Row</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BellmanFord;