import React from 'react';
import { createRoot } from 'react-dom/client';
import EnhancedVisualizationPlayer from './components/EnhancedVisualizationPlayer';

/**
 * Initialize the 3D visualization player with algorithm data and optional initial steps
 * 
 * @param {string} containerId - DOM container ID to mount the visualization
 * @param {Object} algorithmData - Algorithm metadata
 * @param {Array} initialSteps - Optional array of algorithm steps
 */
window.initVisualizationPlayer = (containerId, algorithmData, initialSteps = []) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  // Ensure container has proper styling
  container.style.width = '100%';
  container.style.height = '600px';
  container.style.margin = '20px 0';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  
  // Create and render the React component
  const root = createRoot(container);
  root.render(
    <EnhancedVisualizationPlayer 
      algorithm={algorithmData}
      initialSteps={initialSteps}
    />
  );
  
  return root;
};

/**
 * Load a saved visualization into the container
 * 
 * @param {string} containerId - DOM container ID to mount the visualization
 * @param {Object} visualizationData - Saved visualization data
 */
window.loadSavedVisualization = (containerId, visualizationData) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  // Ensure container has proper styling
  container.style.width = '100%';
  container.style.height = '600px';
  container.style.margin = '20px 0';
  container.style.borderRadius = '8px';
  container.style.overflow = 'hidden';
  
  // Create and render the React component
  const root = createRoot(container);
  root.render(
    <EnhancedVisualizationPlayer 
      algorithm={visualizationData.algorithm}
      initialSteps={visualizationData.steps}
      initialInputData={visualizationData.input_data}
      savedVisualization={true}
    />
  );
  
  return root;
};

// If we're in development mode, add some debug functionality
if (process.env.NODE_ENV === 'development') {
  // Create a global test function for direct debugging
  window.testVisualization = (containerId) => {
    // Sample algorithm data for testing
    const testAlgorithm = {
      id: 999,
      name: "Test Algorithm",
      description: "A test algorithm for visualization",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)",
      code_implementation: "function testAlgorithm(arr) {\n  // Implementation\n}"
    };
    
    // Sample array data
    const testArray = [64, 34, 25, 12, 22, 11, 90];
    
    // Initialize with test data
    window.initVisualizationPlayer(containerId, testAlgorithm);
  };
}