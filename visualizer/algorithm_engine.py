"""
Algorithm execution engine that generates visualization steps.
"""

def execute_algorithm_steps(algorithm_name, input_data):
    """
    Execute the specified algorithm and return visualization steps.
    Each step should include the state of the data structure and any
    relevant information about the current operation.
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

# Sorting Algorithms

def bubble_sort(data):
    """Implement bubble sort algorithm and return visualization steps"""
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Initial array'
    })
    
    for i in range(n):
        # Track if any swaps were made in this pass
        swapped = False
        
        for j in range(0, n - i - 1):
            # Comparing elements
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} and {arr[j+1]}',
                'comparing': [j, j+1]
            })
            
            if arr[j] > arr[j + 1]:
                # Swap the elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
                
                steps.append({
                    'type': 'swap',
                    'state': arr.copy(),
                    'description': f'Swapped {arr[j]} and {arr[j+1]}',
                    'swapped': [j, j+1]
                })
        
        # Mark element as sorted
        steps.append({
            'type': 'sorted',
            'state': arr.copy(),
            'description': f'Element at index {n-i-1} is now in its sorted position',
            'sorted_indices': list(range(n-i-1, n))
        })
        
        # If no swaps were made, array is sorted
        if not swapped:
            break
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Array is sorted',
        'sorted_indices': list(range(n))
    })
    
    return steps

def selection_sort(data):
    """Implement selection sort algorithm and return visualization steps"""
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Initial array'
    })
    
    for i in range(n):
        # Assume the minimum is the first unsorted element
        min_idx = i
        steps.append({
            'type': 'min_selected',
            'state': arr.copy(),
            'description': f'Assuming {arr[min_idx]} at index {min_idx} is the minimum',
            'min_idx': min_idx
        })
        
        # Find the minimum element in the unsorted part
        for j in range(i+1, n):
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} with current minimum {arr[min_idx]}',
                'comparing': [j, min_idx]
            })
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                steps.append({
                    'type': 'new_min',
                    'state': arr.copy(),
                    'description': f'New minimum {arr[min_idx]} found at index {min_idx}',
                    'min_idx': min_idx
                })
        
        # Swap the found minimum element with the first element
        if min_idx != i:
            steps.append({
                'type': 'before_swap',
                'state': arr.copy(),
                'description': f'Swapping {arr[i]} with {arr[min_idx]}',
                'swapping': [i, min_idx]
            })
            
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
            
            steps.append({
                'type': 'after_swap',
                'state': arr.copy(),
                'description': f'Swapped {arr[i]} with {arr[min_idx]}',
                'swapped': [i, min_idx]
            })
        
        # Mark element as sorted
        steps.append({
            'type': 'sorted',
            'state': arr.copy(),
            'description': f'Element {arr[i]} is now in its sorted position',
            'sorted_indices': list(range(i+1))
        })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Array is sorted',
        'sorted_indices': list(range(n))
    })
    
    return steps

def insertion_sort(data):
    """Placeholder for insertion sort implementation"""
    # Implementation would be similar to bubble_sort and selection_sort
    return [{'type': 'placeholder', 'description': 'Insertion Sort steps would go here'}]

def merge_sort(data):
    """Placeholder for merge sort implementation"""
    return [{'type': 'placeholder', 'description': 'Merge Sort steps would go here'}]

def quick_sort(data):
    """Placeholder for quick sort implementation"""
    return [{'type': 'placeholder', 'description': 'Quick Sort steps would go here'}]

# Searching Algorithms

def linear_search(data):
    """Placeholder for linear search implementation"""
    # Data should include the array and target value
    return [{'type': 'placeholder', 'description': 'Linear Search steps would go here'}]

def binary_search(data):
    """Placeholder for binary search implementation"""
    return [{'type': 'placeholder', 'description': 'Binary Search steps would go here'}]

# Tree Operations

def bst_insertion(data):
    """Placeholder for BST insertion implementation"""
    return [{'type': 'placeholder', 'description': 'BST Insertion steps would go here'}]

def bst_traversal(data):
    """Placeholder for BST traversal implementation"""
    return [{'type': 'placeholder', 'description': 'BST Traversal steps would go here'}]

# Graph Algorithms

def bfs(data):
    """Placeholder for breadth-first search implementation"""
    return [{'type': 'placeholder', 'description': 'BFS steps would go here'}]

def dfs(data):
    """Placeholder for depth-first search implementation"""
    return [{'type': 'placeholder', 'description': 'DFS steps would go here'}]

def dijkstra(data):
    """Placeholder for Dijkstra's algorithm implementation"""
    return [{'type': 'placeholder', 'description': 'Dijkstra Algorithm steps would go here'}]

"""
Additional algorithm implementations for the visualization engine.
These implementations should be added to algorithm_engine.py
"""

def insertion_sort(data):
    """Implement insertion sort algorithm and return visualization steps"""
    steps = []
    arr = data.copy()
    n = len(arr)
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Initial array'
    })
    
    # Consider the first element as sorted
    steps.append({
        'type': 'sorted',
        'state': arr.copy(),
        'description': 'First element is already sorted',
        'sorted_indices': [0]
    })
    
    # Insert each element into the sorted part
    for i in range(1, n):
        current = arr[i]
        j = i - 1
        
        steps.append({
            'type': 'current',
            'state': arr.copy(),
            'description': f'Inserting element {current}',
            'current_index': i,
            'sorted_indices': list(range(i))
        })
        
        # Compare and shift elements
        while j >= 0 and arr[j] > current:
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {current} with {arr[j]}',
                'comparing': [j, i]
            })
            
            arr[j + 1] = arr[j]
            
            steps.append({
                'type': 'shift',
                'state': arr.copy(),
                'description': f'Shifting {arr[j]} to the right',
                'shifted': j + 1
            })
            
            j -= 1
        
        arr[j + 1] = current
        
        steps.append({
            'type': 'insert',
            'state': arr.copy(),
            'description': f'Inserting {current} at index {j + 1}',
            'inserted_index': j + 1
        })
        
        steps.append({
            'type': 'sorted',
            'state': arr.copy(),
            'description': f'Array is sorted up to index {i}',
            'sorted_indices': list(range(i + 1))
        })
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Array is sorted',
        'sorted_indices': list(range(n))
    })
    
    return steps

def merge_sort(data):
    """Implement merge sort algorithm and return visualization steps"""
    steps = []
    arr = data.copy()
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Initial array'
    })
    
    # Helper function to merge two subarrays
    def merge(left_start, left_end, right_end):
        left_arr = arr[left_start:left_end + 1]
        right_arr = arr[left_end + 1:right_end + 1]
        
        steps.append({
            'type': 'split',
            'state': arr.copy(),
            'description': f'Split array into left ({left_start}-{left_end}) and right ({left_end+1}-{right_end})',
            'left': list(range(left_start, left_end + 1)),
            'right': list(range(left_end + 1, right_end + 1))
        })
        
        left_idx = 0
        right_idx = 0
        arr_idx = left_start
        
        # Merge the two subarrays
        while left_idx < len(left_arr) and right_idx < len(right_arr):
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {left_arr[left_idx]} and {right_arr[right_idx]}',
                'comparing': [left_start + left_idx, left_end + 1 + right_idx]
            })
            
            if left_arr[left_idx] <= right_arr[right_idx]:
                arr[arr_idx] = left_arr[left_idx]
                steps.append({
                    'type': 'place',
                    'state': arr.copy(),
                    'description': f'Placing {left_arr[left_idx]} at index {arr_idx}',
                    'placed_index': arr_idx
                })
                left_idx += 1
            else:
                arr[arr_idx] = right_arr[right_idx]
                steps.append({
                    'type': 'place',
                    'state': arr.copy(),
                    'description': f'Placing {right_arr[right_idx]} at index {arr_idx}',
                    'placed_index': arr_idx
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
                'placed_index': arr_idx
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
                'placed_index': arr_idx
            })
            right_idx += 1
            arr_idx += 1
        
        steps.append({
            'type': 'merged',
            'state': arr.copy(),
            'description': f'Merged subarrays from {left_start} to {right_end}',
            'merged_indices': list(range(left_start, right_end + 1))
        })
    
    # Helper function for recursive merge sort
    def merge_sort_recursive(left, right):
        if left < right:
            mid = (left + right) // 2
            
            # Sort left and right halves
            merge_sort_recursive(left, mid)
            merge_sort_recursive(mid + 1, right)
            
            # Merge the sorted halves
            merge(left, mid, right)
    
    # Execute merge sort
    merge_sort_recursive(0, len(arr) - 1)
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Array is sorted',
        'sorted_indices': list(range(len(arr)))
    })
    
    return steps

def quick_sort(data):
    """Implement quick sort algorithm and return visualization steps"""
    steps = []
    arr = data.copy()
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': 'Initial array'
    })
    
    # Helper function for partition
    def partition(low, high):
        pivot = arr[high]
        steps.append({
            'type': 'pivot',
            'state': arr.copy(),
            'description': f'Selected pivot: {pivot} at index {high}',
            'pivot_index': high
        })
        
        i = low - 1
        
        for j in range(low, high):
            steps.append({
                'type': 'comparison',
                'state': arr.copy(),
                'description': f'Comparing {arr[j]} with pivot {pivot}',
                'comparing': [j, high]
            })
            
            if arr[j] <= pivot:
                i += 1
                steps.append({
                    'type': 'before_swap',
                    'state': arr.copy(),
                    'description': f'Swapping {arr[i]} and {arr[j]}',
                    'swapping': [i, j]
                })
                
                arr[i], arr[j] = arr[j], arr[i]
                
                steps.append({
                    'type': 'after_swap',
                    'state': arr.copy(),
                    'description': f'Swapped {arr[i]} and {arr[j]}',
                    'swapped': [i, j]
                })
        
        steps.append({
            'type': 'before_swap',
            'state': arr.copy(),
            'description': f'Swapping {arr[i+1]} and pivot {pivot}',
            'swapping': [i+1, high]
        })
        
        arr[i+1], arr[high] = arr[high], arr[i+1]
        
        steps.append({
            'type': 'after_swap',
            'state': arr.copy(),
            'description': f'Swapped {arr[i+1]} and pivot {pivot}',
            'swapped': [i+1, high]
        })
        
        steps.append({
            'type': 'partition',
            'state': arr.copy(),
            'description': f'Partition complete: pivot {pivot} at correct position {i+1}',
            'pivot_index': i+1,
            'left_partition': list(range(low, i+1)),
            'right_partition': list(range(i+2, high+1))
        })
        
        return i + 1
    
    # Helper function for recursive quick sort
    def quick_sort_recursive(low, high):
        if low < high:
            # Find the partition index
            pi = partition(low, high)
            
            # Sort elements before and after partition
            quick_sort_recursive(low, pi - 1)
            quick_sort_recursive(pi + 1, high)
    
    # Execute quick sort
    quick_sort_recursive(0, len(arr) - 1)
    
    # Final state
    steps.append({
        'type': 'final',
        'state': arr.copy(),
        'description': 'Array is sorted',
        'sorted_indices': list(range(len(arr)))
    })
    
    return steps

def linear_search(data):
    """Implement linear search algorithm and return visualization steps"""
    # For linear search, data should contain the array and the target value
    # Format: {'array': [...], 'target': value}
    
    if isinstance(data, list):
        # If data is just a list, use the last element as the target for demonstration
        arr = data.copy()
        target = arr[-1]
    else:
        # If data is a dict with array and target
        arr = data.get('array', []).copy()
        target = data.get('target', 0)
    
    steps = []
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': f'Initial array, searching for {target}',
        'target': target
    })
    
    # Perform linear search
    found = False
    for i in range(len(arr)):
        steps.append({
            'type': 'checking',
            'state': arr.copy(),
            'description': f'Checking index {i}: {arr[i]}',
            'checking_index': i,
            'target': target
        })
        
        if arr[i] == target:
            steps.append({
                'type': 'found',
                'state': arr.copy(),
                'description': f'Found {target} at index {i}',
                'found_index': i,
                'target': target
            })
            found = True
            break
    
    # Final state
    if not found:
        steps.append({
            'type': 'not_found',
            'state': arr.copy(),
            'description': f'{target} not found in the array',
            'target': target
        })
    
    return steps

def binary_search(data):
    """Implement binary search algorithm and return visualization steps"""
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
    
    # Initial state
    steps.append({
        'type': 'initial',
        'state': arr.copy(),
        'description': f'Initial sorted array, searching for {target}',
        'target': target
    })
    
    # Perform binary search
    left, right = 0, len(arr) - 1
    found = False
    
    while left <= right:
        mid = (left + right) // 2
        
        steps.append({
            'type': 'search_range',
            'state': arr.copy(),
            'description': f'Searching in range [{left}:{right}]',
            'left': left,
            'right': right,
            'mid': mid,
            'target': target
        })
        
        steps.append({
            'type': 'checking',
            'state': arr.copy(),
            'description': f'Comparing {arr[mid]} at mid index {mid} with target {target}',
            'checking_index': mid,
            'target': target
        })
        
        if arr[mid] == target:
            steps.append({
                'type': 'found',
                'state': arr.copy(),
                'description': f'Found {target} at index {mid}',
                'found_index': mid,
                'target': target
            })
            found = True
            break
        elif arr[mid] < target:
            steps.append({
                'type': 'move_right',
                'state': arr.copy(),
                'description': f'{arr[mid]} < {target}, searching in right half',
                'left': mid + 1,
                'right': right,
                'mid': mid,
                'target': target
            })
            left = mid + 1
        else:
            steps.append({
                'type': 'move_left',
                'state': arr.copy(),
                'description': f'{arr[mid]} > {target}, searching in left half',
                'left': left,
                'right': mid - 1,
                'mid': mid,
                'target': target
            })
            right = mid - 1
    
    # Final state
    if not found:
        steps.append({
            'type': 'not_found',
            'state': arr.copy(),
            'description': f'{target} not found in the array',
            'target': target
        })
    
    return steps