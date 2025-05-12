"""
Enhanced Algorithm Engine for AlgoViz3D

This module provides complete implementations for all algorithms with detailed
step-by-step explanations and visualization cues, optimized for the enhanced
visualization interface.
"""

def execute_algorithm_steps(algorithm_name, input_data):
    """
    Execute the specified algorithm and return visualization steps.
    Each step includes detailed educational explanations and visual cues
    for the enhanced 3D visualization.
    """
    algorithm_functions = {
        # Sorting algorithms
        'Bubble Sort': bubble_sort,
        'Selection Sort': selection_sort,
        'Insertion Sort': insertion_sort,
        'Merge Sort': merge_sort,
        'Quick Sort': quick_sort,
        
        # Searching algorithms
        'Linear Search': linear_search,
        'Binary Search': binary_search,
        
        # Tree operations
        'BST Insertion': bst_insertion,
        'BST Traversal': bst_traversal,
        
        # Graph algorithms
        'Breadth-First Search': bfs,
        'Depth-First Search': dfs,
        'Dijkstra\'s Algorithm': dijkstra,
    }
    
    if algorithm_name not in algorithm_functions:
        raise ValueError(f"Algorithm '{algorithm_name}' not implemented")
    
    return algorithm_functions[algorithm_name](input_data)


# ===================== SORTING ALGORITHMS =====================

def bubble_sort(data):
    """
    Enhanced bubble sort implementation with detailed educational descriptions
    to support the improved visualization.
    """
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state with detailed explanation
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Bubble Sort starts with the unsorted array',
        'educational_note': 'Bubble Sort compares adjacent elements and swaps them if they are in the wrong order, causing larger elements to "bubble up" to the end of the array.',
        'complexity_note': 'Time Complexity: O(n²) in worst case, where n is the number of elements',
        'current_focus': []
    })
    
    # Track if the algorithm is done early
    for i in range(n):
        # Track if any swaps were made in this pass
        swapped = False
        
        # Show beginning of pass
        if i > 0:
            steps.append({
                'type': 'pass_start',
                'state': arr.copy(),
                'description': f'Starting pass {i+1} of {n}',
                'educational_note': f'With each pass, the largest unsorted element "bubbles up" to its correct position.',
                'sorted_indices': list(range(n-i, n)),
                'current_focus': list(range(0, n-i))
            })
        
        for j in range(0, n - i - 1):
            # Comparing elements with educational explanation
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} and {arr[j+1]}',
                'educational_note': f'We compare adjacent elements to see if they need to be swapped.',
                'comparing': [j, j+1],
                'sorted_indices': list(range(n-i, n)) if i > 0 else [],
                'current_focus': [j, j+1]
            })
            
            if arr[j] > arr[j + 1]:
                # Swap the elements with detailed explanation
                old_values = [arr[j], arr[j+1]]
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                
                steps.append({
                    'type': 'swap',
                    'state': arr.copy(),
                    'description': f'Swapped {old_values[0]} and {old_values[1]} as they were in wrong order',
                    'educational_note': f'Since {old_values[0]} > {old_values[1]}, we swap them to move the larger value to the right.',
                    'swapped': [j, j+1],
                    'sorted_indices': list(range(n-i, n)) if i > 0 else [],
                    'current_focus': [j, j+1]
                })
            else:
                # No swap needed with explanation
                steps.append({
                    'type': 'no_swap',
                    'state': arr.copy(),
                    'description': f'No swap needed as elements are in correct order',
                    'educational_note': f'Since {arr[j]} ≤ {arr[j+1]}, these elements are already in the correct order.',
                    'sorted_indices': list(range(n-i, n)) if i > 0 else [],
                    'current_focus': [j, j+1]
                })
        
        # After completing a pass, mark element as sorted
        if i < n - 1:  # Not the last pass
            element_pos = n - i - 1
            steps.append({
                'type': 'sorted',
                'state': arr.copy(),
                'description': f'Element {arr[element_pos]} is now in its correct sorted position',
                'educational_note': f'After pass {i+1}, the largest unsorted element has "bubbled up" to its final position at index {element_pos}.',
                'sorted_indices': list(range(n-i-1, n)),
                'current_focus': [element_pos],
                'newly_sorted': [element_pos]
            })
        
        # If no swaps were made, array is sorted - optimization explanation
        if not swapped:
            steps.append({
                'type': 'early_termination',
                'state': arr.copy(),
                'description': f'No swaps needed in pass {i+1} - array is already sorted!',
                'educational_note': 'This is an optimization of Bubble Sort: if no swaps occur in a complete pass, the array is already sorted and we can stop early.',
                'sorted_indices': list(range(n)),
                'current_focus': list(range(n))
            })
            break
    
    # Final state with educational conclusion
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Bubble Sort complete! The array is now fully sorted.',
        'educational_note': 'Bubble Sort is simple but inefficient for large arrays. Its advantage is that it is easy to understand and implement.',
        'sorted_indices': list(range(n)),
        'current_focus': list(range(n))
    })

    return steps


def selection_sort(data):
    """
    Enhanced selection sort implementation with detailed educational descriptions.
    """
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Selection Sort starts with the unsorted array',
        'educational_note': 'Selection Sort works by repeatedly finding the minimum element from the unsorted part and putting it at the beginning.',
        'complexity_note': 'Time Complexity: O(n²) in all cases, where n is the number of elements',
        'current_focus': list(range(n))
    })
    
    for i in range(n):
        # Start of new selection phase with educational note
        steps.append({
            'type': 'selection_start',
            'state': arr.copy(),
            'description': f'Starting selection phase {i+1}: finding the minimum in unsorted part',
            'educational_note': f'The array now has two parts: sorted ([0:{i}]) and unsorted ([{i}:{n}]). We need to find the minimum element in the unsorted part.',
            'sorted_indices': list(range(i)),
            'current_focus': list(range(i, n))
        })
        
        # Assume the minimum is the first unsorted element
        min_idx = i
        steps.append({
            'type': 'min_selected',
            'state': arr.copy(),
            'description': f'Initially assuming {arr[min_idx]} at index {min_idx} is the minimum',
            'educational_note': 'We start by assuming the first element of the unsorted portion is the minimum.',
            'min_idx': min_idx,
            'sorted_indices': list(range(i)),
            'current_focus': [min_idx]
        })
        
        # Find the minimum element in the unsorted part with educational explanation
        for j in range(i+1, n):
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} with current minimum {arr[min_idx]}',
                'educational_note': f'We compare each unsorted element with the current minimum to find the smallest value.',
                'comparing': [j, min_idx],
                'sorted_indices': list(range(i)),
                'current_focus': [j, min_idx],
                'min_idx': min_idx
            })
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                steps.append({
                    'type': 'new_min',
                    'state': arr.copy(),
                    'description': f'New minimum {arr[min_idx]} found at index {min_idx}',
                    'educational_note': f'Since {arr[min_idx]} is smaller than our previous minimum, we update our minimum.',
                    'min_idx': min_idx,
                    'sorted_indices': list(range(i)),
                    'current_focus': [min_idx]
                })
        
        # Swap the found minimum element with the first element of unsorted part
        if min_idx != i:
            steps.append({
                'type': 'before_swap',
                'state': arr.copy(),
                'description': f'Swapping {arr[i]} with minimum {arr[min_idx]}',
                'educational_note': f'After finding the minimum element in the unsorted portion, we place it at the end of the sorted portion.',
                'swapping': [i, min_idx],
                'sorted_indices': list(range(i)),
                'current_focus': [i, min_idx]
            })
            
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            
            steps.append({
                'type': 'after_swap',
                'state': arr.copy(),
                'description': f'Swapped {arr[i]} with {arr[min_idx]}',
                'educational_note': f'The minimum element from the unsorted portion is now in its final sorted position.',
                'swapped': [i, min_idx],
                'sorted_indices': list(range(i)),
                'current_focus': [i, min_idx]
            })
        else:
            # No swap needed - element already in position
            steps.append({
                'type': 'no_swap_needed',
                'state': arr.copy(),
                'description': f'No swap needed - minimum {arr[i]} is already at index {i}',
                'educational_note': f'The minimum element was already in the correct position, so no swap is needed.',
                'sorted_indices': list(range(i)),
                'current_focus': [i]
            })
        
        # Mark element as sorted
        steps.append({
            'type': 'sorted',
            'state': arr.copy(),
            'description': f'Element {arr[i]} is now in its final sorted position',
            'educational_note': f'After phase {i+1}, we have {i+1} elements in the sorted portion of the array.',
            'sorted_indices': list(range(i+1)),
            'current_focus': [i],
            'newly_sorted': [i]
        })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Selection Sort complete! The array is now fully sorted.',
        'educational_note': 'Selection Sort makes the minimum number of swaps (at most n-1) compared to other algorithms, which can be advantageous when the cost of swapping elements is high.',
        'sorted_indices': list(range(n)),
        'current_focus': list(range(n))
    })
    
    return steps


def insertion_sort(data):
    """
    Enhanced insertion sort implementation with detailed educational descriptions.
    """
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Insertion Sort begins with an unsorted array',
        'educational_note': 'Insertion Sort builds the sorted array one element at a time by placing each element in its correct position within the already-sorted portion.',
        'complexity_note': 'Time Complexity: O(n²) worst case, but O(n) when array is nearly sorted',
        'current_focus': list(range(n))
    })
    
    # Consider the first element as sorted
    steps.append({
        'type': 'sorted',
        'state': arr.copy(),
        'description': 'First element is considered a sorted array of length 1',
        'educational_note': 'We start by considering the first element as a sorted subarray of size 1.',
        'sorted_indices': [0],
        'current_focus': [0]
    })
    
    # Insert each element into the sorted part
    for i in range(1, n):
        # Select current element to insert
        current = arr[i]
        steps.append({
            'type': 'current',
            'state': arr.copy(),
            'description': f'Selecting element {current} at index {i} for insertion',
            'educational_note': f'The array is divided into a sorted part ([0:{i}]) and an unsorted part ([{i}:{n}]). We take the first element from the unsorted part and insert it into its correct position.',
            'current_index': i,
            'sorted_indices': list(range(i)),
            'current_focus': [i]
        })
        
        # Find the correct position in the sorted part
        j = i - 1
        shifting_done = False
        
        while j >= 0 and arr[j] > current:
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {current} with {arr[j]} in the sorted portion',
                'educational_note': f'We compare the current element with elements in the sorted portion from right to left, looking for the correct insertion point.',
                'comparing': [j, i if not shifting_done else j+1],
                'sorted_indices': list(range(j)),
                'current_focus': [j, i if not shifting_done else j+1]
            })
            
            # Shift element to the right
            arr[j + 1] = arr[j]
            
            steps.append({
                'type': 'shift',
                'state': arr.copy(),
                'description': f'Shifting {arr[j]} one position to the right',
                'educational_note': f'We shift larger elements to the right to make space for the element being inserted.',
                'shifted': j + 1,
                'sorted_indices': list(range(j)),
                'current_focus': [j + 1]
            })
            
            j -= 1
            shifting_done = True
        
        if j + 1 != i or shifting_done:
            # Insert current element into correct position
            arr[j + 1] = current
            
            steps.append({
                'type': 'insert',
                'state': arr.copy(),
                'description': f'Inserting {current} at index {j + 1}',
                'educational_note': f'We have found the correct position for our element and insert it there.',
                'inserted_index': j + 1,
                'sorted_indices': list(range(i+1)),
                'current_focus': [j + 1]
            })
        else:
            # Element is already in the right position
            steps.append({
                'type': 'already_positioned',
                'state': arr.copy(),
                'description': f'Element {current} is already in the correct position',
                'educational_note': f'No shifting was needed as the element is already in the correct position relative to the sorted portion.',
                'sorted_indices': list(range(i + 1)),
                'current_focus': [i]
            })
        
        # Update sorted portion
        steps.append({
            'type': 'sorted',
            'state': arr.copy(),
            'description': f'Sorted portion now includes elements up to index {i}',
            'educational_note': f'The sorted portion has grown by one element. We now have {i+1} elements in correct order.',
            'sorted_indices': list(range(i + 1)),
            'current_focus': list(range(i + 1))
        })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Insertion Sort complete! The array is now fully sorted.',
        'educational_note': 'Insertion Sort is efficient for small data sets and particularly efficient for arrays that are already substantially sorted.',
        'sorted_indices': list(range(n)),
        'current_focus': list(range(n))
    })
    
    return steps


def merge_sort(data):
    """
    Enhanced merge sort implementation with detailed educational descriptions.
    """
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Merge Sort begins with an unsorted array',
        'educational_note': 'Merge Sort uses the divide-and-conquer technique: it divides the array into halves, sorts each half, then merges them back together.',
        'complexity_note': 'Time Complexity: O(n log n) for all cases, making it very efficient even for large arrays',
        'current_focus': list(range(n))
    })
    
    # Global array for tracking sorted segments
    sorted_segments = []
    
    # Merge helper function
    def merge(left_start, mid, right_end, depth=0):
        nonlocal steps, arr, sorted_segments
        
        # Create a temporary array for the merged result
        left_arr = arr[left_start:mid + 1]
        right_arr = arr[mid + 1:right_end + 1]
        
        # Show the division of the array
        steps.append({
            'type': 'divide',
            'state': arr.copy(),
            'description': f'Dividing array into left [{left_start}:{mid+1}] and right [{mid+1}:{right_end+1}]',
            'educational_note': f'We have divided the array into two subarrays: left (indices {left_start} to {mid}) and right (indices {mid+1} to {right_end}).',
            'left_part': list(range(left_start, mid + 1)),
            'right_part': list(range(mid + 1, right_end + 1)),
            'recursion_depth': depth,
            'current_focus': list(range(left_start, right_end + 1))
        })
        
        # Initialize indices
        left_idx = 0
        right_idx = 0
        arr_idx = left_start
        
        # Merge the two subarrays
        while left_idx < len(left_arr) and right_idx < len(right_arr):
            # Compare elements
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {left_arr[left_idx]} and {right_arr[right_idx]}',
                'educational_note': f'We compare the next elements from each subarray to determine which should go next in the merged result.',
                'comparing': [left_start + left_idx, mid + 1 + right_idx],
                'recursion_depth': depth,
                'current_focus': [left_start + left_idx, mid + 1 + right_idx]
            })
            
            if left_arr[left_idx] <= right_arr[right_idx]:
                # Place element from left array
                arr[arr_idx] = left_arr[left_idx]
                steps.append({
                    'type': 'place',
                    'state': arr.copy(),
                    'description': f'Placing {left_arr[left_idx]} at index {arr_idx}',
                    'educational_note': f'The element from the left subarray is smaller, so we place it in the merged result.',
                    'placed_index': arr_idx,
                    'recursion_depth': depth,
                    'current_focus': [arr_idx]
                })
                left_idx += 1
            else:
                # Place element from right array
                arr[arr_idx] = right_arr[right_idx]
                steps.append({
                    'type': 'place',
                    'state': arr.copy(),
                    'description': f'Placing {right_arr[right_idx]} at index {arr_idx}',
                    'educational_note': f'The element from the right subarray is smaller, so we place it in the merged result.',
                    'placed_index': arr_idx,
                    'recursion_depth': depth,
                    'current_focus': [arr_idx]
                })
                right_idx += 1
            arr_idx += 1
        
        # Copy remaining elements from left subarray
        while left_idx < len(left_arr):
            arr[arr_idx] = left_arr[left_idx]
            steps.append({
                'type': 'place',
                'state': arr.copy(),
                'description': f'Placing remaining left element {left_arr[left_idx]} at index {arr_idx}',
                'educational_note': f'We have exhausted the right subarray, so we copy the remaining elements from the left subarray.',
                'placed_index': arr_idx,
                'recursion_depth': depth,
                'current_focus': [arr_idx]
            })
            left_idx += 1
            arr_idx += 1
        
        # Copy remaining elements from right subarray
        while right_idx < len(right_arr):
            arr[arr_idx] = right_arr[right_idx]
            steps.append({
                'type': 'place',
                'state': arr.copy(),
                'description': f'Placing remaining right element {right_arr[right_idx]} at index {arr_idx}',
                'educational_note': f'We have exhausted the left subarray, so we copy the remaining elements from the right subarray.',
                'placed_index': arr_idx,
                'recursion_depth': depth,
                'current_focus': [arr_idx]
            })
            right_idx += 1
            arr_idx += 1
        
        # Mark the merged segment as sorted
        steps.append({
            'type': 'merged',
            'state': arr.copy(),
            'description': f'Merged segment from {left_start} to {right_end}',
            'educational_note': f'We have successfully merged the two subarrays into a single sorted segment.',
            'merged_indices': list(range(left_start, right_end + 1)),
            'recursion_depth': depth,
            'current_focus': list(range(left_start, right_end + 1))
        })
        
        # Track this segment as sorted for visualization
        sorted_segments.append(list(range(left_start, right_end + 1)))
    
    # Recursive merge sort function
    def merge_sort_recursive(left, right, depth=0):
        if left < right:
            # Find the middle point
            mid = (left + right) // 2
            
            # Show the division
            steps.append({
                'type': 'recursive_call',
                'state': arr.copy(),
                'description': f'Dividing array segment [{left}:{right+1}] at midpoint {mid}',
                'educational_note': f'We recursively divide the array into smaller subarrays until we reach segments of size 1, which are trivially sorted.',
                'segment': list(range(left, right + 1)),
                'recursion_depth': depth,
                'current_focus': list(range(left, right + 1))
            })
            
            # Recursively sort the left and right halves
            merge_sort_recursive(left, mid, depth + 1)
            merge_sort_recursive(mid + 1, right, depth + 1)
            
            # Merge the sorted halves
            merge(left, mid, right, depth)
    
    # Execute merge sort
    merge_sort_recursive(0, n - 1)
    
    # Add all sorted segments to the final result
    all_sorted = set()
    for segment in sorted_segments:
        for idx in segment:
            all_sorted.add(idx)
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Merge Sort complete! The array is now fully sorted.',
        'educational_note': 'Merge Sort is a stable, efficient algorithm with O(n log n) time complexity. Its main disadvantage is the O(n) space requirement for temporary arrays during merging.',
        'sorted_indices': list(range(n)),
        'current_focus': list(range(n))
    })
    
    return steps


def quick_sort(data):
    """
    Enhanced quick sort implementation with detailed educational descriptions.
    """
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Quick Sort begins with an unsorted array',
        'educational_note': 'Quick Sort uses a divide-and-conquer approach by selecting a pivot and partitioning the array around it.',
        'complexity_note': 'Time Complexity: O(n log n) average case, O(n²) worst case when poorly pivoted',
        'current_focus': list(range(n))
    })
    
    # Helper function for partition
    def partition(low, high, depth=0):
        nonlocal steps, arr
        
        # Select pivot (using last element)
        pivot = arr[high]
        steps.append({
            'type': 'pivot',
            'state': arr.copy(),
            'description': f'Selected pivot: {pivot} at index {high}',
            'educational_note': f'We choose the last element as our pivot. All elements less than the pivot will go to the left, greater elements will go to the right.',
            'pivot_index': high,
            'partition_range': [low, high],
            'recursion_depth': depth,
            'current_focus': [high]
        })
        
        i = low - 1  # Index of smaller element
        
        # Process each element in the partition
        for j in range(low, high):
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} with pivot {pivot}',
                'educational_note': f'We compare each element with the pivot to determine which partition it belongs to.',
                'comparing': [j, high],
                'pivot_index': high,
                'partition_range': [low, high],
                'recursion_depth': depth,
                'current_focus': [j, high]
            })
            
            if arr[j] <= pivot:
                # Element goes to left partition
                i += 1
                
                if i != j:  # Only swap if indices are different
                    steps.append({
                        'type': 'before_swap',
                        'state': arr.copy(),
                        'description': f'Moving {arr[j]} to the left partition',
                        'educational_note': f'Since {arr[j]} is less than or equal to the pivot, we move it to the left partition.',
                        'swapping': [i, j],
                        'pivot_index': high,
                        'partition_range': [low, high],
                        'recursion_depth': depth,
                        'current_focus': [i, j]
                    })
                    
                    arr[i], arr[j] = arr[j], arr[i]
                    
                    steps.append({
                        'type': 'after_swap',
                        'state': arr.copy(),
                        'description': f'Swapped {arr[i]} and {arr[j]}',
                        'educational_note': f'After this swap, all elements to the left of index {i} are less than or equal to the pivot.',
                        'swapped': [i, j],
                        'pivot_index': high,
                        'partition_range': [low, high],
                        'recursion_depth': depth,
                        'current_focus': [i, j]
                    })
                else:
                    # No swap needed
                    steps.append({
                        'type': 'no_swap_needed',
                        'state': arr.copy(),
                        'description': f'Element {arr[j]} is already in correct partition',
                        'educational_note': f'No swap needed as the element is already in the correct position.',
                        'pivot_index': high,
                        'partition_range': [low, high],
                        'recursion_depth': depth,
                        'current_focus': [j]
                    })
        
        # Move pivot to its final position
        pivot_position = i + 1
        steps.append({
            'type': 'before_swap',
            'state': arr.copy(),
            'description': f'Moving pivot {pivot} to its correct position',
            'educational_note': f'After partitioning, we place the pivot between the two partitions at index {pivot_position}.',
            'swapping': [pivot_position, high],
            'pivot_index': high,
            'partition_range': [low, high],
            'recursion_depth': depth,
            'current_focus': [pivot_position, high]
        })
        
        arr[pivot_position], arr[high] = arr[high], arr[pivot_position]
        
        steps.append({
            'type': 'after_swap',
            'state': arr.copy(),
            'description': f'Pivot {pivot} is now at index {pivot_position}',
            'educational_note': f'The pivot is now in its final sorted position. All elements to its left are smaller, and all elements to its right are larger.',
            'swapped': [pivot_position, high],
            'pivot_index': pivot_position,
            'partition_range': [low, high],
            'recursion_depth': depth,
            'current_focus': [pivot_position]
        })
        
        steps.append({
            'type': 'partition',
            'state': arr.copy(),
            'description': f'Partition complete: pivot {pivot} at position {pivot_position}',
            'educational_note': f'The array segment is now partitioned: elements < pivot ([{low}:{pivot_position}]) | pivot | elements > pivot ([{pivot_position+1}:{high+1}]).',
            'pivot_index': pivot_position,
            'left_partition': list(range(low, pivot_position)),
            'right_partition': list(range(pivot_position + 1, high + 1)),
            'recursion_depth': depth,
            'current_focus': list(range(low, high + 1))
        })
        
        return pivot_position
    
    # Helper function for recursive quick sort
    def quick_sort_recursive(low, high, depth=0):
        nonlocal steps, arr
        
        if low < high:
            # Starting a new recursive call
            steps.append({
                'type': 'recursive_call',
                'state': arr.copy(),
                'description': f'Processing subarray from index {low} to {high}',
                'educational_note': f'Quick Sort works by recursively partitioning smaller and smaller subarrays.',
                'subarray_range': [low, high],
                'recursion_depth': depth,
                'current_focus': list(range(low, high + 1))
            })
            
            # Find the partition index
            pi = partition(low, high, depth)
            
            # Sort elements before and after partition
            if pi - 1 > low:  # There are elements to sort on the left
                steps.append({
                    'type': 'recursive_left',
                    'state': arr.copy(),
                    'description': f'Recursively sorting left partition: [{low}:{pi}]',
                    'educational_note': f'We now apply Quick Sort to the left partition (elements less than the pivot).',
                    'left_range': [low, pi - 1],
                    'recursion_depth': depth,
                    'current_focus': list(range(low, pi))
                })
                quick_sort_recursive(low, pi - 1, depth + 1)
            
            if pi + 1 < high:  # There are elements to sort on the right
                steps.append({
                    'type': 'recursive_right',
                    'state': arr.copy(),
                    'description': f'Recursively sorting right partition: [{pi+1}:{high+1}]',
                    'educational_note': f'We now apply Quick Sort to the right partition (elements greater than the pivot).',
                    'right_range': [pi + 1, high],
                    'recursion_depth': depth,
                    'current_focus': list(range(pi + 1, high + 1))
                })
                quick_sort_recursive(pi + 1, high, depth + 1)
            
            # If this is the root call (depth=0), show sorted segments
            if depth == 0:
                # Mark as sorted when returning from recursion
                steps.append({
                    'type': 'subarray_sorted',
                    'state': arr.copy(),
                    'description': f'Subarray [{low}:{high+1}] is now sorted',
                    'educational_note': f'As we return from the recursive calls, larger portions of the array become sorted.',
                    'sorted_indices': list(range(low, high + 1)),
                    'current_focus': list(range(low, high + 1))
                })
    
    # Execute quick sort
    quick_sort_recursive(0, n - 1)
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Quick Sort complete! The array is now fully sorted.',
        'educational_note': 'Quick Sort is very efficient for large datasets and has good cache performance, but its worst-case time complexity is O(n²) when poor pivots are chosen consistently.',
        'sorted_indices': list(range(n)),
        'current_focus': list(range(n))
    })
    
    return steps


# ===================== SEARCHING ALGORITHMS =====================

def linear_search(data):
    """
    Enhanced linear search implementation with detailed educational descriptions.
    """
    # For linear search, data should contain the array and the target value
    # Format: {'array': [...], 'target': value}
    
    if isinstance(data, list):
        # If data is just a list, use the last element as the target for demonstration
        arr = data.copy()
        target = arr[-1]  # Use last element as target
    else:
        # If data is a dict with array and target
        arr = data.get('array', []).copy()
        target = data.get('target', 0)
    
    steps = []
    n = len(arr)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': f'Linear Search begins, looking for target value {target}',
        'educational_note': 'Linear Search examines each element sequentially until the target is found or the end is reached.',
        'complexity_note': 'Time Complexity: O(n) - in worst case, we need to check all n elements',
        'target': target,
        'current_focus': []
    })
    
    # Perform linear search
    found = False
    
    for i in range(n):
        steps.append({
            'type': 'checking',
            'state': arr.copy(),
            'description': f'Checking element at index {i}: Is {arr[i]} equal to {target}?',
            'educational_note': f'Linear Search simply compares each element of the array with the target value.',
            'checking_index': i,
            'target': target,
            'current_focus': [i]
        })
        
        if arr[i] == target:
            steps.append({
                'type': 'found',
                'state': arr.copy(),
                'description': f'Found target {target} at index {i}!',
                'educational_note': f'Success! We have found the target value after checking {i+1} elements.',
                'found_index': i,
                'target': target,
                'current_focus': [i]
            })
            found = True
            break
    
    # Final state
    if not found:
        steps.append({
            'type': 'not_found',
            'state': arr.copy(),
            'description': f'Target {target} not found after checking all {n} elements',
            'educational_note': f'After examining all elements, we conclude that the target value is not present in the array.',
            'target': target,
            'current_focus': []
        })
    else:
        steps.append({
            'type': 'final',
            'state': arr.copy(),
            'description': f'Linear Search complete! Found {target} at index {i}.',
            'educational_note': f'Linear Search is simple but inefficient for large arrays. It has O(n) time complexity in the worst case.',
            'target': target,
            'found_index': i,
            'current_focus': [i]
        })
    
    return steps


def binary_search(data):
    """
    Enhanced binary search implementation with detailed educational descriptions.
    """
    # For binary search, data should contain the sorted array and the target value
    # Format: {'array': [...], 'target': value}
    
    if isinstance(data, list):
        # If data is just a list, use the middle element as the target for demonstration
        arr = sorted(data.copy())  # Ensure array is sorted
        target = arr[len(arr) // 2]
    else:
        # If data is a dict with array and target
        arr = sorted(data.get('array', []).copy())  # Ensure array is sorted
        target = data.get('target', 0)
    
    steps = []
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': f'Binary Search begins on a sorted array, looking for target value {target}',
        'educational_note': 'Binary Search requires a sorted array. It works by repeatedly dividing the search interval in half.',
        'complexity_note': 'Time Complexity: O(log n) - much faster than linear search for large arrays',
        'target': target,
        'current_focus': list(range(len(arr)))
    })
    
    # Perform binary search
    left, right = 0, len(arr) - 1
    found = False
    iterations = 0
    max_iterations = 1 + int(2 * (len(arr).bit_length()))  # Safeguard against infinite loops
    
    while left <= right and iterations < max_iterations:
        iterations += 1
        mid = (left + right) // 2
        
        steps.append({
            'type': 'search_range',
            'state': arr.copy(),
            'description': f'Searching in range [{left}:{right+1}] (elements {right-left+1})',
            'educational_note': f'We have narrowed our search to {right-left+1} elements. Binary search divides the search space in half with each step.',
            'left': left,
            'right': right,
            'mid': mid,
            'target': target,
            'current_focus': list(range(left, right + 1)),
            'highlighted_focus': [mid]
        })
        
        steps.append({
            'type': 'checking',
            'state': arr.copy(),
            'description': f'Checking middle element at index {mid}: Is {arr[mid]} equal to {target}?',
            'educational_note': f'The key to binary search is comparing the middle element with our target value.',
            'checking_index': mid,
            'target': target,
            'left': left,
            'right': right,
            'current_focus': [mid]
        })
        
        if arr[mid] == target:
            steps.append({
                'type': 'found',
                'state': arr.copy(),
                'description': f'Found target {target} at index {mid}!',
                'educational_note': f'Success! Binary search found the target in just {iterations} steps, demonstrating its efficiency.',
                'found_index': mid,
                'target': target,
                'current_focus': [mid]
            })
            found = True
            break
        elif arr[mid] < target:
            steps.append({
                'type': 'move_right',
                'state': arr.copy(),
                'description': f'{arr[mid]} < {target}, searching in right half',
                'educational_note': f'Since the middle element is less than our target, we eliminate the entire left half including the middle element.',
                'left': mid + 1,
                'right': right,
                'mid': mid,
                'target': target,
                'eliminated_range': list(range(left, mid + 1)),
                'current_focus': list(range(mid + 1, right + 1))
            })
            left = mid + 1
        else:
            steps.append({
                'type': 'move_left',
                'state': arr.copy(),
                'description': f'{arr[mid]} > {target}, searching in left half',
                'educational_note': f'Since the middle element is greater than our target, we eliminate the entire right half including the middle element.',
                'left': left,
                'right': mid - 1,
                'mid': mid,
                'target': target,
                'eliminated_range': list(range(mid, right + 1)),
                'current_focus': list(range(left, mid))
            })
            right = mid - 1
    
    # Final state
    if not found:
        steps.append({
            'type': 'not_found',
            'state': arr.copy(),
            'description': f'Target {target} not found in the array after {iterations} iterations',
            'educational_note': f'Binary search has exhausted all possibilities and concluded that the target is not present in the array.',
            'target': target,
            'current_focus': []
        })
    else:
        steps.append({
            'type': 'final',
            'state': arr.copy(),
            'description': f'Binary Search complete! Found {target} in {iterations} steps.',
            'educational_note': f'Compare this to Linear Search which would take up to {len(arr)} steps in the worst case. The logarithmic efficiency of Binary Search makes it extremely fast for large datasets.',
            'target': target,
            'found_index': mid,
            'current_focus': [mid]
        })
    
    return steps


# ===================== TREE OPERATIONS =====================

def bst_insertion(data):
    """
    Enhanced Binary Search Tree Insertion implementation with detailed educational descriptions.
    """
    # For BST insertion, data should be a list of values to insert in order
    # We'll represent the tree as a list of nodes with indices
    
    steps = []
    
    # Helper class to represent a node in the BST
    class Node:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None
            self.index = None  # For visualization purposes
    
    # Helper function to convert tree to array representation for visualization
    def tree_to_array(root, node_dict):
        if not root:
            return []
        
        result = [None] * len(node_dict)
        for node, idx in node_dict.items():
            result[idx] = node.value
        
        return result
    
    # Helper function to assign indices to nodes in level order
    def assign_indices(root):
        if not root:
            return {}
        
        node_dict = {}
        queue = [(root, 0)]
        counter = 0
        
        while queue:
            node, level = queue.pop(0)
            node.index = counter
            node_dict[node] = counter
            counter += 1
            
            if node.left:
                queue.append((node.left, level + 1))
            if node.right:
                queue.append((node.right, level + 1))
        
        return node_dict
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': [],
        'description': 'Starting with an empty Binary Search Tree',
        'educational_note': 'A Binary Search Tree (BST) is a tree data structure where for each node, all elements in its left subtree are less than the node, and all elements in its right subtree are greater.',
        'complexity_note': 'Time Complexity: O(log n) average case for insertions, but O(n) worst case for skewed trees',
        'current_focus': []
    })
    
    root = None
    node_dict = {}
    
    # Insert each value into the BST
    for i, value in enumerate(data):
        steps.append({
            'type': 'insert_start',
            'state': tree_to_array(root, node_dict) if root else [],
            'description': f'Inserting value {value} into the BST',
            'educational_note': f'To insert a value, we start at the root and move down the tree, comparing with each node.',
            'inserting_value': value,
            'current_focus': []
        })
        
        # If the tree is empty, create a root node
        if not root:
            root = Node(value)
            node_dict = assign_indices(root)
            
            steps.append({
                'type': 'insert_root',
                'state': tree_to_array(root, node_dict),
                'description': f'Created root node with value {value}',
                'educational_note': f'For the first insertion, we create the root node of the tree.',
                'inserted_index': 0,
                'current_focus': [0]
            })
            continue
        
        # Start at the root and find the proper position
        current = root
        parent = None
        path = []
        
        while current:
            parent = current
            path.append(current.index)
            
            steps.append({
                'type': 'comparison',
                'state': tree_to_array(root, node_dict),
                'description': f'Comparing {value} with node value {current.value}',
                'educational_note': f'We compare the value to be inserted with the current node to determine whether to go left or right.',
                'comparing': [current.index],
                'current_focus': [current.index],
                'path': path.copy()
            })
            
            if value < current.value:
                steps.append({
                    'type': 'go_left',
                    'state': tree_to_array(root, node_dict),
                    'description': f'{value} < {current.value}, moving to left child',
                    'educational_note': f'Since the value is less than the current node, we move to the left subtree.',
                    'current_node': current.index,
                    'current_focus': [current.index],
                    'path': path.copy(),
                    'direction': 'left'
                })
                current = current.left
            else:
                steps.append({
                    'type': 'go_right',
                    'state': tree_to_array(root, node_dict),
                    'description': f'{value} >= {current.value}, moving to right child',
                    'educational_note': f'Since the value is greater than or equal to the current node, we move to the right subtree.',
                    'current_node': current.index,
                    'current_focus': [current.index],
                    'path': path.copy(),
                    'direction': 'right'
                })
                current = current.right
        
        # Create a new node at the appropriate position
        new_node = Node(value)
        
        if value < parent.value:
            parent.left = new_node
            steps.append({
                'type': 'insert_left',
                'state': tree_to_array(root, assign_indices(root)),
                'description': f'Inserted {value} as left child of {parent.value}',
                'educational_note': f'We have found the insertion point: {value} becomes the left child of {parent.value}.',
                'parent_index': parent.index,
                'inserted_value': value,
                'current_focus': [parent.index],
                'path': path.copy()
            })
        else:
            parent.right = new_node
            steps.append({
                'type': 'insert_right',
                'state': tree_to_array(root, assign_indices(root)),
                'description': f'Inserted {value} as right child of {parent.value}',
                'educational_note': f'We have found the insertion point: {value} becomes the right child of {parent.value}.',
                'parent_index': parent.index,
                'inserted_value': value,
                'current_focus': [parent.index],
                'path': path.copy()
            })
        
        # Update the node dictionary
        node_dict = assign_indices(root)
        
        # Show the tree after insertion
        steps.append({
            'type': 'after_insertion',
            'state': tree_to_array(root, node_dict),
            'description': f'Tree after inserting {value}',
            'educational_note': f'The BST property is maintained: for every node, all elements in its left subtree are less, and all elements in its right subtree are greater.',
            'node_indices': list(node_dict.values()),
            'current_focus': list(node_dict.values())
        })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': tree_to_array(root, node_dict),
        'description': 'Binary Search Tree construction complete!',
        'educational_note': 'The resulting BST allows for efficient operations like search, insertion, and deletion, all with O(log n) average time complexity in balanced trees.',
        'node_indices': list(node_dict.values()),
        'current_focus': list(node_dict.values())
    })
    
    return steps


def bst_traversal(data):
    """
    Enhanced Binary Search Tree Traversal implementation with detailed educational descriptions.
    """
    # For BST traversal, data should be a list of values to first build the tree
    # Then we'll demonstrate different traversal methods
    
    steps = []
    
    # Helper class to represent a node in the BST
    class Node:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None
            self.index = None  # For visualization purposes
    
    # Helper function to convert tree to array representation for visualization
    def tree_to_array(root, node_dict):
        if not root:
            return []
        
        result = [None] * len(node_dict)
        for node, idx in node_dict.items():
            result[idx] = node.value
        
        return result
    
    # Helper function to assign indices to nodes in level order
    def assign_indices(root):
        if not root:
            return {}
        
        node_dict = {}
        queue = [(root, 0)]
        counter = 0
        
        while queue:
            node, level = queue.pop(0)
            node.index = counter
            node_dict[node] = counter
            counter += 1
            
            if node.left:
                queue.append((node.left, level + 1))
            if node.right:
                queue.append((node.right, level + 1))
        
        return node_dict
    
    # Helper function to build a BST from a list of values
    def build_bst(values):
        if not values:
            return None, {}
        
        root = None
        
        for value in values:
            if not root:
                root = Node(value)
                continue
            
            current = root
            while current:
                parent = current
                if value < current.value:
                    if not current.left:
                        current.left = Node(value)
                        break
                    current = current.left
                else:
                    if not current.right:
                        current.right = Node(value)
                        break
                    current = current.right
        
        node_dict = assign_indices(root)
        return root, node_dict
    
    # Build the BST from input data
    root, node_dict = build_bst(data)
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': tree_to_array(root, node_dict),
        'description': 'Binary Search Tree ready for traversal',
        'educational_note': 'Tree traversal is the process of visiting each node in a tree data structure exactly once. There are different traversal orders: in-order, pre-order, and post-order.',
        'complexity_note': 'Time Complexity: O(n) for all traversal methods, where n is the number of nodes',
        'node_indices': list(node_dict.values()),
        'current_focus': list(node_dict.values())
    })
    
    # In-order traversal
    steps.append({
        'type': 'inorder_start',
        'state': tree_to_array(root, node_dict),
        'description': 'Starting In-order Traversal (Left, Root, Right)',
        'educational_note': 'In-order traversal visits the left subtree, then the root, then the right subtree. For a BST, this yields elements in sorted order.',
        'node_indices': list(node_dict.values()),
        'current_focus': [root.index]
    })
    
    inorder_result = []
    visited_nodes = []
    
    def inorder(node):
        nonlocal steps, inorder_result, visited_nodes
        
        if not node:
            return
        
        # Visit left subtree
        if node.left:
            steps.append({
                'type': 'inorder_left',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to left child of {node.value}',
                'educational_note': 'In in-order traversal, we first recursively visit the left subtree.',
                'current_node': node.index,
                'next_node': node.left.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.left.index]
            })
        
        inorder(node.left)
        
        # Visit the node itself
        inorder_result.append(node.value)
        visited_nodes.append(node.index)
        
        steps.append({
            'type': 'inorder_visit',
            'state': tree_to_array(root, node_dict),
            'description': f'Visiting node {node.value}',
            'educational_note': 'After visiting the left subtree, we visit the node itself.',
            'visited_node': node.index,
            'visited': visited_nodes.copy(),
            'inorder_result': inorder_result.copy(),
            'current_focus': [node.index]
        })
        
        # Visit right subtree
        if node.right:
            steps.append({
                'type': 'inorder_right',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to right child of {node.value}',
                'educational_note': 'After visiting the node, we recursively visit the right subtree.',
                'current_node': node.index,
                'next_node': node.right.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.right.index]
            })
        
        inorder(node.right)
    
    inorder(root)
    
    # In-order traversal complete
    steps.append({
        'type': 'inorder_complete',
        'state': tree_to_array(root, node_dict),
        'description': f'In-order Traversal complete: {inorder_result}',
        'educational_note': 'For a Binary Search Tree, in-order traversal gives the elements in sorted (ascending) order.',
        'inorder_result': inorder_result,
        'visited': visited_nodes.copy(),
        'current_focus': list(node_dict.values())
    })
    
    # Pre-order traversal
    steps.append({
        'type': 'preorder_start',
        'state': tree_to_array(root, node_dict),
        'description': 'Starting Pre-order Traversal (Root, Left, Right)',
        'educational_note': 'Pre-order traversal visits the root, then the left subtree, then the right subtree. It is useful for creating a copy of the tree or prefix expression.',
        'node_indices': list(node_dict.values()),
        'current_focus': [root.index]
    })
    
    preorder_result = []
    visited_nodes = []
    
    def preorder(node):
        nonlocal steps, preorder_result, visited_nodes
        
        if not node:
            return
        
        # Visit the node itself first
        preorder_result.append(node.value)
        visited_nodes.append(node.index)
        
        steps.append({
            'type': 'preorder_visit',
            'state': tree_to_array(root, node_dict),
            'description': f'Visiting node {node.value}',
            'educational_note': 'In pre-order traversal, we visit the node first, before its children.',
            'visited_node': node.index,
            'visited': visited_nodes.copy(),
            'preorder_result': preorder_result.copy(),
            'current_focus': [node.index]
        })
        
        # Then visit left subtree
        if node.left:
            steps.append({
                'type': 'preorder_left',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to left child of {node.value}',
                'educational_note': 'After visiting the node, we recursively visit the left subtree.',
                'current_node': node.index,
                'next_node': node.left.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.left.index]
            })
        
        preorder(node.left)
        
        # Finally visit right subtree
        if node.right:
            steps.append({
                'type': 'preorder_right',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to right child of {node.value}',
                'educational_note': 'After visiting the left subtree, we recursively visit the right subtree.',
                'current_node': node.index,
                'next_node': node.right.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.right.index]
            })
        
        preorder(node.right)
    
    preorder(root)
    
    # Pre-order traversal complete
    steps.append({
        'type': 'preorder_complete',
        'state': tree_to_array(root, node_dict),
        'description': f'Pre-order Traversal complete: {preorder_result}',
        'educational_note': 'Pre-order traversal is useful when you want to create a copy of the tree or to generate a prefix expression (Polish notation).',
        'preorder_result': preorder_result,
        'visited': visited_nodes.copy(),
        'current_focus': list(node_dict.values())
    })
    
    # Post-order traversal
    steps.append({
        'type': 'postorder_start',
        'state': tree_to_array(root, node_dict),
        'description': 'Starting Post-order Traversal (Left, Right, Root)',
        'educational_note': 'Post-order traversal visits the left subtree, then the right subtree, then the root. It is useful for deletion operations and postfix expressions.',
        'node_indices': list(node_dict.values()),
        'current_focus': [root.index]
    })
    
    postorder_result = []
    visited_nodes = []
    
    def postorder(node):
        nonlocal steps, postorder_result, visited_nodes
        
        if not node:
            return
        
        # First visit left subtree
        if node.left:
            steps.append({
                'type': 'postorder_left',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to left child of {node.value}',
                'educational_note': 'In post-order traversal, we first recursively visit the left subtree.',
                'current_node': node.index,
                'next_node': node.left.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.left.index]
            })
        
        postorder(node.left)
        
        # Then visit right subtree
        if node.right:
            steps.append({
                'type': 'postorder_right',
                'state': tree_to_array(root, node_dict),
                'description': f'Moving to right child of {node.value}',
                'educational_note': 'After visiting the left subtree, we recursively visit the right subtree.',
                'current_node': node.index,
                'next_node': node.right.index,
                'visited': visited_nodes.copy(),
                'current_focus': [node.index, node.right.index]
            })
        
        postorder(node.right)
        
        # Visit the node itself last
        postorder_result.append(node.value)
        visited_nodes.append(node.index)
        
        steps.append({
            'type': 'postorder_visit',
            'state': tree_to_array(root, node_dict),
            'description': f'Visiting node {node.value}',
            'educational_note': 'In post-order traversal, we visit the node after both its subtrees have been visited.',
            'visited_node': node.index,
            'visited': visited_nodes.copy(),
            'postorder_result': postorder_result.copy(),
            'current_focus': [node.index]
        })
    
    postorder(root)
    
    # Post-order traversal complete
    steps.append({
        'type': 'postorder_complete',
        'state': tree_to_array(root, node_dict),
        'description': f'Post-order Traversal complete: {postorder_result}',
        'educational_note': 'Post-order traversal is useful for deleting the tree (as we visit children before parents) or for generating postfix notation.',
        'postorder_result': postorder_result,
        'visited': visited_nodes.copy(),
        'current_focus': list(node_dict.values())
    })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': tree_to_array(root, node_dict),
        'description': 'All traversals complete!',
        'educational_note': 'Traversal methods give us different ways to process all nodes in a tree in a specific order, each with its own applications.',
        'inorder_result': inorder_result,
        'preorder_result': preorder_result,
        'postorder_result': postorder_result,
        'current_focus': list(node_dict.values())
    })
    
    return steps


# ===================== GRAPH ALGORITHMS =====================

def bfs(data):
    """
    Enhanced Breadth-First Search implementation with detailed educational descriptions.
    """
    # For BFS, data should be a dictionary representing the graph and a starting node
    # Format: {'graph': {node: [neighbors]}, 'start': start_node}
    
    # Setup the graph data
    if isinstance(data, dict):
        graph = data.get('graph', {})
        start = data.get('start', next(iter(graph)) if graph else 0)
    else:
        # If just a list is provided, interpret it as a sequence of edges
        # and convert to an adjacency list representation
        graph = {}
        for i in range(len(data)):
            if i not in graph:
                graph[i] = []
            if i + 1 < len(data):
                graph[i].append(i + 1)
        start = 0
    
    steps = []
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': graph,
        'description': f'Breadth-First Search starting from node {start}',
        'educational_note': 'Breadth-First Search (BFS) explores a graph level by level, visiting all neighbors of a node before moving to the next level.',
        'complexity_note': 'Time Complexity: O(V + E) where V is the number of vertices and E is the number of edges',
        'start_node': start,
        'current_focus': [start]
    })
    
    # Perform BFS
    visited = []
    queue = [start]
    visited_nodes = [start]
    levels = {start: 0}
    
    steps.append({
        'type': 'bfs_start',
        'state': graph,
        'description': f'Starting BFS from node {start}',
        'educational_note': 'We begin by adding the start node to the queue and marking it as visited.',
        'start_node': start,
        'visited': visited.copy(),
        'queue': queue.copy(),
        'current_focus': [start]
    })
    
    current_level = 0
    level_nodes = []
    
    while queue:
        node = queue.pop(0)
        visited.append(node)
        
        # Check if we're starting a new level
        if levels[node] > current_level:
            current_level = levels[node]
            steps.append({
                'type': 'bfs_new_level',
                'state': graph,
                'description': f'Moving to level {current_level}',
                'educational_note': f'BFS explores the graph level by level. We are now exploring nodes at distance {current_level} from the start.',
                'level': current_level,
                'level_nodes': level_nodes.copy(),
                'visited': visited.copy(),
                'queue': queue.copy(),
                'current_focus': level_nodes.copy()
            })
            level_nodes = []
        
        level_nodes.append(node)
        
        steps.append({
            'type': 'bfs_visit',
            'state': graph,
            'description': f'Visiting node {node}',
            'educational_note': 'We process the node at the front of the queue and then enqueue all its unvisited neighbors.',
            'visited_node': node,
            'visited': visited.copy(),
            'queue': queue.copy(),
            'current_focus': [node]
        })
        
        # Add unvisited neighbors to the queue
        for neighbor in graph.get(node, []):
            if neighbor not in visited_nodes:
                queue.append(neighbor)
                visited_nodes.append(neighbor)
                levels[neighbor] = levels[node] + 1
                
                steps.append({
                    'type': 'bfs_enqueue',
                    'state': graph,
                    'description': f'Adding neighbor {neighbor} of node {node} to the queue',
                    'educational_note': f'Since node {neighbor} has not been visited yet, we add it to the queue for later processing.',
                    'added_node': neighbor,
                    'from_node': node,
                    'visited': visited.copy(),
                    'queue': queue.copy(),
                    'current_focus': [node, neighbor]
                })
            else:
                steps.append({
                    'type': 'bfs_skip',
                    'state': graph,
                    'description': f'Skipping neighbor {neighbor} of node {node} as it\'s already visited',
                    'educational_note': f'Node {neighbor} has already been visited or is already in the queue, so we skip it to avoid cycles.',
                    'skipped_node': neighbor,
                    'from_node': node,
                    'visited': visited.copy(),
                    'queue': queue.copy(),
                    'current_focus': [node, neighbor]
                })
    
    # BFS complete
    steps.append({
        'type': 'final',
        'state': graph,
        'description': f'Breadth-First Search complete! Visited nodes: {visited}',
        'educational_note': 'BFS gives us the shortest path (in terms of the number of edges) from the start node to all reachable nodes.',
        'visited': visited,
        'current_focus': visited.copy()
    })
    
    return steps


def dfs(data):
    """
    Enhanced Depth-First Search implementation with detailed educational descriptions.
    """
    # For DFS, data should be a dictionary representing the graph and a starting node
    # Format: {'graph': {node: [neighbors]}, 'start': start_node}
    
    # Setup the graph data
    if isinstance(data, dict):
        graph = data.get('graph', {})
        start = data.get('start', next(iter(graph)) if graph else 0)
    else:
        # If just a list is provided, interpret it as a sequence of edges
        # and convert to an adjacency list representation
        graph = {}
        for i in range(len(data)):
            if i not in graph:
                graph[i] = []
            if i + 1 < len(data):
                graph[i].append(i + 1)
        start = 0
    
    steps = []
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': graph,
        'description': f'Depth-First Search starting from node {start}',
        'educational_note': 'Depth-First Search (DFS) explores as far as possible along each branch before backtracking.',
        'complexity_note': 'Time Complexity: O(V + E) where V is the number of vertices and E is the number of edges',
        'start_node': start,
        'current_focus': [start]
    })
    
    # Perform DFS
    visited = []
    stack = [start]
    path = []
    
    steps.append({
        'type': 'dfs_start',
        'state': graph,
        'description': f'Starting DFS from node {start}',
        'educational_note': 'We begin by adding the start node to the stack and will explore its path as deeply as possible before backtracking.',
        'start_node': start,
        'visited': visited.copy(),
        'stack': stack.copy(),
        'path': path.copy(),
        'current_focus': [start]
    })
    
    while stack:
        node = stack.pop()
        
        if node not in visited:
            visited.append(node)
            path.append(node)
            
            steps.append({
                'type': 'dfs_visit',
                'state': graph,
                'description': f'Visiting node {node}',
                'educational_note': 'We process the node at the top of the stack and then push all its unvisited neighbors to continue exploring deeply.',
                'visited_node': node,
                'visited': visited.copy(),
                'stack': stack.copy(),
                'path': path.copy(),
                'current_focus': [node]
            })
            
            # Add unvisited neighbors to the stack (in reverse order to maintain the expected DFS order)
            neighbors = sorted(graph.get(node, []), reverse=True)
            for neighbor in neighbors:
                if neighbor not in visited:
                    stack.append(neighbor)
                    
                    steps.append({
                        'type': 'dfs_push',
                        'state': graph,
                        'description': f'Pushing neighbor {neighbor} of node {node} onto the stack',
                        'educational_note': f'We add node {neighbor} to the stack so we can explore its path deeply before returning to other branches.',
                        'pushed_node': neighbor,
                        'from_node': node,
                        'visited': visited.copy(),
                        'stack': stack.copy(),
                        'path': path.copy(),
                        'current_focus': [node, neighbor]
                    })
                else:
                    steps.append({
                        'type': 'dfs_skip',
                        'state': graph,
                        'description': f'Skipping neighbor {neighbor} of node {node} as it\'s already visited',
                        'educational_note': f'Node {neighbor} has already been visited, so we skip it to avoid cycles.',
                        'skipped_node': neighbor,
                        'from_node': node,
                        'visited': visited.copy(),
                        'stack': stack.copy(),
                        'path': path.copy(),
                        'current_focus': [node, neighbor]
                    })
            
            # If no unvisited neighbors, we've reached a dead end
            if all(neighbor in visited for neighbor in graph.get(node, [])):
                steps.append({
                    'type': 'dfs_backtrack',
                    'state': graph,
                    'description': f'Reached a dead end at node {node}, backtracking',
                    'educational_note': 'When there are no more unvisited neighbors, DFS backtracks to explore other branches.',
                    'dead_end_node': node,
                    'visited': visited.copy(),
                    'stack': stack.copy(),
                    'path': path.copy(),
                    'current_focus': [node]
                })
    
    # DFS complete
    steps.append({
        'type': 'final',
        'state': graph,
        'description': f'Depth-First Search complete! Visited nodes: {visited}',
        'educational_note': 'DFS is useful for finding connected components, topological sorting, and pathfinding in maze-like structures.',
        'visited': visited,
        'path': path,
        'current_focus': visited.copy()
    })
    
    return steps


def dijkstra(data):
    """
    Enhanced Dijkstra's Algorithm implementation with detailed educational descriptions.
    """
    # For Dijkstra's algorithm, data should be a dictionary representing the graph with weighted edges and a starting node
    # Format: {'graph': {node: {neighbor: weight}}, 'start': start_node}
    
    # Setup the graph data
    if isinstance(data, dict):
        graph = data.get('graph', {})
        start = data.get('start', next(iter(graph)) if graph else 0)
    else:
        # If just a list is provided, create a simple graph with equal weights
        graph = {}
        for i in range(len(data)):
            if i not in graph:
                graph[i] = {}
            if i + 1 < len(data):
                graph[i][i + 1] = 1  # Weight of 1 for all edges
        start = 0
    
    steps = []
    
    # Initial state with educational context
    steps.append({
        'type': 'initial',
        'state': graph,
        'description': f'Dijkstra\'s Algorithm starting from node {start}',
        'educational_note': 'Dijkstra\'s Algorithm finds the shortest path from a start node to all other nodes in a weighted graph with non-negative edge weights.',
        'complexity_note': 'Time Complexity: O((V + E) log V) where V is the number of vertices and E is the number of edges',
        'start_node': start,
        'current_focus': [start]
    })
    
    # Initialize distances and visited nodes
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}
    unvisited = list(graph.keys())
    
    steps.append({
        'type': 'dijkstra_init',
        'state': graph,
        'description': f'Initializing distances: 0 for start node, infinity for all others',
        'educational_note': 'We initialize the distance to the start node as 0 and to all other nodes as infinity. We\'ll update these distances as we discover shorter paths.',
        'distances': distances.copy(),
        'unvisited': unvisited.copy(),
        'current_focus': [start]
    })
    
    # Main Dijkstra algorithm loop
    while unvisited:
        # Find the unvisited node with the smallest distance
        current = min(unvisited, key=lambda node: distances[node])
        
        # If the smallest distance is infinity, there are unreachable nodes
        if distances[current] == float('infinity'):
            steps.append({
                'type': 'dijkstra_unreachable',
                'state': graph,
                'description': f'Remaining nodes are unreachable from the start node',
                'educational_note': 'When the minimum distance becomes infinity, it means the remaining nodes are not connected to our start node.',
                'current_node': current,
                'distances': distances.copy(),
                'unvisited': unvisited.copy(),
                'current_focus': unvisited.copy()
            })
            break
        
        steps.append({
            'type': 'dijkstra_current',
            'state': graph,
            'description': f'Processing node {current} with current distance {distances[current]}',
            'educational_note': 'We select the unvisited node with the smallest tentative distance as our current node.',
            'current_node': current,
            'distances': distances.copy(),
            'unvisited': unvisited.copy(),
            'current_focus': [current]
        })
        
        # Remove current node from unvisited
        unvisited.remove(current)
        
        # Update distances to neighbors
        for neighbor, weight in graph.get(current, {}).items():
            if neighbor in unvisited:  # Only consider unvisited neighbors
                distance = distances[current] + weight
                
                steps.append({
                    'type': 'dijkstra_check',
                    'state': graph,
                    'description': f'Checking path to {neighbor} via {current}',
                    'educational_note': f'We calculate the potential new distance to node {neighbor} by adding the weight of the edge from {current} to {neighbor} to the distance to {current}.',
                    'from_node': current,
                    'to_node': neighbor,
                    'current_distance': distances[neighbor],
                    'new_distance': distance,
                    'weight': weight,
                    'distances': distances.copy(),
                    'current_focus': [current, neighbor]
                })
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current
                    
                    steps.append({
                        'type': 'dijkstra_update',
                        'state': graph,
                        'description': f'Updated: shorter path to {neighbor} via {current}, new distance: {distance}',
                        'educational_note': f'We\'ve found a shorter path to node {neighbor} through {current}, so we update its distance and set {current} as its predecessor.',
                        'updated_node': neighbor,
                        'from_node': current,
                        'new_distance': distance,
                        'distances': distances.copy(),
                        'previous': previous.copy(),
                        'current_focus': [current, neighbor]
                    })
    
    # Construct shortest paths
    paths = {}
    for node in graph:
        if distances[node] != float('infinity'):
            path = []
            current = node
            while current is not None:
                path.append(current)
                current = previous[current]
            path.reverse()
            paths[node] = path
    
    # Final state
    steps.append({
        'type': 'final',
        'state': graph,
        'description': f'Dijkstra\'s Algorithm complete!',
        'educational_note': 'We have found the shortest path from the start node to all reachable nodes in the graph.',
        'distances': distances,
        'paths': paths,
        'current_focus': list(graph.keys())
    })
    
    return steps