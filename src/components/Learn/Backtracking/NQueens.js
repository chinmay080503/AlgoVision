import React, { useState, useEffect, useRef } from "react";
import "./NQueens.css";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, AlertTriangle } from "lucide-react";

class TreeNode {
  constructor(row, col, path = [], isLeaf = false) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.row = row;
    this.col = col;
    this.path = [...path];
    this.children = [];
    this.isSolution = false;
    this.isPruned = false;
    this.isLeaf = isLeaf;
    this.x = 0;
    this.y = 0;
  }
}

const NQueens = () => {
  const [n, setN] = useState(4);
  const [gameBoard, setGameBoard] = useState(Array(16).fill(0));
  const [gameActive, setGameActive] = useState(true);
  const [conflictMessage, setConflictMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [root, setRoot] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [speed, setSpeed] = useState(1200);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showVisualization, setShowVisualization] = useState(false);
  const boardRef = useRef(null);
  const treeRef = useRef(null);

  // Initialize board when N changes
  useEffect(() => {
    const newBoard = Array(n * n).fill(0);
    setGameBoard(newBoard);
    setGameActive(true);
    setConflictMessage(null);
    setShowVisualization(false);
  }, [n]);

  const checkConflicts = (board, size) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i * size + j] !== 1) continue;

        // Check same row
        for (let k = 0; k < size; k++) {
          if (k !== j && board[i * size + k] === 1) {
            return { conflict: true, row: i, col: j };
          }
        }

        // Check same column
        for (let k = 0; k < size; k++) {
          if (k !== i && board[k * size + j] === 1) {
            return { conflict: true, row: i, col: j };
          }
        }

        // Check diagonals
        for (let di = -size; di <= size; di++) {
          for (let dj = -size; dj <= size; dj++) {
            if ((di === 0 && dj === 0) || Math.abs(di) !== Math.abs(dj)) continue;
            const ni = i + di;
            const nj = j + dj;
            if (ni >= 0 && ni < size && nj >= 0 && nj < size && board[ni * size + nj] === 1) {
              return { conflict: true, row: i, col: j };
            }
          }
        }
      }
    }
    return { conflict: false };
  };

  const handleSquareClick = (index) => {
    if (!gameActive) return;

    const row = Math.floor(index / n);
    const col = index % n;
    const newBoard = [...gameBoard];

    if (newBoard[index] === 1) {
      // Remove queen
      newBoard[index] = 0;
      setGameBoard(newBoard);
      setConflictMessage(null);
    } else {
      // Try to place queen
      newBoard[index] = 1;
      const result = checkConflicts(newBoard, n);
      
      if (result.conflict) {
        setConflictMessage({
          message: `Conflict detected at (${result.row}, ${result.col})! This queen is under attack.`,
          conflictPos: { row: result.row, col: result.col }
        });
        // Don't add the queen
      } else {
        setGameBoard(newBoard);
        setConflictMessage(null);

        // Check if solved
        const queensPlaced = newBoard.filter(q => q === 1).length;
        if (queensPlaced === n) {
          setGameActive(false);
          setConflictMessage({ solved: true });
        }
      }
    }
  };

  const generateSteps = (boardSize) => {
    const steps = [];
    const solutions = [];
    let solutionCount = 0;

    const generatedRoot = new TreeNode(0, -1, []);
    steps.push({
      nodeId: generatedRoot.id,
      action: `Starting N-Queens solver. Need to place ${boardSize} queens on a ${boardSize}×${boardSize} board such that no two queens attack each other.`,
      code: "Initialize",
      row: 0,
      col: -1,
      board: Array(boardSize * boardSize).fill(0),
      visitedCells: new Set(),
      currentCell: null,
      solutionCount: 0,
      solutions: [],
      expandedNodes: new Set([generatedRoot.id])
    });

    function dfs(treeNode, row, placed, board, expandedSet) {
      if (row === boardSize) {
        // Solution found
        treeNode.isSolution = true;
        const solution = [...placed];
        solutions.push(solution);
        solutionCount++;

        // Make sure the solution node is in the expanded set
        const solutionExpandedSet = new Set([...expandedSet, treeNode.id]);

        steps.push({
          nodeId: treeNode.id,
          action: `🎉 SOLUTION FOUND! All ${boardSize} queens have been successfully placed without any conflicts. Solution #${solutionCount}: ${solution.map(p => `(${p[0]},${p[1]})`).join(', ')}`,
          code: "Cycle found",
          row: row,
          col: -1,
          board: board,
          visitedCells: new Set(),
          currentCell: null,
          solutionCount,
          solutions: [...solutions],
          expandedNodes: solutionExpandedSet
        });
        return;
      }

      // Try each column in this row
      const unvisited = [];
      for (let col = 0; col < boardSize; col++) {
        unvisited.push(col);
      }

      unvisited.forEach((col) => {
        // Check if position is safe
        let safe = true;

        // Check column
        for (let i = 0; i < row; i++) {
          if (placed.some(p => p[0] === i && p[1] === col)) {
            safe = false;
            break;
          }
        }

        // Check diagonals
        if (safe) {
          for (let p of placed) {
            if (Math.abs(p[0] - row) === Math.abs(p[1] - col)) {
              safe = false;
              break;
            }
          }
        }

        steps.push({
          nodeId: treeNode.id,
          action: `At row ${row}: Trying column ${col}. Checking if this position is safe (no conflicts with previously placed queens).`,
          code: "Explore",
          row: row,
          col: col,
          board: board,
          visitedCells: new Set(placed.map(p => p[0] * boardSize + p[1])),
          currentCell: row * boardSize + col,
          solutionCount,
          solutions: [...solutions],
          expandedNodes: new Set(expandedSet)
        });

        if (safe) {
          steps.push({
            nodeId: treeNode.id,
            action: `Column ${col} at row ${row} is SAFE ✓ - No queen in same column or diagonal. This position can be used.`,
            code: "Safe",
            row: row,
            col: col,
            board: board,
            visitedCells: new Set(placed.map(p => p[0] * boardSize + p[1])),
            currentCell: row * boardSize + col,
            solutionCount,
            solutions: [...solutions],
            expandedNodes: new Set(expandedSet)
          });
        } else {
          steps.push({
            nodeId: treeNode.id,
            action: `Column ${col} at row ${row} has CONFLICT ✗ - A queen already exists in this column or on a diagonal. Skip this position and try next column.`,
            code: "Unsafe",
            row: row,
            col: col,
            board: board,
            visitedCells: new Set(placed.map(p => p[0] * boardSize + p[1])),
            currentCell: row * boardSize + col,
            solutionCount,
            solutions: [...solutions],
            expandedNodes: new Set(expandedSet)
          });
        }

        if (safe) {
          // Create child node
          const childNode = new TreeNode(row, col, [...placed, [row, col]]);
          treeNode.children.push(childNode);

          const newExpandedSet = new Set(expandedSet);
          newExpandedSet.add(childNode.id);

          const newBoard = Array(boardSize * boardSize).fill(0);
          [...placed, [row, col]].forEach(([r, c]) => {
            newBoard[r * boardSize + c] = 1;
          });

          steps.push({
            nodeId: childNode.id,
            action: `PLACING QUEEN at Row ${row}, Column ${col} ♛ - Queen successfully placed! Moving to next row (${row + 1}) to place the next queen.`,
            code: "Visit",
            row: row,
            col: col,
            board: newBoard,
            visitedCells: new Set([...placed, [row, col]].map(p => p[0] * boardSize + p[1])),
            currentCell: row * boardSize + col,
            solutionCount,
            solutions: [...solutions],
            expandedNodes: newExpandedSet
          });

          // Recursively solve
          dfs(childNode, row + 1, [...placed, [row, col]], newBoard, newExpandedSet);
        }
      });

      steps.push({
        nodeId: treeNode.id,
        action: `BACKTRACKING from row ${row}: No valid column found for this row (all columns either have conflicts or were already tried). Going back to previous row to try a different position.`,
        code: "Backtrack",
        row: row,
        col: -1,
        board: board,
        visitedCells: new Set(placed.map(p => p[0] * boardSize + p[1])),
        currentCell: null,
        solutionCount,
        solutions: [...solutions],
        expandedNodes: new Set(expandedSet)
      });
    }

    dfs(generatedRoot, 0, [], Array(boardSize * boardSize).fill(0), new Set([generatedRoot.id]));

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
    if (solutions.length === 0) {
      steps.push({
        nodeId: null,
        action: `Search complete. No valid solutions found for the ${boardSize}×${boardSize} N-Queens problem.`,
        code: "Complete",
        row: -1,
        col: -1,
        board: Array(boardSize * boardSize).fill(0),
        visitedCells: new Set(),
        currentCell: null,
        solutionCount: 0,
        solutions: [...solutions],
        expandedNodes: new Set()
      });
    } else {
      steps.push({
        nodeId: null,
        action: `✓ Search complete! Found ${solutionCount} valid solution(s) for the ${boardSize}×${boardSize} N-Queens problem. Total steps explored: ${steps.length}`,
        code: "Complete",
        row: -1,
        col: -1,
        board: Array(boardSize * boardSize).fill(0),
        visitedCells: new Set(),
        currentCell: null,
        solutionCount,
        solutions: [...solutions],
        expandedNodes: new Set()
      });
    }

    return { generatedSteps: steps, generatedRoot, solutions };
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
        action: "Click 'See Solution' to start the N-Queens algorithm",
        code: "Initialize",
        row: 0,
        col: -1,
        board: Array(n * n).fill(0),
        visitedCells: new Set(),
        currentCell: null,
        solutionCount: 0,
        solutions: [],
        expandedNodes: new Set(root?.id ? new Set([root.id]) : new Set())
      };
    }
    const step = steps[Math.min(currentStep, steps.length - 1)];
    return {
      ...step,
      currentNode: step.nodeId ? findNodeById(root, step.nodeId) : null
    };
  };

  const stepData = getCurrentStepData();

  const handleShowSolution = () => {
    const { generatedSteps, generatedRoot } = generateSteps(n);
    setSteps(generatedSteps);
    setRoot(generatedRoot);
    setTotalSteps(generatedSteps.length);
    setCurrentStep(0);
    setShowVisualization(true);
    setGameActive(false);
    setConflictMessage(null);

    if (generatedRoot) {
      positionTree(generatedRoot, 600, 50, 180, 100);
    }

    // Scroll to visualization
    setTimeout(() => {
      treeRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

  const resetGame = () => {
    const newBoard = Array(n * n).fill(0);
    setGameBoard(newBoard);
    setGameActive(true);
    setConflictMessage(null);
    setShowVisualization(false);
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
          const nextStepIdx = prev + 1;
          if (steps[nextStepIdx]?.expandedNodes) {
            setExpandedNodes(steps[nextStepIdx].expandedNodes);
          }
          return nextStepIdx;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed, steps]);

  const renderTree = () => {
    if (!root) return null;

    const lines = [];
    const labels = [];
    const nodes = [];

    const traverse = (node) => {
      // Always render solution nodes and nodes in expanded set
      if (!expandedNodes.has(node.id) && node !== root && !node.isSolution && !node.isOnSolutionPath) return;

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
          <text 
            x={node.x} 
            y={node.y - 5} 
            textAnchor="middle" 
            fontSize={12} 
            fill={isSolution || isOnSolutionPath ? "white" : "#1f2937"} 
            fontWeight="bold"
          >
            {node.row >= 0 ? `R${node.row}` : "S"}
          </text>
          <text x={node.x} y={node.y + 10} textAnchor="middle" fontSize={10} fill={isSolution || isOnSolutionPath ? "white" : "#1f2937"}>
            C{node.col >= 0 ? node.col : '-'}
          </text>
        </g>
      );

      node.children.forEach((child) => {
        // Only draw lines to expanded children or solution children
        if (!expandedNodes.has(child.id) && !child.isSolution && !child.isOnSolutionPath) return;

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
              C{child.col}
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
    // Include solution nodes and expanded nodes in bounds calculation
    if (expandedSet.has(node.id) || node === root || node.isSolution || node.isOnSolutionPath) {
      bounds.minX = Math.min(bounds.minX, node.x);
      bounds.maxX = Math.max(bounds.maxX, node.x);
      bounds.minY = Math.min(bounds.minY, node.y);
      bounds.maxY = Math.max(bounds.maxY, node.y);

      node.children.forEach((child) => {
        if (expandedSet.has(child.id) || child.isSolution || child.isOnSolutionPath) {
          getTreeBounds(child, expandedSet, bounds);
        }
      });
    }
    return bounds;
  };

  const getHighlightedCode = () => {
    const algorithm = `function nQueens(boardSize) {
  const solutions = [];
  
  function isSafe(board, row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i] === col) return false;
    }
    
    // Check diagonals
    for (let i = 0; i < row; i++) {
      if (Math.abs(board[i] - col) === 
          Math.abs(i - row)) return false;
    }
    return true;
  }
  
  function dfs(board, row) {
    if (row === boardSize) {
      solutions.push([...board]);
      return;
    }
    
    for (let col = 0; col < boardSize; col++) {
      if (isSafe(board, row, col)) {
        board[row] = col;
        dfs(board, row + 1);
        board[row] = -1;
      }
    }
  }
  
  dfs(Array(boardSize).fill(-1), 0);
  return solutions;
}`;

    const lines = algorithm.split("\n");
    return lines.map((line, index) => {
      let highlight = false;

      if (stepData.code === "Visit" && line.includes("board[row] = col")) {
        highlight = true;
      }

      if (stepData.code === "Explore" && line.includes("for (let col")) {
        highlight = true;
      }

      if (stepData.code === "Cycle found" && line.includes("solutions.push")) {
        highlight = true;
      }

      if (stepData.code === "Backtrack" && line.includes("board[row] = -1")) {
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
    <div className="nq-container">
      <div className="max-width">
        <div className="header">
          <h1 className="title">N-Queens Problem</h1>
        </div>

        <div className="main-grid">
          <div className="left-column">
            {/* About Section */}
            <div className="card">
              <h2 className="card-title">About N-Queens</h2>
              <p className="card-content">
                The <strong>N-Queens Problem</strong> is a classic constraint satisfaction problem where you must place N queens on an N×N chessboard such that no two queens attack each other. Queens can attack horizontally, vertically, and diagonally. This visualization uses <strong>backtracking</strong>, a systematic way to explore all possibilities and prune invalid branches.
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
                    <li>Board configuration storage</li>
                  </ul>
                </div>
              </div>
              <div className="complexity-card yellow-card" style={{ marginTop: "16px" }}>
                <h3 className="complexity-title yellow-title">Key Characteristics</h3>
                <ul className="characteristics-list yellow-text">
                  <li>• Visits all rows with one queen each</li>
                  <li>• No two queens attack each other</li>
                  <li>• NP-complete decision problem</li>
                  <li>• Backtracking approach</li>
                  <li>• Dynamic solution discovery</li>
                </ul>
              </div>
            </div>

            {/* Board Configuration and Game */}
            <div className="card">
              <h2 className="card-title">Play N-Queens Game</h2>
              <p className="card-content">
                Select a board size and place queens freely on the board. Try to place all N queens without any conflicts. The game detects conflicts immediately.
              </p>
              
              <div className="input-group">
                <h3>Select Board Size (N):</h3>
                <div className="size-selector">
                  {[4, 5, 6, 7, 8].map(size => (
                    <button
                      key={size}
                      className={`size-button ${n === size ? 'active' : ''}`}
                      onClick={() => setN(size)}
                      disabled={!gameActive && showVisualization}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Board */}
              <div className="game-container">
                <div 
                  className="chess-board"
                  ref={boardRef}
                  style={{
                    gridTemplateColumns: `repeat(${n}, 1fr)`,
                    gridTemplateRows: `repeat(${n}, 1fr)`,
                  }}
                >
                  {gameBoard.map((queen, index) => {
                    const row = Math.floor(index / n);
                    const col = index % n;
                    const isLight = (row + col) % 2 === 0;
                    const isConflictPos = conflictMessage?.conflictPos?.row === row && conflictMessage?.conflictPos?.col === col;

                    return (
                      <div
                        key={index}
                        className={`
                          chess-square
                          ${isLight ? 'light' : 'dark'}
                          ${queen === 1 ? 'has-queen' : ''}
                          ${isConflictPos ? 'conflict-square' : ''}
                        `}
                        onClick={() => handleSquareClick(index)}
                      >
                        {queen === 1 && <div className="queen-symbol">♛</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Conflict Message */}
                {conflictMessage && !conflictMessage.solved && (
                  <div className="conflict-alert">
                    <AlertTriangle size={20} />
                    <span>{conflictMessage.message}</span>
                  </div>
                )}

                {/* Success Message */}
                {conflictMessage?.solved && (
                  <div className="success-alert">
                    <span>✓ Congratulations! You solved the {n}-Queens puzzle!</span>
                    <button 
                      className="btn-secondary"
                      onClick={handleShowSolution}
                      style={{ marginLeft: '16px' }}
                    >
                      See Algorithm
                    </button>
                  </div>
                )}

                {/* Queen Counter */}
                <div className="counter-info">
                  Queens placed: {gameBoard.filter(q => q === 1).length} / {n}
                </div>

                <div className="button-group">
                  <button 
                    onClick={resetGame}
                    className="gray-button"
                  >
                    Reset Game
                  </button>
                  <button 
                    onClick={handleShowSolution}
                    className="blue-button"
                  >
                    See Solution
                  </button>
                </div>
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
                  {/* Visualization Board */}
                  <div className="board-visualization">
                    <h3 className="array-title">Algorithm Board - Step by Step</h3>
                    <p className="vis-description">Watch the algorithm place queens row by row. Green squares show placed queens. Yellow highlights the current cell being evaluated.</p>
                    <div 
                      className="vis-chess-board"
                      style={{
                        gridTemplateColumns: `repeat(${n}, 1fr)`,
                      }}
                    >
                      {stepData.board.map((queen, index) => {
                        const row = Math.floor(index / n);
                        const col = index % n;
                        const isLightSquare = (row + col) % 2 === 0;
                        const isQueenPlaced = queen === 1;
                        const isCurrentCell = stepData.currentCell === index;
                        const isVisited = stepData.visitedCells?.has(index);

                        return (
                          <div
                            key={index}
                            className={`
                              vis-chess-square
                              ${isLightSquare ? 'light' : 'dark'}
                              ${isQueenPlaced ? 'queen-placed' : ''}
                              ${isCurrentCell ? 'current-cell' : ''}
                              ${isVisited && !isQueenPlaced && !isCurrentCell ? 'visited-cell' : ''}
                            `}
                          >
                            {isQueenPlaced && <div className="vis-queen-symbol">♛</div>}
                            {isCurrentCell && !isQueenPlaced && (
                              <div className="current-indicator">
                                <span className="pulse-dot"></span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* State Space Tree */}
                  <div className="tree-section" ref={treeRef}>
                    <h3 className="array-title">State Space Tree - Backtracking Exploration</h3>
                    <p className="tree-description">Each node represents a decision point. The tree shows which columns were tried for each row and which branches led to solutions.</p>
                    <div className="tree-container">
                      {showVisualization ? renderTree() : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                          Click "See Solution" to visualize the backtracking algorithm
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                      <strong>Legend:</strong> S = Start | R{`{X}`} = Row X | C{`{X}`} = Column X
                      <br />
                      <span style={{ color: '#3b82f6' }}>■</span> Blue = Current Node | 
                      <span style={{ color: '#10b981', marginLeft: '8px' }}>■</span> Green = Solution Path | 
                      <span style={{ color: '#f3f4f6', marginLeft: '8px' }}>■</span> Gray = Explored Node
                    </div>
                  </div>

                  {/* Solutions Found */}
                  <div className="cycles-section">
                    <h3 className="array-title">Solutions Found: {stepData.solutions.length}</h3>
                    <div className="cycles-container">
                      {stepData.solutions && stepData.solutions.length > 0
                        ? stepData.solutions.slice(0, 5).map((solution, idx) => (
                            <div key={idx} className="cycle-item">
                              Sol {idx + 1}: [{solution.map(p => `(${p[0]},${p[1]})`).join(', ')}]
                            </div>
                          ))
                        : "No solutions found yet..."}
                      {stepData.solutions && stepData.solutions.length > 5 && (
                        <div className="cycle-item">
                          ... and {stepData.solutions.length - 5} more solution(s)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="status-grid">
                    <div className="status-card blue-card">
                      <div className="status-label blue-text">Solutions Found</div>
                      <div className="status-value blue-title">
                        {stepData.solutionCount}
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
                {showVisualization && (
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
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="card">
              <h2 className="card-title">Color Legend</h2>
              <div className="legend-grid">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#fbbf24" }}></div>
                  <span className="legend-text">Current Cell</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color queen-color"></div>
                  <span className="legend-text">Queen Placed</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
                  <span className="legend-text">Current Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
                  <span className="legend-text">Solution Path</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#f3f4f6" }}></div>
                  <span className="legend-text">Explored Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NQueens;