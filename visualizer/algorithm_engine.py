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