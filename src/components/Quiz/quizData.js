// src/data/quizData.js
const quizData = {
  'bubble-sort': [
    {
      question: 'What is the worst-case time complexity of Bubble Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      answer: 'O(n²)',
      explanation: 'Bubble Sort has O(n²) worst-case complexity because it may require up to n passes, each making n-1 comparisons.'
    },
    {
      question: 'In which case does Bubble Sort perform best?',
      options: ['Random data', 'Reverse sorted data', 'Already sorted data', 'All cases same'],
      answer: 'Already sorted data',
      explanation: 'Best case is O(n) when array is sorted, as it only needs one pass to verify.'
    },
    {
      question: 'What is the space complexity of Bubble Sort?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 'O(1)',
      explanation: 'It sorts in-place with only constant additional space needed.'
    },
    {
      question: 'Which statement about Bubble Sort is correct?',
      options: [
        'It always performs better than Quick Sort',
        'It works by repeatedly selecting the minimum element',
        'It is a stable sorting algorithm',
        'It requires O(n) additional space'
      ],
      answer: 'It is a stable sorting algorithm',
      explanation: 'Equal elements maintain their relative order during sorting.'
    },
    {
      question: 'After first pass of Bubble Sort on [5,3,8,6], what is the array?',
      options: ['[3,5,6,8]', '[3,5,8,6]', '[5,3,6,8]', '[3,8,5,6]'],
      answer: '[3,5,6,8]',
      explanation: 'The largest element (8) bubbles up to its correct position.'
    },
    {
      question: 'What optimization can reduce Bubble Sort passes on sorted data?',
      options: [
        'Add a flag to check if swaps occurred',
        'Sort in both directions alternately',
        'Use recursion',
        'Both A and B'
      ],
      answer: 'Add a flag to check if swaps occurred',
      explanation: 'A swap flag allows early termination if no swaps occur in a pass.'
    },
    {
      question: 'How many comparisons does Bubble Sort make in worst case?',
      options: ['n', 'n²', 'n(n-1)/2', 'n log n'],
      answer: 'n(n-1)/2',
      explanation: 'It makes (n-1)+(n-2)+...+1 = n(n-1)/2 comparisons.'
    },
    {
      question: 'What real-world analogy describes Bubble Sort?',
      options: [
        'Organizing books by swapping adjacent ones',
        'Finding the tallest person in a line',
        'Dividing cards into piles',
        'Sorting coins by dates'
      ],
      answer: 'Organizing books by swapping adjacent ones',
      explanation: 'It resembles physically swapping adjacent items into order.'
    },
    {
      question: 'What is the average-case time complexity of Bubble Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 'O(n²)',
      explanation: 'On average, it still requires quadratic time.'
    },
    {
      question: 'Which property makes Bubble Sort impractical for large datasets?',
      options: [
        'O(n²) time complexity',
        'O(n) space complexity',
        'Unstable sorting',
        'Recursive implementation'
      ],
      answer: 'O(n²) time complexity',
      explanation: 'Quadratic growth becomes too slow for large n.'
    }
  ],

  'selection-sort': [
    {
      question: 'What is the main operation in Selection Sort?',
      options: [
        'Repeatedly swapping adjacent elements',
        'Finding minimum element and placing it at beginning',
        'Dividing array into subarrays',
        'Comparing all elements to a pivot'
      ],
      answer: 'Finding minimum element and placing it at beginning',
      explanation: 'It repeatedly selects the minimum from the unsorted portion.'
    },
    {
      question: 'What is the time complexity of Selection Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 'O(n²)',
      explanation: 'It always makes n(n-1)/2 comparisons regardless of input.'
    },
    {
      question: 'Is Selection Sort stable?',
      options: ['Yes', 'No', 'Only for small arrays', 'Only in best case'],
      answer: 'No',
      explanation: 'The default implementation is not stable as swaps can change order of equals.'
    },
    {
      question: 'After first iteration on [64,25,12,22,11], what is the array?',
      options: [
        '[11,25,12,22,64]',
        '[25,64,12,22,11]',
        '[64,25,12,22,11]',
        '[11,64,25,22,12]'
      ],
      answer: '[11,25,12,22,64]',
      explanation: 'The minimum (11) is moved to the front.'
    },
    {
      question: 'What is the space complexity of Selection Sort?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 'O(1)',
      explanation: 'It sorts in-place with constant extra space.'
    },
    {
      question: 'How many swaps does Selection Sort perform in worst case?',
      options: ['n', 'n²', 'n-1', 'n log n'],
      answer: 'n-1',
      explanation: 'It performs exactly n-1 swaps regardless of input.'
    },
    {
      question: 'What is the best-case time complexity?',
      options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
      answer: 'O(n²)',
      explanation: 'It always performs the same number of comparisons.'
    },
    {
      question: 'Which algorithm is Selection Sort most similar to?',
      options: [
        'Insertion Sort',
        'Bubble Sort',
        'Heap Sort',
        'Merge Sort'
      ],
      answer: 'Heap Sort',
      explanation: 'Both repeatedly select extremal elements, though Heap Sort is more efficient.'
    },
    {
      question: 'When is Selection Sort most useful?',
      options: [
        'When memory is limited',
        'When stability is required',
        'When data is nearly sorted',
        'When worst-case performance is critical'
      ],
      answer: 'When memory is limited',
      explanation: 'Its O(1) space complexity makes it useful in constrained environments.'
    },
    {
      question: 'How can Selection Sort be made stable?',
      options: [
        'By using linked lists',
        'By inserting instead of swapping',
        'By comparing adjacent elements',
        'Both A and B'
      ],
      answer: 'Both A and B',
      explanation: 'Either approach preserves order of equal elements.'
    }
  ],

  'insertion-sort': [
    {
      question: 'How does Insertion Sort work?',
      options: [
        'By building the final array one item at a time',
        'By dividing the array into halves',
        'By repeatedly swapping adjacent elements',
        'By selecting minimum elements'
      ],
      answer: 'By building the final array one item at a time',
      explanation: 'It inserts each element into its proper position in the sorted portion.'
    },
    {
      question: 'What is the best-case time complexity?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
      answer: 'O(n)',
      explanation: 'When input is already sorted, it only needs linear time.'
    },
    {
      question: 'After first pass on [4,3,2,10,12,1,5,6], what changes?',
      options: [
        '[3,4,2,10,12,1,5,6]',
        '[4,3,2,10,12,1,5,6]',
        '[2,3,4,10,12,1,5,6]',
        '[4,3,10,2,12,1,5,6]'
      ],
      answer: '[3,4,2,10,12,1,5,6]',
      explanation: 'The first two elements become sorted.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 'O(1)',
      explanation: 'It sorts in-place with constant extra space.'
    },
    {
      question: 'In what scenario does it outperform Merge Sort?',
      options: [
        'Large random datasets',
        'Nearly sorted datasets',
        'Reverse sorted datasets',
        'Datasets with many duplicates'
      ],
      answer: 'Nearly sorted datasets',
      explanation: 'For nearly sorted data, it can approach O(n) time.'
    },
    {
      question: 'How many comparisons in worst case?',
      options: ['n', 'n²', 'n(n-1)/2', 'n log n'],
      answer: 'n(n-1)/2',
      explanation: 'Each element may need to compare with all previous elements.'
    },
    {
      question: 'Which algorithm uses Insertion Sort as a subroutine?',
      options: [
        'Quick Sort',
        'Merge Sort',
        'Shell Sort',
        'Tim Sort'
      ],
      answer: 'Tim Sort',
      explanation: 'Tim Sort uses Insertion Sort for small runs.'
    },
    {
      question: 'What is the main advantage for small datasets?',
      options: [
        'Low constant factors',
        'Cache-friendly access',
        'No recursion overhead',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'Its simplicity provides multiple performance benefits for small n.'
    },
    {
      question: 'How many element shifts in worst case?',
      options: ['n', 'n²', 'n(n-1)/2', 'log n'],
      answer: 'n(n-1)/2',
      explanation: 'Each insertion may require shifting the entire sorted portion.'
    },
    {
      question: 'Is Insertion Sort stable?',
      options: ['Yes', 'No', 'Only for integers', 'Only in best case'],
      answer: 'Yes',
      explanation: 'Equal elements maintain their relative order.'
    }
  ],

  'merge-sort': [
    {
      question: 'What is the time complexity of Merge Sort?',
      options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(log n)'],
      answer: 'O(n log n)',
      explanation: 'Divides array in halves (log n) and merges them (n).'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 'O(n)',
      explanation: 'Requires temporary arrays during merging.'
    },
    {
      question: 'Which technique does it use?',
      options: [
        'Divide and Conquer',
        'Greedy Algorithm',
        'Dynamic Programming',
        'Backtracking'
      ],
      answer: 'Divide and Conquer',
      explanation: 'Divides problem into subproblems, solves them, and combines results.'
    },
    {
      question: 'Is Merge Sort stable?',
      options: ['Yes', 'No', 'Only for small arrays', 'Only in best case'],
      answer: 'Yes',
      explanation: 'The standard implementation is stable.'
    },
    {
      question: 'What is the key operation?',
      options: [
        'Partitioning',
        'Pivot selection',
        'Merging sorted subarrays',
        'Swapping adjacent elements'
      ],
      answer: 'Merging sorted subarrays',
      explanation: 'The merge step combines two sorted halves into one.'
    },
    {
      question: 'What is the recurrence relation?',
      options: [
        'T(n) = T(n/2) + O(n)',
        'T(n) = 2T(n/2) + O(n)',
        'T(n) = T(n-1) + O(n)',
        'T(n) = T(k) + T(n-k) + O(n)'
      ],
      answer: 'T(n) = 2T(n/2) + O(n)',
      explanation: 'Divides into two subproblems of half size plus linear merge work.'
    },
    {
      question: 'What is the advantage over Quick Sort?',
      options: [
        'Better average-case performance',
        'Guaranteed O(n log n) time',
        'Lower space complexity',
        'Easier to implement'
      ],
      answer: 'Guaranteed O(n log n) time',
      explanation: 'Never degrades to quadratic performance.'
    },
    {
      question: 'How can memory usage be optimized?',
      options: [
        'Using linked lists',
        'In-place merging',
        'Insertion sort for small subarrays',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'Various techniques can reduce memory overhead.'
    },
    {
      question: 'Which variant uses O(1) space?',
      options: [
        'In-place Merge Sort',
        'Block Merge Sort',
        'Natural Merge Sort',
        'Bottom-up Merge Sort'
      ],
      answer: 'Block Merge Sort',
      explanation: 'A complex but truly in-place variant.'
    },
    {
      question: 'What is the base case typically?',
      options: [
        'Array of size 0',
        'Array of size 1',
        'Array of size 2',
        'Array of size 10'
      ],
      answer: 'Array of size 1',
      explanation: 'A single element is trivially sorted.'
    }
  ],

  'quick-sort': [
    {
      question: 'What is the average-case time complexity?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 'O(n log n)',
      explanation: 'With good pivot selection, average performance is O(n log n).'
    },
    {
      question: 'What is the worst-case time complexity?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      answer: 'O(n²)',
      explanation: 'Occurs with consistently bad pivot choices.'
    },
    {
      question: 'Which pivot selection avoids worst-case?',
      options: [
        'Always first element',
        'Always last element',
        'Median-of-three',
        'Random element'
      ],
      answer: 'Median-of-three',
      explanation: 'Choosing median of first, middle, last elements helps balance partitions.'
    },
    {
      question: 'Is Quick Sort stable?',
      options: ['Yes', 'No', 'Only for small arrays', 'Only with certain pivot choices'],
      answer: 'No',
      explanation: 'Standard implementation is not stable due to non-adjacent swaps.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answer: 'O(log n)',
      explanation: 'Space is used for recursion stack (log n in average case).'
    },
    {
      question: 'What is tail recursion optimization?',
      options: [
        'Recursing only on smaller partition',
        'Using insertion sort for small subarrays',
        'Choosing middle element as pivot',
        'Eliminating one recursive call via iteration'
      ],
      answer: 'Recursing only on smaller partition',
      explanation: 'Limits recursion depth to O(log n) in worst case.'
    },
    {
      question: 'Which real-world application commonly uses Quick Sort?',
      options: [
        'Database indexing',
        'Graphics rendering',
        'Cryptography',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'Its cache efficiency makes it widely used in performance-critical systems.'
    },
    {
      question: 'What is the worst-case space complexity?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 'O(n)',
      explanation: 'Bad pivots can lead to linear recursion depth.'
    },
    {
      question: 'What is the partition process?',
      options: [
        'Dividing array into two subarrays around a pivot',
        'Finding the median element',
        'Splitting array into equal halves',
        'Separating even and odd elements'
      ],
      answer: 'Dividing array into two subarrays around a pivot',
      explanation: 'Elements < pivot go left, > pivot go right.'
    },
    {
      question: 'Which algorithm is hybridized with Quick Sort in Introsort?',
      options: [
        'Insertion Sort',
        'Merge Sort',
        'Heap Sort',
        'Selection Sort'
      ],
      answer: 'Heap Sort',
      explanation: 'Introsort switches to Heap Sort when recursion depth exceeds limit.'
    }
  ],

  'heap-sort': [
    {
      question: 'What data structure does it primarily use?',
      options: ['Stack', 'Queue', 'Binary Heap', 'Linked List'],
      answer: 'Binary Heap',
      explanation: 'Uses a binary heap to structure data for sorting.'
    },
    {
      question: 'What is the time complexity?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 'O(n log n)',
      explanation: 'Building heap is O(n) and each extraction is O(log n), repeated n times.'
    },
    {
      question: 'Is Heap Sort stable?',
      options: ['Yes', 'No', 'Only for max-heap', 'Only for min-heap'],
      answer: 'No',
      explanation: 'Heap operations can change relative order of equal elements.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      answer: 'O(1)',
      explanation: 'It sorts in-place with constant extra space.'
    },
    {
      question: 'After heapifying [3,1,4,1,5,9,2], what is first element?',
      options: ['1', '2', '9', '3'],
      answer: '9',
      explanation: 'Heapification creates max-heap with largest element at root.'
    },
    {
      question: 'What is the time complexity of building the heap?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      answer: 'O(n)',
      explanation: 'Surprisingly, heap construction can be done in linear time.'
    },
    {
      question: 'Which heap property is essential?',
      options: [
        'All levels are completely filled',
        'Parent nodes are greater than children (max-heap)',
        'Left children are greater than right',
        'All leaves are at same depth'
      ],
      answer: 'Parent nodes are greater than children (max-heap)',
      explanation: 'This allows efficient extraction of maximum elements.'
    },
    {
      question: 'How can it be made stable?',
      options: [
        'Using a secondary array',
        'Including original indices in comparisons',
        'Implementing as min-heap',
        'Cannot be made stable'
      ],
      answer: 'Including original indices in comparisons',
      explanation: 'Preserves order of equals at cost of extra space.'
    },
    {
      question: 'What is the advantage over Merge Sort?',
      options: [
        'Stable sorting',
        'Better cache performance',
        'In-place sorting',
        'Faster average case'
      ],
      answer: 'In-place sorting',
      explanation: 'Requires only O(1) additional space.'
    },
    {
      question: 'Which operation dominates time complexity?',
      options: [
        'Heap construction',
        'Extract-max operations',
        'Both contribute equally',
        'Depends on input'
      ],
      answer: 'Extract-max operations',
      explanation: 'The n log n term comes from repeated extractions.'
    }
  ],

  'shell-sort': [
    {
      question: 'What is the key feature?',
      options: [
        'Compares adjacent elements',
        'Uses diminishing increments',
        'Requires O(n) extra space',
        'Always runs in O(n log n) time'
      ],
      answer: 'Uses diminishing increments',
      explanation: 'Sorts elements far apart first, then reduces the gap.'
    },
    {
      question: 'What is the worst-case time complexity with proper gaps?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n^(3/2))'],
      answer: 'O(n^(3/2))',
      explanation: 'With proper gap sequence, can outperform O(n²) algorithms.'
    },
    {
      question: 'Which algorithm does it improve upon?',
      options: [
        'Bubble Sort',
        'Insertion Sort',
        'Selection Sort',
        'Quick Sort'
      ],
      answer: 'Insertion Sort',
      explanation: 'Optimizes Insertion Sort by allowing exchange of far items.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 'O(1)',
      explanation: 'Like Insertion Sort, it sorts in-place.'
    },
    {
      question: 'Which gap sequence is common?',
      options: [
        'Fibonacci sequence',
        'Powers of 2',
        'Knuth sequence (3k+1)',
        'Prime numbers'
      ],
      answer: 'Knuth sequence (3k+1)',
      explanation: 'Sequence 1,4,13,40,... provides good practical performance.'
    },
    {
      question: 'What is the key insight behind its efficiency?',
      options: [
        'Early moves eliminate large displacements',
        'Uses divide-and-conquer',
        'Sorts odd/even elements separately',
        'Maintains multiple sorted subarrays'
      ],
      answer: 'Early moves eliminate large displacements',
      explanation: 'Early passes move elements over large distances, reducing later work.'
    },
    {
      question: 'Which sequence achieves O(n^(4/3)) time?',
      options: [
        'Powers of 2',
        'Powers of 3',
        'Sedgewick\'s sequence',
        'Fibonacci sequence'
      ],
      answer: 'Sedgewick\'s sequence',
      explanation: 'Theoretically optimal sequence derived by Sedgewick.'
    },
    {
      question: 'Why is it an improvement over Insertion Sort?',
      options: [
        'Better asymptotic complexity',
        'Lower constant factors',
        'Eliminates large shifts early',
        'All of the above'
      ],
      answer: 'Eliminates large shifts early',
      explanation: 'Diminishing gaps reduce final insertion passes.'
    },
    {
      question: 'What is the best-known time complexity?',
      options: [
        'O(n log n)',
        'O(n^(3/2))',
        'O(n^(4/3))',
        'Depends on gap sequence'
      ],
      answer: 'Depends on gap sequence',
      explanation: 'Different sequences yield different theoretical bounds.'
    },
    {
      question: 'Which application benefits most?',
      options: [
        'Sorting nearly-sorted data',
        'Embedded systems with memory constraints',
        'Large database operations',
        'Graphics rendering'
      ],
      answer: 'Embedded systems with memory constraints',
      explanation: 'In-place nature and reasonable performance suit constrained environments.'
    }
  ],

  'counting-sort': [
    {
      question: 'When is it most effective?',
      options: [
        'When range of input is small',
        'When data is nearly sorted',
        'When stability is not required',
        'When space is limited'
      ],
      answer: 'When range of input is small',
      explanation: 'Works well when range (k) is not significantly larger than n.'
    },
    {
      question: 'What is the time complexity?',
      options: ['O(n)', 'O(n log n)', 'O(n + k)', 'O(n²)'],
      answer: 'O(n + k)',
      explanation: 'Counts occurrences of each value (k) and outputs sorted order (n).'
    },
    {
      question: 'Is it a comparison sort?',
      options: ['Yes', 'No', 'Only in worst case', 'Only for integers'],
      answer: 'No',
      explanation: 'Counts occurrences rather than comparing elements directly.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(1)', 'O(log n)', 'O(n + k)', 'O(n²)'],
      answer: 'O(n + k)',
      explanation: 'Requires arrays for counts (k) and output (n).'
    },
    {
      question: 'Which sort commonly uses it as a subroutine?',
      options: ['Radix Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'],
      answer: 'Radix Sort',
      explanation: 'Used as stable digit sort in Radix implementations.'
    },
    {
      question: 'What is the main limitation?',
      options: [
        'Cannot sort negative numbers',
        'Requires O(n) additional space',
        'Only works with integer keys',
        'Unstable'
      ],
      answer: 'Only works with integer keys',
      explanation: 'Relies on integer indices for counting.'
    },
    {
      question: 'How can it handle negative numbers?',
      options: [
        'Using two counting arrays',
        'Adding an offset to make all positive',
        'Treating sign bit separately',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'Various techniques can extend it to handle negatives.'
    },
    {
      question: 'What is the minimum range requirement for efficiency?',
      options: [
        'k = O(n)',
        'k = O(n log n)',
        'k = O(n²)',
        'No requirement'
      ],
      answer: 'k = O(n)',
      explanation: 'Range k should be comparable to n for linear performance.'
    },
    {
      question: 'Which step ensures stability?',
      options: [
        'Initial counting phase',
        'Cumulative sum phase',
        'Placement phase (iterating backwards)',
        'All of the above'
      ],
      answer: 'Placement phase (iterating backwards)',
      explanation: 'Backwards iteration preserves order of equal elements.'
    },
    {
      question: 'What is the most common use?',
      options: [
        'Standalone sorting',
        'Subroutine in Radix Sort',
        'Sorting floating-point numbers',
        'External sorting'
      ],
      answer: 'Subroutine in Radix Sort',
      explanation: 'Serves as stable digit sort in Radix implementations.'
    }
  ],

  'radix-sort': [
    {
      question: 'What is the key idea?',
      options: [
        'Comparing adjacent elements',
        'Sorting numbers digit by digit',
        'Dividing array into buckets',
        'Selecting pivot elements'
      ],
      answer: 'Sorting numbers digit by digit',
      explanation: 'Processes digits from least to most significant.'
    },
    {
      question: 'What is the time complexity for n numbers with d digits?',
      options: ['O(n)', 'O(dn)', 'O(n log n)', 'O(n²)'],
      answer: 'O(dn)',
      explanation: 'Each digit pass takes O(n) time, repeated d times.'
    },
    {
      question: 'Which sort does it typically use as subroutine?',
      options: [
        'Counting Sort',
        'Insertion Sort',
        'Quick Sort',
        'Selection Sort'
      ],
      answer: 'Counting Sort',
      explanation: 'Uses Counting Sort as stable digit sort.'
    },
    {
      question: 'Is it a comparison sort?',
      options: ['Yes', 'No', 'Only for integers', 'Only in best case'],
      answer: 'No',
      explanation: 'Processes digits directly rather than comparing whole numbers.'
    },
    {
      question: 'What types of data can it handle?',
      options: [
        'Only positive integers',
        'Integers and strings',
        'Only floating-point numbers',
        'Any comparable data'
      ],
      answer: 'Integers and strings',
      explanation: 'Can sort anything with positional digits/characters.'
    },
    {
      question: 'Why is LSD Radix Sort preferred over MSD?',
      options: [
        'Lower space complexity',
        'Stability',
        'Easier implementation',
        'No recursion required'
      ],
      answer: 'Stability',
      explanation: 'Least Significant Digit version is inherently stable.'
    },
    {
      question: 'How can it handle floating-point numbers?',
      options: [
        'Treating as strings',
        'Separating integer/fractional parts',
        'Using bitwise operations',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'Various encoding techniques can adapt it for floats.'
    },
    {
      question: 'Which optimization helps for 32-bit integers?',
      options: [
        'Using base-256 for fewer passes',
        'Sorting bytes instead of digits',
        'Using SIMD instructions',
        'All of the above'
      ],
      answer: 'All of the above',
      explanation: 'All can significantly improve performance.'
    },
    {
      question: 'What is the main advantage over comparison sorts?',
      options: [
        'Better asymptotic complexity',
        'No comparisons needed',
        'Stability',
        'Lower space complexity'
      ],
      answer: 'Better asymptotic complexity',
      explanation: 'O(dn) can outperform O(n log n) for fixed-width keys.'
    },
    {
      question: 'What is the space complexity?',
      options: ['O(1)', 'O(d)', 'O(n + k)', 'O(dn)'],
      answer: 'O(n + k)',
      explanation: 'Requires space for output array and counting bins.'
    }
  ],

  'bucket-sort': [
    {
      question: 'What is the key idea?',
      options: [
        'Dividing data into ranges and sorting each',
        'Comparing adjacent elements',
        'Selecting pivot elements',
        'Building a heap structure'
      ],
      answer: 'Dividing data into ranges and sorting each',
      explanation: 'Distributes elements into buckets which are sorted individually.'
    },
    {
      question: 'What is the average-case time complexity with uniform data?',
      options: ['O(n + k)', 'O(n log n)', 'O(n²)', 'O(n)'],
      answer: 'O(n + k)',
      explanation: 'Where k is number of buckets - linear when distribution is uniform.'
    },
    {
      question: 'Which algorithm typically sorts individual buckets?',
      options: [
        'Insertion Sort',
        'Quick Sort',
        'Merge Sort',
        'Any comparison sort'
      ],
      answer: 'Insertion Sort',
      explanation: 'Its low overhead makes it ideal for small buckets.'
    },
    {
      question: 'What is the worst-case time complexity?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 'O(n²)',
      explanation: 'Occurs when all elements fall into a single bucket.'
    },
    {
      question: 'When is it most effective?',
      options: [
        'When input is uniformly distributed',
        'When data is nearly sorted',
        'When stability is required',
        'When memory is limited'
      ],
      answer: 'When input is uniformly distributed',
      explanation: 'Uniform distribution ensures balanced buckets and O(n) performance.'
    },
    {
      question: 'How does it handle empty buckets?',
      options: [
        'Skips them during concatenation',
        'Fills with dummy values',
        'Rebalances buckets',
        'Fails in such cases'
      ],
      answer: 'Skips them during concatenation',
      explanation: 'Empty buckets don\'t require processing.'
    },
    {
      question: 'What is the worst-case space complexity?',
      options: ['O(1)', 'O(n)', 'O(n + k)', 'O(n²)'],
      answer: 'O(n + k)',
      explanation: 'Needs space for n elements plus k buckets (even if empty).'
    },
    {
      question: 'Which scenario makes it perform O(n²)?',
      options: [
        'All elements in one bucket',
        'Uniform distribution',
        'Reverse sorted input',
        'Small range of integers'
      ],
      answer: 'All elements in one bucket',
      explanation: 'Degenerates to the complexity of the bucket sorting algorithm.'
    },
    {
      question: 'What is the main advantage over comparison sorts?',
      options: [
        'Better asymptotic complexity',
        'Stability',
        'In-place sorting',
        'Handles any data type'
      ],
      answer: 'Better asymptotic complexity',
      explanation: 'Can achieve O(n) time with uniform distribution.'
    },
    {
      question: 'How does it compare to Radix Sort?',
      options: [
        'Bucket Sort is faster',
        'Radix Sort is more general',
        'Bucket Sort doesn\'t use counting',
        'Radix Sort is a type of Bucket Sort'
      ],
      answer: 'Radix Sort is a type of Bucket Sort',
      explanation: 'Radix Sort can be viewed as Bucket Sort where buckets represent digits.'
    }
  ],
  "linear-search": [
    {
      question: "What is the time complexity of linear search in the worst case?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(n)",
      explanation: "In the worst case, the target element is the last element or not present, so we have to check all n elements."
    },
    {
      question: "Which of the following is NOT a requirement for linear search?",
      options: ["Sorted array", "Random access", "Comparable elements", "Finite size"],
      answer: "Sorted array",
      explanation: "Linear search works on both sorted and unsorted arrays, unlike binary search which requires sorting."
    },
    {
      question: "What is the best-case scenario for linear search?",
      options: ["Element is at the beginning", "Element is at the end", "Element is not present", "Array is empty"],
      answer: "Element is at the beginning",
      explanation: "In the best case, the target element is the first element checked, resulting in O(1) time complexity."
    },
    {
      question: "How would you modify linear search to find all occurrences of a value?",
      options: [
        "Return after first match",
        "Continue searching after first match",
        "Use binary search instead",
        "Sort the array first"
      ],
      answer: "Continue searching after first match",
      explanation: "To find all occurrences, you need to continue searching the entire array after finding a match."
    },
    {
      question: "When is linear search preferred over binary search?",
      options: [
        "When the array is large",
        "When the array is frequently updated",
        "When the array is sorted",
        "When memory is limited"
      ],
      answer: "When the array is frequently updated",
      explanation: "Linear search doesn't require sorting, so it's better for frequently updated arrays where maintaining sorted order would be expensive."
    },
    {
      question: "What is the space complexity of linear search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "Linear search uses constant space as it doesn't require any additional data structures."
    },
    {
      question: "Which data structure CANNOT use linear search effectively?",
      options: ["Arrays", "Linked lists", "Hash tables", "Binary search trees"],
      answer: "Hash tables",
      explanation: "Hash tables use hash functions for O(1) access, making linear search unnecessary and inefficient."
    },
    {
      question: "How can you optimize linear search for a frequently accessed element?",
      options: [
        "Move it to the end",
        "Move it to the front",
        "Sort the array",
        "Use binary search instead"
      ],
      answer: "Move it to the front",
      explanation: "Moving frequently accessed elements to the front reduces search time for those elements in subsequent searches."
    },
    {
      question: "What is the average case time complexity of linear search?",
      options: ["O(1)", "O(n/2)", "O(n)", "O(log n)"],
      answer: "O(n)",
      explanation: "On average, you'd need to check half the elements, but constant factors are dropped in Big-O notation."
    },
    {
      question: "Which scenario would make linear search perform as poorly as possible?",
      options: [
        "Searching for the first element",
        "Searching for an element not in the array",
        "Searching in a small array",
        "Searching in a sorted array"
      ],
      answer: "Searching for an element not in the array",
      explanation: "When the element isn't present, linear search must check every single element in the array."
    }
  ],
  "binary-search": [
    {
      question: "What is the prerequisite for performing binary search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "Array must be small"
      ],
      answer: "Array must be sorted",
      explanation: "Binary search relies on the array being sorted to eliminate half of the remaining elements at each step."
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(log n)",
      explanation: "Binary search halves the search space at each step, leading to logarithmic time complexity."
    },
    {
      question: "What is the worst-case scenario for binary search?",
      options: [
        "Element is at the first position",
        "Element is at the last position",
        "Element is not present",
        "Element is at the middle"
      ],
      answer: "Element is not present",
      explanation: "The worst case occurs when the element isn't present, requiring the maximum number of comparisons."
    },
    {
      question: "Which of these is NOT a step in binary search?",
      options: [
        "Compare with the middle element",
        "Recursively search left or right half",
        "Swap adjacent elements",
        "Repeat until element is found or interval is empty"
      ],
      answer: "Swap adjacent elements",
      explanation: "Binary search doesn't modify the array - it only examines elements and adjusts search boundaries."
    },
    {
      question: "What is the space complexity of iterative binary search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "Iterative binary search uses constant space as it only needs a few variables to track boundaries."
    },
    {
      question: "Which data structure is binary search commonly used with?",
      options: ["Linked lists", "Arrays", "Hash tables", "Stacks"],
      answer: "Arrays",
      explanation: "Binary search is most efficient with arrays due to their O(1) random access capability."
    },
    {
      question: "What is the mid-point calculation in binary search to avoid overflow?",
      options: [
        "mid = (low + high) / 2",
        "mid = low + (high - low) / 2",
        "mid = high - (high - low) / 2",
        "mid = (low * high) / 2"
      ],
      answer: "mid = low + (high - low) / 2",
      explanation: "This calculation prevents potential integer overflow that could occur with (low + high)/2 for large arrays."
    },
    {
      question: "How many comparisons does binary search need for an array of 1024 elements?",
      options: ["10", "11", "32", "1024"],
      answer: "10",
      explanation: "log₂1024 = 10, so at most 10 comparisons are needed in the worst case."
    },
    {
      question: "What is the main disadvantage of binary search?",
      options: [
        "High time complexity",
        "Requires sorted data",
        "Only works on numbers",
        "Cannot be implemented recursively"
      ],
      answer: "Requires sorted data",
      explanation: "The need to maintain sorted data is the primary drawback, especially for frequently modified datasets."
    },
    {
      question: "Which search algorithm is faster than binary search for very small arrays?",
      options: [
        "Linear search",
        "Jump search",
        "Exponential search",
        "Ternary search"
      ],
      answer: "Linear search",
      explanation: "For very small arrays (typically <10 elements), linear search can be faster due to simpler operations."
    }
  ],
  "jump-search": [
    {
      question: "What is the optimal block size for jump search?",
      options: ["√n", "n/2", "log n", "n"],
      answer: "√n",
      explanation: "The optimal jump size is √n, which balances between the jump steps and the linear search within a block."
    },
    {
      question: "What is the time complexity of jump search?",
      options: ["O(√n)", "O(n)", "O(log n)", "O(n log n)"],
      answer: "O(√n)",
      explanation: "Jump search has O(√n) complexity as it makes √n jumps in the worst case and performs √n comparisons in the linear search phase."
    },
    {
      question: "Which of these is a prerequisite for jump search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "No prerequisites"
      ],
      answer: "Array must be sorted",
      explanation: "Like binary search, jump search requires the array to be sorted to work correctly."
    },
    {
      question: "What is the first step in jump search?",
      options: [
        "Jump ahead by fixed steps",
        "Compare with the middle element",
        "Sort the array",
        "Check the last element"
      ],
      answer: "Jump ahead by fixed steps",
      explanation: "Jump search begins by jumping ahead in fixed-size steps until it finds an interval that might contain the target."
    },
    {
      question: "When does jump search perform better than binary search?",
      options: [
        "On very small arrays",
        "On very large arrays stored on slow media",
        "On unsorted arrays",
        "On arrays with duplicate elements"
      ],
      answer: "On very large arrays stored on slow media",
      explanation: "Jump search can be better when the cost of jumping ahead is less than the cost of random access needed for binary search."
    },
    {
      question: "What is the space complexity of jump search?",
      options: ["O(n)", "O(√n)", "O(log n)", "O(1)"],
      answer: "O(1)",
      explanation: "Jump search uses constant space as it only needs a few variables to track positions."
    },
    {
      question: "Which search algorithm is jump search most similar to?",
      options: [
        "Linear search",
        "Binary search",
        "Exponential search",
        "Interpolation search"
      ],
      answer: "Linear search",
      explanation: "Jump search is essentially an optimized version of linear search that jumps ahead in fixed blocks."
    },
    {
      question: "What is the worst-case scenario for jump search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at the last jump position"
      ],
      answer: "Element is at the end",
      explanation: "The worst case occurs when the element is at the end, requiring √n jumps and then √n comparisons in the linear search phase."
    },
    {
      question: "How would you modify jump search for better performance on uniformly distributed data?",
      options: [
        "Use larger jump sizes",
        "Use smaller jump sizes",
        "Use interpolation jump sizes",
        "Switch to binary search"
      ],
      answer: "Use interpolation jump sizes",
      explanation: "For uniformly distributed data, interpolation-based jump sizes can provide better performance."
    },
    {
      question: "Which of these is NOT an advantage of jump search over binary search?",
      options: [
        "Fewer comparisons",
        "Better cache performance",
        "Works on linked lists",
        "No recursive calls"
      ],
      answer: "Works on linked lists",
      explanation: "Jump search doesn't work well on linked lists as it requires efficient random access for the jumps."
    }
  ],
  "exponential-search": [
    {
      question: "What is the first step in exponential search?",
      options: [
        "Find range where element may be present",
        "Sort the array",
        "Check the middle element",
        "Compare with first and last elements"
      ],
      answer: "Find range where element may be present",
      explanation: "Exponential search begins by finding a range where the element might be by doubling the index at each step."
    },
    {
      question: "What is the time complexity of exponential search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: "O(log n)",
      explanation: "Exponential search has logarithmic complexity as it uses binary search after finding the appropriate range."
    },
    {
      question: "Which search algorithms does exponential search combine?",
      options: [
        "Linear and binary search",
        "Jump and binary search",
        "Linear and jump search",
        "Binary and interpolation search"
      ],
      answer: "Linear and binary search",
      explanation: "Exponential search combines elements of linear search (to find the range) and binary search (to search the range)."
    },
    {
      question: "When is exponential search particularly useful?",
      options: [
        "When the array is small",
        "When the array is unsorted",
        "When the element is near the beginning",
        "When the array is unbounded or infinite"
      ],
      answer: "When the array is unbounded or infinite",
      explanation: "Exponential search is ideal for unbounded searches where the size isn't known in advance."
    },
    {
      question: "What is the space complexity of exponential search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(√n)"],
      answer: "O(1)",
      explanation: "Exponential search uses constant space as it doesn't require additional data structures."
    },
    {
      question: "How does exponential search determine the range to search?",
      options: [
        "By doubling the index until finding an element larger than the target",
        "By dividing the array in half",
        "By using interpolation",
        "By jumping in fixed-size steps"
      ],
      answer: "By doubling the index until finding an element larger than the target",
      explanation: "The algorithm exponentially increases the search range (1, 2, 4, 8,...) until it bounds the target."
    },
    {
      question: "What is the worst-case scenario for exponential search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at position 2^k"
      ],
      answer: "Element is at the end",
      explanation: "The worst case occurs when the element is at the end, requiring the most range-finding steps before binary search."
    },
    {
      question: "Which of these is an advantage of exponential search over binary search?",
      options: [
        "Works on unsorted data",
        "Better for unbounded arrays",
        "Fewer comparisons",
        "Lower space complexity"
      ],
      answer: "Better for unbounded arrays",
      explanation: "Exponential search can work on theoretically infinite arrays, while binary search requires knowing the array bounds."
    },
    {
      question: "What is the second phase of exponential search?",
      options: [
        "Linear search",
        "Binary search",
        "Jump search",
        "Interpolation search"
      ],
      answer: "Binary search",
      explanation: "After finding the range, exponential search performs binary search within that range."
    },
    {
      question: "Which search algorithm is exponential search most similar to?",
      options: [
        "Linear search",
        "Binary search",
        "Jump search",
        "Fibonacci search"
      ],
      answer: "Binary search",
      explanation: "Exponential search is essentially binary search preceded by a range-finding phase."
    }
  ],
  "ternary-search": [
    {
      question: "How does ternary search divide the search space?",
      options: [
        "Into two equal parts",
        "Into three equal parts",
        "Into four equal parts",
        "Into n equal parts"
      ],
      answer: "Into three equal parts",
      explanation: "Ternary search divides the array into three parts by using two midpoints."
    },
    {
      question: "What is the time complexity of ternary search?",
      options: ["O(1)", "O(log₃n)", "O(log₂n)", "O(n)"],
      answer: "O(log₃n)",
      explanation: "Ternary search has logarithmic time complexity with base 3 as it eliminates two-thirds of the search space at each step."
    },
    {
      question: "Which of these is a prerequisite for ternary search?",
      options: [
        "Array must be unsorted",
        "Array must be sorted",
        "Array must have unique elements",
        "No prerequisites"
      ],
      answer: "Array must be sorted",
      explanation: "Like binary search, ternary search requires the array to be sorted to work correctly."
    },
    {
      question: "How many comparisons does ternary search make per iteration?",
      options: ["1", "2", "3", "4"],
      answer: "2",
      explanation: "Ternary search compares the target with two midpoints (at 1/3 and 2/3 positions) in each iteration."
    },
    {
      question: "When is ternary search preferred over binary search?",
      options: [
        "When the array is small",
        "When the function is unimodal",
        "When the array is unsorted",
        "When memory is limited"
      ],
      answer: "When the function is unimodal",
      explanation: "Ternary search is particularly useful for finding maxima/minima of unimodal functions."
    },
    {
      question: "What is the space complexity of ternary search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      answer: "O(1)",
      explanation: "Like binary search, ternary search uses constant space in its iterative implementation."
    },
    {
      question: "Which search algorithm generally performs fewer comparisons: binary or ternary search?",
      options: [
        "Binary search",
        "Ternary search",
        "They perform the same",
        "Depends on array size"
      ],
      answer: "Binary search",
      explanation: "Although ternary search eliminates more elements per iteration, it makes more comparisons, making binary search generally more efficient."
    },
    {
      question: "What is the worst-case scenario for ternary search?",
      options: [
        "Element is at the beginning",
        "Element is at the end",
        "Element is not present",
        "Element is at one of the midpoints"
      ],
      answer: "Element is not present",
      explanation: "Like other search algorithms, the worst case occurs when the element isn't present in the array."
    },
    {
      question: "How would you modify ternary search to find the maximum of a unimodal function?",
      options: [
        "Compare f(m1) and f(m2)",
        "Compare f(m1) and f(high)",
        "Compare f(low) and f(high)",
        "Use linear search instead"
      ],
      answer: "Compare f(m1) and f(m2)",
      explanation: "For unimodal functions, comparing the function values at the two midpoints tells us which third to eliminate."
    },
    {
      question: "Which of these is NOT a use case for ternary search?",
      options: [
        "Finding an element in a sorted array",
        "Finding the maximum of a bitonic sequence",
        "Finding the minimum of a parabolic function",
        "Searching in an unsorted array"
      ],
      answer: "Searching in an unsorted array",
      explanation: "Ternary search, like binary search, requires the data to be sorted (or the function to be unimodal) to work correctly."
    }
  ]
};

export default quizData;