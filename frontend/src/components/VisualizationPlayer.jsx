import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Maximize, Minimize, Eye, Layers, Sliders, Settings, 
  Code, Info, X, AlertCircle
} from 'lucide-react';

// Shape geometries
const SHAPES = {
  cube: (size) => new THREE.BoxGeometry(size, size, size),
  sphere: (size) => new THREE.SphereGeometry(size * 0.6, 32, 32),
  cylinder: (size) => new THREE.CylinderGeometry(size * 0.5, size * 0.5, size, 32),
  pyramid: (size) => new THREE.ConeGeometry(size * 0.7, size, 4),
  diamond: (size) => new THREE.OctahedronGeometry(size * 0.7, 0)
};

// Color themes
const THEMES = {
  blue: {
    default: 0x4285F4,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x34A853,
    selected: 0xAA46BC,
    background: '#0a1929',
    text: '#ffffff'
  },
  green: {
    default: 0x34A853,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x4285F4,
    selected: 0xAA46BC,
    background: '#0a291c',
    text: '#ffffff'
  },
  purple: {
    default: 0xAA46BC,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x34A853,
    selected: 0x4285F4,
    background: '#1a0a29',
    text: '#ffffff'
  },
  dark: {
    default: 0x607D8B,
    comparison: 0xFF5252,
    swap: 0xFFB300,
    sorted: 0x66BB6A,
    selected: 0x448AFF,
    background: '#121212',
    text: '#ffffff'
  }
};

const VisualizationPlayer = ({ 
  algorithm, 
  initialSteps = [], 
  initialInputData = [], 
  savedVisualization = false 
}) => {
  // State
  const [state, setState] = useState({
    algorithm: algorithm || {},
    steps: initialSteps || [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 5,
    is3DView: true,
    visualizationShape: 'cube',
    colorTheme: 'blue',
    focusMode: true,
    showCode: false,
    showSettings: false,
    inputData: initialInputData || [],
    inputSize: initialInputData?.length || 10,
    isFullscreen: false,
    loading: false,
    error: null,
    customInputText: ''
  });
  
  // Refs
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  const intervalRef = useRef(null);
  const dataObjectsRef = useRef([]);
  const textLabelsRef = useRef([]);
  const arrowsRef = useRef([]);
  
  // Setup Three.js scene on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize scene
    setupScene();
    
    // Generate initial data if not saved
    if (!savedVisualization && initialInputData.length === 0) {
      generateRandomData();
    } else if (initialSteps.length > 0) {
      // If we have initial steps, update the visualization
      setTimeout(() => updateVisualization(), 500);
    }
    
    // Set up event listeners for keyboard shortcuts
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up on unmount
    return () => {
      cleanupScene();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Effect to update visualization when step changes
  useEffect(() => {
    updateVisualization();
  }, [state.currentStepIndex]);
  
  // Helper function to get CSRF token
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
  
  // Setup Three.js scene
  const setupScene = () => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(THEMES[state.colorTheme].background);
    sceneRef.current = scene;
    
    // Add grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x304FFE, 0x1A237E);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add camera
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 40, 60);
    cameraRef.current = camera;
    
    // Add renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 30, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 150;
    mainLight.shadow.camera.left = -70;
    mainLight.shadow.camera.right = 70;
    mainLight.shadow.camera.top = 70;
    mainLight.shadow.camera.bottom = -70;
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0x9090ff, 0.6);
    fillLight.position.set(-10, 20, -15);
    scene.add(fillLight);
    
    const pointLight = new THREE.PointLight(0x3f51b5, 0.8, 100);
    pointLight.position.set(-10, 20, 5);
    scene.add(pointLight);
    
    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.7;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = true;
    controlsRef.current = controls;
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Animate focused elements (if needed)
      animateFocusedElements();
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };
  
  // Cleanup Three.js scene
  const cleanupScene = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    window.removeEventListener('resize', handleResize);
    
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.dispose();
    }
    
    if (sceneRef.current) {
      disposeScene(sceneRef.current);
    }
  };
  
  // Dispose scene objects
  const disposeScene = (scene) => {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };
  
  // Animate focused elements
  const animateFocusedElements = () => {
    if (!state.focusMode || !state.steps.length || !sceneRef.current) return;
    
    const step = state.steps[state.currentStepIndex];
    if (!step) return;
    
    // Get focused elements indices
    let focusedIndices = [];
    
    if (step.comparing && step.comparing.length) {
      focusedIndices = focusedIndices.concat(step.comparing);
    }
    
    if (step.swapped && step.swapped.length) {
      focusedIndices = focusedIndices.concat(step.swapped);
    }
    
    // Animate arrows if any
    animateArrows();
    
    // Make focused elements pulse
    if (focusedIndices.length && dataObjectsRef.current.length) {
      const time = Date.now() * 0.001;
      focusedIndices.forEach(index => {
        if (index >= 0 && index < dataObjectsRef.current.length) {
          const element = dataObjectsRef.current[index];
          if (element && element.scale) {
            // Apply pulse animation
            const pulseFactor = 1 + Math.sin(time * 3) * 0.05;
            element.scale.set(pulseFactor, pulseFactor, pulseFactor);
          }
        }
      });
    }
  };
  
  // Animate arrows (comparison or swap indicators)
  const animateArrows = () => {
    if (!arrowsRef.current.length) return;
    
    const time = Date.now() * 0.001;
    arrowsRef.current.forEach(arrow => {
      if (arrow) {
        // Apply pulse animation to arrows
        const pulseFactor = 1 + Math.sin(time * 2) * 0.1;
        arrow.scale.y = pulseFactor;
      }
    });
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    // Only process if not in form input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.key) {
      case ' ': // Space - play/pause
        togglePlayPause();
        event.preventDefault();
        break;
      case 'ArrowRight': // Right - step forward
        stepForward();
        event.preventDefault();
        break;
      case 'ArrowLeft': // Left - step backward
        stepBackward();
        event.preventDefault();
        break;
      case 'r': // R - reset
        resetVisualization();
        event.preventDefault();
        break;
      case 'c': // C - reset camera
        resetCamera();
        event.preventDefault();
        break;
      case 'v': // V - toggle 2D/3D view
        toggle3DView();
        event.preventDefault();
        break;
      case 'f': // F - toggle fullscreen
        toggleFullscreen();
        event.preventDefault();
        break;
    }
  };
  
  // Generate random data
  const generateRandomData = () => {
    const data = Array.from({ length: state.inputSize }, () => Math.floor(Math.random() * 100));
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Generate nearly sorted data
  const generateNearlySortedData = () => {
    const data = Array.from({ length: state.inputSize }, (_, i) => i + 1);
    
    // Swap a few elements to make it nearly sorted
    for (let i = 0; i < Math.max(1, state.inputSize / 10); i++) {
      const idx1 = Math.floor(Math.random() * state.inputSize);
      const idx2 = Math.floor(Math.random() * state.inputSize);
      [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
    }
    
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Generate reversed data
  const generateReversedData = () => {
    const data = Array.from({ length: state.inputSize }, (_, i) => state.inputSize - i);
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Parse and apply custom data
  const applyCustomData = () => {
    try {
      const rawInput = state.customInputText.trim();
      if (!rawInput) {
        throw new Error('Empty input');
      }
      
      // Try to parse as comma-separated list or space-separated list
      let data;
      if (rawInput.includes(',')) {
        data = rawInput.split(',').map(n => {
          const parsed = parseInt(n.trim());
          if (isNaN(parsed)) throw new Error('Invalid number');
          return parsed;
        });
      } else {
        data = rawInput.split(/\s+/).map(n => {
          const parsed = parseInt(n.trim());
          if (isNaN(parsed)) throw new Error('Invalid number');
          return parsed;
        });
      }
      
      if (!data.length) {
        throw new Error('No valid numbers found');
      }
      
      setState(prevState => ({ 
        ...prevState, 
        inputData: data,
        inputSize: data.length
      }));
      executeAlgorithm(data);
    } catch (error) {
      setState(prevState => ({ 
        ...prevState, 
        error: `Invalid input format: ${error.message}`
      }));
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setState(prevState => ({ ...prevState, error: null }));
      }, 3000);
    }
  };
  
  // Execute algorithm via API
  const executeAlgorithm = (data) => {
    setState(prevState => ({ 
      ...prevState, 
      loading: true,
      error: null
    }));
    
    fetch('/api/execute-algorithm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify({
        algorithm_id: state.algorithm.id,
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
      setState(prevState => ({ 
        ...prevState, 
        steps: result.steps,
        currentStepIndex: 0,
        isPlaying: false,
        loading: false
      }));
    })
    .catch(error => {
      console.error('Error executing algorithm:', error);
      setState(prevState => ({ 
        ...prevState, 
        error: `Error: ${error.message}`,
        loading: false
      }));
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setState(prevState => ({ ...prevState, error: null }));
      }, 5000);
    });
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setState(prevState => {
      const newIsPlaying = !prevState.isPlaying;
      
      if (newIsPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Start playback
        intervalRef.current = setInterval(() => {
          setState(currentState => {
            if (currentState.currentStepIndex < currentState.steps.length - 1) {
              const newIndex = currentState.currentStepIndex + 1;
              return { ...currentState, currentStepIndex: newIndex };
            } else {
              // Stop when we reach the end
              clearInterval(intervalRef.current);
              return { ...currentState, isPlaying: false };
            }
          });
        }, 2000 / prevState.playbackSpeed);
      } else {
        // Stop playback
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      return { ...prevState, isPlaying: newIsPlaying };
    });
  };
  
  // Step forward
  const stepForward = () => {
    setState(prevState => {
      // Stop if playing
      if (prevState.isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return { 
          ...prevState, 
          isPlaying: false,
          currentStepIndex: Math.min(prevState.currentStepIndex + 1, prevState.steps.length - 1)
        };
      }
      
      return {
        ...prevState,
        currentStepIndex: Math.min(prevState.currentStepIndex + 1, prevState.steps.length - 1)
      };
    });
  };
  
  // Step backward
  const stepBackward = () => {
    setState(prevState => {
      // Stop if playing
      if (prevState.isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return { 
          ...prevState, 
          isPlaying: false,
          currentStepIndex: Math.max(prevState.currentStepIndex - 1, 0)
        };
      }
      
      return {
        ...prevState,
        currentStepIndex: Math.max(prevState.currentStepIndex - 1, 0)
      };
    });
  };
  
  // Reset visualization
  const resetVisualization = () => {
    setState(prevState => {
      // Stop if playing
      if (prevState.isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      
      return {
        ...prevState,
        isPlaying: false,
        currentStepIndex: 0
      };
    });
  };
  
  // Update visualization based on current step
  const updateVisualization = () => {
    if (!sceneRef.current || state.steps.length === 0) return;
    
    // Clear previous visualization
    clearVisualization();
    
    // Get current step
    const currentStep = state.steps[state.currentStepIndex];
    
    // Create visualization for current step
    createVisualization(currentStep);
  };
  
  // Clear visualization
  const clearVisualization = () => {
    if (!sceneRef.current) return;
    
    // Remove existing visual elements
    [...dataObjectsRef.current, ...textLabelsRef.current, ...arrowsRef.current].forEach(obj => {
      if (sceneRef.current.children.includes(obj)) {
        sceneRef.current.remove(obj);
      }
      
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    dataObjectsRef.current = [];
    textLabelsRef.current = [];
    arrowsRef.current = [];
  };
  
  // Create visualization from step data
  const createVisualization = (step) => {
    if (!sceneRef.current || !step || !step.state) return;
    
    const data = step.state;
    const baseSize = state.focusMode ? 6 : 2;
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1);
    
    // Create objects for each data element
    data.forEach((value, i) => {
      // Scale height based on value
      const heightScale = Math.max(0.2, value / maxValue);
      const height = baseSize * 5 * heightScale;
      
      // Determine color based on step type
      let color = THEMES[state.colorTheme].default;
      
      if (step.comparing && step.comparing.includes(i)) {
        color = THEMES[state.colorTheme].comparison;
      } else if (step.swapped && step.swapped.includes(i)) {
        color = THEMES[state.colorTheme].swap;
      } else if (step.sorted_indices && step.sorted_indices.includes(i)) {
        color = THEMES[state.colorTheme].sorted;
      }
      
      // Create geometry based on selected shape
      let geometry;
      const shapeSize = baseSize;
      
      switch (state.visualizationShape) {
        case 'sphere':
          geometry = SHAPES.sphere(shapeSize);
          break;
        case 'cylinder':
          geometry = SHAPES.cylinder(shapeSize);
          break;
        case 'pyramid':
          geometry = SHAPES.pyramid(shapeSize);
          break;
        case 'diamond':
          geometry = SHAPES.diamond(shapeSize);
          break;
        case 'cube':
        default:
          geometry = new THREE.BoxGeometry(shapeSize, height, shapeSize);
      }
      
      // For non-cube shapes, scale to represent value
      if (state.visualizationShape !== 'cube') {
        geometry.scale(1, heightScale * 5, 1);
      }
      
      // Create material
      const material = new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        metalness: 0.5,
        roughness: 0.2,
        reflectivity: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Position mesh
      const xPos = startX + i * (baseSize + spacing);
      const yPos = state.visualizationShape === 'cube' ? height / 2 : 0;
      mesh.position.set(xPos, yPos, 0);
      
      // Add to scene
      sceneRef.current.add(mesh);
      dataObjectsRef.current[i] = mesh;
      
      // Add text label for value
      addValueLabel(value, mesh, i, height);
    });
    
    // Add operation indicators based on step type
    if (step.comparing && step.comparing.length >= 2) {
      addComparisonIndicator(step.comparing[0], step.comparing[1], data);
    }
    
    if (step.swapped && step.swapped.length >= 2) {
      addSwapIndicator(step.swapped[0], step.swapped[1], data);
    }
  };
  
  // Add value label above each element
  const addValueLabel = (value, element, index, height) => {
    if (!sceneRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Size based on focus mode
    const fontSize = state.focusMode ? 120 : 84;
    
    // Background with rounded corners
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(64, 64, 128, 128, 20);
    ctx.fill();
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, 128, 128);
    
    // Create sprite with texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // Scale and position
    const scale = state.focusMode ? 3 : 1.5;
    sprite.scale.set(scale, scale, scale);
    const labelY = element.position.y + (state.visualizationShape === 'cube' ? height + 3 : height * 0.5 + 6);
    sprite.position.set(element.position.x, labelY, 0);
    
    // Add to scene
    sceneRef.current.add(sprite);
    textLabelsRef.current.push(sprite);
  };
  
  // Add comparison indicator
  const addComparisonIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Create an arrow between the two elements
    const direction = new THREE.Vector3().subVectors(element2.position, element1.position);
    direction.normalize();
    
    const arrowLength = Math.abs(element2.position.x - element1.position.x) * 0.8;
    const origin = new THREE.Vector3(
      element1.position.x + direction.x * 2,
      element1.position.y + 8,
      element1.position.z
    );
    
    const arrowHelper = new THREE.ArrowHelper(
      direction,
      origin,
      arrowLength,
      THEMES[state.colorTheme].comparison,
      3,
      2
    );
    
    sceneRef.current.add(arrowHelper);
    arrowsRef.current.push(arrowHelper);
    
    // Add comparison text
    addOperationLabel("COMPARING", element1.position.x, element2.position.x, THEMES[state.colorTheme].comparison);
  };
  
  // Add swap indicator
  const addSwapIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Create arrows for swap
    const midX = (element1.position.x + element2.position.x) / 2;
    
    // Arrow from first to second (top path)
    const arrowTop = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0).normalize(),
      new THREE.Vector3(element1.position.x, element1.position.y + 8, element1.position.z),
      Math.abs(element2.position.x - element1.position.x) * 0.8,
      THEMES[state.colorTheme].swap,
      3,
      2
    );
    
    // Arrow from second to first (bottom path)
    const arrowBottom = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0).normalize(),
      new THREE.Vector3(element2.position.x, element2.position.y + 4, element2.position.z),
      Math.abs(element2.position.x - element1.position.x) * 0.8,
      THEMES[state.colorTheme].swap,
      3,
      2
    );
    
    sceneRef.current.add(arrowTop);
    sceneRef.current.add(arrowBottom);
    arrowsRef.current.push(arrowTop, arrowBottom);
    
    // Add swap text
    addOperationLabel("SWAPPING", element1.position.x, element2.position.x, THEMES[state.colorTheme].swap);
  };
  
  // Add operation label
  const addOperationLabel = (text, x1, x2, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // Background with rounded corners
    ctx.fillStyle = `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.8)`;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    // Create sprite with texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // Scale and position
    const scale = state.focusMode ? 8 : 5;
    sprite.scale.set(scale, scale / 4, 1);
    
    const midX = (x1 + x2) / 2;
    sprite.position.set(midX, 20, 0);
    
    // Add to scene
    sceneRef.current.add(sprite);
    textLabelsRef.current.push(sprite);
  };
  
  // Toggle play/pause
  const handlePlayPause = () => {
    togglePlayPause();
  };
  
  // Toggle 3D/2D view
  const toggle3DView = () => {
    setState(prevState => ({ ...prevState, is3DView: !prevState.is3DView }));
    
    if (cameraRef.current) {
      if (state.is3DView) {
        // Switch to 2D view
        cameraRef.current.position.set(0, 80, 0.0001);
      } else {
        // Switch to 3D view
        cameraRef.current.position.set(0, 40, 60);
      }
      cameraRef.current.lookAt(0, 0, 0);
    }
    
    updateVisualization();
  };
  
  // Reset camera
  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 40, 60);
      cameraRef.current.lookAt(0, 0, 0);
      
      if (controlsRef.current && typeof controlsRef.current.reset === 'function') {
        controlsRef.current.reset();
      }
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setState(prevState => ({ ...prevState, isFullscreen: !prevState.isFullscreen }));
    
    // Update camera aspect ratio after toggling fullscreen
    setTimeout(handleResize, 100);
  };
  
  // Update playback speed
  const updatePlaybackSpeed = (e) => {
    const speed = parseInt(e.target.value);
    setState(prevState => {
      if (prevState.isPlaying) {
        // Update interval if playing
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          setState(currentState => {
            if (currentState.currentStepIndex < currentState.steps.length - 1) {
              return { ...currentState, currentStepIndex: currentState.currentStepIndex + 1 };
            } else {
              // Stop when we reach the end
              clearInterval(intervalRef.current);
              return { ...currentState, isPlaying: false };
            }
          });
        }, 2000 / speed);
      }
      
      return { ...prevState, playbackSpeed: speed };
    });
  };
  
  // Change shape
  const changeShape = (shape) => {
    setState(prevState => ({ ...prevState, visualizationShape: shape }));
    updateVisualization();
  };
  
  // Change color theme
  const changeTheme = (theme) => {
    setState(prevState => ({ ...prevState, colorTheme: theme }));
    
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(THEMES[theme].background);
    }
    
    updateVisualization();
  };
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setState(prevState => ({ ...prevState, focusMode: !prevState.focusMode }));
    updateVisualization();
  };
  
  // Toggle code view
  const toggleCodeView = () => {
    setState(prevState => ({ ...prevState, showCode: !prevState.showCode }));
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setState(prevState => ({ ...prevState, showSettings: !prevState.showSettings }));
  };
  
  // Update input size
  const updateInputSize = (e) => {
    const size = parseInt(e.target.value);
    setState(prevState => ({ ...prevState, inputSize: size }));
  };
  
  // Handle custom input change
  const handleCustomInputChange = (e) => {
    setState(prevState => ({ ...prevState, customInputText: e.target.value }));
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (state.steps.length === 0) return 0;
    return (state.currentStepIndex / (state.steps.length - 1)) * 100;
  };
  
  // Get current step
  const getCurrentStep = () => {
    if (state.steps.length === 0) {
      return { description: 'No steps available', educational_note: '' };
    }
    
    return state.steps[state.currentStepIndex];
  };
  
  // Render component
  return (
    <div className={`visualization-container ${state.isFullscreen ? 'fullscreen' : ''}`}>
      <div className="visualization-header">
        <h2>{state.algorithm.name}</h2>
        <div className="visualization-controls-top">
          <button 
            className="control-button" 
            onClick={toggleFullscreen}
            title={state.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {state.isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button 
            className="control-button" 
            onClick={toggleSettings}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            className="control-button" 
            onClick={toggleCodeView}
            title="View Code"
          >
            <Code className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="visualization-main">
        <div 
          className={`visualization-sidebar-left ${state.showSettings ? 'open' : 'closed'}`}
        >
          {state.showSettings && (
            <div className="settings-panel">
              <div className="settings-header">
                <h3>Visualization Settings</h3>
                <button 
                  className="close-button" 
                  onClick={toggleSettings}
                  title="Close Settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="settings-section">
                <h4>Shape</h4>
                <div className="shape-selector">
                  <button 
                    className={`shape-option ${state.visualizationShape === 'cube' ? 'active' : ''}`}
                    onClick={() => changeShape('cube')}
                    title="Cube"
                  >
                    □
                  </button>
                  <button 
                    className={`shape-option ${state.visualizationShape === 'sphere' ? 'active' : ''}`}
                    onClick={() => changeShape('sphere')}
                    title="Sphere"
                  >
                    ○
                  </button>
                  <button 
                    className={`shape-option ${state.visualizationShape === 'cylinder' ? 'active' : ''}`}
                    onClick={() => changeShape('cylinder')}
                    title="Cylinder"
                  >
                    ⊙
                  </button>
                  <button 
                    className={`shape-option ${state.visualizationShape === 'pyramid' ? 'active' : ''}`}
                    onClick={() => changeShape('pyramid')}
                    title="Pyramid"
                  >
                    △
                  </button>
                  <button 
                    className={`shape-option ${state.visualizationShape === 'diamond' ? 'active' : ''}`}
                    onClick={() => changeShape('diamond')}
                    title="Diamond"
                  >
                    ◆
                  </button>
                </div>
              </div>
              
              <div className="settings-section">
                <h4>Theme</h4>
                <div className="theme-selector">
                  <button 
                    className={`theme-option theme-blue ${state.colorTheme === 'blue' ? 'active' : ''}`}
                    onClick={() => changeTheme('blue')}
                    title="Blue Theme"
                  />
                  <button 
                    className={`theme-option theme-green ${state.colorTheme === 'green' ? 'active' : ''}`}
                    onClick={() => changeTheme('green')}
                    title="Green Theme"
                  />
                  <button 
                    className={`theme-option theme-purple ${state.colorTheme === 'purple' ? 'active' : ''}`}
                    onClick={() => changeTheme('purple')}
                    title="Purple Theme"
                  />
                  <button 
                    className={`theme-option theme-dark ${state.colorTheme === 'dark' ? 'active' : ''}`}
                    onClick={() => changeTheme('dark')}
                    title="Dark Theme"
                  />
                </div>
              </div>
              
              <div className="settings-section">
                <h4>Input Data</h4>
                <div className="input-size">
                  <label>Size: {state.inputSize}</label>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    value={state.inputSize} 
                    onChange={updateInputSize} 
                  />
                </div>
                <div className="data-buttons">
                  <button onClick={generateRandomData}>Random</button>
                  <button onClick={generateNearlySortedData}>Nearly Sorted</button>
                  <button onClick={generateReversedData}>Reversed</button>
                </div>
                <div className="custom-input">
                  <label>Custom Input:</label>
                  <div className="custom-input-row">
                    <input 
                      type="text" 
                      value={state.customInputText}
                      onChange={handleCustomInputChange}
                      placeholder="E.g. 5,3,1,4,2" 
                    />
                    <button onClick={applyCustomData}>Apply</button>
                  </div>
                  {state.error && (
                    <div className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      <span>{state.error}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="settings-section">
                <h4>Display Options</h4>
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.focusMode} 
                      onChange={toggleFocusMode} 
                    />
                    Focus Mode
                  </label>
                </div>
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.is3DView} 
                      onChange={toggle3DView} 
                    />
                    3D View
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="visualization-canvas-container">
          <div 
            className="visualization-canvas" 
            ref={canvasRef}
          />
          
          {state.focusMode && state.steps.length > 0 && (
            <div className="focus-description">
              <h3>{getCurrentStep().description}</h3>
              <p>{getCurrentStep().educational_note}</p>
            </div>
          )}
          
          {state.loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Processing algorithm...</p>
            </div>
          )}
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          
          <div className="controls-container">
            <div className="playback-controls">
              <button 
                className="control-button reset" 
                onClick={resetVisualization}
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                className="control-button" 
                onClick={stepBackward}
                title="Step Backward"
                disabled={state.currentStepIndex === 0}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                className="control-button play-pause" 
                onClick={handlePlayPause}
                title={state.isPlaying ? "Pause" : "Play"}
              >
                {state.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button 
                className="control-button" 
                onClick={stepForward}
                title="Step Forward"
                disabled={state.currentStepIndex === state.steps.length - 1}
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="speed-control">
                <label>Speed: {state.playbackSpeed}x</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={state.playbackSpeed} 
                  onChange={updatePlaybackSpeed} 
                />
              </div>
            </div>
            
            <div className="view-controls">
              <button 
                className="control-button" 
                onClick={resetCamera}
                title="Reset Camera"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button 
                className="control-button" 
                onClick={toggle3DView}
                title={state.is3DView ? "2D View" : "3D View"}
              >
                {state.is3DView ? <Layers className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className={`visualization-sidebar-right ${state.showCode ? 'open' : 'closed'}`}>
          {state.showCode && (
            <div className="code-panel">
              <div className="code-header">
                <h3>Algorithm Code</h3>
                <button 
                  className="close-button" 
                  onClick={toggleCodeView}
                  title="Close Code View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <pre className="code-block">
                {state.algorithm.code_implementation || `function ${state.algorithm.name.replace(/\s/g, '')}(arr) {
  // Algorithm implementation not available
}`}
              </pre>
            </div>
          )}
          
          <div className="step-info-panel">
            <div className="step-counter">
              Step {state.currentStepIndex + 1} of {state.steps.length}
            </div>
            
            <div className="step-description">
              <h3>{getCurrentStep().description}</h3>
              <p>{getCurrentStep().educational_note}</p>
            </div>
            
            <div className="algorithm-info">
              <div className="info-row">
                <span className="info-label">Time Complexity:</span>
                <span className="info-value">{state.algorithm.timeComplexity}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Space Complexity:</span>
                <span className="info-value">{state.algorithm.spaceComplexity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .visualization-container {
          display: flex;
          flex-direction: column;
          height: 700px;
          background-color: ${THEMES[state.colorTheme].background};
          color: ${THEMES[state.colorTheme].text};
          border-radius: 8px;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
        }
        
        .visualization-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border-radius: 0;
          height: 100vh;
        }
        
        .visualization-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .visualization-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        
        .visualization-controls-top {
          display: flex;
          gap: 0.5rem;
        }
        
        .visualization-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .visualization-sidebar-left {
          width: 0;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(0, 0, 0, 0.2);
          transition: width 0.3s ease;
        }
        
        .visualization-sidebar-left.open {
          width: 250px;
        }
        
        .visualization-sidebar-right {
          width: 0;
          overflow: hidden;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(0, 0, 0, 0.2);
          transition: width 0.3s ease;
        }
        
        .visualization-sidebar-right.open {
          width: 300px;
        }
        
        .visualization-canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .visualization-canvas {
          flex: 1;
          width: 100%;
          position: relative;
        }
        
        .controls-container {
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .playback-controls, .view-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .control-button {
          background-color: rgba(66, 133, 244, 0.2);
          border: 1px solid rgba(66, 133, 244, 0.5);
          color: white;
          border-radius: 4px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .control-button:hover {
          background-color: rgba(66, 133, 244, 0.3);
          transform: translateY(-2px);
        }
        
        .control-button:active {
          transform: translateY(0);
        }
        
        .control-button.play-pause {
          width: 48px;
          height: 48px;
          background-color: rgba(66, 133, 244, 0.4);
        }
        
        .control-button.reset {
          background-color: rgba(234, 67, 53, 0.2);
          border-color: rgba(234, 67, 53, 0.5);
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .speed-control {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-left: 0.5rem;
        }
        
        .speed-control label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .speed-control input {
          width: 100px;
        }
        
        .focus-description {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 8px;
          padding: 1rem;
          max-width: 80%;
          border: 1px solid rgba(66, 133, 244, 0.5);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }
        
        .focus-description h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: #64b5f6;
        }
        
        .focus-description p {
          margin: 0;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .progress-bar {
          height: 4px;
          background-color: rgba(255, 255, 255, 0.1);
          width: 100%;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #64b5f6;
          transition: width 0.3s ease;
        }
        
        .settings-panel {
          padding: 1rem;
          height: 100%;
          overflow-y: auto;
        }
        
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }
        
        .settings-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .close-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .settings-section {
          margin-bottom: 1.5rem;
        }
        
        .settings-section h4 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .shape-selector, .theme-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .shape-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.2s;
        }
        
        .shape-option:hover {
          background-color: rgba(66, 133, 244, 0.2);
          transform: translateY(-2px);
        }
        
        .shape-option.active {
          background-color: rgba(66, 133, 244, 0.3);
          border-color: #64b5f6;
        }
        
        .theme-option {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .theme-option:hover {
          transform: scale(1.1);
        }
        
        .theme-option.active {
          border-color: white;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.5);
        }
        
        .theme-blue {
          background: linear-gradient(135deg, #4285F4, #64b5f6);
        }
        
        .theme-green {
          background: linear-gradient(135deg, #34A853, #81c784);
        }
        
        .theme-purple {
          background: linear-gradient(135deg, #AA46BC, #ba68c8);
        }
        
        .theme-dark {
          background: linear-gradient(135deg, #202124, #424242);
        }
        
        .data-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .data-buttons button {
          background-color: rgba(66, 133, 244, 0.2);
          border: 1px solid rgba(66, 133, 244, 0.5);
          color: white;
          border-radius: 4px;
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .data-buttons button:hover {
          background-color: rgba(66, 133, 244, 0.3);
        }
        
        .input-size {
          margin-bottom: 0.5rem;
        }
        
        .input-size label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }
        
        .custom-input {
          margin-top: 0.5rem;
        }
        
        .custom-input label {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }
        
        .custom-input-row {
          display: flex;
          gap: 0.5rem;
        }
        
        .custom-input input {
          flex: 1;
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
        }
        
        .custom-input input:focus {
          outline: none;
          border-color: rgba(66, 133, 244, 0.5);
        }
        
        .custom-input button {
          background-color: rgba(66, 133, 244, 0.3);
          border: 1px solid rgba(66, 133, 244, 0.5);
          color: white;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .custom-input button:hover {
          background-color: rgba(66, 133, 244, 0.4);
        }
        
        .error-message {
          margin-top: 0.5rem;
          color: #ff5252;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background-color: rgba(255, 82, 82, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 82, 82, 0.3);
        }
        
        .toggle-option {
          margin-bottom: 0.5rem;
        }
        
        .toggle-option label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .code-panel {
          padding: 1rem;
          height: 100%;
          overflow-y: auto;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0.5rem;
        }
        
        .code-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .code-block {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          max-height: 300px;
          overflow-y: auto;
          white-space: pre;
        }
        
        .step-info-panel {
          padding: 1rem;
        }
        
        .step-counter {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }
        
        .step-description {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .step-description h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: #64b5f6;
        }
        
        .step-description p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .algorithm-info {
          font-size: 0.9rem;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .info-label {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 20;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Media queries for responsive design */
        @media (max-width: 900px) {
          .visualization-main {
            flex-direction: column;
          }
          
          .visualization-sidebar-left.open,
          .visualization-sidebar-right.open {
            width: 100%;
            max-height: 300px;
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .visualization-canvas-container {
            min-height: 400px;
          }
          
          .controls-container {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VisualizationPlayer;