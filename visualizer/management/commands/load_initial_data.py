from django.core.management.base import BaseCommand
from visualizer.models import Algorithm, DataStructure

class Command(BaseCommand):
    help = 'Load initial algorithm and data structure data'

    def handle(self, *args, **kwargs):
        # Create data structures
        array_ds = DataStructure.objects.create(
            name="Array",
            category="linear",
            description="A collection of elements stored at contiguous memory locations"
        )

        # Create algorithms
        algorithms_data = [
            {
                'name': 'Bubble Sort',
                'category': 'sort',
                'description': 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                'code_implementation': '''def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr''',
                'time_complexity': 'O(n²)',
                'space_complexity': 'O(1)',
                'id': 5
            },
            {
                'name': 'Binary Search',
                'category': 'search',
                'description': 'A search algorithm that finds the position of a target value within a sorted array.',
                'code_implementation': '''def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1''',
                'time_complexity': 'O(log n)',
                'space_complexity': 'O(1)',
                'id': 7
            },
            {
                'name': 'Breadth First Search',
                'category': 'graph',
                'description': 'A graph traversal algorithm that explores all vertices at the present depth before moving to vertices at the next depth level.',
                'code_implementation': '''def bfs(graph, start):
    visited = set()
    queue = [start]
    visited.add(start)
    
    while queue:
        vertex = queue.pop(0)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited''',
                'time_complexity': 'O(V + E)',
                'space_complexity': 'O(V)',
                'id': 10
            },
            {
                'name': "Dijkstra's Algorithm",
                'category': 'graph',
                'description': 'An algorithm for finding the shortest paths between nodes in a weighted graph.',
                'code_implementation': '''def dijkstra(graph, start):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    unvisited = list(graph.keys())
    
    while unvisited:
        current = min(unvisited, key=lambda node: distances[node])
        unvisited.remove(current)
        
        for neighbor, weight in graph[current].items():
            distance = distances[current] + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
    return distances''',
                'time_complexity': 'O((V + E) log V)',
                'space_complexity': 'O(V)',
                'id': 12
            }
        ]

        for algo_data in algorithms_data:
            algo_id = algo_data.pop('id')
            algorithm = Algorithm.objects.create(**algo_data)
            algorithm.id = algo_id
            algorithm.save()
            algorithm.data_structures.add(array_ds)

        self.stdout.write(self.style.SUCCESS('Successfully loaded initial data'))