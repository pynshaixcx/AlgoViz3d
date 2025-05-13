import React from 'react';
import { createRoot } from 'react-dom/client';
import VisualizationPlayer from './components/VisualizationPlayer';

// Initialize visualization player with default or saved data
window.initVisualizationPlayer = (containerId, algorithmData, initialSteps = []) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <VisualizationPlayer 
      algorithm={algorithmData}
      initialSteps={initialSteps}
    />
  );
};

// Allow loading saved visualizations
window.loadSavedVisualization = (containerId, visualizationData) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <VisualizationPlayer 
      algorithm={visualizationData.algorithm}
      initialSteps={visualizationData.steps}
      initialInputData={visualizationData.input_data}
      savedVisualization={true}
    />
  );
};