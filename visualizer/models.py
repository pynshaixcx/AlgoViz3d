from django.db import models
from django.contrib.auth.models import User

class DataStructure(models.Model):
    """Model representing a data structure type"""
    CATEGORIES = [
        ('linear', 'Linear Data Structures'),
        ('tree', 'Tree Structures'),
        ('graph', 'Graph Structures'),
        ('hash', 'Hashing Structures'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField()
    
    def __str__(self):
        return self.name

class Algorithm(models.Model):
    """Model representing an algorithm"""
    CATEGORIES = [
        ('search', 'Searching Algorithms'),
        ('sort', 'Sorting Algorithms'),
        ('tree', 'Tree Operations'),
        ('graph', 'Graph Algorithms'),
        ('array', 'Array/List Operations'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField()
    code_implementation = models.TextField()
    time_complexity = models.CharField(max_length=100)
    space_complexity = models.CharField(max_length=100)
    data_structures = models.ManyToManyField(DataStructure, related_name='algorithms')
    
    def __str__(self):
        return self.name

class Visualization(models.Model):
    """Model representing a saved visualization"""
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE)
    input_data = models.JSONField()
    steps = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, default="Untitled Visualization")
    
    def __str__(self):
        return f"{self.algorithm.name} - {self.name}"