from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import json

from .models import Algorithm, DataStructure, Visualization
from .algorithm_engine import execute_algorithm_steps

def index(request):
    """Main landing page"""
    return render(request, 'index.html')

def dashboard(request):
    """Dashboard page with algorithm and data structure selection"""
    # Get all algorithms and data structures
    algorithms = Algorithm.objects.all().order_by('category', 'name')
    data_structures = DataStructure.objects.all().order_by('category', 'name')
    
    # Group algorithms by category
    algorithm_categories = {}
    for algorithm in algorithms:
        if algorithm.category not in algorithm_categories:
            algorithm_categories[algorithm.category] = []
        algorithm_categories[algorithm.category].append(algorithm)
    
    # Group data structures by category
    data_structure_categories = {}
    for data_structure in data_structures:
        if data_structure.category not in data_structure_categories:
            data_structure_categories[data_structure.category] = []
        data_structure_categories[data_structure.category].append(data_structure)
    
    context = {
        'algorithm_categories': algorithm_categories,
        'data_structure_categories': data_structure_categories,
    }
    
    return render(request, 'dashboard.html', context)

def visualization(request, algorithm_id):
    """Page for a specific algorithm visualization"""
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
    
    # Get related data structures
    data_structures = algorithm.data_structures.all()
    
    # Get example visualizations if user is authenticated
    example_visualizations = []
    if request.user.is_authenticated:
        example_visualizations = Visualization.objects.filter(
            algorithm=algorithm,
            user=request.user
        ).order_by('-created_at')[:5]
    
    context = {
        'algorithm': algorithm,
        'data_structures': data_structures,
        'example_visualizations': example_visualizations,
    }
    
    return render(request, 'visualization.html', context)

@csrf_exempt
@api_view(['POST'])
def execute_algorithm(request):
    """API endpoint to execute an algorithm and return visualization steps"""
    try:
        data = json.loads(request.body)
        algorithm_id = data.get('algorithm_id')
        input_data = data.get('input_data', [])
        
        # Get algorithm
        algorithm = get_object_or_404(Algorithm, id=algorithm_id)
        
        # Execute algorithm and get steps
        steps = execute_algorithm_steps(algorithm.name, input_data)
        
        # Create visualization record if user is authenticated
        if request.user.is_authenticated:
            Visualization.objects.create(
                algorithm=algorithm,
                input_data=input_data,
                steps=steps,
                user=request.user,
                name=f"{algorithm.name} - {len(input_data)} elements"
            )
        
        return JsonResponse({
            'algorithm': algorithm.name,
            'steps': steps,
            'time_complexity': algorithm.time_complexity,
            'space_complexity': algorithm.space_complexity,
        })
    
    except Algorithm.DoesNotExist:
        return JsonResponse({'error': 'Algorithm not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)