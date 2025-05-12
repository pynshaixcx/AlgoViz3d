from django.test import TestCase
from .models import Algorithm, DataStructure, Visualization
from django.contrib.auth.models import User

class AlgorithmModelTests(TestCase):
    def setUp(self):
        self.data_structure = DataStructure.objects.create(
            name="Array",
            category="linear",
            description="A collection of elements stored at contiguous memory locations"
        )
        
        self.algorithm = Algorithm.objects.create(
            name="Bubble Sort",
            category="sort",
            description="A simple sorting algorithm",
            code_implementation="def bubble_sort(arr):\n    # Implementation",
            time_complexity="O(n²)",
            space_complexity="O(1)"
        )
        
        self.algorithm.data_structures.add(self.data_structure)
    
    def test_algorithm_creation(self):
        self.assertEqual(self.algorithm.name, "Bubble Sort")
        self.assertEqual(self.algorithm.category, "sort")
        
    def test_algorithm_data_structure_relation(self):
        self.assertEqual(self.algorithm.data_structures.count(), 1)
        self.assertEqual(self.algorithm.data_structures.first().name, "Array")

class VisualizationModelTests(TestCase):
    def setUp(self):
        self.algorithm = Algorithm.objects.create(
            name="Bubble Sort",
            category="sort",
            description="A simple sorting algorithm",
            code_implementation="def bubble_sort(arr):\n    # Implementation",
            time_complexity="O(n²)",
            space_complexity="O(1)"
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword"
        )
        
        self.visualization = Visualization.objects.create(
            algorithm=self.algorithm,
            input_data=[3, 1, 4, 1, 5, 9, 2, 6],
            steps=[{"type": "initial", "state": [3, 1, 4, 1, 5, 9, 2, 6]}],
            name="Test Visualization",
            user=self.user
        )
    
    def test_visualization_creation(self):
        self.assertEqual(self.visualization.name, "Test Visualization")
        self.assertEqual(self.visualization.algorithm.name, "Bubble Sort")
        self.assertEqual(self.visualization.user.username, "testuser")