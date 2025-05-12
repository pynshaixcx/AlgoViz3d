from rest_framework import viewsets, permissions
from .models import Algorithm, DataStructure, Visualization
from .serializers import AlgorithmSerializer, DataStructureSerializer, VisualizationSerializer

class AlgorithmViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing algorithms"""
    queryset = Algorithm.objects.all()
    serializer_class = AlgorithmSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class DataStructureViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing data structures"""
    queryset = DataStructure.objects.all()
    serializer_class = DataStructureSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class VisualizationViewSet(viewsets.ModelViewSet):
    """API endpoint for managing visualizations"""
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only the user's own visualizations"""
        if self.request.user.is_authenticated:
            return Visualization.objects.filter(user=self.request.user)
        return Visualization.objects.none()
    
    def perform_create(self, serializer):
        """Set the user automatically"""
        serializer.save(user=self.request.user)