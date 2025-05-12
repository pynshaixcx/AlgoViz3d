from rest_framework import serializers
from .models import Algorithm, DataStructure, Visualization

class DataStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStructure
        fields = ['id', 'name', 'category', 'description']

class AlgorithmSerializer(serializers.ModelSerializer):
    data_structures = DataStructureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Algorithm
        fields = ['id', 'name', 'category', 'description', 'code_implementation', 
                 'time_complexity', 'space_complexity', 'data_structures']

class VisualizationSerializer(serializers.ModelSerializer):
    algorithm_name = serializers.ReadOnlyField(source='algorithm.name')
    
    class Meta:
        model = Visualization
        fields = ['id', 'algorithm', 'algorithm_name', 'input_data', 'steps', 
                 'created_at', 'name']
        read_only_fields = ['created_at', 'user']