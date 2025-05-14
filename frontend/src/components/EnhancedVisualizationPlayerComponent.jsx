import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Import our custom UI components
import { 
  ControlButtons, 
  ShapeControls, 
  StepInfoPanel, 
  InstructionsPanel,
  LoadingIndicator
} from './VisualizationComponents';

// Import Three.js utilities
import { 
  ShapeFactory,
  ColorThemes,
  getElementColor,
  getElementStatus,
  createValueLabel,
  createComparisonIndicator,
  createSwapIndicator,
  setupScene,
  addLighting,
  addGrid,
  applyHoverEffect,
  resetHoverEffect,
  createVisualizationElements,
  clearVisualization,
  cleanupScene
} from './ThreeJsUtils';

/**
 * Enhanced Visualization Player for AlgoViz3D
 * 
 * Provides an interactive 3D visualization of algorithm operations with
 * proper sizing, element interaction, and clear visual indicators for operations.
 */
const EnhancedVisualizationPlayer = ({ 
  algorithm,
  initialSteps = [], 
  initialInputData = [], 
  savedVisualization = false 
}) => {
  // Visualization state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3);
  const [steps, setSteps] = useState(initialSteps);
  const [inputData, setInputData] = useState(initialInputData);
  const [is3DView, setIs3DView] = useState(true);
  
  // Appearance settings
  const [selectedShape, setSelectedShape] = useState('cube');
  const [showLabels, setShowLabels] = useState(true);
  const [focusMode, setFocusMode] = useState(true);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Refs for Three.js objects
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const elementsRef = useRef([]);
  const intervalRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredObjectRef = useRef(null);
  
  // Initialize on component mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Three.js scene
    initializeScene();
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    
    // Initialize algorithm if needed
    if (steps.length > 0) {
      // If we have initial steps, render the visualization
      setTimeout(() => updateVisualization(), 300);
    } else if (!savedVisualization) {
      // Otherwise generate random data for demo
      generateRandomData();
    }
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clear animation and intervals
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Clean up Three.js resources
      cleanupResources();
    };
  }, []);
  
  // Update visualization when step changes
  useEffect(() => {
    updateVisualization();
  }, [currentStepIndex, selectedShape, showLabels, focusMode]);
  
  // Initialize Three.js scene
  const initializeScene = () => {
    const container = canvasRef.current;
    if (!container) return;
    
    // Set up the scene
    const { scene, camera, renderer } = setupScene(container);
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controlsRef.current = controls;
    
    // Initialize raycaster for mouse interaction
    raycasterRef.current = new THREE.Raycaster();
    
    // Add mouse event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleMouseClick);
    
    // Start animation loop
    animate();
  };
  
  // Animation loop
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // Update mouse hover interactions
    updateMouseInteraction();
    
    // Render scene
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };
  
  // Update mouse interactions (hover effects)
  const updateMouseInteraction = () => {
    if (!raycasterRef.current || !cameraRef.current || !sceneRef.current) return;
    
    // Filter out non-mesh objects (like sprites and groups)
    const interactableObjects = elementsRef.current.filter(
      obj => obj.type === 'Mesh' && obj.userData && obj.userData.index !== undefined
    );
    
    if (interactableObjects.length === 0) return;
    
    // Update raycaster with current mouse position
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // Find intersections
    const intersects = raycasterRef.current.intersectObjects(interactableObjects);
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // If hovering over a new object
      if (hoveredObjectRef.current !== intersectedObject) {
        // Reset previous hover effect
        if (hoveredObjectRef.current) {
          resetHoverEffect(hoveredObjectRef.current);
        }
        
        // Apply hover effect to new object
        hoveredObjectRef.current = intersectedObject;
        applyHoverEffect(hoveredObjectRef.current);
        
        // Change cursor
        if (rendererRef.current && rendererRef.current.domElement) {
          rendererRef.current.domElement.style.cursor = 'pointer';
        }
      }
    } else if (hoveredObjectRef.current) {
      // Reset hover effect when not hovering over any object
      resetHoverEffect(hoveredObjectRef.current);
      hoveredObjectRef.current = null;
      
      // Reset cursor
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.style.cursor = 'default';
      }
    }
  };
  
  // Handle mouse movement
  const handleMouseMove = (event) => {
    if (!rendererRef.current) return;
    
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };
  
  // Handle mouse click
  const handleMouseClick = (event) => {
    if (hoveredObjectRef.current && hoveredObjectRef.current.userData && 
        hoveredObjectRef.current.userData.index !== undefined) {
      // Show element details
      showElementDetails(hoveredObjectRef.current.userData.index);
    }
  };
  
  // Show details popup for an element
  const showElementDetails = (index) => {
    if (!steps || !steps.length || index === undefined) return;
    
    const currentStep = steps[currentStepIndex];
    const value = currentStep.state[index];
    const status = getElementStatus(index, currentStep);
    
    // Find the element's position in the scene
    const element = elementsRef.current.find(
      el => el.userData && el.userData.index === index
    );
    
    if (!element) return;
    
    // Create popup
    const popupEl = document.createElement('div');
    popupEl.className = 'element-popup';
    popupEl.innerHTML = `
      <div class="popup-content">
        <h3>Element Details</h3>
        <p><strong>Value:</strong> ${value}</p>
        <p><strong>Index:</strong> ${index}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>
    `;
    
    // Style and position popup
    const style = popupEl.style;
    style.position = 'absolute';
    style.zIndex = '1000';
    
    // Convert 3D position to screen space
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(element.matrixWorld);
    vector.project(cameraRef.current);
    
    const canvas = rendererRef.current.domElement;
    const rect = canvas.getBoundingClientRect();
    
    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
    const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
    
    style.left = `${x}px`;
    style.top = `${y - 150}px`; // Position above the element
    
    // Add to document
    document.body.appendChild(popupEl);
    
    // Remove after a delay
    setTimeout(() => {
      if (popupEl.parentElement) {
        document.body.removeChild(popupEl);
      }
    }, 3000);
  };
  
  // Clean up resources
  const cleanupResources = () => {
    // Remove event listeners
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove);
      rendererRef.current.domElement.removeEventListener('click', handleMouseClick);
    }
    
    // Clean up Three.js resources
    if (sceneRef.current && rendererRef.current) {
      cleanupScene(sceneRef.current, rendererRef.current);
    }
  };
  
  // Update visualization based on current step
  const updateVisualization = () => {
    if (!sceneRef.current || !steps || steps.length === 0) return;
    
    // Clear current visualization elements
    if (elementsRef.current.length > 0) {
      clearVisualization(sceneRef.current, elementsRef.current);
      elementsRef.current = [];
    }
    
    // Get current step
    const currentStep = steps[currentStepIndex];
    
    // Create new visualization elements
    elementsRef.current = createVisualizationElements(
      sceneRef.current,
      currentStep,
      {
        selectedShape,
        showLabels,
        focusMode,
        baseSize: 8,     // Larger elements for better visibility
        spacing: 12      // More spacing for better separation
      }
    );
  };
  
  // Generate random input data
  const generateRandomData = () => {
    setLoading(true);
    
    // Generate small dataset to make elements clearly visible
    const size = 8; // Reduced from typical 20+ elements for better visibility
    const data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    setInputData(data);
    
    // Execute algorithm
    executeAlgorithm(data);
  };
  
  // Execute the algorithm
  const executeAlgorithm = (data) => {
    if (!algorithm || !algorithm.id) {
      console.error('No algorithm specified');
      setLoading(false);
      return;
    }
    
    // Call API to execute algorithm
    fetch('/api/execute-algorithm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify({
        algorithm_id: algorithm.id,
        input_data: data
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      console.log('Algorithm executed successfully');
      setSteps(result.steps);
      setCurrentStepIndex(0);
      setLoading(false);
      
      // Update visualization
      setTimeout(() => updateVisualization(), 300);
    })
    .catch(error => {
      console.error('Error executing algorithm:', error);
      setLoading(false);
      
      // Generate fake steps for demo purposes
      const fakeSteps = generateFakeSteps(data);
      setSteps(fakeSteps);
      setCurrentStepIndex(0);
      
      // Update visualization
      setTimeout(() => updateVisualization(), 300);
    });
  };
  
  // Helper to generate fake algorithm steps for demo
  const generateFakeSteps = (data) => {
    const steps = [];
    const arr = [...data];
    
    // Initial state
    steps.push({
      type: 'initial',
      state: [...arr],
      description: 'Initial array',
      comparing: []
    });
    
    // Generate comparison and swap steps (simple bubble sort)
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        // Comparison step
        steps.push({
          type: 'comparison',
          state: [...arr],
          description: `Comparing elements at positions ${j} and ${j+1}`,
          comparing: [j, j+1]
        });
        
        // Swap if needed
        if (arr[j] > arr[j+1]) {
          [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
          
          steps.push({
            type: 'swap',
            state: [...arr],
            description: `Swapping elements at positions ${j} and ${j+1}`,
            swapped: [j, j+1]
          });
        }
      }
      
      // Mark as sorted
      steps.push({
        type: 'sorted',
        state: [...arr],
        description: `Element at position ${arr.length - i - 1} is now in its final position`,
        sorted_indices: Array.from({ length: i + 1 }, (_, idx) => arr.length - idx - 1)
      });
    }
    
    // Final sorted state
    steps.push({
      type: 'final',
      state: [...arr],
      description: 'Array is now sorted',
      sorted_indices: Array.from({ length: arr.length }, (_, i) => i)
    });
    
    return steps;
  };
  
  // Helper to get CSRF token
  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    
    return cookieValue;
  };
  
  // Toggle play/pause state
  const togglePlayPause = () => {
    setIsPlaying(prevState => {
      const newIsPlaying = !prevState;
      
      if (newIsPlaying) {
        // Start playback
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          setCurrentStepIndex(prev => {
            if (prev < steps.length - 1) {
              return prev + 1;
            } else {
              // Stop at the end
              clearInterval(intervalRef.current);
              setIsPlaying(false);
              return prev;
            }
          });
        }, 2000 / playbackSpeed);
      } else {
        // Stop playback
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      return newIsPlaying;
    });
  };
  
  // Step forward one step
  const stepForward = () => {
    if (isPlaying) {
      // Stop playback first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    }
    
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  // Step backward one step
  const stepBackward = () => {
    if (isPlaying) {
      // Stop playback first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    }
    
    setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  };
  
  // Reset to beginning
  const resetVisualization = () => {
    if (isPlaying) {
      // Stop playback first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    }
    
    setCurrentStepIndex(0);
    
    // Add visual feedback for reset
    if (canvasRef.current) {
      canvasRef.current.classList.add('reset-flash');
      setTimeout(() => {
        canvasRef.current.classList.remove('reset-flash');
      }, 300);
    }
  };
  
  // Toggle between 2D and 3D view
  const toggle2D3DView = () => {
    setIs3DView(prev => {
      const newValue = !prev;
      
      // Animate camera transition
      if (cameraRef.current) {
        const startPos = cameraRef.current.position.clone();
        const endPos = newValue ? 
          new THREE.Vector3(0, 30, 50) : // 3D view
          new THREE.Vector3(0, 80, 0.1);  // 2D view
          
        const duration = 1000; // milliseconds
        const startTime = Date.now();
        
        const animateCamera = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Use smooth easing
          const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
          
          // Interpolate position
          cameraRef.current.position.lerpVectors(startPos, endPos, easeProgress);
          cameraRef.current.lookAt(0, 0, 0);
          
          if (progress < 1) {
            requestAnimationFrame(animateCamera);
          } else {
            // Final position
            cameraRef.current.position.copy(endPos);
            cameraRef.current.lookAt(0, 0, 0);
          }
        };
        
        animateCamera();
      }
      
      return newValue;
    });
  };
  
  // Reset camera position
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    // Animate to default position
    const startPos = cameraRef.current.position.clone();
    const endPos = new THREE.Vector3(0, 30, 50);
    
    const duration = 800; // milliseconds
    const startTime = Date.now();
    
    const animateReset = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use smooth easing
      const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      
      // Interpolate position
      cameraRef.current.position.lerpVectors(startPos, endPos, easeProgress);
      cameraRef.current.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      } else {
        // Reset controls
        controlsRef.current.reset();
      }
    };
    
    animateReset();
  };
  
  // Render component
  return (
    <div className="algorithm-visualizer">
      {/* Visualization Canvas */}
      <div className="visualization-canvas-container">
        <div 
          className="visualization-canvas" 
          ref={canvasRef}
        />
        
        {/* Playback Controls */}
        <ControlButtons 
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          stepForward={stepForward}
          stepBackward={stepBackward}
          resetVisualization={resetVisualization}
          toggle2D3DView={toggle2D3DView}
          resetCamera={resetCamera}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          is3DView={is3DView}
        />
        
        {/* Loading Indicator */}
        {loading && (
          <LoadingIndicator message="Executing algorithm..." />
        )}
      </div>
      
      {/* Shape Controls */}
      <ShapeControls 
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
      />
      
      {/* Step Information */}
      {steps.length > 0 && (
        <StepInfoPanel 
          currentStep={steps[currentStepIndex]}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
        />
      )}
      
      {/* Instructions Panel */}
      <InstructionsPanel />
    </div>
  );
};

export default EnhancedVisualizationPlayer;