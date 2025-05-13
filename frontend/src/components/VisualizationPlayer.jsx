import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Maximize, Minimize, Eye, Layers, Sliders, Settings, 
  Code, Info, X, AlertCircle
} from 'lucide-react';

// Import the external CSS file - this avoids JSX template string errors
import './VisualizationStyles.css';

// Enhanced shape geometries with better visual details
const SHAPES = {
  cube: (size) => new THREE.BoxGeometry(size, size, size),
  sphere: (size) => new THREE.SphereGeometry(size * 0.6, 32, 32), // Increased segments
  cylinder: (size) => new THREE.CylinderGeometry(size * 0.5, size * 0.5, size, 32), // Smoother cylinder
  pyramid: (size) => new THREE.ConeGeometry(size * 0.7, size, 4, 2), // More detailed pyramid
  diamond: (size) => new THREE.OctahedronGeometry(size * 0.7, 2), // Higher detail diamond
  torus: (size) => new THREE.TorusGeometry(size * 0.4, size * 0.2, 16, 32) // New shape option
};

// Enhanced color themes with better contrasts and accents
const THEMES = {
  blue: {
    default: 0x4285F4,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x34A853,
    selected: 0xAA46BC,
    background: '#061023', // Darker for better contrast
    surface: '#0a1929',
    accent: '#64b5f6',
    text: '#ffffff'
  },
  green: {
    default: 0x34A853,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x4285F4,
    selected: 0xAA46BC,
    background: '#051a15',
    surface: '#0a291c',
    accent: '#81c784',
    text: '#ffffff'
  },
  purple: {
    default: 0xAA46BC,
    comparison: 0xEA4335,
    swap: 0xFBBC05,
    sorted: 0x34A853,
    selected: 0x4285F4,
    background: '#130a29',
    surface: '#1a0a29',
    accent: '#ba68c8',
    text: '#ffffff'
  },
  dark: {
    default: 0x607D8B,
    comparison: 0xFF5252,
    swap: 0xFFB300,
    sorted: 0x66BB6A,
    selected: 0x448AFF,
    background: '#0a0a0a',
    surface: '#121212',
    accent: '#90caf9',
    text: '#ffffff'
  }
};

// Simple vertex shader for glow effect
const glowVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Simple fragment shader for glow effect
const glowFragmentShader = `
  uniform vec3 color;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(color, 1.0) * intensity;
  }
`;

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
    customInputText: '',
    // Focused elements for limiting visualization to important elements
    focusedElements: []
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
  const particleSystemRef = useRef(null);
  const backgroundPlaneRef = useRef(null);
  
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
  
  // Setup Three.js scene with enhanced visuals
  const setupScene = () => {
    // Create scene
    const scene = new THREE.Scene();
    
    // Set background color based on theme
    scene.background = new THREE.Color(THEMES[state.colorTheme].background);
    sceneRef.current = scene;
    
    // Create enhanced background with particles and subtle grid
    createEnhancedBackground();
    
    // Add camera with better positioning
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 40, 60);
    cameraRef.current = camera;
    
    // Add renderer with better quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add enhanced lighting
    setupLighting();
    
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
      
      // Animate particle system
      animateParticles();
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
  };
  
  // Create enhanced background with particles
  const createEnhancedBackground = () => {
    if (!sceneRef.current) return;
    
    // Create a subtle grid as the floor
    const gridHelper = new THREE.GridHelper(100, 50, 0x304FFE, 0x1A237E);
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -5;
    sceneRef.current.add(gridHelper);
    
    // Add a subtle base plane for shadow casting
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: THEMES[state.colorTheme].surface,
      transparent: true,
      opacity: 0.3,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -5;
    plane.receiveShadow = true;
    sceneRef.current.add(plane);
    backgroundPlaneRef.current = plane;
    
    // Add particle system for ambient background detail
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Create a spherical distribution
      const radius = 30 + Math.random() * 70;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i+1] = radius * Math.sin(phi) * Math.sin(theta) - 10; // Lowered to be mostly below view
      posArray[i+2] = radius * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create a point material with custom texture for better particles
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.4,
      color: new THREE.Color(THEMES[state.colorTheme].accent),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    sceneRef.current.add(particleSystem);
    particleSystemRef.current = particleSystem;
  };
  
  // Setup enhanced lighting
  const setupLighting = () => {
    if (!sceneRef.current) return;
    
    // Main ambient light
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    sceneRef.current.add(ambientLight);
    
    // Primary directional light with shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
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
    sceneRef.current.add(mainLight);
    
    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x9090ff, 0.5);
    fillLight.position.set(-10, 20, -15);
    sceneRef.current.add(fillLight);
    
    // Accent point light
    const accentLight = new THREE.PointLight(
      new THREE.Color(THEMES[state.colorTheme].accent),
      0.8,
      100
    );
    accentLight.position.set(-10, 20, 5);
    sceneRef.current.add(accentLight);
    
    // Add a subtle spotight for focus
    const spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(0, 50, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 1;
    spotLight.distance = 200;
    spotLight.castShadow = true;
    sceneRef.current.add(spotLight);
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
  
  // Animate particles for dynamic background
  const animateParticles = () => {
    if (particleSystemRef.current) {
      const time = Date.now() * 0.0001;
      particleSystemRef.current.rotation.y = time * 0.1;
      
      // Subtle pulsing effect
      const scale = 1 + 0.05 * Math.sin(time * 2);
      particleSystemRef.current.material.size = 0.4 * scale;
    }
  };
  
  // Animate focused elements
  const animateFocusedElements = () => {
    if (!state.focusMode || !state.steps.length || !sceneRef.current) return;
    
    const step = state.steps[state.currentStepIndex];
    if (!step) return;
    
    // Get focused elements indices
    let focusedIndices = state.focusedElements;
    
    // If no specific focused elements, determine from step type
    if (focusedIndices.length === 0) {
      if (step.comparing && step.comparing.length) {
        focusedIndices = [...step.comparing];
      }
      
      if (step.swapped && step.swapped.length) {
        focusedIndices = [...step.swapped];
      }
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
            const pulseFactor = 1 + Math.sin(time * 3) * 0.08;
            element.scale.set(pulseFactor, pulseFactor, pulseFactor);
            
            // Rotate slightly for more dynamic effect
            element.rotation.y = Math.sin(time * 2) * 0.2;
          }
        }
      });
    }
  };
  
  // Animate arrows with enhanced effects
  const animateArrows = () => {
    if (!arrowsRef.current.length) return;
    
    const time = Date.now() * 0.001;
    arrowsRef.current.forEach(arrow => {
      if (arrow) {
        // Apply pulse animation to arrows
        const pulseFactor = 1 + Math.sin(time * 2) * 0.15;
        
        // Apply different animations based on arrow type
        if (arrow.userData && arrow.userData.type === 'comparison') {
          arrow.scale.y = pulseFactor;
          
          // Pulse opacity for comparison arrows
          if (arrow.material) {
            arrow.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
          }
        } else if (arrow.userData && arrow.userData.type === 'swap') {
          // For swap arrows, apply a flowing animation
          arrow.scale.y = pulseFactor;
          arrow.scale.x = 1 + Math.sin(time * 2.5) * 0.1;
        }
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
    
    // Get current step and determine focused elements
    const currentStep = state.steps[state.currentStepIndex];
    const focusedElements = determineFocusedElements(currentStep);
    
    // Update state with focused elements
    setState(prevState => ({
      ...prevState,
      focusedElements: focusedElements
    }));
    
    // Create visualization for current step
    createVisualization(currentStep, focusedElements);
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
  
  // Determine focused elements based on step type
  const determineFocusedElements = (step) => {
    let focusedElements = [];
    
    if (!step) return focusedElements;
    
    // Determine focused elements based on step type
    if (step.comparing && step.comparing.length) {
      focusedElements = [...step.comparing];
    }
    
    if (step.swapped && step.swapped.length) {
      // Add swap elements without duplicates
      step.swapped.forEach(idx => {
        if (!focusedElements.includes(idx)) {
          focusedElements.push(idx);
        }
      });
    }
    
    // If specific focus is mentioned in the step
    if (step.current_focus && Array.isArray(step.current_focus)) {
      focusedElements = [...step.current_focus];
    }
    
    // If in initial state, focus on everything
    if (step.type === 'initial' || step.type === 'final') {
      const data = step.state || [];
      focusedElements = Array.from({ length: data.length }, (_, i) => i);
    }
    
    return focusedElements;
  };
  
  // Create visualization from step data
  const createVisualization = (step, focusedIndices) => {
    if (!sceneRef.current || !step || !step.state) return;
    
    const data = step.state;
    const baseSize = state.focusMode ? 6 : 2;
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1);
    
    // If in focus mode and not initial/final step, show only focused elements
    // otherwise show all elements with focused ones highlighted
    const elementsToRender = state.focusMode && 
                            step.type !== 'initial' && 
                            step.type !== 'final' && 
                            focusedIndices.length > 0 ?
                            [...focusedIndices] : // Only focused elements
                            [...Array(data.length).keys()]; // All elements
    
    // Create objects for each data element
    elementsToRender.forEach((i) => {
      const value = data[i];
      
      // Don't attempt to render undefined elements
      if (value === undefined) return;
      
      // Scale height based on value
      const heightScale = Math.max(0.2, value / maxValue);
      const height = baseSize * 5 * heightScale;
      
      // Determine color based on step type
      let color = getElementColor(i, step, data.length);
      
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
        case 'torus':
          geometry = SHAPES.torus(shapeSize);
          break;
        case 'cube':
        default:
          geometry = new THREE.BoxGeometry(shapeSize, height, shapeSize);
      }
      
      // For non-cube shapes, scale to represent value
      if (state.visualizationShape !== 'cube') {
        geometry.scale(1, heightScale * 5, 1);
      }
      
      // Create material with enhanced visual appeal
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: focusedIndices.includes(i) ? 1.0 : 0.8,
        metalness: 0.8,
        roughness: 0.2,
        reflectivity: 0.7,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        emissive: focusedIndices.includes(i) ? color : 0x000000,
        emissiveIntensity: focusedIndices.includes(i) ? 0.2 : 0
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
      addValueLabel(value, mesh, i, height, focusedIndices.includes(i));
      
      // Add glow effect for focused elements
      if (focusedIndices.includes(i)) {
        addGlowEffect(mesh, color);
      }
    });
    
    // Add operation indicators based on step type
    if (step.comparing && step.comparing.length >= 2) {
      addComparisonIndicator(step.comparing[0], step.comparing[1], data);
    }
    
    if (step.swapped && step.swapped.length >= 2) {
      addSwapIndicator(step.swapped[0], step.swapped[1], data);
    }
  };
  
  // Add glow effect to focused elements
  const addGlowEffect = (mesh, color) => {
    if (!mesh) return;
    
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) }
      },
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    
    // Create a slightly larger mesh for the glow effect
    const glowMesh = new THREE.Mesh(
      mesh.geometry.clone(),
      glowMaterial
    );
    
    // Scale it slightly larger than the original mesh
    glowMesh.scale.multiplyScalar(1.2);
    mesh.add(glowMesh);
  };
  
  // Add value label above each element
  const addValueLabel = (value, element, index, height, isFocused) => {
    if (!element) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Size based on focus mode
    const fontSize = isFocused ? 120 : 84;
    
    // Background with rounded corners
    ctx.fillStyle = isFocused ? 'rgba(30, 60, 100, 0.8)' : 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(64, 64, 128, 128, 20);
    ctx.fill();
    
    // Add subtle border for focused elements
    if (isFocused) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.roundRect(64, 64, 128, 128, 20);
      ctx.stroke();
    }
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, 128, 128);
    
    // Create sprite with texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: isFocused ? 1.0 : 0.7
    });
    const sprite = new THREE.Sprite(material);
    
    // Scale and position
    const scale = isFocused ? 3 : 2;
    sprite.scale.set(scale, scale, scale);
    const labelY = element.position.y + (state.visualizationShape === 'cube' ? height + 3 : height * 0.5 + 6);
    sprite.position.set(element.position.x, labelY, 0);
    
    // Add to scene
    sceneRef.current.add(sprite);
    textLabelsRef.current.push(sprite);
  };
  
  // Add comparison indicator with enhanced styling
  const addComparisonIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Create an improved arrow between the two elements
    // Using a curve for more visual appeal
    const curvePoints = [];
    const segments = 20;
    const midX = (element1.position.x + element2.position.x) / 2;
    const peakY = Math.max(element1.position.y, element2.position.y) + 12;
    
    // Create a curved path for the arrow
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(element1.position.x, element2.position.x, t);
      
      // Quadratic curve formula
      const y = THREE.MathUtils.lerp(
        element1.position.y, 
        element2.position.y, 
        t
      ) + Math.sin(t * Math.PI) * 8; // Arch height
      
      curvePoints.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.4, 8, false);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: THEMES[state.colorTheme].comparison,
      emissive: THEMES[state.colorTheme].comparison,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.userData = { type: 'comparison' };
    
    sceneRef.current.add(tube);
    arrowsRef.current.push(tube);
    
    // Add arrowhead at the end
    const arrowHeadGeometry = new THREE.ConeGeometry(1, 2, 8);
    const arrowHeadMaterial = new THREE.MeshPhysicalMaterial({
      color: THEMES[state.colorTheme].comparison,
      emissive: THEMES[state.colorTheme].comparison,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
    
    // Position at the end of the curve
    const endPoint = curve.getPointAt(1);
    const tangent = curve.getTangentAt(1).normalize();
    
    arrowHead.position.copy(endPoint);
    
    // Orient the arrowhead along the curve
    const axis = new THREE.Vector3(0, 1, 0);
    arrowHead.quaternion.setFromUnitVectors(axis, tangent);
    arrowHead.rotateX(Math.PI / 2); // Adjust as needed
    
    sceneRef.current.add(arrowHead);
    arrowsRef.current.push(arrowHead);
    
    // Add comparison text
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    // Create a background with a gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    const hexColor = THEMES[state.colorTheme].comparison;
    const r = (hexColor >> 16) & 255;
    const g = (hexColor >> 8) & 255;
    const b = hexColor & 255;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.85)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Add border glow effect
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.7)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('COMPARING', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    const textScale = state.focusMode ? 8 : 4;
    textSprite.scale.set(textScale, textScale / 4, 1);
    textSprite.position.set(midX, peakY + 6, 0);
    sceneRef.current.add(textSprite);
    textLabelsRef.current.push(textSprite);
    
    // Add specific comparison text
    const compTextCanvas = document.createElement('canvas');
    const compCtx = compTextCanvas.getContext('2d');
    compTextCanvas.width = 512;
    compTextCanvas.height = 128;
    
    // Create background
    compCtx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    compCtx.beginPath();
    compCtx.roundRect(0, 0, 512, 128, 16);
    compCtx.fill();
    
    // Add border
    compCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    compCtx.lineWidth = 4;
    compCtx.roundRect(0, 0, 512, 128, 16);
    compCtx.stroke();
    
    // Add text
    compCtx.fillStyle = 'white';
    compCtx.font = 'bold 48px Arial, sans-serif';
    compCtx.textAlign = 'center';
    compCtx.textBaseline = 'middle';
    
    // Get the comparison values
    const value1 = data[index1];
    const value2 = data[index2];
    const compareSymbol = value1 > value2 ? '>' : (value1 < value2 ? '<' : '=');
    
    compCtx.fillText(`${value1} ${compareSymbol} ${value2}`, 256, 64);
    
    const compTextTexture = new THREE.CanvasTexture(compTextCanvas);
    const compTextMaterial = new THREE.SpriteMaterial({ map: compTextTexture });
    const compTextSprite = new THREE.Sprite(compTextMaterial);
    compTextSprite.scale.set(textScale, textScale / 4, 1);
    compTextSprite.position.set(midX, peakY + 12, 0);
    sceneRef.current.add(compTextSprite);
    textLabelsRef.current.push(compTextSprite);
  };
  
  // Add swap indicator with enhanced styling
  const addSwapIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Create curved swap arrows for better visual appeal
    const midX = (element1.position.x + element2.position.x) / 2;
    const element1Y = element1.position.y;
    const element2Y = element2.position.y;
    
    // First curve: element1 to element2 (upper curve)
    const curve1Points = [];
    const segments = 20;
    const upperPeakY = Math.max(element1Y, element2Y) + 10;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(element1.position.x, element2.position.x, t);
      
      // Quadratic curve formula for upper path
      const y = THREE.MathUtils.lerp(element1Y, element2Y, t) + 
                Math.sin(t * Math.PI) * 8; // Arch height
      
      curve1Points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve1 = new THREE.CatmullRomCurve3(curve1Points);
    const tube1Geometry = new THREE.TubeGeometry(curve1, 20, 0.4, 8, false);
    const tube1Material = new THREE.MeshPhysicalMaterial({
      color: THEMES[state.colorTheme].swap,
      emissive: THEMES[state.colorTheme].swap,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const tube1 = new THREE.Mesh(tube1Geometry, tube1Material);
    tube1.userData = { type: 'swap' };
    
    sceneRef.current.add(tube1);
    arrowsRef.current.push(tube1);
    
    // Second curve: element2 to element1 (lower curve)
    const curve2Points = [];
    const lowerPeakY = Math.min(element1Y, element2Y) - 6;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(element2.position.x, element1.position.x, t);
      
      // Quadratic curve formula for lower path
      const y = THREE.MathUtils.lerp(element2Y, element1Y, t) - 
                Math.sin(t * Math.PI) * 6; // Downward arch height
      
      curve2Points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve2 = new THREE.CatmullRomCurve3(curve2Points);
    const tube2Geometry = new THREE.TubeGeometry(curve2, 20, 0.4, 8, false);
    const tube2Material = new THREE.MeshPhysicalMaterial({
      color: THEMES[state.colorTheme].swap,
      emissive: THEMES[state.colorTheme].swap,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const tube2 = new THREE.Mesh(tube2Geometry, tube2Material);
    tube2.userData = { type: 'swap' };
    
    sceneRef.current.add(tube2);
    arrowsRef.current.push(tube2);
    
    // Add arrowheads at the ends of both curves
    const addArrowHead = (curve, isEndPoint) => {
      const arrowHeadGeometry = new THREE.ConeGeometry(1, 2, 8);
      const arrowHeadMaterial = new THREE.MeshPhysicalMaterial({
        color: THEMES[state.colorTheme].swap,
        emissive: THEMES[state.colorTheme].swap,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
      
      // Position at the end of the curve
      const point = curve.getPointAt(isEndPoint ? 1 : 0);
      const tangent = curve.getTangentAt(isEndPoint ? 1 : 0).normalize();
      
      arrowHead.position.copy(point);
      
      // Orient the arrowhead along the curve
      const axis = new THREE.Vector3(0, 1, 0);
      arrowHead.quaternion.setFromUnitVectors(axis, tangent);
      
      // Adjust rotation based on direction
      if (isEndPoint) {
        arrowHead.rotateX(Math.PI / 2);
      } else {
        arrowHead.rotateX(-Math.PI / 2);
      }
      
      sceneRef.current.add(arrowHead);
      arrowsRef.current.push(arrowHead);
    };
    
    // Add arrowheads to both curves
    addArrowHead(curve1, true);
    addArrowHead(curve2, true);
    
    // Add swap text
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    // Create a background with a gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    const hexColor = THEMES[state.colorTheme].swap;
    const r = (hexColor >> 16) & 255;
    const g = (hexColor >> 8) & 255;
    const b = hexColor & 255;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.85)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Add border glow effect
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.7)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAPPING', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    const textScale = state.focusMode ? 8 : 4;
    textSprite.scale.set(textScale, textScale / 4, 1);
    textSprite.position.set(midX, upperPeakY + 6, 0);
    sceneRef.current.add(textSprite);
    textLabelsRef.current.push(textSprite);
    
    // Add specific swap text showing values
    const swapTextCanvas = document.createElement('canvas');
    const swapCtx = swapTextCanvas.getContext('2d');
    swapTextCanvas.width = 512;
    swapTextCanvas.height = 128;
    
    // Create background
    swapCtx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    swapCtx.beginPath();
    swapCtx.roundRect(0, 0, 512, 128, 16);
    swapCtx.fill();
    
    // Add border
    swapCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    swapCtx.lineWidth = 4;
    swapCtx.roundRect(0, 0, 512, 128, 16);
    swapCtx.stroke();
    
    // Add text
    swapCtx.fillStyle = 'white';
    swapCtx.font = 'bold 48px Arial, sans-serif';
    swapCtx.textAlign = 'center';
    swapCtx.textBaseline = 'middle';
    swapCtx.fillText(`${data[index1]} ⟷ ${data[index2]}`, 256, 64);
    
    const swapTextTexture = new THREE.CanvasTexture(swapTextCanvas);
    const swapTextMaterial = new THREE.SpriteMaterial({ map: swapTextTexture });
    const swapTextSprite = new THREE.Sprite(swapTextMaterial);
    swapTextSprite.scale.set(textScale, textScale / 4, 1);
    swapTextSprite.position.set(midX, upperPeakY + 15, 0);
    sceneRef.current.add(swapTextSprite);
    textLabelsRef.current.push(swapTextSprite);
  };
  
  // Helper function to get element color based on its role
  const getElementColor = (index, step, totalElements) => {
    // Get theme colors
    const colors = THEMES[state.colorTheme];
    
    // Determine color based on operation type
    if (step.comparing && step.comparing.includes(index)) {
      return colors.comparison;
    } else if (step.swapped && step.swapped.includes(index)) {
      return colors.swap;
    } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
      return colors.sorted;
    } else if (step.selected && step.selected.includes(index)) {
      return colors.selected;
    } else if (step.min_idx === index) {
      return colors.selected;
    } else if (step.highlighted && step.highlighted.includes(index)) {
      return colors.selected;
    } else {
      return colors.default;
    }
  };
  
  // Toggle play/pause with enhanced animation
  const handlePlayPause = () => {
    togglePlayPause();
  };
  
  // Toggle 2D/3D view with smooth transition
  const toggle3DView = () => {
    setState(prevState => ({ ...prevState, is3DView: !prevState.is3DView }));
    
    if (cameraRef.current) {
      // Create a smoother animation between views
      const startPosition = cameraRef.current.position.clone();
      const endPosition = state.is3DView ? 
        new THREE.Vector3(0, 80, 0.0001) : // 2D view position
        new THREE.Vector3(0, 40, 60);      // 3D view position
      
      const duration = 1000; // milliseconds
      const startTime = Date.now();
      
      function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smoother transition
        const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
        
        // Interpolate position
        cameraRef.current.position.lerpVectors(startPosition, endPosition, easeProgress);
        
        // Look at center
        cameraRef.current.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          // Final position
          cameraRef.current.position.copy(endPosition);
          cameraRef.current.lookAt(0, 0, 0);
          
          // Update visualization
          updateVisualization();
        }
      }
      
      animateCamera();
    }
  };
  
  // Reset camera with animation
  const resetCamera = () => {
    if (!cameraRef.current) return;
    
    // Animate camera reset for better UX
    const startPosition = cameraRef.current.position.clone();
    const endPosition = new THREE.Vector3(0, 40, 60);
    
    const duration = 800; // milliseconds
    const startTime = Date.now();
    
    function animateReset() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
      
      // Interpolate position
      cameraRef.current.position.lerpVectors(startPosition, endPosition, easeProgress);
      
      // Look at center
      cameraRef.current.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      } else {
        // Final reset
        cameraRef.current.position.copy(endPosition);
        cameraRef.current.lookAt(0, 0, 0);
        
        if (controlsRef.current && typeof controlsRef.current.reset === 'function') {
          controlsRef.current.reset();
        }
      }
    }
    
    animateReset();
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setState(prevState => ({ ...prevState, isFullscreen: !prevState.isFullscreen }));
    
    // Update camera aspect ratio after toggling fullscreen
    setTimeout(handleResize, 100);
  };
  
  // Update playback speed with visual feedback
  const updateSpeed = (e) => {
    if (!e.target) return;
    
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
    
    // Add visual feedback for speed change
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
      speedDisplay.textContent = `${speed}x`;
      speedDisplay.classList.add('speed-changed');
      setTimeout(() => {
        speedDisplay.classList.remove('speed-changed');
      }, 500);
    }
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
      
      // Update background plane color
      if (backgroundPlaneRef.current) {
        backgroundPlaneRef.current.material.color = new THREE.Color(THEMES[theme].surface);
      }
      
      // Update particle system color
      if (particleSystemRef.current) {
        particleSystemRef.current.material.color = new THREE.Color(THEMES[theme].accent);
      }
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
  
  // Clean up resources
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
  
  // Render component with enhanced styling
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
                  <button 
                    className={`shape-option ${state.visualizationShape === 'torus' ? 'active' : ''}`}
                    onClick={() => changeShape('torus')}
                    title="Torus"
                  >
                    ⊗
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
          
          <div className="enhanced-speed-control">
            <div className="speed-label">Speed: </div>
            <div className="speed-slider-container">
              <button className="speed-btn speed-decrease" onClick={() => {
                if (state.playbackSpeed > 1) {
                  const newSpeed = state.playbackSpeed - 1;
                  setState(prevState => ({...prevState, playbackSpeed: newSpeed}));
                  if (state.isPlaying) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(() => {
                      setState(state => {
                        if (state.currentStepIndex < state.steps.length - 1) {
                          return {...state, currentStepIndex: state.currentStepIndex + 1};
                        } else {
                          clearInterval(intervalRef.current);
                          return {...state, isPlaying: false};
                        }
                      });
                    }, 2000 / newSpeed);
                  }
                }
              }}>-</button>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={state.playbackSpeed} 
                onChange={updateSpeed}
                className="speed-slider" 
              />
              <button className="speed-btn speed-increase" onClick={() => {
                if (state.playbackSpeed < 10) {
                  const newSpeed = state.playbackSpeed + 1;
                  setState(prevState => ({...prevState, playbackSpeed: newSpeed}));
                  if (state.isPlaying) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(() => {
                      setState(state => {
                        if (state.currentStepIndex < state.steps.length - 1) {
                          return {...state, currentStepIndex: state.currentStepIndex + 1};
                        } else {
                          clearInterval(intervalRef.current);
                          return {...state, isPlaying: false};
                        }
                      });
                    }, 2000 / newSpeed);
                  }
                }
              }}>+</button>
            </div>
            <div className="speed-value" id="speed-display">{state.playbackSpeed}x</div>
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
    </div>
  );
};

export default VisualizationPlayer;