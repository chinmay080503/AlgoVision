// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import BubbleSort from './components/Learn/Sorting/BubbleSort';
import SelectionSort from './components/Learn/Sorting/SelectionSort';
import InsertionSort from './components/Learn/Sorting/InsertionSort';
import MergeSort from './components/Learn/Sorting/MergeSort';
import QuickSort from './components/Learn/Sorting/QuickSort';
import HeapSort from './components/Learn/Sorting/HeapSort';
import ShellSort from './components/Learn/Sorting/ShellSort';
import CountingSort from './components/Learn/Sorting/CountingSort';
import RadixSort from './components/Learn/Sorting/RadixSort';
import BucketSort from './components/Learn/Sorting/BucketSort';
import LinearSearch from './components/Learn/Searching/LinearSeach';
import BinarySearch from './components/Learn/Searching/BinarySearch';
import JumpSearch from './components/Learn/Searching/JumpSearch';
import ExponentialSearch from './components/Learn/Searching/ExponentialSearch';
import TernarySearch from './components/Learn/Searching/TernarySearch';
import LongestCommonSubsequence from './components/Learn/DynamicProgramming/LongestCommonSubsequence';
import MatrixChainMultiplication from './components/Learn/DynamicProgramming/MatrixChainMultiplication';
import KnapsackZeroOne from './components/Learn/DynamicProgramming/Knapsack01';
import AllPairsShortestPath from './components/Learn/DynamicProgramming/AllPairsShortestPath';
import BellmanFord from './components/Learn/DynamicProgramming/BellmanFord';
import TravellingSalesman from './components/Learn/DynamicProgramming/TravellingSalesman';
import StringPermutation from './components/Learn/Backtracking/StringPermutation';
import SumOfSubsets from './components/Learn/Backtracking/SumOfSubsets';
import NQueens from './components/Learn/Backtracking/NQueens';
import HamiltonianCycle from './components/Learn/Backtracking/HamiltonianCycle';
import MColoring from './components/Learn/Backtracking/MColoring';
import AssignmentProblem from './components/Learn/BranchAndBound/AssignmentProblem';
import TravellingSalesmanBB from './components/Learn/BranchAndBound/TravellingSalesmanBB';
import KnapsackBB from './components/Learn/BranchAndBound/KnapsackBB';
import SetCoverBB from './components/Learn/BranchAndBound/SetCoverBB';
import IntegerProgrammingBB from './components/Learn/BranchAndBound/IntegerProgrammingBB';
import QuizHome from './components/Quiz/QuizHome';
import QuizTopic from './components/Quiz/QuizTopic';
import Quiz from './components/Quiz/Quiz';
import Progress from './pages/Progress';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Forum from './components/Forum/Forum';
import AIAssistant from './components/AI/AIAssitant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/sorting/bubble-sort" element={<BubbleSort/>} />
        <Route path="/learn/sorting/selection-sort" element={<SelectionSort/ >} />
        <Route path="/learn/sorting/insertion-sort" element={<InsertionSort/ >} />
        <Route path="/learn/sorting/merge-sort" element={<MergeSort/ >} />
        <Route path="/learn/sorting/quick-sort" element={<QuickSort/ >} />
        <Route path="/learn/sorting/heap-sort" element={<HeapSort/ >} />
        <Route path="/learn/sorting/shell-sort" element={<ShellSort/ >} />
        <Route path="/learn/sorting/counting-sort" element={<CountingSort/ >} />
        <Route path="/learn/sorting/radix-sort" element={<RadixSort/ >} />
        <Route path="/learn/sorting/bucket-sort" element={<BucketSort/ >} />
        <Route path="/learn/searching/linear-search" element={<LinearSearch/ >} />
        <Route path="/learn/searching/binary-search" element={<BinarySearch/ >} />
        <Route path="/learn/searching/jump-search" element={<JumpSearch/ >} />
        <Route path="/learn/searching/exponential-search" element={<ExponentialSearch/ >} />
        <Route path="/learn/searching/ternary-search" element={<TernarySearch/ >} />
        <Route path="/learn/dynamic-programming/lcs-problem" element={<LongestCommonSubsequence/>} />
        <Route path="/learn/dynamic-programming/matrix-chain-multiplication" element={<MatrixChainMultiplication/>} /> 
        <Route path="/learn/dynamic-programming/0/1-knapsack-problem" element={<KnapsackZeroOne/>} />
        <Route path="/learn/dynamic-programming/floyd-warshall-algorithm" element={<AllPairsShortestPath/>} />
        <Route path="/learn/dynamic-programming/bellman-ford's-algorithm" element={<BellmanFord/>} />
        <Route path="/learn/dynamic-programming/travelling-salesman-problem" element={<TravellingSalesman/>} />
        <Route path="/learn/backtracking/string-permutation-problem" element={<StringPermutation/>} />
        <Route path="/learn/backtracking/sum-of-subsets" element={<SumOfSubsets/>} />
        <Route path="/learn/backtracking/n-queens-problem" element={<NQueens/>} />
        <Route path="learn/backtracking/hamiltonian-cycle" element={<HamiltonianCycle/>} />
        <Route path="learn/backtracking/m-coloring-problem" element={<MColoring/>} />
      
        <Route path="/learn/branch&bound/assignment-problem" element={<AssignmentProblem/>} />
        <Route path="/learn/branch&bound/travelling-salesman-problem" element={<TravellingSalesmanBB/>} />
        <Route path="/learn/branch&bound/0/1-knapsack-problem" element={<KnapsackBB/>} />
        <Route path="/learn/branch&bound/set-cover-problem" element={<SetCoverBB/>} />
        <Route path="/learn/branch&bound/integer-programming" element={<IntegerProgrammingBB/>} />  
        <Route path="/quiz" element={<QuizHome />} />
        <Route path="/quiz/:topic" element={<QuizTopic />} />
        <Route path="/quiz/:topic/:algo" element={<Quiz />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/forum" element={<Forum/>} />
        <Route path="/ai-assistant" element={<AIAssistant/>} />
      </Routes>
    </Router>
  );
}

export default App;
