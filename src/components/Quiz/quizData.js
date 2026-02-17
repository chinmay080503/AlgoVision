// src/data/quizData.js
const quizData = {
  "bubble-sort": [
    {
      question: "What is the worst-case time complexity of Bubble Sort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
      answer: "O(n²)",
      explanation:
        "Bubble Sort has O(n²) worst-case complexity because it may require up to n passes, each making n-1 comparisons.",
    },
    {
      question: "In which case does Bubble Sort perform best?",
      options: [
        "Random data",
        "Reverse sorted data",
        "Already sorted data",
        "All cases same",
      ],
      answer: "Already sorted data",
      explanation:
        "Best case is O(n) when array is sorted, as it only needs one pass to verify.",
    },
    {
      question: "What is the space complexity of Bubble Sort?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation:
        "It sorts in-place with only constant additional space needed.",
    },
    {
      question: "Which statement about Bubble Sort is correct?",
      options: [
        "It always performs better than Quick Sort",
        "It works by repeatedly selecting the minimum element",
        "It is a stable sorting algorithm",
        "It requires O(n) additional space",
      ],
      answer: "It is a stable sorting algorithm",
      explanation:
        "Equal elements maintain their relative order during sorting.",
    },
    {
      question:
        "After first pass of Bubble Sort on [5,3,8,6], what is the array?",
      options: ["[3,5,6,8]", "[3,5,8,6]", "[5,3,6,8]", "[3,8,5,6]"],
      answer: "[3,5,6,8]",
      explanation:
        "The largest element (8) bubbles up to its correct position.",
    },
    {
      question:
        "What optimization can reduce Bubble Sort passes on sorted data?",
      options: [
        "Add a flag to check if swaps occurred",
        "Sort in both directions alternately",
        "Use recursion",
        "Both A and B",
      ],
      answer: "Add a flag to check if swaps occurred",
      explanation:
        "A swap flag allows early termination if no swaps occur in a pass.",
    },
    {
      question: "How many comparisons does Bubble Sort make in worst case?",
      options: ["n", "n²", "n(n-1)/2", "n log n"],
      answer: "n(n-1)/2",
      explanation: "It makes (n-1)+(n-2)+...+1 = n(n-1)/2 comparisons.",
    },
    {
      question: "What real-world analogy describes Bubble Sort?",
      options: [
        "Organizing books by swapping adjacent ones",
        "Finding the tallest person in a line",
        "Dividing cards into piles",
        "Sorting coins by dates",
      ],
      answer: "Organizing books by swapping adjacent ones",
      explanation:
        "It resembles physically swapping adjacent items into order.",
    },
    {
      question: "What is the average-case time complexity of Bubble Sort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n²)",
      explanation: "On average, it still requires quadratic time.",
    },
    {
      question:
        "Which property makes Bubble Sort impractical for large datasets?",
      options: [
        "O(n²) time complexity",
        "O(n) space complexity",
        "Unstable sorting",
        "Recursive implementation",
      ],
      answer: "O(n²) time complexity",
      explanation: "Quadratic growth becomes too slow for large n.",
    },
  ],

  "selection-sort": [
    {
      question: "What is the main operation in Selection Sort?",
      options: [
        "Repeatedly swapping adjacent elements",
        "Finding minimum element and placing it at beginning",
        "Dividing array into subarrays",
        "Comparing all elements to a pivot",
      ],
      answer: "Finding minimum element and placing it at beginning",
      explanation:
        "It repeatedly selects the minimum from the unsorted portion.",
    },
    {
      question: "What is the time complexity of Selection Sort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n²)",
      explanation: "It always makes n(n-1)/2 comparisons regardless of input.",
    },
    {
      question: "Is Selection Sort stable?",
      options: ["Yes", "No", "Only for small arrays", "Only in best case"],
      answer: "No",
      explanation:
        "The default implementation is not stable as swaps can change order of equals.",
    },
    {
      question: "After first iteration on [64,25,12,22,11], what is the array?",
      options: [
        "[11,25,12,22,64]",
        "[25,64,12,22,11]",
        "[64,25,12,22,11]",
        "[11,64,25,22,12]",
      ],
      answer: "[11,25,12,22,64]",
      explanation: "The minimum (11) is moved to the front.",
    },
    {
      question: "What is the space complexity of Selection Sort?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "It sorts in-place with constant extra space.",
    },
    {
      question: "How many swaps does Selection Sort perform in worst case?",
      options: ["n", "n²", "n-1", "n log n"],
      answer: "n-1",
      explanation: "It performs exactly n-1 swaps regardless of input.",
    },
    {
      question: "What is the best-case time complexity?",
      options: ["O(n)", "O(n²)", "O(n log n)", "O(1)"],
      answer: "O(n²)",
      explanation: "It always performs the same number of comparisons.",
    },
    {
      question: "Which algorithm is Selection Sort most similar to?",
      options: ["Insertion Sort", "Bubble Sort", "Heap Sort", "Merge Sort"],
      answer: "Heap Sort",
      explanation:
        "Both repeatedly select extremal elements, though Heap Sort is more efficient.",
    },
    {
      question: "When is Selection Sort most useful?",
      options: [
        "When memory is limited",
        "When stability is required",
        "When data is nearly sorted",
        "When worst-case performance is critical",
      ],
      answer: "When memory is limited",
      explanation:
        "Its O(1) space complexity makes it useful in constrained environments.",
    },
    {
      question: "How can Selection Sort be made stable?",
      options: [
        "By using linked lists",
        "By inserting instead of swapping",
        "By comparing adjacent elements",
        "Both A and B",
      ],
      answer: "Both A and B",
      explanation: "Either approach preserves order of equal elements.",
    },
  ],

  "insertion-sort": [
    {
      question: "How does Insertion Sort work?",
      options: [
        "By building the final array one item at a time",
        "By dividing the array into halves",
        "By repeatedly swapping adjacent elements",
        "By selecting minimum elements",
      ],
      answer: "By building the final array one item at a time",
      explanation:
        "It inserts each element into its proper position in the sorted portion.",
    },
    {
      question: "What is the best-case time complexity?",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
      answer: "O(n)",
      explanation: "When input is already sorted, it only needs linear time.",
    },
    {
      question: "After first pass on [4,3,2,10,12,1,5,6], what changes?",
      options: [
        "[3,4,2,10,12,1,5,6]",
        "[4,3,2,10,12,1,5,6]",
        "[2,3,4,10,12,1,5,6]",
        "[4,3,10,2,12,1,5,6]",
      ],
      answer: "[3,4,2,10,12,1,5,6]",
      explanation: "The first two elements become sorted.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "It sorts in-place with constant extra space.",
    },
    {
      question: "In what scenario does it outperform Merge Sort?",
      options: [
        "Large random datasets",
        "Nearly sorted datasets",
        "Reverse sorted datasets",
        "Datasets with many duplicates",
      ],
      answer: "Nearly sorted datasets",
      explanation: "For nearly sorted data, it can approach O(n) time.",
    },
    {
      question: "How many comparisons in worst case?",
      options: ["n", "n²", "n(n-1)/2", "n log n"],
      answer: "n(n-1)/2",
      explanation:
        "Each element may need to compare with all previous elements.",
    },
    {
      question: "Which algorithm uses Insertion Sort as a subroutine?",
      options: ["Quick Sort", "Merge Sort", "Shell Sort", "Tim Sort"],
      answer: "Tim Sort",
      explanation: "Tim Sort uses Insertion Sort for small runs.",
    },
    {
      question: "What is the main advantage for small datasets?",
      options: [
        "Low constant factors",
        "Cache-friendly access",
        "No recursion overhead",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Its simplicity provides multiple performance benefits for small n.",
    },
    {
      question: "How many element shifts in worst case?",
      options: ["n", "n²", "n(n-1)/2", "log n"],
      answer: "n(n-1)/2",
      explanation:
        "Each insertion may require shifting the entire sorted portion.",
    },
    {
      question: "Is Insertion Sort stable?",
      options: ["Yes", "No", "Only for integers", "Only in best case"],
      answer: "Yes",
      explanation: "Equal elements maintain their relative order.",
    },
  ],

  "merge-sort": [
    {
      question: "What is the time complexity of Merge Sort?",
      options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
      answer: "O(n log n)",
      explanation: "Divides array in halves (log n) and merges them (n).",
    },
    {
      question: "What is the space complexity?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: "O(n)",
      explanation: "Requires temporary arrays during merging.",
    },
    {
      question: "Which technique does it use?",
      options: [
        "Divide and Conquer",
        "Greedy Algorithm",
        "Dynamic Programming",
        "Backtracking",
      ],
      answer: "Divide and Conquer",
      explanation:
        "Divides problem into subproblems, solves them, and combines results.",
    },
    {
      question: "Is Merge Sort stable?",
      options: ["Yes", "No", "Only for small arrays", "Only in best case"],
      answer: "Yes",
      explanation: "The standard implementation is stable.",
    },
    {
      question: "What is the key operation?",
      options: [
        "Partitioning",
        "Pivot selection",
        "Merging sorted subarrays",
        "Swapping adjacent elements",
      ],
      answer: "Merging sorted subarrays",
      explanation: "The merge step combines two sorted halves into one.",
    },
    {
      question: "What is the recurrence relation?",
      options: [
        "T(n) = T(n/2) + O(n)",
        "T(n) = 2T(n/2) + O(n)",
        "T(n) = T(n-1) + O(n)",
        "T(n) = T(k) + T(n-k) + O(n)",
      ],
      answer: "T(n) = 2T(n/2) + O(n)",
      explanation:
        "Divides into two subproblems of half size plus linear merge work.",
    },
    {
      question: "What is the advantage over Quick Sort?",
      options: [
        "Better average-case performance",
        "Guaranteed O(n log n) time",
        "Lower space complexity",
        "Easier to implement",
      ],
      answer: "Guaranteed O(n log n) time",
      explanation: "Never degrades to quadratic performance.",
    },
    {
      question: "How can memory usage be optimized?",
      options: [
        "Using linked lists",
        "In-place merging",
        "Insertion sort for small subarrays",
        "All of the above",
      ],
      answer: "All of the above",
      explanation: "Various techniques can reduce memory overhead.",
    },
    {
      question: "Which variant uses O(1) space?",
      options: [
        "In-place Merge Sort",
        "Block Merge Sort",
        "Natural Merge Sort",
        "Bottom-up Merge Sort",
      ],
      answer: "Block Merge Sort",
      explanation: "A complex but truly in-place variant.",
    },
    {
      question: "What is the base case typically?",
      options: [
        "Array of size 0",
        "Array of size 1",
        "Array of size 2",
        "Array of size 10",
      ],
      answer: "Array of size 1",
      explanation: "A single element is trivially sorted.",
    },
  ],

  "quick-sort": [
    {
      question: "What is the average-case time complexity?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n log n)",
      explanation:
        "With good pivot selection, average performance is O(n log n).",
    },
    {
      question: "What is the worst-case time complexity?",
      options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      answer: "O(n²)",
      explanation: "Occurs with consistently bad pivot choices.",
    },
    {
      question: "Which pivot selection avoids worst-case?",
      options: [
        "Always first element",
        "Always last element",
        "Median-of-three",
        "Random element",
      ],
      answer: "Median-of-three",
      explanation:
        "Choosing median of first, middle, last elements helps balance partitions.",
    },
    {
      question: "Is Quick Sort stable?",
      options: [
        "Yes",
        "No",
        "Only for small arrays",
        "Only with certain pivot choices",
      ],
      answer: "No",
      explanation:
        "Standard implementation is not stable due to non-adjacent swaps.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      answer: "O(log n)",
      explanation: "Space is used for recursion stack (log n in average case).",
    },
    {
      question: "What is tail recursion optimization?",
      options: [
        "Recursing only on smaller partition",
        "Using insertion sort for small subarrays",
        "Choosing middle element as pivot",
        "Eliminating one recursive call via iteration",
      ],
      answer: "Recursing only on smaller partition",
      explanation: "Limits recursion depth to O(log n) in worst case.",
    },
    {
      question: "Which real-world application commonly uses Quick Sort?",
      options: [
        "Database indexing",
        "Graphics rendering",
        "Cryptography",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Its cache efficiency makes it widely used in performance-critical systems.",
    },
    {
      question: "What is the worst-case space complexity?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(n)",
      explanation: "Bad pivots can lead to linear recursion depth.",
    },
    {
      question: "What is the partition process?",
      options: [
        "Dividing array into two subarrays around a pivot",
        "Finding the median element",
        "Splitting array into equal halves",
        "Separating even and odd elements",
      ],
      answer: "Dividing array into two subarrays around a pivot",
      explanation: "Elements < pivot go left, > pivot go right.",
    },
    {
      question: "Which algorithm is hybridized with Quick Sort in Introsort?",
      options: ["Insertion Sort", "Merge Sort", "Heap Sort", "Selection Sort"],
      answer: "Heap Sort",
      explanation:
        "Introsort switches to Heap Sort when recursion depth exceeds limit.",
    },
  ],

  "heap-sort": [
    {
      question: "What data structure does it primarily use?",
      options: ["Stack", "Queue", "Binary Heap", "Linked List"],
      answer: "Binary Heap",
      explanation: "Uses a binary heap to structure data for sorting.",
    },
    {
      question: "What is the time complexity?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n log n)",
      explanation:
        "Building heap is O(n) and each extraction is O(log n), repeated n times.",
    },
    {
      question: "Is Heap Sort stable?",
      options: ["Yes", "No", "Only for max-heap", "Only for min-heap"],
      answer: "No",
      explanation:
        "Heap operations can change relative order of equal elements.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      answer: "O(1)",
      explanation: "It sorts in-place with constant extra space.",
    },
    {
      question: "After heapifying [3,1,4,1,5,9,2], what is first element?",
      options: ["1", "2", "9", "3"],
      answer: "9",
      explanation:
        "Heapification creates max-heap with largest element at root.",
    },
    {
      question: "What is the time complexity of building the heap?",
      options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
      answer: "O(n)",
      explanation:
        "Surprisingly, heap construction can be done in linear time.",
    },
    {
      question: "Which heap property is essential?",
      options: [
        "All levels are completely filled",
        "Parent nodes are greater than children (max-heap)",
        "Left children are greater than right",
        "All leaves are at same depth",
      ],
      answer: "Parent nodes are greater than children (max-heap)",
      explanation: "This allows efficient extraction of maximum elements.",
    },
    {
      question: "How can it be made stable?",
      options: [
        "Using a secondary array",
        "Including original indices in comparisons",
        "Implementing as min-heap",
        "Cannot be made stable",
      ],
      answer: "Including original indices in comparisons",
      explanation: "Preserves order of equals at cost of extra space.",
    },
    {
      question: "What is the advantage over Merge Sort?",
      options: [
        "Stable sorting",
        "Better cache performance",
        "In-place sorting",
        "Faster average case",
      ],
      answer: "In-place sorting",
      explanation: "Requires only O(1) additional space.",
    },
    {
      question: "Which operation dominates time complexity?",
      options: [
        "Heap construction",
        "Extract-max operations",
        "Both contribute equally",
        "Depends on input",
      ],
      answer: "Extract-max operations",
      explanation: "The n log n term comes from repeated extractions.",
    },
  ],

  "shell-sort": [
    {
      question: "What is the key feature?",
      options: [
        "Compares adjacent elements",
        "Uses diminishing increments",
        "Requires O(n) extra space",
        "Always runs in O(n log n) time",
      ],
      answer: "Uses diminishing increments",
      explanation: "Sorts elements far apart first, then reduces the gap.",
    },
    {
      question: "What is the worst-case time complexity with proper gaps?",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(n^(3/2))"],
      answer: "O(n^(3/2))",
      explanation: "With proper gap sequence, can outperform O(n²) algorithms.",
    },
    {
      question: "Which algorithm does it improve upon?",
      options: [
        "Bubble Sort",
        "Insertion Sort",
        "Selection Sort",
        "Quick Sort",
      ],
      answer: "Insertion Sort",
      explanation:
        "Optimizes Insertion Sort by allowing exchange of far items.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "Like Insertion Sort, it sorts in-place.",
    },
    {
      question: "Which gap sequence is common?",
      options: [
        "Fibonacci sequence",
        "Powers of 2",
        "Knuth sequence (3k+1)",
        "Prime numbers",
      ],
      answer: "Knuth sequence (3k+1)",
      explanation:
        "Sequence 1,4,13,40,... provides good practical performance.",
    },
    {
      question: "What is the key insight behind its efficiency?",
      options: [
        "Early moves eliminate large displacements",
        "Uses divide-and-conquer",
        "Sorts odd/even elements separately",
        "Maintains multiple sorted subarrays",
      ],
      answer: "Early moves eliminate large displacements",
      explanation:
        "Early passes move elements over large distances, reducing later work.",
    },
    {
      question: "Which sequence achieves O(n^(4/3)) time?",
      options: [
        "Powers of 2",
        "Powers of 3",
        "Sedgewick's sequence",
        "Fibonacci sequence",
      ],
      answer: "Sedgewick's sequence",
      explanation: "Theoretically optimal sequence derived by Sedgewick.",
    },
    {
      question: "Why is it an improvement over Insertion Sort?",
      options: [
        "Better asymptotic complexity",
        "Lower constant factors",
        "Eliminates large shifts early",
        "All of the above",
      ],
      answer: "Eliminates large shifts early",
      explanation: "Diminishing gaps reduce final insertion passes.",
    },
    {
      question: "What is the best-known time complexity?",
      options: [
        "O(n log n)",
        "O(n^(3/2))",
        "O(n^(4/3))",
        "Depends on gap sequence",
      ],
      answer: "Depends on gap sequence",
      explanation: "Different sequences yield different theoretical bounds.",
    },
    {
      question: "Which application benefits most?",
      options: [
        "Sorting nearly-sorted data",
        "Embedded systems with memory constraints",
        "Large database operations",
        "Graphics rendering",
      ],
      answer: "Embedded systems with memory constraints",
      explanation:
        "In-place nature and reasonable performance suit constrained environments.",
    },
  ],

  "counting-sort": [
    {
      question: "When is it most effective?",
      options: [
        "When range of input is small",
        "When data is nearly sorted",
        "When stability is not required",
        "When space is limited",
      ],
      answer: "When range of input is small",
      explanation:
        "Works well when range (k) is not significantly larger than n.",
    },
    {
      question: "What is the time complexity?",
      options: ["O(n)", "O(n log n)", "O(n + k)", "O(n²)"],
      answer: "O(n + k)",
      explanation:
        "Counts occurrences of each value (k) and outputs sorted order (n).",
    },
    {
      question: "Is it a comparison sort?",
      options: ["Yes", "No", "Only in worst case", "Only for integers"],
      answer: "No",
      explanation:
        "Counts occurrences rather than comparing elements directly.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(1)", "O(log n)", "O(n + k)", "O(n²)"],
      answer: "O(n + k)",
      explanation: "Requires arrays for counts (k) and output (n).",
    },
    {
      question: "Which sort commonly uses it as a subroutine?",
      options: ["Radix Sort", "Quick Sort", "Merge Sort", "Heap Sort"],
      answer: "Radix Sort",
      explanation: "Used as stable digit sort in Radix implementations.",
    },
    {
      question: "What is the main limitation?",
      options: [
        "Cannot sort negative numbers",
        "Requires O(n) additional space",
        "Only works with integer keys",
        "Unstable",
      ],
      answer: "Only works with integer keys",
      explanation: "Relies on integer indices for counting.",
    },
    {
      question: "How can it handle negative numbers?",
      options: [
        "Using two counting arrays",
        "Adding an offset to make all positive",
        "Treating sign bit separately",
        "All of the above",
      ],
      answer: "All of the above",
      explanation: "Various techniques can extend it to handle negatives.",
    },
    {
      question: "What is the minimum range requirement for efficiency?",
      options: ["k = O(n)", "k = O(n log n)", "k = O(n²)", "No requirement"],
      answer: "k = O(n)",
      explanation: "Range k should be comparable to n for linear performance.",
    },
    {
      question: "Which step ensures stability?",
      options: [
        "Initial counting phase",
        "Cumulative sum phase",
        "Placement phase (iterating backwards)",
        "All of the above",
      ],
      answer: "Placement phase (iterating backwards)",
      explanation: "Backwards iteration preserves order of equal elements.",
    },
    {
      question: "What is the most common use?",
      options: [
        "Standalone sorting",
        "Subroutine in Radix Sort",
        "Sorting floating-point numbers",
        "External sorting",
      ],
      answer: "Subroutine in Radix Sort",
      explanation: "Serves as stable digit sort in Radix implementations.",
    },
  ],

  "radix-sort": [
    {
      question: "What is the key idea?",
      options: [
        "Comparing adjacent elements",
        "Sorting numbers digit by digit",
        "Dividing array into buckets",
        "Selecting pivot elements",
      ],
      answer: "Sorting numbers digit by digit",
      explanation: "Processes digits from least to most significant.",
    },
    {
      question: "What is the time complexity for n numbers with d digits?",
      options: ["O(n)", "O(dn)", "O(n log n)", "O(n²)"],
      answer: "O(dn)",
      explanation: "Each digit pass takes O(n) time, repeated d times.",
    },
    {
      question: "Which sort does it typically use as subroutine?",
      options: [
        "Counting Sort",
        "Insertion Sort",
        "Quick Sort",
        "Selection Sort",
      ],
      answer: "Counting Sort",
      explanation: "Uses Counting Sort as stable digit sort.",
    },
    {
      question: "Is it a comparison sort?",
      options: ["Yes", "No", "Only for integers", "Only in best case"],
      answer: "No",
      explanation:
        "Processes digits directly rather than comparing whole numbers.",
    },
    {
      question: "What types of data can it handle?",
      options: [
        "Only positive integers",
        "Integers and strings",
        "Only floating-point numbers",
        "Any comparable data",
      ],
      answer: "Integers and strings",
      explanation: "Can sort anything with positional digits/characters.",
    },
    {
      question: "Why is LSD Radix Sort preferred over MSD?",
      options: [
        "Lower space complexity",
        "Stability",
        "Easier implementation",
        "No recursion required",
      ],
      answer: "Stability",
      explanation: "Least Significant Digit version is inherently stable.",
    },
    {
      question: "How can it handle floating-point numbers?",
      options: [
        "Treating as strings",
        "Separating integer/fractional parts",
        "Using bitwise operations",
        "All of the above",
      ],
      answer: "All of the above",
      explanation: "Various encoding techniques can adapt it for floats.",
    },
    {
      question: "Which optimization helps for 32-bit integers?",
      options: [
        "Using base-256 for fewer passes",
        "Sorting bytes instead of digits",
        "Using SIMD instructions",
        "All of the above",
      ],
      answer: "All of the above",
      explanation: "All can significantly improve performance.",
    },
    {
      question: "What is the main advantage over comparison sorts?",
      options: [
        "Better asymptotic complexity",
        "No comparisons needed",
        "Stability",
        "Lower space complexity",
      ],
      answer: "Better asymptotic complexity",
      explanation: "O(dn) can outperform O(n log n) for fixed-width keys.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(1)", "O(d)", "O(n + k)", "O(dn)"],
      answer: "O(n + k)",
      explanation: "Requires space for output array and counting bins.",
    },
  ],

  "bucket-sort": [
    {
      question: "What is the key idea?",
      options: [
        "Dividing data into ranges and sorting each",
        "Comparing adjacent elements",
        "Selecting pivot elements",
        "Building a heap structure",
      ],
      answer: "Dividing data into ranges and sorting each",
      explanation:
        "Distributes elements into buckets which are sorted individually.",
    },
    {
      question: "What is the average-case time complexity with uniform data?",
      options: ["O(n + k)", "O(n log n)", "O(n²)", "O(n)"],
      answer: "O(n + k)",
      explanation:
        "Where k is number of buckets - linear when distribution is uniform.",
    },
    {
      question: "Which algorithm typically sorts individual buckets?",
      options: [
        "Insertion Sort",
        "Quick Sort",
        "Merge Sort",
        "Any comparison sort",
      ],
      answer: "Insertion Sort",
      explanation: "Its low overhead makes it ideal for small buckets.",
    },
    {
      question: "What is the worst-case time complexity?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: "O(n²)",
      explanation: "Occurs when all elements fall into a single bucket.",
    },
    {
      question: "When is it most effective?",
      options: [
        "When input is uniformly distributed",
        "When data is nearly sorted",
        "When stability is required",
        "When memory is limited",
      ],
      answer: "When input is uniformly distributed",
      explanation:
        "Uniform distribution ensures balanced buckets and O(n) performance.",
    },
    {
      question: "How does it handle empty buckets?",
      options: [
        "Skips them during concatenation",
        "Fills with dummy values",
        "Rebalances buckets",
        "Fails in such cases",
      ],
      answer: "Skips them during concatenation",
      explanation: "Empty buckets don't require processing.",
    },
    {
      question: "What is the worst-case space complexity?",
      options: ["O(1)", "O(n)", "O(n + k)", "O(n²)"],
      answer: "O(n + k)",
      explanation: "Needs space for n elements plus k buckets (even if empty).",
    },
    {
      question: "Which scenario makes it perform O(n²)?",
      options: [
        "All elements in one bucket",
        "Uniform distribution",
        "Reverse sorted input",
        "Small range of integers",
      ],
      answer: "All elements in one bucket",
      explanation:
        "Degenerates to the complexity of the bucket sorting algorithm.",
    },
    {
      question: "What is the main advantage over comparison sorts?",
      options: [
        "Better asymptotic complexity",
        "Stability",
        "In-place sorting",
        "Handles any data type",
      ],
      answer: "Better asymptotic complexity",
      explanation: "Can achieve O(n) time with uniform distribution.",
    },
    {
      question: "How does it compare to Radix Sort?",
      options: [
        "Bucket Sort is faster",
        "Radix Sort is more general",
        "Bucket Sort doesn't use counting",
        "Radix Sort is a type of Bucket Sort",
      ],
      answer: "Radix Sort is a type of Bucket Sort",
      explanation:
        "Radix Sort can be viewed as Bucket Sort where buckets represent digits.",
    },
  ],
  "linear-search": [
    {
      question:
        "What is the time complexity of linear search in the worst case?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(n)",
      explanation:
        "In the worst case, the target element is the last element or not present, so we have to check all n elements.",
    },
    {
      question:
        "Which of the following is NOT a requirement for linear search?",
      options: [
        "Sorted array",
        "Random access",
        "Comparable elements",
        "Finite size",
      ],
      answer: "Sorted array",
      explanation:
        "Linear search works on both sorted and unsorted arrays, unlike binary search which requires sorting.",
    },
    {
      question: "What is the best-case scenario for linear search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Array is empty",
      ],
      answer: "Element is at the beginning",
      explanation:
        "In the best case, the target element is the first element checked, resulting in O(1) time complexity.",
    },
    {
      question:
        "How would you modify linear search to find all occurrences of a value?",
      options: [
        "Return after first match",
        "Continue searching after first match",
        "Use binary search instead",
        "Sort the array first",
      ],
      answer: "Continue searching after first match",
      explanation:
        "To find all occurrences, you need to continue searching the entire array after finding a match.",
    },
    {
      question: "When is linear search preferred over binary search?",
      options: [
        "When the array is large",
        "When the array is frequently updated",
        "When the array is sorted",
        "When memory is limited",
      ],
      answer: "When the array is frequently updated",
      explanation:
        "Linear search doesn't require sorting, so it's better for frequently updated arrays where maintaining sorted order would be expensive.",
    },
    {
      question: "What is the space complexity of linear search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation:
        "Linear search uses constant space as it doesn't require any additional data structures.",
    },
    {
      question: "Which data structure CANNOT use linear search effectively?",
      options: ["Arrays", "Linked lists", "Hash tables", "Binary search trees"],
      answer: "Hash tables",
      explanation:
        "Hash tables use hash functions for O(1) access, making linear search unnecessary and inefficient.",
    },
    {
      question:
        "How can you optimize linear search for a frequently accessed element?",
      options: [
        "Move it to the end",
        "Move it to the front",
        "Sort the array",
        "Use binary search instead",
      ],
      answer: "Move it to the front",
      explanation:
        "Moving frequently accessed elements to the front reduces search time for those elements in subsequent searches.",
    },
    {
      question: "What is the average case time complexity of linear search?",
      options: ["O(1)", "O(n/2)", "O(n)", "O(log n)"],
      answer: "O(n)",
      explanation:
        "On average, you'd need to check half the elements, but constant factors are dropped in Big-O notation.",
    },
    {
      question:
        "Which scenario would make linear search perform as poorly as possible?",
      options: [
        "Searching for the first element",
        "Searching for an element not in the array",
        "Searching in a small array",
        "Searching in a sorted array",
      ],
      answer: "Searching for an element not in the array",
      explanation:
        "When the element isn't present, linear search must check every single element in the array.",
    },
  ],
  "binary-search": [
    {
      question: "What is the prerequisite for performing binary search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "Array must be small",
      ],
      answer: "Array must be sorted",
      explanation:
        "Binary search relies on the array being sorted to eliminate half of the remaining elements at each step.",
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(log n)",
      explanation:
        "Binary search halves the search space at each step, leading to logarithmic time complexity.",
    },
    {
      question: "What is the worst-case scenario for binary search?",
      options: [
        "Element is at the first position",
        "Element is at the last position",
        "Element is not present",
        "Element is at the middle",
      ],
      answer: "Element is not present",
      explanation:
        "The worst case occurs when the element isn't present, requiring the maximum number of comparisons.",
    },
    {
      question: "Which of these is NOT a step in binary search?",
      options: [
        "Compare with the middle element",
        "Recursively search left or right half",
        "Swap adjacent elements",
        "Repeat until element is found or interval is empty",
      ],
      answer: "Swap adjacent elements",
      explanation:
        "Binary search doesn't modify the array - it only examines elements and adjusts search boundaries.",
    },
    {
      question: "What is the space complexity of iterative binary search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation:
        "Iterative binary search uses constant space as it only needs a few variables to track boundaries.",
    },
    {
      question: "Which data structure is binary search commonly used with?",
      options: ["Linked lists", "Arrays", "Hash tables", "Stacks"],
      answer: "Arrays",
      explanation:
        "Binary search is most efficient with arrays due to their O(1) random access capability.",
    },
    {
      question:
        "What is the mid-point calculation in binary search to avoid overflow?",
      options: [
        "mid = (low + high) / 2",
        "mid = low + (high - low) / 2",
        "mid = high - (high - low) / 2",
        "mid = (low * high) / 2",
      ],
      answer: "mid = low + (high - low) / 2",
      explanation:
        "This calculation prevents potential integer overflow that could occur with (low + high)/2 for large arrays.",
    },
    {
      question:
        "How many comparisons does binary search need for an array of 1024 elements?",
      options: ["10", "11", "32", "1024"],
      answer: "10",
      explanation:
        "log₂1024 = 10, so at most 10 comparisons are needed in the worst case.",
    },
    {
      question: "What is the main disadvantage of binary search?",
      options: [
        "High time complexity",
        "Requires sorted data",
        "Only works on numbers",
        "Cannot be implemented recursively",
      ],
      answer: "Requires sorted data",
      explanation:
        "The need to maintain sorted data is the primary drawback, especially for frequently modified datasets.",
    },
    {
      question:
        "Which search algorithm is faster than binary search for very small arrays?",
      options: [
        "Linear search",
        "Jump search",
        "Exponential search",
        "Ternary search",
      ],
      answer: "Linear search",
      explanation:
        "For very small arrays (typically <10 elements), linear search can be faster due to simpler operations.",
    },
  ],
  "jump-search": [
    {
      question: "What is the optimal block size for jump search?",
      options: ["√n", "n/2", "log n", "n"],
      answer: "√n",
      explanation:
        "The optimal jump size is √n, which balances between the jump steps and the linear search within a block.",
    },
    {
      question: "What is the time complexity of jump search?",
      options: ["O(√n)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(√n)",
      explanation:
        "Jump search has O(√n) complexity as it makes √n jumps in the worst case and performs √n comparisons in the linear search phase.",
    },
    {
      question: "Which of these is a prerequisite for jump search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "No prerequisites",
      ],
      answer: "Array must be sorted",
      explanation:
        "Like binary search, jump search requires the array to be sorted to work correctly.",
    },
    {
      question: "What is the first step in jump search?",
      options: [
        "Jump ahead by fixed steps",
        "Compare with the middle element",
        "Sort the array",
        "Check the last element",
      ],
      answer: "Jump ahead by fixed steps",
      explanation:
        "Jump search begins by jumping ahead in fixed-size steps until it finds an interval that might contain the target.",
    },
    {
      question: "When does jump search perform better than binary search?",
      options: [
        "On very small arrays",
        "On very large arrays stored on slow media",
        "On unsorted arrays",
        "On arrays with duplicate elements",
      ],
      answer: "On very large arrays stored on slow media",
      explanation:
        "Jump search can be better when the cost of jumping ahead is less than the cost of random access needed for binary search.",
    },
    {
      question: "What is the space complexity of jump search?",
      options: ["O(n)", "O(√n)", "O(log n)", "O(1)"],
      answer: "O(1)",
      explanation:
        "Jump search uses constant space as it only needs a few variables to track positions.",
    },
    {
      question: "Which search algorithm is jump search most similar to?",
      options: [
        "Linear search",
        "Binary search",
        "Exponential search",
        "Interpolation search",
      ],
      answer: "Linear search",
      explanation:
        "Jump search is essentially an optimized version of linear search that jumps ahead in fixed blocks.",
    },
    {
      question: "What is the worst-case scenario for jump search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at the last jump position",
      ],
      answer: "Element is at the end",
      explanation:
        "The worst case occurs when the element is at the end, requiring √n jumps and then √n comparisons in the linear search phase.",
    },
    {
      question:
        "How would you modify jump search for better performance on uniformly distributed data?",
      options: [
        "Use larger jump sizes",
        "Use smaller jump sizes",
        "Use interpolation jump sizes",
        "Switch to binary search",
      ],
      answer: "Use interpolation jump sizes",
      explanation:
        "For uniformly distributed data, interpolation-based jump sizes can provide better performance.",
    },
    {
      question:
        "Which of these is NOT an advantage of jump search over binary search?",
      options: [
        "Fewer comparisons",
        "Better cache performance",
        "Works on linked lists",
        "No recursive calls",
      ],
      answer: "Works on linked lists",
      explanation:
        "Jump search doesn't work well on linked lists as it requires efficient random access for the jumps.",
    },
  ],
  "exponential-search": [
    {
      question: "What is the first step in exponential search?",
      options: [
        "Find range where element may be present",
        "Sort the array",
        "Check the middle element",
        "Compare with first and last elements",
      ],
      answer: "Find range where element may be present",
      explanation:
        "Exponential search begins by finding a range where the element might be by doubling the index at each step.",
    },
    {
      question: "What is the time complexity of exponential search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(log n)",
      explanation:
        "Exponential search has logarithmic complexity as it uses binary search after finding the appropriate range.",
    },
    {
      question: "Which search algorithms does exponential search combine?",
      options: [
        "Linear and binary search",
        "Jump and binary search",
        "Linear and jump search",
        "Binary and interpolation search",
      ],
      answer: "Linear and binary search",
      explanation:
        "Exponential search combines elements of linear search (to find the range) and binary search (to search the range).",
    },
    {
      question: "When is exponential search particularly useful?",
      options: [
        "When the array is small",
        "When the array is unsorted",
        "When the element is near the beginning",
        "When the array is unbounded or infinite",
      ],
      answer: "When the array is unbounded or infinite",
      explanation:
        "Exponential search is ideal for unbounded searches where the size isn't known in advance.",
    },
    {
      question: "What is the space complexity of exponential search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(√n)"],
      answer: "O(1)",
      explanation:
        "Exponential search uses constant space as it doesn't require additional data structures.",
    },
    {
      question: "How does exponential search determine the range to search?",
      options: [
        "By doubling the index until finding an element larger than the target",
        "By dividing the array in half",
        "By using interpolation",
        "By jumping in fixed-size steps",
      ],
      answer:
        "By doubling the index until finding an element larger than the target",
      explanation:
        "The algorithm exponentially increases the search range (1, 2, 4, 8,...) until it bounds the target.",
    },
    {
      question: "What is the worst-case scenario for exponential search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at position 2^k",
      ],
      answer: "Element is at the end",
      explanation:
        "The worst case occurs when the element is at the end, requiring the most range-finding steps before binary search.",
    },
    {
      question:
        "Which of these is an advantage of exponential search over binary search?",
      options: [
        "Works on unsorted data",
        "Better for unbounded arrays",
        "Fewer comparisons",
        "Lower space complexity",
      ],
      answer: "Better for unbounded arrays",
      explanation:
        "Exponential search can work on theoretically infinite arrays, while binary search requires knowing the array bounds.",
    },
    {
      question: "What is the second phase of exponential search?",
      options: [
        "Linear search",
        "Binary search",
        "Jump search",
        "Interpolation search",
      ],
      answer: "Binary search",
      explanation:
        "After finding the range, exponential search performs binary search within that range.",
    },
    {
      question: "Which search algorithm is exponential search most similar to?",
      options: [
        "Linear search",
        "Binary search",
        "Jump search",
        "Fibonacci search",
      ],
      answer: "Binary search",
      explanation:
        "Exponential search is essentially binary search preceded by a range-finding phase.",
    },
  ],
  "ternary-search": [
    {
      question: "How does ternary search divide the search space?",
      options: [
        "Into two equal parts",
        "Into three equal parts",
        "Into four equal parts",
        "Into n equal parts",
      ],
      answer: "Into three equal parts",
      explanation:
        "Ternary search divides the array into three parts by using two midpoints.",
    },
    {
      question: "What is the time complexity of ternary search?",
      options: ["O(1)", "O(log₃n)", "O(log₂n)", "O(n)"],
      answer: "O(log₃n)",
      explanation:
        "Ternary search has logarithmic time complexity with base 3 as it eliminates two-thirds of the search space at each step.",
    },
    {
      question: "Which of these is a prerequisite for ternary search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "No prerequisites",
      ],
      answer: "Array must be sorted",
      explanation:
        "Like binary search, ternary search requires the array to be sorted to work correctly.",
    },
    {
      question: "How many comparisons does ternary search make per iteration?",
      options: ["1", "2", "3", "4"],
      answer: "2",
      explanation:
        "Ternary search compares the target with two midpoints (at 1/3 and 2/3 positions) in each iteration.",
    },
    {
      question: "When is ternary search preferred over binary search?",
      options: [
        "When the array is small",
        "When the function is unimodal",
        "When the array is unsorted",
        "When memory is limited",
      ],
      answer: "When the function is unimodal",
      explanation:
        "Ternary search is particularly useful for finding maxima/minima of unimodal functions.",
    },
    {
      question: "What is the space complexity of ternary search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation:
        "Like binary search, ternary search uses constant space in its iterative implementation.",
    },
    {
      question:
        "Which search algorithm generally performs fewer comparisons: binary or ternary search?",
      options: [
        "Binary search",
        "Ternary search",
        "They perform the same",
        "Depends on array size",
      ],
      answer: "Binary search",
      explanation:
        "Although ternary search eliminates more elements per iteration, it makes more comparisons, making binary search generally more efficient.",
    },
    {
      question: "What is the worst-case scenario for ternary search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at one of the midpoints",
      ],
      answer: "Element is not present",
      explanation:
        "Like other search algorithms, the worst case occurs when the element isn't present in the array.",
    },
    {
      question:
        "How would you modify ternary search to find the maximum of a unimodal function?",
      options: [
        "Compare f(m1) and f(m2)",
        "Compare f(m1) and f(high)",
        "Compare f(low) and f(high)",
        "Use linear search instead",
      ],
      answer: "Compare f(m1) and f(m2)",
      explanation:
        "For unimodal functions, comparing the function values at the two midpoints tells us which third to eliminate.",
    },
    {
      question: "Which of these is NOT a use case for ternary search?",
      options: [
        "Finding an element in a sorted array",
        "Finding the maximum of a bitonic sequence",
        "Finding the minimum of a parabolic function",
        "Searching in an unsorted array",
      ],
      answer: "Searching in an unsorted array",
      explanation:
        "Ternary search, like binary search, requires the data to be sorted (or the function to be unimodal) to work correctly.",
    },
  ],

  // Dynamic Programming Algorithms
  "lcs-problem": [
    {
      question: "What does LCS stand for in dynamic programming?",
      options: [
        "Longest Common Subsequence",
        "Least Common Subsequence",
        "Longest Common Substring",
        "Least Common Substring",
      ],
      answer: "Longest Common Subsequence",
      explanation:
        "LCS stands for Longest Common Subsequence, which finds the longest sequence that appears in the same order in both strings.",
    },
    {
      question:
        "What is the time complexity of the dynamic programming solution for LCS?",
      options: ["O(n)", "O(n log n)", "O(mn)", "O(2^n)"],
      answer: "O(mn)",
      explanation:
        "The DP solution uses a 2D table of size m×n, leading to O(mn) time complexity where m and n are string lengths.",
    },
    {
      question:
        "What is the space complexity of the basic DP solution for LCS?",
      options: ["O(1)", "O(min(m,n))", "O(mn)", "O(n)"],
      answer: "O(mn)",
      explanation:
        "The basic solution requires a 2D DP table of size (m+1)×(n+1), giving O(mn) space complexity.",
    },
    {
      question: "Which recurrence relation is used in LCS DP solution?",
      options: [
        "dp[i][j] = max(dp[i-1][j], dp[i][j-1]) + 1 if chars match",
        "dp[i][j] = dp[i-1][j-1] + 1 if chars match, else max(dp[i-1][j], dp[i][j-1])",
        "dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + 1",
        "dp[i][j] = dp[i-1][j-1] if chars match",
      ],
      answer:
        "dp[i][j] = dp[i-1][j-1] + 1 if chars match, else max(dp[i-1][j], dp[i][j-1])",
      explanation:
        "This recurrence builds the solution by considering whether characters match or not at each position.",
    },
    {
      question: "What is the LCS of 'ABCDGH' and 'AEDFHR'?",
      options: ["ADH", "ABC", "AED", "DFH"],
      answer: "ADH",
      explanation: "The longest common subsequence is 'ADH' with length 3.",
    },
    {
      question: "How can LCS space complexity be optimized to O(min(m,n))?",
      options: [
        "Using recursion with memoization",
        "Using only two rows of the DP table at a time",
        "Using a hash table instead of 2D array",
        "Using binary search",
      ],
      answer: "Using only two rows of the DP table at a time",
      explanation:
        "We only need the current and previous rows to compute the solution, reducing space to O(min(m,n)).",
    },
    {
      question: "What is the difference between subsequence and substring?",
      options: [
        "Subsequence must be contiguous, substring need not be",
        "Substring must be contiguous, subsequence need not be",
        "Both must be contiguous",
        "Neither needs to be contiguous",
      ],
      answer: "Substring must be contiguous, subsequence need not be",
      explanation:
        "A substring consists of consecutive characters, while a subsequence can have characters with gaps.",
    },
    {
      question: "Which application commonly uses LCS?",
      options: [
        "DNA sequence alignment",
        "Image compression",
        "Network routing",
        "Cryptography",
      ],
      answer: "DNA sequence alignment",
      explanation:
        "LCS is widely used in bioinformatics for comparing genetic sequences.",
    },
    {
      question:
        "What is the length of LCS when one string is reverse of the other?",
      options: [
        "Always 0",
        "Always 1",
        "At least 1 if strings are non-empty",
        "Equal to the length of longest palindrome",
      ],
      answer: "At least 1 if strings are non-empty",
      explanation:
        "Even when reversed, there's always at least one common character if strings are non-empty.",
    },
    {
      question: "How to reconstruct the actual LCS from the DP table?",
      options: [
        "Backtrack from dp[m][n] to dp[0][0] following maximum values",
        "Use the first row of the table",
        "Sort the characters alphabetically",
        "Take the diagonal elements",
      ],
      answer: "Backtrack from dp[m][n] to dp[0][0] following maximum values",
      explanation:
        "We backtrack through the table, moving diagonally when characters match, otherwise moving towards larger values.",
    },
  ],

  "matrix-chain-multiplication": [
    {
      question: "What is the goal of matrix chain multiplication problem?",
      options: [
        "Find the product of matrices",
        "Find the optimal parenthesization to minimize scalar multiplications",
        "Find the determinant of matrices",
        "Find the inverse of matrices",
      ],
      answer:
        "Find the optimal parenthesization to minimize scalar multiplications",
      explanation:
        "The problem aims to find the most efficient way to multiply a chain of matrices by optimizing the order of operations.",
    },
    {
      question:
        "What is the time complexity of the DP solution for matrix chain multiplication?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: "O(n³)",
      explanation:
        "The DP solution uses three nested loops, resulting in O(n³) time complexity for n matrices.",
    },
    {
      question:
        "Given matrices of dimensions 10×30, 30×5, 5×60, what is minimum multiplications?",
      options: ["4500", "3000", "2700", "1800"],
      answer: "4500",
      explanation:
        "Optimal parenthesization: (A1×(A2×A3)) = 30×5×60 + 10×30×60 = 9000 + 18000 = 27000? Wait, let's recalculate: (10×30×5) + (10×5×60) = 1500 + 3000 = 4500",
    },
    {
      question: "What does m[i][j] represent in the DP solution?",
      options: [
        "Minimum scalar multiplications for matrices i through j",
        "Product of matrices i through j",
        "Dimension of matrix i",
        "Maximum possible multiplications",
      ],
      answer: "Minimum scalar multiplications for matrices i through j",
      explanation:
        "m[i][j] stores the minimum number of scalar multiplications needed to compute the product of matrices from i to j.",
    },
    {
      question:
        "What is the recurrence relation for matrix chain multiplication?",
      options: [
        "m[i][j] = min(m[i][k] + m[k+1][j] + p[i-1]×p[k]×p[j])",
        "m[i][j] = max(m[i][k] + m[k+1][j])",
        "m[i][j] = m[i][j-1] + p[i]×p[j]",
        "m[i][j] = m[i+1][j] + p[i]×p[i+1]×p[j]",
      ],
      answer: "m[i][j] = min(m[i][k] + m[k+1][j] + p[i-1]×p[k]×p[j])",
      explanation:
        "We try all possible splits k and choose the one that minimizes total multiplications.",
    },
    {
      question: "How many ways are there to parenthesize n matrices?",
      options: ["n!", "2^n", "Catalan(n-1)", "n²"],
      answer: "Catalan(n-1)",
      explanation:
        "The number of ways to parenthesize n matrices is given by the (n-1)th Catalan number.",
    },
    {
      question: "What is the space complexity of the DP solution?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: "O(n²)",
      explanation:
        "We need a 2D DP table of size n×n, giving O(n²) space complexity.",
    },
    {
      question:
        "Which real-world application uses matrix chain multiplication optimization?",
      options: [
        "Computer graphics transformations",
        "Database query optimization",
        "Compiler design for expression evaluation",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "All these applications involve chained operations where optimization reduces computational cost.",
    },
    {
      question: "What is the base case in the recurrence?",
      options: [
        "m[i][i] = 0",
        "m[i][i] = 1",
        "m[i][i] = p[i]",
        "m[i][i] = infinity",
      ],
      answer: "m[i][i] = 0",
      explanation:
        "A single matrix requires no multiplications, so m[i][i] = 0.",
    },
    {
      question: "How to find the actual optimal parenthesization?",
      options: [
        "Store split points in another table during DP",
        "Use the minimum value from m table",
        "Try all possible combinations",
        "Use greedy approach",
      ],
      answer: "Store split points in another table during DP",
      explanation:
        "We maintain a separate table s[i][j] that stores the optimal split point for each subproblem.",
    },
  ],

  "01-knapsack-problem": [
    {
      question: "What is the 0/1 knapsack problem?",
      options: [
        "Items can be divided arbitrarily",
        "Items must be taken completely or not at all",
        "Multiple copies of items are allowed",
        "Only two items can be selected",
      ],
      answer: "Items must be taken completely or not at all",
      explanation:
        "In 0/1 knapsack, each item is either taken (1) or not taken (0), no fractional items allowed.",
    },
    {
      question: "What is the time complexity of DP solution for 0/1 knapsack?",
      options: ["O(n)", "O(n log n)", "O(nW)", "O(2^n)"],
      answer: "O(nW)",
      explanation:
        "The DP solution uses a table of size n×W, where n is number of items and W is capacity.",
    },
    {
      question: "What is the recurrence relation for 0/1 knapsack?",
      options: [
        "dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])",
        "dp[i][w] = min(dp[i-1][w], dp[i-1][w-wt[i]])",
        "dp[i][w] = dp[i-1][w] + val[i]",
        "dp[i][w] = dp[i][w-1] + wt[i]",
      ],
      answer: "dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])",
      explanation:
        "We either exclude the current item or include it if it fits, taking the maximum value.",
    },
    {
      question: "Is 0/1 knapsack a polynomial-time problem?",
      options: [
        "Yes, always",
        "No, it's NP-hard",
        "Only for small weights",
        "Only when all items have same value",
      ],
      answer: "No, it's NP-hard",
      explanation:
        "0/1 knapsack is NP-hard, but the DP solution is pseudo-polynomial as it depends on W.",
    },
    {
      question: "What is the space-optimized version space complexity?",
      options: ["O(nW)", "O(W)", "O(n)", "O(1)"],
      answer: "O(W)",
      explanation:
        "We can optimize space by using a 1D array and iterating backwards.",
    },
    {
      question: "Which variation allows taking fractional items?",
      options: [
        "0/1 knapsack",
        "Fractional knapsack",
        "Unbounded knapsack",
        "Multiple knapsack",
      ],
      answer: "Fractional knapsack",
      explanation:
        "Fractional knapsack allows taking parts of items and can be solved greedily.",
    },
    {
      question: "What is the base case for knapsack DP?",
      options: [
        "dp[0][w] = 0 for all w",
        "dp[i][0] = val[i]",
        "dp[0][w] = infinity",
        "dp[i][0] = 1",
      ],
      answer: "dp[0][w] = 0 for all w",
      explanation:
        "With 0 items, the maximum value is always 0 regardless of capacity.",
    },
    {
      question: "How to find which items are selected in optimal solution?",
      options: [
        "Backtrack through the DP table",
        "Look at the last row only",
        "Take all items with positive value",
        "Sort items by value/weight ratio",
      ],
      answer: "Backtrack through the DP table",
      explanation:
        "We can reconstruct the solution by tracing back through the DP table from the final cell.",
    },
    {
      question: "Which application uses knapsack problem?",
      options: [
        "Resource allocation",
        "Portfolio optimization",
        "Cutting stock problem",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Knapsack has applications in various resource allocation and optimization problems.",
    },
    {
      question:
        "What happens if we iterate forward in space-optimized version?",
      options: [
        "Solution becomes incorrect",
        "It works the same",
        "It becomes fractional knapsack",
        "Time complexity improves",
      ],
      answer: "Solution becomes incorrect",
      explanation:
        "Forward iteration would allow using items multiple times, turning it into unbounded knapsack.",
    },
  ],

  "floyd-warshall-algorithm": [
    {
      question: "What does Floyd-Warshall algorithm compute?",
      options: [
        "Minimum spanning tree",
        "All pairs shortest paths",
        "Single source shortest paths",
        "Maximum flow",
      ],
      answer: "All pairs shortest paths",
      explanation:
        "Floyd-Warshall finds shortest paths between all pairs of vertices in a weighted graph.",
    },
    {
      question: "What is the time complexity of Floyd-Warshall?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: "O(n³)",
      explanation:
        "The algorithm uses three nested loops over all vertices, giving O(V³) time complexity.",
    },
    {
      question: "What type of graphs can Floyd-Warshall handle?",
      options: [
        "Only directed acyclic graphs",
        "Only positive weight graphs",
        "Both positive and negative weights (no negative cycles)",
        "Only unweighted graphs",
      ],
      answer: "Both positive and negative weights (no negative cycles)",
      explanation:
        "It works with any weights as long as there are no negative cycles reachable from the source.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: "O(n²)",
      explanation: "It requires a 2D distance matrix of size V×V.",
    },
    {
      question: "What is the key idea behind Floyd-Warshall?",
      options: [
        "Dynamic programming considering intermediate vertices",
        "Greedy edge selection",
        "Divide and conquer",
        "Backtracking",
      ],
      answer: "Dynamic programming considering intermediate vertices",
      explanation:
        "It gradually improves shortest path estimates by allowing more intermediate vertices.",
    },
    {
      question: "How to detect negative cycles with Floyd-Warshall?",
      options: [
        "Check if diagonal entries become negative",
        "Check if any distance is infinite",
        "Count the number of edges",
        "Use BFS after the algorithm",
      ],
      answer: "Check if diagonal entries become negative",
      explanation:
        "If any diagonal entry dist[i][i] becomes negative, there's a negative cycle involving vertex i.",
    },
    {
      question: "What is the recurrence relation?",
      options: [
        "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])",
        "dist[i][j] = max(dist[i][j], dist[i][k] + dist[k][j])",
        "dist[i][j] = dist[i][k] × dist[k][j]",
        "dist[i][j] = dist[i][k] - dist[k][j]",
      ],
      answer: "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])",
      explanation:
        "We try to improve the path from i to j by going through vertex k.",
    },
    {
      question:
        "Which is better for dense graphs: Floyd-Warshall or running Dijkstra n times?",
      options: [
        "Always Floyd-Warshall",
        "Always Dijkstra",
        "Floyd-Warshall for dense graphs",
        "Dijkstra for graphs with negative weights",
      ],
      answer: "Floyd-Warshall for dense graphs",
      explanation:
        "For dense graphs, Floyd-Warshall's O(V³) can be better than O(VE log V) of multiple Dijkstra runs.",
    },
    {
      question: "What is initialized in the distance matrix?",
      options: [
        "0 for diagonal, infinity for others",
        "1 for all entries",
        "Edge weights for direct edges, infinity for others",
        "Random values",
      ],
      answer: "Edge weights for direct edges, infinity for others",
      explanation:
        "Direct edges have their weights, unreachable pairs have infinity, and diagonal has 0.",
    },
    {
      question: "Which application commonly uses Floyd-Warshall?",
      options: [
        "Network routing protocols",
        "Social network analysis",
        "Transportation networks",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "All these applications benefit from knowing shortest paths between all pairs.",
    },
  ],

  "bellman-ford's-algorithm": [
    {
      question: "What does Bellman-Ford algorithm compute?",
      options: [
        "All pairs shortest paths",
        "Single source shortest paths",
        "Minimum spanning tree",
        "Maximum flow",
      ],
      answer: "Single source shortest paths",
      explanation:
        "Bellman-Ford finds shortest paths from a single source to all other vertices.",
    },
    {
      question: "What is the time complexity of Bellman-Ford?",
      options: ["O(n)", "O(n log n)", "O(nm)", "O(n²)"],
      answer: "O(nm)",
      explanation:
        "It runs for V-1 iterations, each relaxing all E edges, giving O(VE) time.",
    },
    {
      question: "What is Bellman-Ford's advantage over Dijkstra?",
      options: [
        "Faster time complexity",
        "Works with negative weights",
        "Lower space complexity",
        "Easier to implement",
      ],
      answer: "Works with negative weights",
      explanation:
        "Bellman-Ford can handle graphs with negative edge weights, unlike Dijkstra.",
    },
    {
      question: "How to detect negative cycles with Bellman-Ford?",
      options: [
        "Run one extra iteration and check if distances improve",
        "Check if any distance is negative",
        "Count the number of edges",
        "Use DFS after the algorithm",
      ],
      answer: "Run one extra iteration and check if distances improve",
      explanation:
        "If distances decrease in the V-th iteration, a negative cycle exists.",
    },
    {
      question: "What is the space complexity?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(nm)"],
      answer: "O(n)",
      explanation:
        "It only needs to store distances and predecessors for each vertex.",
    },
    {
      question: "How many relaxation phases does Bellman-Ford need?",
      options: ["n", "n-1", "n²", "log n"],
      answer: "n-1",
      explanation:
        "V-1 iterations are sufficient to propagate shortest paths through the entire graph.",
    },
    {
      question: "Which real-world protocol uses Bellman-Ford?",
      options: [
        "TCP congestion control",
        "RIP (Routing Information Protocol)",
        "HTTP protocol",
        "DNS resolution",
      ],
      answer: "RIP (Routing Information Protocol)",
      explanation:
        "RIP uses a distance-vector algorithm based on Bellman-Ford for network routing.",
    },
    {
      question:
        "What happens if there's a negative cycle reachable from source?",
      options: [
        "Algorithm returns correct distances",
        "Algorithm detects it and reports",
        "Algorithm runs forever",
        "Algorithm returns random values",
      ],
      answer: "Algorithm detects it and reports",
      explanation:
        "Bellman-Ford can detect and report the presence of negative cycles.",
    },
    {
      question:
        "Which is generally faster for graphs without negative weights?",
      options: [
        "Always Bellman-Ford",
        "Always Dijkstra",
        "They have same speed",
        "Depends on graph density",
      ],
      answer: "Always Dijkstra",
      explanation:
        "Dijkstra's O(E log V) is generally faster than Bellman-Ford's O(VE) for non-negative weights.",
    },
    {
      question: "What is initialized in the distance array?",
      options: [
        "0 for source, infinity for others",
        "1 for all vertices",
        "Infinity for all vertices",
        "Random values",
      ],
      answer: "0 for source, infinity for others",
      explanation:
        "Source has distance 0, all other vertices start with infinity (unknown distance).",
    },
  ],

  "travelling-salesman-problem": [
    {
      question: "What is the Traveling Salesman Problem (TSP)?",
      options: [
        "Find shortest path visiting each vertex exactly once and returning to start",
        "Find minimum spanning tree",
        "Find shortest path between two vertices",
        "Find maximum flow in network",
      ],
      answer:
        "Find shortest path visiting each vertex exactly once and returning to start",
      explanation:
        "TSP finds the shortest possible route that visits each city exactly once and returns to the origin city.",
    },
    {
      question: "What is the time complexity of DP solution for TSP?",
      options: ["O(n)", "O(n log n)", "O(n² 2^n)", "O(2^n)"],
      answer: "O(n² 2^n)",
      explanation:
        "The Held-Karp algorithm uses O(n² 2^n) time by considering all subsets of vertices.",
    },
    {
      question: "What is the space complexity of DP solution?",
      options: ["O(n)", "O(n log n)", "O(n 2^n)", "O(2^n)"],
      answer: "O(n 2^n)",
      explanation:
        "We need to store solutions for all subsets and ending vertices.",
    },
    {
      question: "What does the DP state dp[mask][i] represent?",
      options: [
        "Minimum cost to visit all cities in mask ending at city i",
        "Maximum cost to visit cities",
        "Number of paths visiting cities",
        "Time taken to visit cities",
      ],
      answer: "Minimum cost to visit all cities in mask ending at city i",
      explanation:
        "mask represents visited cities, i is the current ending city.",
    },
    {
      question: "Is TSP an NP-hard problem?",
      options: [
        "Yes, it's NP-hard",
        "No, it's in P",
        "Only for large n",
        "Only for metric TSP",
      ],
      answer: "Yes, it's NP-hard",
      explanation:
        "TSP is one of the classic NP-hard problems with no known polynomial-time solution.",
    },
    {
      question: "What is metric TSP?",
      options: [
        "Triangle inequality holds",
        "All distances are equal",
        "Graph is complete",
        "Distances satisfy symmetry",
      ],
      answer: "Triangle inequality holds",
      explanation:
        "Metric TSP satisfies triangle inequality: dist(i,j) ≤ dist(i,k) + dist(k,j).",
    },
    {
      question: "What approximation ratio can be achieved for metric TSP?",
      options: ["1.5", "2", "log n", "n"],
      answer: "1.5",
      explanation:
        "Christofides algorithm achieves 1.5-approximation for metric TSP.",
    },
    {
      question: "Which technique is commonly used for small TSP instances?",
      options: [
        "Dynamic programming",
        "Genetic algorithms",
        "Simulated annealing",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Different techniques are used based on problem size and requirements.",
    },
    {
      question: "What is the base case in TSP DP?",
      options: [
        "dp[1<<i][i] = dist[0][i]",
        "dp[0][i] = 0",
        "dp[1<<i][i] = 0",
        "dp[mask][0] = infinity",
      ],
      answer: "dp[1<<i][i] = dist[0][i]",
      explanation: "Starting from city 0, cost to reach city i directly.",
    },
    {
      question: "Which real-world application uses TSP?",
      options: [
        "Logistics and delivery routes",
        "Circuit board drilling",
        "DNA sequencing",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "TSP has applications in various optimization problems involving route planning.",
    },
  ],

  // Backtracking Algorithms
  "string-permutations": [
    {
      question: "What is a string permutation?",
      options: [
        "All possible arrangements of characters in a string",
        "The reverse of a string",
        "Sorting characters alphabetically",
        "Removing duplicate characters",
      ],
      answer: "All possible arrangements of characters in a string",
      explanation:
        "A permutation is a rearrangement of characters where order matters. For a string of length n, there are n! possible permutations.",
    },
    {
      question: "How many permutations does a string of length n have?",
      options: ["n²", "2ⁿ", "n!", "n log n"],
      answer: "n!",
      explanation:
        "A string of length n has n! (n factorial) permutations. For example, 'ABC' (length 3) has 3! = 6 permutations.",
    },
    {
      question:
        "What is the time complexity of generating all string permutations using backtracking?",
      options: ["O(n)", "O(n log n)", "O(n!)", "O(2ⁿ)"],
      answer: "O(n!)",
      explanation:
        "There are n! permutations, and generating each takes O(n) time, so total complexity is O(n × n!), which simplifies to O(n!).",
    },
    {
      question: "What is the base case in string permutation backtracking?",
      options: [
        "When the remaining string is empty",
        "When current string length equals 1",
        "When all characters are used",
        "Both A and C",
      ],
      answer: "Both A and C",
      explanation:
        "The recursion stops when no characters remain to be chosen (remaining string is empty), meaning we've used all characters.",
    },
    {
      question: "How does backtracking choose the next character?",
      options: [
        "Select each remaining character one by one",
        "Always pick the first character",
        "Pick random characters",
        "Pick characters in sorted order only",
      ],
      answer: "Select each remaining character one by one",
      explanation:
        "For each remaining character, the algorithm chooses it, adds to current permutation, and recursively generates permutations with remaining characters.",
    },
    {
      question: "What happens during backtracking in permutation generation?",
      options: [
        "Remove last chosen character and try next option",
        "Start over from beginning",
        "Delete the entire permutation",
        "Skip to next character without removing",
      ],
      answer: "Remove last chosen character and try next option",
      explanation:
        "After exploring one branch, the algorithm removes (backtracks) the last chosen character to try a different character at that position.",
    },
    {
      question:
        "For string 'ABC', how many leaf nodes are in the permutation tree?",
      options: ["3", "6", "9", "27"],
      answer: "6",
      explanation:
        "Each leaf represents a complete permutation. 'ABC' has 3! = 6 permutations: ABC, ACB, BAC, BCA, CAB, CBA.",
    },
    {
      question:
        "What data structure is typically used to track remaining characters?",
      options: [
        "Boolean array or visited set",
        "Stack",
        "Queue",
        "Linked list",
      ],
      answer: "Boolean array or visited set",
      explanation:
        "A boolean array or visited set efficiently tracks which characters have been used in the current permutation path.",
    },
    {
      question: "How to handle duplicate characters in a string?",
      options: [
        "Skip duplicate choices at same level",
        "Process duplicates normally",
        "Remove duplicates first",
        "Convert to set",
      ],
      answer: "Skip duplicate choices at same level",
      explanation:
        "To avoid duplicate permutations, skip choosing the same character value at the same recursion level if it was already chosen.",
    },
    {
      question:
        "Which algorithm characteristic is NOT true for string permutation?",
      options: [
        "Uses divide and conquer approach",
        "Has n! recursive calls in worst case",
        "Uses O(n) space for recursion stack",
        "Always finds all permutations",
      ],
      answer: "Uses divide and conquer approach",
      explanation:
        "String permutation uses backtracking, not divide and conquer. While it divides the problem, it systematically explores all possibilities by trying and undoing choices.",
    },
  ],
  "sum-of-subsets": [
    {
      question: "What is the Sum of Subsets problem?",
      options: [
        "Find all subsets that sum to a given target",
        "Find maximum sum subset",
        "Find minimum sum subset",
        "Find subset with equal sum partition",
      ],
      answer: "Find all subsets that sum to a given target",
      explanation:
        "Given a set of positive integers, find all subsets whose sum equals a given target value.",
    },
    {
      question:
        "What is the time complexity of naive brute-force for Sum of Subsets?",
      options: ["O(n)", "O(n log n)", "O(2^n)", "O(n!)"],
      answer: "O(2^n)",
      explanation: "Naive approach checks all 2^n subsets of the given set.",
    },
    {
      question: "How does backtracking optimize Sum of Subsets?",
      options: [
        "Prunes branches that exceed target sum",
        "Uses memoization to store results",
        "Sorts the array first",
        "Uses dynamic programming table",
      ],
      answer: "Prunes branches that exceed target sum",
      explanation:
        "Backtracking prunes branches where current sum exceeds target, reducing search space.",
    },
    {
      question: "What is a key optimization for Sum of Subsets?",
      options: [
        "Sort array in descending order",
        "Use BFS instead of DFS",
        "Store results in hash table",
        "Use greedy approach first",
      ],
      answer: "Sort array in descending order",
      explanation:
        "Sorting in descending order allows early pruning when numbers are large.",
    },
    {
      question: "Given set [2,3,5,7] and target 10, how many valid subsets?",
      options: ["1", "2", "3", "4"],
      answer: "2",
      explanation: "Valid subsets are [2,3,5] and [3,7], both sum to 10.",
    },
    {
      question: "What condition allows pruning in Sum of Subsets?",
      options: [
        "currentSum + remainingSum < target",
        "currentSum > target",
        "remaining elements are negative",
        "Both A and B",
      ],
      answer: "Both A and B",
      explanation:
        "We prune when current sum exceeds target OR when even adding all remaining elements we can't reach target.",
    },
    {
      question: "What is the space complexity of backtracking solution?",
      options: ["O(n)", "O(n²)", "O(2^n)", "O(1)"],
      answer: "O(n)",
      explanation: "Space is O(n) for recursion stack depth in worst case.",
    },
    {
      question: "Which technique is similar to Sum of Subsets?",
      options: [
        "0/1 Knapsack",
        "Merge Sort",
        "Dijkstra's Algorithm",
        "Quick Sort",
      ],
      answer: "0/1 Knapsack",
      explanation:
        "Both involve selecting/excluding items to meet a target, though constraints differ.",
    },
    {
      question: "What happens if array contains negative numbers?",
      options: [
        "Algorithm fails completely",
        "Need to modify pruning conditions",
        "Works without changes",
        "Only works if all numbers are negative",
      ],
      answer: "Need to modify pruning conditions",
      explanation:
        "With negative numbers, pruning condition currentSum > target doesn't work as is.",
    },
    {
      question: "Which application uses Sum of Subsets problem?",
      options: [
        "Resource allocation",
        "Cryptography (subset sum in public key)",
        "Load balancing",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Subset sum has applications in various optimization and cryptographic problems.",
    },
  ],

  "n-queens-problem": [
    {
      question: "What is the N-Queens problem?",
      options: [
        "Place N queens on N×N chessboard so no two attack each other",
        "Find maximum queens that can be placed",
        "Place queens to checkmate king",
        "Find shortest path for queen",
      ],
      answer: "Place N queens on N×N chessboard so no two attack each other",
      explanation:
        "Place N queens on an N×N chessboard such that no two queens threaten each other.",
    },
    {
      question: "How many solutions exist for standard 8-Queens problem?",
      options: ["8", "64", "92", "256"],
      answer: "92",
      explanation: "There are 92 distinct solutions to the 8-Queens problem.",
    },
    {
      question: "What is the time complexity of backtracking for N-Queens?",
      options: ["O(n)", "O(n!)", "O(2^n)", "O(n^n)"],
      answer: "O(n!)",
      explanation:
        "Backtracking explores permutations of queen placements, though pruning reduces actual time.",
    },
    {
      question: "How to check if two queens threaten each other?",
      options: [
        "Same row, column, or diagonal",
        "Same color square",
        "Within knight's move",
        "Adjacent squares",
      ],
      answer: "Same row, column, or diagonal",
      explanation: "Queens attack along rows, columns, and both diagonals.",
    },
    {
      question: "What optimization reduces diagonal checks to O(1)?",
      options: [
        "Use boolean arrays for diagonals",
        "Check all previous queens",
        "Use mathematical formula",
        "Store positions in hash set",
      ],
      answer: "Use boolean arrays for diagonals",
      explanation:
        "Maintain arrays tracking occupied rows and diagonals for constant-time checking.",
    },
    {
      question: "How many main diagonals in N×N board?",
      options: ["N", "2N-1", "N²", "2N"],
      answer: "2N-1",
      explanation:
        "There are 2N-1 diagonals in each direction (main and anti-diagonals).",
    },
    {
      question: "What is the minimum N with no solution?",
      options: ["1", "2", "3", "4"],
      answer: "2",
      explanation:
        "N=2 and N=3 have no solutions. N=1 has trivial solution, N=4 has solutions.",
    },
    {
      question: "Which algorithm is often compared with N-Queens?",
      options: [
        "Knight's Tour",
        "Tower of Hanoi",
        "Dijkstra's Algorithm",
        "Binary Search",
      ],
      answer: "Knight's Tour",
      explanation: "Both are classic backtracking problems on chessboards.",
    },
    {
      question: "What data structure is efficient for tracking attacks?",
      options: [
        "Bitmask for small N",
        "Hash table",
        "Linked list",
        "Binary search tree",
      ],
      answer: "Bitmask for small N",
      explanation:
        "Bitmask representation allows fast operations and compact storage for N ≤ 64.",
    },
    {
      question: "Which real-world application uses N-Queens concepts?",
      options: [
        "VLSI chip design",
        "Parallel memory storage",
        "Air traffic control",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Constraint satisfaction problems like N-Queens appear in scheduling and layout problems.",
    },
  ],

  "hamiltonian-cycle": [
    {
      question: "What is a Hamiltonian Cycle?",
      options: [
        "Cycle visiting each vertex exactly once and returning to start",
        "Cycle with minimum total weight",
        "Cycle visiting each edge exactly once",
        "Any cycle in the graph",
      ],
      answer: "Cycle visiting each vertex exactly once and returning to start",
      explanation:
        "A cycle that visits every vertex exactly once and returns to starting vertex.",
    },
    {
      question: "How does Hamiltonian Cycle differ from Eulerian Cycle?",
      options: [
        "Hamiltonian visits vertices, Eulerian visits edges",
        "Hamiltonian is easier to find",
        "Eulerian requires connected graph",
        "They are the same",
      ],
      answer: "Hamiltonian visits vertices, Eulerian visits edges",
      explanation:
        "Hamiltonian Cycle visits each vertex once, Eulerian Circuit visits each edge once.",
    },
    {
      question:
        "What is the time complexity of backtracking for Hamiltonian Cycle?",
      options: ["O(n)", "O(n log n)", "O(n!)", "O(2^n)"],
      answer: "O(n!)",
      explanation:
        "Worst-case explores all permutations of vertices, though pruning helps.",
    },
    {
      question: "Which condition allows pruning in Hamiltonian backtracking?",
      options: [
        "Current vertex has no unvisited neighbors",
        "Path length exceeds n",
        "Cycle weight is too high",
        "Both A and B",
      ],
      answer: "Current vertex has no unvisited neighbors",
      explanation:
        "If current vertex has no unvisited adjacent vertices, cannot complete cycle.",
    },
    {
      question: "What is Dirac's theorem for Hamiltonian graphs?",
      options: [
        "If deg(v) ≥ n/2 for all v, graph is Hamiltonian",
        "If graph is complete, it has Hamiltonian cycle",
        "If graph is bipartite, no Hamiltonian cycle",
        "Planar graphs always have Hamiltonian cycles",
      ],
      answer: "If deg(v) ≥ n/2 for all v, graph is Hamiltonian",
      explanation:
        "Dirac's theorem gives sufficient condition for Hamiltonian cycles.",
    },
    {
      question: "Which algorithm uses backtracking for Hamiltonian Cycle?",
      options: [
        "Pósa's algorithm",
        "Dijkstra's algorithm",
        "Kruskal's algorithm",
        "Floyd-Warshall algorithm",
      ],
      answer: "Pósa's algorithm",
      explanation:
        "Pósa's algorithm uses a backtracking approach with rotation operation.",
    },
    {
      question: "What is the space complexity of backtracking solution?",
      options: ["O(n)", "O(n²)", "O(n!)", "O(2^n)"],
      answer: "O(n)",
      explanation: "Need O(n) space for path array and visited tracking.",
    },
    {
      question: "Which problem reduces to Hamiltonian Cycle?",
      options: [
        "Traveling Salesman Problem",
        "Minimum Spanning Tree",
        "Maximum Flow",
        "Graph Coloring",
      ],
      answer: "Traveling Salesman Problem",
      explanation:
        "TSP can be reduced to Hamiltonian Cycle by checking if cycle exists with weight ≤ k.",
    },
    {
      question: "What is Hamiltonian Path (vs Cycle)?",
      options: [
        "Path visiting all vertices, not necessarily cycle",
        "Shorter version of Hamiltonian Cycle",
        "Cycle with repeated vertices",
        "Path with minimum edges",
      ],
      answer: "Path visiting all vertices, not necessarily cycle",
      explanation:
        "Hamiltonian Path visits all vertices once but doesn't return to start.",
    },
    {
      question: "Which application uses Hamiltonian Cycle?",
      options: [
        "Route planning for delivery",
        "Circuit board drilling",
        "DNA fragment assembly",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "All involve visiting locations/points exactly once optimally.",
    },
  ],

  "m-coloring-problem": [
    {
      question: "What is the M-Coloring problem?",
      options: [
        "Color graph vertices with ≤m colors so adjacent vertices differ",
        "Find minimum colors needed",
        "Color edges with m colors",
        "Find chromatic number",
      ],
      answer: "Color graph vertices with ≤m colors so adjacent vertices differ",
      explanation:
        "Given m colors, assign colors to vertices such that no adjacent vertices share color.",
    },
    {
      question: "What is the chromatic number?",
      options: [
        "Minimum m for which graph is m-colorable",
        "Maximum degree of graph",
        "Number of vertices",
        "Number of edges",
      ],
      answer: "Minimum m for which graph is m-colorable",
      explanation:
        "Chromatic number χ(G) is the smallest number of colors needed.",
    },
    {
      question: "What is the time complexity of backtracking for M-Coloring?",
      options: ["O(n)", "O(m^n)", "O(n!)", "O(2^n)"],
      answer: "O(m^n)",
      explanation: "In worst case, tries m colors for each of n vertices.",
    },
    {
      question: "How to check if color c is valid for vertex v?",
      options: [
        "Check all adjacent vertices don't have color c",
        "Check all vertices in graph",
        "Check vertices with same degree",
        "Check previous vertex only",
      ],
      answer: "Check all adjacent vertices don't have color c",
      explanation: "Must ensure no neighbor has the same color c.",
    },
    {
      question: "Which heuristic improves backtracking performance?",
      options: [
        "Order vertices by decreasing degree",
        "Use random order",
        "Always start from vertex 0",
        "Try colors in random order",
      ],
      answer: "Order vertices by decreasing degree",
      explanation:
        "Coloring high-degree vertices first provides more constraints early.",
    },
    {
      question: "What is the Four Color Theorem?",
      options: [
        "Any planar graph is 4-colorable",
        "Any graph is 4-colorable",
        "Planar graphs need at most 5 colors",
        "Complete graphs need n colors",
      ],
      answer: "Any planar graph is 4-colorable",
      explanation: "Every planar graph can be colored with at most 4 colors.",
    },
    {
      question: "Which graph always needs n colors?",
      options: [
        "Complete graph K_n",
        "Cycle graph C_n",
        "Tree with n vertices",
        "Bipartite graph",
      ],
      answer: "Complete graph K_n",
      explanation:
        "Complete graph on n vertices needs n colors as all vertices are adjacent.",
    },
    {
      question: "What is bipartite graph's chromatic number?",
      options: ["1", "2", "3", "n"],
      answer: "2",
      explanation:
        "Bipartite graphs are 2-colorable (can be colored with two colors).",
    },
    {
      question: "Which algorithm is used for 2-coloring?",
      options: [
        "BFS/DFS with color alternation",
        "Backtracking only",
        "Dynamic programming",
        "Greedy coloring",
      ],
      answer: "BFS/DFS with color alternation",
      explanation:
        "2-coloring (bipartiteness) can be checked with BFS/DFS by alternating colors.",
    },
    {
      question: "Which application uses graph coloring?",
      options: [
        "Register allocation in compilers",
        "Frequency assignment in wireless",
        "Scheduling problems",
        "All of the above",
      ],
      answer: "All of the above",
      explanation:
        "Graph coloring models conflicts in various resource allocation problems.",
    },
  ],

  //Branch and Bound
  "assignment-problem": [
    {
      "question": "What is the Assignment Problem?",
      "options": [
        "Assign n workers to n jobs minimizing total cost",
        "Find shortest path visiting all cities",
        "Pack items in knapsack",
        "Color graph with minimum colors"
      ],
      "answer": "Assign n workers to n jobs minimizing total cost",
      "explanation": "Assignment problem optimally assigns n agents to n tasks with given costs, each agent doing exactly one task, each task assigned to exactly one agent."
    },
    {
      "question": "Which algorithm solves Assignment Problem in O(n³) time?",
      "options": [
        "Hungarian Algorithm",
        "Dijkstra's Algorithm",
        "Bellman-Ford",
        "Kruskal's Algorithm"
      ],
      "answer": "Hungarian Algorithm",
      "explanation": "Hungarian Algorithm (Kuhn-Munkres) solves assignment problem in O(n³) using duality and matrix reduction."
    },
    {
      "question": "What are the constraints in Assignment Problem?",
      "options": [
        "One-to-one matching between agents and tasks",
        "Agents can do multiple tasks",
        "Tasks can be left unassigned",
        "No constraints needed"
      ],
      "answer": "One-to-one matching between agents and tasks",
      "explanation": "Each agent assigned exactly one task, each task assigned exactly one agent - perfect matching in bipartite graph."
    },
    {
      "question": "How to model Assignment Problem as Integer Programming?",
      "options": [
        "Binary variables xᵢⱼ with sum constraints = 1",
        "Continuous variables with bounds",
        "Integer variables without constraints",
        "Boolean variables only"
      ],
      "answer": "Binary variables xᵢⱼ with sum constraints = 1",
      "explanation": "Use binary variables xᵢⱼ (1 if agent i assigned task j). Constraints: Σⱼ xᵢⱼ = 1 for each i, Σᵢ xᵢⱼ = 1 for each j."
    },
    {
      "question": "What is the mathematical formulation of Assignment Problem?",
      "options": [
        "Minimize ΣᵢΣⱼ cᵢⱼ xᵢⱼ subject to assignment constraints",
        "Maximize ΣᵢΣⱼ xᵢⱼ",
        "Minimize Σᵢ xᵢᵢ",
        "Maximize product of assignments"
      ],
      "answer": "Minimize ΣᵢΣⱼ cᵢⱼ xᵢⱼ subject to assignment constraints",
      "explanation": "Objective minimizes total cost with binary variables and row/column sum constraints = 1."
    },
    {
      "question": "What is the time complexity of brute force for Assignment Problem?",
      "options": ["O(n²)", "O(n³)", "O(n!)", "O(2ⁿ)"],
      "answer": "O(n!)",
      "explanation": "Brute force tries all n! permutations of assignments, checking each possibility."
    },
    {
      "question": "Which variation allows unbalanced assignment?",
      "options": [
        "Add dummy rows/columns with zero cost",
        "Remove extra agents/tasks",
        "Use different algorithm",
        "Cannot handle unbalanced"
      ],
      "answer": "Add dummy rows/columns with zero cost",
      "explanation": "For unbalanced problems (different number of agents/tasks), add dummy rows/columns with zero cost to create square matrix."
    },
    {
      "question": "What is the Hungarian Algorithm's key operation?",
      "options": [
        "Row and column reduction",
        "Finding augmenting paths",
        "Graph coloring",
        "Matrix multiplication"
      ],
      "answer": "Row and column reduction",
      "explanation": "Hungarian Algorithm reduces matrix by subtracting row minima, then column minima, then covers zeros with minimum lines."
    },
    {
      "question": "Assignment Problem is a special case of:",
      "options": [
        "Transportation Problem",
        "Maximum Flow Problem",
        "Shortest Path Problem",
        "Minimum Spanning Tree"
      ],
      "answer": "Transportation Problem",
      "explanation": "Assignment problem is transportation problem where supply = demand = 1 at each node."
    },
    {
      "question": "What does duality in Assignment Problem represent?",
      "options": [
        "Shadow prices for agents and tasks",
        "Optimal cost only",
        "Number of assignments",
        "Feasible region"
      ],
      "answer": "Shadow prices for agents and tasks",
      "explanation": "Dual variables represent opportunity costs/prices for assigning each agent and task."
    }
],
"set-cover-problem": [
    {
      "question": "What is the Set Cover Problem?",
      "options": [
        "Find minimum number of sets covering all elements in universe",
        "Find maximum overlapping sets",
        "Find all disjoint sets",
        "Find largest set"
      ],
      "answer": "Find minimum number of sets covering all elements in universe",
      "explanation": "Given universe U and collection of sets, choose minimum subsets whose union equals U."
    },
    {
      "question": "What is the complexity class of Set Cover?",
      "options": ["P", "NP-Complete", "NP-Hard", "Co-NP"],
      "answer": "NP-Complete",
      "explanation": "Decision version is NP-Complete, optimization version is NP-Hard. Karp's 21 NP-complete problems includes set cover."
    },
    {
      "question": "What is the greedy algorithm for Set Cover?",
      "options": [
        "Pick set covering most uncovered elements",
        "Pick smallest set first",
        "Pick largest set first",
        "Pick random sets"
      ],
      "answer": "Pick set covering most uncovered elements",
      "explanation": "Greedy repeatedly selects set covering maximum number of uncovered elements until all covered."
    },
    {
      "question": "What is the approximation ratio of greedy Set Cover?",
      "options": ["O(log n)", "2", "1.5", "n"],
      "answer": "O(log n)",
      "explanation": "Greedy achieves H(n) ≈ ln n approximation, which is optimal unless P = NP."
    },
    {
      "question": "What is Hitting Set problem relative to Set Cover?",
      "options": [
        "Dual problem - elements hit sets",
        "Special case of Set Cover",
        "Harder than Set Cover",
        "Unrelated problem"
      ],
      "answer": "Dual problem - elements hit sets",
      "explanation": "Hitting Set: choose minimum elements intersecting every set. Equivalent to Set Cover by swapping roles."
    },
    {
      "question": "What is the Vertex Cover problem's relation to Set Cover?",
      "options": [
        "Vertex Cover is special case with sets as edges",
        "Vertex Cover is harder",
        "No relation",
        "Vertex Cover is dual"
      ],
      "answer": "Vertex Cover is special case with sets as edges",
      "explanation": "Vertex Cover: universe = edges, sets = vertices with incident edges. Cover all edges with minimum vertices."
    },
    {
      "question": "What is the mathematical formulation of Set Cover?",
      "options": [
        "Minimize Σxⱼ subject to Σⱼ aᵢⱼ xⱼ ≥ 1, xⱼ ∈ {0,1}",
        "Maximize Σxⱼ",
        "Minimize Σaᵢⱼ xⱼ",
        "Maximize coverage with constraints"
      ],
      "answer": "Minimize Σxⱼ subject to Σⱼ aᵢⱼ xⱼ ≥ 1, xⱼ ∈ {0,1}",
      "explanation": "Binary variables xⱼ for sets, aᵢⱼ=1 if element i in set j. Constraints ensure each element covered at least once."
    },
    {
      "question": "Why is Set Cover important in practice?",
      "options": [
        "Models many real problems like facility location",
        "Easy to solve optimally",
        "Always small instances",
        "Only theoretical interest"
      ],
      "answer": "Models many real problems like facility location",
      "explanation": "Set cover models location problems, network monitoring, test selection, and many covering applications."
    },
    {
      "question": "What is the complexity of checking if a solution covers all elements?",
      "options": ["O(nm)", "O(2ⁿ)", "O(n!)", "O(1)"],
      "answer": "O(nm)",
      "explanation": "Check each element against chosen sets - O(universe size × number of chosen sets) time."
    },
    {
      "question": "Which problem is NOT a special case of Set Cover?",
      "options": [
        "Shortest Path",
        "Vertex Cover",
        "Hitting Set",
        "Dominating Set"
      ],
      "answer": "Shortest Path",
      "explanation": "Shortest path finds route between nodes, not covering elements with sets."
    }
],
"integer-programming": [
    {
      "question": "What is Integer Programming (IP)?",
      "options": [
        "Optimization with integer decision variables and linear constraints",
        "Programming with integer data types",
        "Counting integers in a range",
        "Sorting integers"
      ],
      "answer": "Optimization with integer decision variables and linear constraints",
      "explanation": "Integer Programming: linear program where some or all variables must take integer values."
    },
    {
      "question": "What is the difference between LP and IP?",
      "options": [
        "IP has integrality constraints on variables",
        "IP has nonlinear constraints",
        "IP has more variables",
        "IP is easier to solve"
      ],
      "answer": "IP has integrality constraints on variables",
      "explanation": "Linear Programming allows fractional solutions; Integer Programming requires integer values, making it NP-hard."
    },
    {
      "question": "What is Mixed Integer Programming (MIP)?",
      "options": [
        "Some variables integer, others continuous",
        "Mix of linear and nonlinear constraints",
        "Integer and binary variables only",
        "Multiple objective functions"
      ],
      "answer": "Some variables integer, others continuous",
      "explanation": "MIP combines continuous and integer variables, common in real-world optimization."
    },
    {
      "question": "What is the complexity class of general Integer Programming?",
      "options": ["P", "NP-Complete", "NP-Hard", "Undecidable"],
      "answer": "NP-Complete",
      "explanation": "Decision version is NP-Complete; optimization version is NP-Hard. General IP is NP-hard."
    },
    {
      "question": "What is 0-1 Integer Programming?",
      "options": [
        "Variables restricted to 0 or 1",
        "Only 0 and 1 as coefficients",
        "Programs with binary inputs",
        "Constraints with 0-1 matrices"
      ],
      "answer": "Variables restricted to 0 or 1",
      "explanation": "Binary Integer Programming where variables are binary (0/1), modeling yes/no decisions."
    },
    {
      "question": "What is the LP relaxation of an IP?",
      "options": [
        "Drop integrality constraints, solve as LP",
        "Add more constraints",
        "Convert to dual problem",
        "Use nonlinear programming"
      ],
      "answer": "Drop integrality constraints, solve as LP",
      "explanation": "LP relaxation removes integer requirements, providing bound for branch and bound."
    },
    {
      "question": "What is Branch and Bound for IP?",
      "options": [
        "Divide problem by fixing variables, use bounds to prune",
        "Search all possibilities randomly",
        "Use gradient descent",
        "Solve dual problem"
      ],
      "answer": "Divide problem by fixing variables, use bounds to prune",
      "explanation": "Branch and bound recursively partitions feasible region using LP relaxations for bounds."
    },
    {
      "question": "What are cutting planes in IP?",
      "options": [
        "Constraints that cut off fractional solutions without removing integer solutions",
        "Geometric cuts in 3D",
        "Removing variables from problem",
        "Dividing problem into pieces"
      ],
      "answer": "Constraints that cut off fractional solutions without removing integer solutions",
      "explanation": "Cutting planes tighten LP relaxation by adding valid inequalities that exclude fractional points."
    },
    {
      "question": "What is the importance of total unimodularity?",
      "options": [
        "LP relaxation gives integer solution automatically",
        "Problem becomes linear",
        "Solution found in O(1)",
        "No constraints needed"
      ],
      "answer": "LP relaxation gives integer solution automatically",
      "explanation": "If constraint matrix is totally unimodular and RHS integer, LP optimum is integer (e.g., network flow)."
    },
    {
      "question": "Which problem CANNOT be formulated as Integer Program?",
      "options": [
        "Finding transcendental numbers",
        "Assignment Problem",
        "Knapsack Problem",
        "Set Cover Problem"
      ],
      "answer": "Finding transcendental numbers",
      "explanation": "Transcendental numbers (like π, e) cannot be represented as solutions to finite integer programs."
    }
]
};

export default quizData;
