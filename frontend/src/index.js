import React from 'react';
import { createRoot } from 'react-dom/client';
import AlgorithmVisualizer3D from './components/AlgorithmVisualizer3D';

// Initialize the 3D visualizer
window.initVisualizationPlayer = (containerId, algorithmData, initialSteps = []) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <AlgorithmVisualizer3D 
      algorithm={algorithmData}
      initialSteps={initialSteps}
    />
  );
};

// Load saved visualization
window.loadSavedVisualization = (containerId, visualizationData) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <AlgorithmVisualizer3D 
      algorithm={visualizationData.algorithm}
      initialSteps={visualizationData.steps}
      initialInputData={visualizationData.input_data}
      savedVisualization={true}
    />
  );
};