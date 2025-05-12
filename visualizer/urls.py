from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api import AlgorithmViewSet, DataStructureViewSet, VisualizationViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'algorithms', AlgorithmViewSet)
router.register(r'data-structures', DataStructureViewSet)
router.register(r'visualizations', VisualizationViewSet)

urlpatterns = [
    # Frontend views
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('visualization/<int:algorithm_id>/', views.visualization, name='visualization'),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/execute-algorithm/', views.execute_algorithm, name='execute-algorithm'),
]