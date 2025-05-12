"""
URL configuration for algo_viz3d project.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('visualizer.urls')),
]