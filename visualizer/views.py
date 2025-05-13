from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
import logging

from .models import Algorithm, DataStructure, Visualization
from .algorithm_engine import execute_algorithm_steps

# Set up logging
logger = logging.getLogger(__name__)

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

def saved_visualization(request, visualization_id):
    """View a saved visualization"""
    visualization = get_object_or_404(Visualization, id=visualization_id)
    
    # Check if the user has permission to view this visualization
    if visualization.user and visualization.user != request.user and not request.user.is_staff:
        return render(request, '403.html', status=403)
    
    algorithm = visualization.algorithm
    
    context = {
        'visualization': visualization,
        'algorithm': algorithm,
    }
    
    return render(request, 'saved_visualization.html', context)

@csrf_exempt
@api_view(['POST'])
def execute_algorithm(request):
    """API endpoint to execute an algorithm and return visualization steps"""
    try:
        # Parse the request data
        data = request.data
        algorithm_id = data.get('algorithm_id')
        input_data = data.get('input_data', [])
        
        # Validate input data
        if not algorithm_id:
            return Response({'error': 'Algorithm ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not input_data or not isinstance(input_data, list):
            return Response({'error': 'Valid input data array is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get algorithm
        try:
            algorithm = Algorithm.objects.get(id=algorithm_id)
        except Algorithm.DoesNotExist:
            return Response({'error': 'Algorithm not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Log the algorithm execution request
        logger.info(f"Executing algorithm: {algorithm.name} with {len(input_data)} elements")
        
        # Execute algorithm and get steps
        try:
            steps = execute_algorithm_steps(algorithm.name, input_data)
            
            # Ensure steps is a list
            if not isinstance(steps, list):
                steps = [{'type': 'error', 'description': 'Algorithm execution did not return valid steps'}]
                
            # If steps is empty, add a placeholder step
            if len(steps) == 0:
                steps = [{'type': 'placeholder', 'description': 'No visualization steps returned', 'state': input_data}]
        except Exception as e:
            logger.error(f"Error executing algorithm: {str(e)}")
            # Create a default step showing the input data
            steps = [
                {'type': 'error', 'description': f'Error executing algorithm: {str(e)}', 'state': input_data}
            ]
        
        # Create visualization record if user is authenticated
        if request.user.is_authenticated:
            try:
                Visualization.objects.create(
                    algorithm=algorithm,
                    input_data=input_data,
                    steps=steps,
                    user=request.user,
                    name=f"{algorithm.name} - {len(input_data)} elements"
                )
            except Exception as e:
                logger.error(f"Error saving visualization: {str(e)}")
        
        # Format the response for the React component
        return Response({
            'algorithm': {
                'id': algorithm.id,
                'name': algorithm.name,
                'description': algorithm.description,
                'timeComplexity': algorithm.time_complexity,
                'spaceComplexity': algorithm.space_complexity,
                'code_implementation': algorithm.code_implementation
            },
            'steps': steps,
            'inputData': input_data
        })
    
    except Exception as e:
        logger.error(f"Unexpected error in execute_algorithm: {str(e)}")
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)