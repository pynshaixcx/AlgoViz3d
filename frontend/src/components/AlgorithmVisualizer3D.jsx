import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Play, Pause, SkipBack, SkipForward, RefreshCw, 
  Maximize, Minimize, Eye, Layers, Cube, Sliders,
  Settings, Code, Info, X, ChevronDown, ChevronUp,
  HelpCircle, BookOpen, Save, Copy, ZoomIn, ZoomOut,
  Activity, RotateCw
} from 'lucide-react';

import './AlgorithmVisualizer3D.css';

// Define collection of 3D shapes with configurable parameters
const ShapeFactory = {
  // Standard shapes
  cube: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    return new THREE.BoxGeometry(
      size, 
      size * heightScale, 
      size, 
      options.segments || 1, 
      Math.max(1, Math.floor(options.segments * heightScale)) || 1, 
      options.segments || 1
    );
  },
  
  sphere: (size, options = {}) => {
    return new THREE.SphereGeometry(
      size * 0.6, 
      options.detail || 32, 
      options.detail || 24
    );
  },
  
  cylinder: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    return new THREE.CylinderGeometry(
      size * 0.5, 
      size * 0.5, 
      size * heightScale, 
      options.detail || 32
    );
  },
  
  cone: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    return new THREE.ConeGeometry(
      size * 0.6, 
      size * heightScale, 
      options.detail || 32, 
      options.segments || 1
    );
  },
  
  pyramid: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    return new THREE.ConeGeometry(
      size * 0.7, 
      size * heightScale, 
      4, 
      options.segments || 1
    );
  },
  
  diamond: (size, options = {}) => {
    return new THREE.OctahedronGeometry(
      size * 0.7, 
      options.detail || 0
    );
  },
  
  torus: (size, options = {}) => {
    return new THREE.TorusGeometry(
      size * 0.45, 
      size * 0.2, 
      options.detail || 16, 
      options.detail * 2 || 32
    );
  },
  
  // More complex shapes
  hexagonalPrism: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    const geometry = new THREE.CylinderGeometry(
      size * 0.6, 
      size * 0.6, 
      size * heightScale, 
      6, // 6 sides for hexagonal shape
      1,
      false
    );
    geometry.rotateY(Math.PI / 6); // Rotate to align flat sides
    return geometry;
  },
  
  capsule: (size, options = {}) => {
    const heightScale = options.heightScale || 1;
    const adjustedHeight = Math.max(0.2, heightScale - 0.5);
    return new THREE.CapsuleGeometry(
      size * 0.45, 
      size * adjustedHeight, 
      options.detail || 16, 
      options.detail || 24
    );
  },
  
  dodecahedron: (size, options = {}) => {
    return new THREE.DodecahedronGeometry(
      size * 0.6, 
      options.detail || 0
    );
  },
  
  icosahedron: (size, options = {}) => {
    return new THREE.IcosahedronGeometry(
      size * 0.6, 
      options.detail || 0
    );
  },
  
  tetrahedron: (size, options = {}) => {
    return new THREE.TetrahedronGeometry(
      size * 0.7, 
      options.detail || 0
    );
  }
};

// Enhanced color themes with better visual aesthetics
const ColorThemes = {
  quantum: {
    name: "Quantum Blue",
    default: 0x2563eb,
    comparison: 0xef4444,
    swap: 0xf59e0b,
    sorted: 0x10b981,
    selected: 0x9333ea,
    background: 0x0c1c2c,
    grid: 0x1e3a5f,
    gridHighlight: 0x3b82f6,
    gridSize: 100,
    text: 0xffffff,
    emission: 0.2,
    metalness: 0.7,
    roughness: 0.2,
    ambientLight: { color: 0x404080, intensity: 0.6 },
    directionalLight: { color: 0xffffff, intensity: 1.0, position: [10, 30, 20] },
    accentLight: { color: 0x3b82f6, intensity: 0.8, position: [-10, 20, 5] }
  },
  
  emerald: {
    name: "Emerald Green",
    default: 0x059669,
    comparison: 0xef4444,
    swap: 0xf59e0b,
    sorted: 0x2563eb,
    selected: 0x9333ea,
    background: 0x042f2e,
    grid: 0x115e59,
    gridHighlight: 0x10b981,
    gridSize: 100,
    text: 0xffffff,
    emission: 0.2,
    metalness: 0.7,
    roughness: 0.2,
    ambientLight: { color: 0x3f6259, intensity: 0.6 },
    directionalLight: { color: 0xffffff, intensity: 1.0, position: [10, 30, 20] },
    accentLight: { color: 0x10b981, intensity: 0.8, position: [-10, 20, 5] }
  },
  
  amethyst: {
    name: "Amethyst Purple",
    default: 0x8b5cf6,
    comparison: 0xef4444,
    swap: 0xf59e0b,
    sorted: 0x10b981,
    selected: 0x2563eb,
    background: 0x280d5f,
    grid: 0x580fb4,
    gridHighlight: 0xa78bfa,
    gridSize: 100,
    text: 0xffffff,
    emission: 0.2,
    metalness: 0.7,
    roughness: 0.2,
    ambientLight: { color: 0x4a397a, intensity: 0.6 },
    directionalLight: { color: 0xffffff, intensity: 1.0, position: [10, 30, 20] },
    accentLight: { color: 0x8b5cf6, intensity: 0.8, position: [-10, 20, 5] }
  },
  
  sunset: {
    name: "Sunset Orange",
    default: 0xf97316,
    comparison: 0xef4444,
    swap: 0x3b82f6,
    sorted: 0x10b981,
    selected: 0x8b5cf6,
    background: 0x431407,
    grid: 0x7c2d12,
    gridHighlight: 0xfb923c,
    gridSize: 100,
    text: 0xffffff,
    emission: 0.2,
    metalness: 0.7,
    roughness: 0.2,
    ambientLight: { color: 0x6a3a19, intensity: 0.6 },
    directionalLight: { color: 0xffffff, intensity: 1.0, position: [10, 30, 20] },
    accentLight: { color: 0xfb923c, intensity: 0.8, position: [-10, 20, 5] }
  },
  
  graphite: {
    name: "Graphite Dark",
    default: 0x64748b,
    comparison: 0xef4444,
    swap: 0xf59e0b,
    sorted: 0x10b981,
    selected: 0x3b82f6,
    background: 0x0f172a,
    grid: 0x1e293b,
    gridHighlight: 0x64748b,
    gridSize: 100,
    text: 0xffffff,
    emission: 0.1,
    metalness: 0.6,
    roughness: 0.3,
    ambientLight: { color: 0x2c3e50, intensity: 0.6 },
    directionalLight: { color: 0xffffff, intensity: 1.0, position: [10, 30, 20] },
    accentLight: { color: 0x64748b, intensity: 0.6, position: [-10, 20, 5] }
  }
};

// Vertex shader for advanced glow effect
const GlowShader = {
  vertex: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragment: `
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      float glow = pow(0.65 - dot(normalize(vNormal), normalize(vViewPosition)), 3.0) * intensity;
      gl_FragColor = vec4(glowColor, glow);
    }
  `
};

// Main component
const AlgorithmVisualizer3D = ({ 
  algorithm, 
  initialSteps = [], 
  initialInputData = [], 
  savedVisualization = false,
  onSave = null
}) => {
  // State management
  const [state, setState] = useState({
    // Algorithm & data
    algorithm: algorithm || {},
    steps: initialSteps || [],
    currentStepIndex: 0,
    inputData: initialInputData || [],
    inputSize: initialInputData?.length || 10,
    
    // Playback control
    isPlaying: false,
    playbackSpeed: 5,
    
    // Visual settings
    colorTheme: 'quantum',
    visualizationShape: 'cube',
    shapeDetail: 2,
    heightScaleFactor: 1,
    
    // View options
    is3DView: true,
    focusMode: true,
    showLabels: true,
    showArrows: true,
    showGrid: true,
    showAnimations: true,
    
    // UI state
    showCode: false,
    showSettings: false,
    showHelpModal: false,
    isFullscreen: false,
    loading: false,
    error: null,
    
    // Input handling
    customInputText: '',
    
    // Enhanced visualization
    focusedElements: [],
    highlightedElements: [],
    cameraDistance: 1,
    autoRotate: false,
    lightIntensity: 1,
    particleEffects: true
  });
  
  // Refs for 3D objects and DOM elements
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
  const gridRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredObjectRef = useRef(null);
  
  // Setup Three.js scene on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize scene
    initializeScene();
    
    // Generate initial data if not saved
    if (!savedVisualization && initialInputData.length === 0) {
      generateRandomData();
    } else if (initialSteps.length > 0) {
      // If we have initial steps, update the visualization
      setTimeout(() => updateVisualization(), 300);
    }
    
    // Set up event listeners for keyboard shortcuts
    window.addEventListener('keydown', handleKeyboardShortcuts);
    window.addEventListener('resize', handleWindowResize);
    
    // Clean up on unmount
    return () => {
      cleanupScene();
      window.removeEventListener('keydown', handleKeyboardShortcuts);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  
  // Update visualization when step changes
  useEffect(() => {
    updateVisualization();
  }, [state.currentStepIndex]);
  
  // Update visual appearance when theme changes
  useEffect(() => {
    if (sceneRef.current) {
      updateTheme();
    }
  }, [state.colorTheme]);

  // Initialize Three.js scene
  const initializeScene = () => {
    // Create scene
    const scene = new THREE.Scene();
    const theme = ColorThemes[state.colorTheme];
    scene.background = new THREE.Color(theme.background);
    sceneRef.current = scene;
    
    // Create renderer with enhanced quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    canvas.innerHTML = '';
    canvas.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create raycaster for interaction
    raycasterRef.current = new THREE.Raycaster();
    
    // Add camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 50, 70);
    cameraRef.current = camera;
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.autoRotate = state.autoRotate;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = true;
    controlsRef.current = controls;
    
    // Add lighting
    setupLighting(theme);
    
    // Add environmental elements
    createEnvironment();
    
    // Set up animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update animated elements
      updateAnimations();
      
      // Handle raycasting for hover effects
      if (raycasterRef.current && cameraRef.current && dataObjectsRef.current.length > 0) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(dataObjectsRef.current);
        
        if (intersects.length > 0) {
          if (hoveredObjectRef.current !== intersects[0].object) {
            if (hoveredObjectRef.current) {
              // Reset previous hovered object
              resetHoverEffect(hoveredObjectRef.current);
            }
            
            // Set new hovered object
            hoveredObjectRef.current = intersects[0].object;
            applyHoverEffect(hoveredObjectRef.current);
          }
        } else if (hoveredObjectRef.current) {
          // Reset hover when mouse isn't over any object
          resetHoverEffect(hoveredObjectRef.current);
          hoveredObjectRef.current = null;
        }
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // Add event listeners for mouse interaction
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleMouseClick);
  };

  // Set up lighting based on theme
  const setupLighting = (theme) => {
    const { ambientLight, directionalLight, accentLight } = theme;
    
    // Add ambient light
    const ambient = new THREE.AmbientLight(
      ambientLight.color, 
      ambientLight.intensity * state.lightIntensity
    );
    sceneRef.current.add(ambient);
    
    // Add directional light with shadows
    const mainLight = new THREE.DirectionalLight(
      directionalLight.color, 
      directionalLight.intensity * state.lightIntensity
    );
    mainLight.position.set(...directionalLight.position);
    mainLight.castShadow = true;
    
    // Configure shadow properties
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -80;
    mainLight.shadow.camera.right = 80;
    mainLight.shadow.camera.top = 80;
    mainLight.shadow.camera.bottom = -80;
    sceneRef.current.add(mainLight);
    
    // Add accent light for highlights
    const accent = new THREE.PointLight(
      accentLight.color,
      accentLight.intensity * state.lightIntensity,
      100
    );
    accent.position.set(...accentLight.position);
    sceneRef.current.add(accent);
    
    // Add hemisphere light for softer global illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, theme.background, 0.3 * state.lightIntensity);
    sceneRef.current.add(hemiLight);
  };

  // Create scene environment
  const createEnvironment = () => {
    const theme = ColorThemes[state.colorTheme];
    
    // Create grid
    if (state.showGrid) {
      const grid = new THREE.GridHelper(theme.gridSize, theme.gridSize / 2, theme.gridHighlight, theme.grid);
      grid.material.transparent = true;
      grid.material.opacity = 0.15;
      grid.position.y = -10;
      sceneRef.current.add(grid);
      gridRef.current = grid;
    }
    
    // Create background plane for shadow reception
    const planeGeometry = new THREE.PlaneGeometry(theme.gridSize * 1.5, theme.gridSize * 1.5);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: theme.grid,
      transparent: true,
      opacity: 0.2,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -10.1;
    plane.receiveShadow = true;
    sceneRef.current.add(plane);
    
    // Create ambient particle system if enabled
    if (state.particleEffects) {
      createParticleSystem(theme);
    }
  };

  // Create particle system for ambient atmosphere
  const createParticleSystem = (theme) => {
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color(theme.gridHighlight);
    const spread = theme.gridSize * 0.7;
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      // Color with slight variation
      const variableColor = color.clone().multiplyScalar(0.8 + Math.random() * 0.4);
      colors[i3] = variableColor.r;
      colors[i3 + 1] = variableColor.g;
      colors[i3 + 2] = variableColor.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    sceneRef.current.add(particleSystem);
    particleSystemRef.current = particleSystem;
  };
  
  // Update theme visuals
  const updateTheme = () => {
    const theme = ColorThemes[state.colorTheme];
    
    // Update scene background
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(theme.background);
    }
    
    // Clear existing lights
    if (sceneRef.current) {
      sceneRef.current.children = sceneRef.current.children.filter(child => 
        !(child instanceof THREE.AmbientLight || 
          child instanceof THREE.DirectionalLight || 
          child instanceof THREE.PointLight ||
          child instanceof THREE.HemisphereLight)
      );
    }
    
    // Add new lights based on the theme
    setupLighting(theme);
    
    // Update grid
    if (gridRef.current) {
      sceneRef.current.remove(gridRef.current);
      
      if (state.showGrid) {
        const grid = new THREE.GridHelper(theme.gridSize, theme.gridSize / 2, theme.gridHighlight, theme.grid);
        grid.material.transparent = true;
        grid.material.opacity = 0.15;
        grid.position.y = -10;
        sceneRef.current.add(grid);
        gridRef.current = grid;
      }
    }
    
    // Update particle system
    if (particleSystemRef.current) {
      sceneRef.current.remove(particleSystemRef.current);
      if (state.particleEffects) {
        createParticleSystem(theme);
      }
    }
    
    // Update visualization
    updateVisualization();
  };
  
  // Handle window resize
  const handleWindowResize = () => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };
  
  // Animate visual elements
  const updateAnimations = () => {
    // Animate particle system
    if (particleSystemRef.current && state.particleEffects) {
      const time = Date.now() * 0.0001;
      particleSystemRef.current.rotation.y = time * 0.1;
      
      // Gently move particles up and down
      const positions = particleSystemRef.current.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 5 + i) * 0.01;
      }
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate focused elements
    if (state.focusMode && state.focusedElements.length > 0 && state.showAnimations) {
      const time = Date.now() * 0.001;
      
      state.focusedElements.forEach(index => {
        if (index >= 0 && index < dataObjectsRef.current.length) {
          const element = dataObjectsRef.current[index];
          if (element) {
            // Pulsing scale animation
            const scale = 1 + Math.sin(time * 3) * 0.1;
            element.scale.set(scale, scale, scale);
            
            // Subtle rotation
            element.rotation.y = Math.sin(time * 2) * 0.2;
          }
        }
      });
    }
    
    // Animate arrows
    if (arrowsRef.current.length > 0 && state.showAnimations) {
      const time = Date.now() * 0.001;
      
      arrowsRef.current.forEach(arrow => {
        if (arrow && arrow.userData) {
          const type = arrow.userData.type;
          
          if (type === 'comparison') {
            // Pulse comparison arrows
            const scale = 1 + Math.sin(time * 4) * 0.15;
            arrow.scale.y = scale;
            
            // Pulse opacity if material exists
            if (arrow.material) {
              arrow.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
            }
          } 
          else if (type === 'swap') {
            // Animate swap arrows with flowing effect
            const scale = 1 + Math.sin(time * 3) * 0.1;
            arrow.scale.y = scale;
            arrow.scale.x = 1 + Math.sin(time * 2.5) * 0.05;
          }
        }
      });
    }
  };
  
  // Handle mouse movement
  const handleMouseMove = (event) => {
    const canvas = rendererRef.current.domElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouseRef.current.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
  };
  
  // Handle mouse click
  const handleMouseClick = (event) => {
    // Interact with hovered object
    if (hoveredObjectRef.current && hoveredObjectRef.current.userData.index !== undefined) {
      const index = hoveredObjectRef.current.userData.index;
      
      // Set focus to clicked element
      const newFocusedElements = [index];
      setState(prevState => ({
        ...prevState,
        focusedElements: newFocusedElements
      }));
      
      // Create a temporary info popup
      showElementDetails(index);
    }
  };
  
  // Apply hover effect to an object
  const applyHoverEffect = (object) => {
    if (!object.material) return;
    
    // Store original material properties
    if (!object.userData.originalMaterial) {
      object.userData.originalMaterial = {
        emissiveIntensity: object.material.emissiveIntensity,
        scale: object.scale.x
      };
      
      // Enhance emission for hover effect
      object.material.emissiveIntensity = object.material.emissiveIntensity * 2;
      object.scale.set(1.05, 1.05, 1.05);
      
      // Change cursor
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.style.cursor = 'pointer';
      }
    }
  };
  
  // Reset hover effect on an object
  const resetHoverEffect = (object) => {
    if (!object.material || !object.userData.originalMaterial) return;
    
    // Restore original material properties
    object.material.emissiveIntensity = object.userData.originalMaterial.emissiveIntensity;
    object.scale.set(1, 1, 1);
    delete object.userData.originalMaterial;
    
    // Reset cursor
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.domElement.style.cursor = 'default';
    }
  };
  
  // Show element details in a popup
  const showElementDetails = (index) => {
    if (!state.steps || state.steps.length === 0) return;
    
    const currentStep = state.steps[state.currentStepIndex];
    const value = currentStep.state[index];
    
    // Create a temporary popup
    const popup = document.createElement('div');
    popup.className = 'element-popup';
    popup.innerHTML = `
      <div class="element-popup-content">
        <h3>Element Details</h3>
        <p><strong>Value:</strong> ${value}</p>
        <p><strong>Index:</strong> ${index}</p>
        ${getElementRoleDescription(index, currentStep)}
      </div>
    `;
    
    canvasRef.current.appendChild(popup);
    
    // Position popup near the element
    const object = dataObjectsRef.current[index];
    if (object && cameraRef.current && rendererRef.current) {
      // Convert 3D position to screen position
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(object.matrixWorld);
      
      position.project(cameraRef.current);
      
      const widthHalf = canvasRef.current.clientWidth / 2;
      const heightHalf = canvasRef.current.clientHeight / 2;
      
      const x = (position.x * widthHalf) + widthHalf;
      const y = -(position.y * heightHalf) + heightHalf;
      
      popup.style.left = `${x}px`;
      popup.style.top = `${y - 120}px`;
    }
    
    // Remove popup after a delay
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 3000);
  };
  
  // Get description of element's role in current step
  const getElementRoleDescription = (index, step) => {
    if (!step) return '';
    
    let description = '<p><strong>Role:</strong> ';
    
    if (step.comparing && step.comparing.includes(index)) {
      description += 'Being compared</p>';
    } else if (step.swapped && step.swapped.includes(index)) {
      description += 'Being swapped</p>';
    } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
      description += 'Sorted element</p>';
    } else if (step.min_idx === index) {
      description += 'Current minimum</p>';
    } else if (step.pivot_index === index) {
      description += 'Pivot element</p>';
    } else if (step.checking_index === index) {
      description += 'Being checked</p>';
    } else {
      description += 'Standard element</p>';
    }
    
    return description;
  };
  
  // Handle keyboard shortcuts
  const handleKeyboardShortcuts = (event) => {
    // Ignore shortcuts when typing in input fields
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.key) {
      case ' ': // Space - play/pause
        togglePlayPause();
        event.preventDefault();
        break;
      case 'ArrowRight': // Right arrow - step forward
        stepForward();
        event.preventDefault();
        break;
      case 'ArrowLeft': // Left arrow - step backward
        stepBackward();
        event.preventDefault();
        break;
      case 'r': // r - reset visualization
        resetVisualization();
        event.preventDefault();
        break;
      case 'f': // f - toggle fullscreen
        toggleFullscreen();
        event.preventDefault();
        break;
      case 'c': // c - toggle code view
        toggleCodeView();
        event.preventDefault();
        break;
      case 'v': // v - toggle 2D/3D view
        toggle2D3DView();
        event.preventDefault();
        break;
      case 's': // s - toggle settings
        toggleSettingsPanel();
        event.preventDefault();
        break;
      case '+': // + - increase speed
        updateSpeed(Math.min(10, state.playbackSpeed + 1));
        event.preventDefault();
        break;
      case '-': // - - decrease speed
        updateSpeed(Math.max(1, state.playbackSpeed - 1));
        event.preventDefault();
        break;
    }
  };
  
  // Clean up scene resources
  const cleanupScene = () => {
    // Stop animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Stop interval timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Remove event listeners
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.domElement.removeEventListener('mousemove', handleMouseMove);
      rendererRef.current.domElement.removeEventListener('click', handleMouseClick);
    }
    
    // Dispose of all Three.js objects
    if (sceneRef.current) {
      disposeScene(sceneRef.current);
    }
    
    // Dispose of renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };
  
  // Recursively dispose of Three.js objects
  const disposeScene = (scene) => {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => disposeMaterial(material));
        } else {
          disposeMaterial(object.material);
        }
      }
    });
  };
  
  // Dispose of material and its textures
  const disposeMaterial = (material) => {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.displacementMap) material.displacementMap.dispose();
    if (material.emissiveMap) material.emissiveMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    if (material.alphaMap) material.alphaMap.dispose();
    if (material.aoMap) material.aoMap.dispose();
    
    material.dispose();
  };
  
  // Toggle play/pause state
  const togglePlayPause = () => {
    setState(prevState => {
      const newIsPlaying = !prevState.isPlaying;
      
      if (newIsPlaying) {
        // Start playback
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          setState(currentState => {
            if (currentState.currentStepIndex < currentState.steps.length - 1) {
              return { ...currentState, currentStepIndex: currentState.currentStepIndex + 1 };
            } else {
              // Stop at the end
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
  
  // Step forward one visualization step
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
  
  // Step backward one visualization step
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
  
  // Reset visualization to start
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
    
    // Add visual indication of reset
    if (canvasRef.current) {
      canvasRef.current.classList.add('reset-flash');
      setTimeout(() => {
        canvasRef.current.classList.remove('reset-flash');
      }, 300);
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setState(prevState => ({
      ...prevState,
      isFullscreen: !prevState.isFullscreen
    }));
    
    // Force resize after toggling fullscreen
    setTimeout(handleWindowResize, 100);
  };
  
  // Toggle code view panel
  const toggleCodeView = () => {
    setState(prevState => ({
      ...prevState,
      showCode: !prevState.showCode,
      showSettings: false // Close settings if open
    }));
  };
  
  // Toggle between 2D and 3D view
  const toggle2D3DView = () => {
    setState(prevState => ({
      ...prevState,
      is3DView: !prevState.is3DView
    }));
    
    if (cameraRef.current) {
      // Create a smooth animation between views
      const startPosition = cameraRef.current.position.clone();
      const endPosition = state.is3DView ? 
        new THREE.Vector3(0, 100, 0.1) : // 2D view position (top-down)
        new THREE.Vector3(0, 50, 70);    // 3D view position
      
      const duration = 1000; // Animation duration in ms
      const startTime = Date.now();
      
      function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use a smooth easing function
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        
        // Interpolate position
        cameraRef.current.position.lerpVectors(startPosition, endPosition, easedProgress);
        
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
  
  // Toggle settings panel
  const toggleSettingsPanel = () => {
    setState(prevState => ({
      ...prevState,
      showSettings: !prevState.showSettings,
      showCode: false // Close code view if open
    }));
  };
  
  // Update playback speed
  const updateSpeed = (speed) => {
    setState(prevState => {
      // Update interval if currently playing
      if (prevState.isPlaying && intervalRef.current) {
        clearInterval(intervalRef.current);
        
        intervalRef.current = setInterval(() => {
          setState(currentState => {
            if (currentState.currentStepIndex < currentState.steps.length - 1) {
              return { ...currentState, currentStepIndex: currentState.currentStepIndex + 1 };
            } else {
              // Stop at the end
              clearInterval(intervalRef.current);
              return { ...currentState, isPlaying: false };
            }
          });
        }, 2000 / speed);
      }
      
      return { ...prevState, playbackSpeed: speed };
    });
    
    // Add visual feedback
    const speedDisplay = document.getElementById('speed-value');
    if (speedDisplay) {
      speedDisplay.classList.add('pulse-animation');
      setTimeout(() => speedDisplay.classList.remove('pulse-animation'), 300);
    }
  };
  
  // Reset camera position
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      const startPosition = cameraRef.current.position.clone();
      const endPosition = new THREE.Vector3(0, 50, 70);
      
      const duration = 800; // ms
      const startTime = Date.now();
      
      function animateReset() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate position
        cameraRef.current.position.lerpVectors(startPosition, endPosition, easedProgress);
        
        // Update look direction
        cameraRef.current.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animateReset);
        } else {
          // Reset complete
          cameraRef.current.position.copy(endPosition);
          cameraRef.current.lookAt(0, 0, 0);
          
          if (controlsRef.current.reset) {
            controlsRef.current.reset();
          }
        }
      }
      
      animateReset();
    }
  };
  
  // Generate random data for visualization
  const generateRandomData = () => {
    const size = state.inputSize;
    const data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Generate nearly sorted data (mostly in order with a few out of place)
  const generateNearlySortedData = () => {
    const size = state.inputSize;
    const data = Array.from({ length: size }, (_, i) => i + 1);
    
    // Swap a few elements to make it nearly sorted
    for (let i = 0; i < Math.max(1, size / 10); i++) {
      const idx1 = Math.floor(Math.random() * size);
      const idx2 = Math.floor(Math.random() * size);
      [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
    }
    
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Generate reversed data (descending order)
  const generateReversedData = () => {
    const size = state.inputSize;
    const data = Array.from({ length: size }, (_, i) => size - i);
    
    setState(prevState => ({ ...prevState, inputData: data }));
    executeAlgorithm(data);
  };
  
  // Apply custom user-entered data
  const applyCustomData = () => {
    try {
      const rawInput = state.customInputText.trim();
      if (!rawInput) {
        throw new Error('Empty input');
      }
      
      // Try to parse as comma-separated or space-separated list
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
      showError(`Invalid input format: ${error.message}`);
    }
  };
  
  // Update input size
  const handleInputSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setState(prevState => ({ ...prevState, inputSize: newSize }));
  };
  
  // Update custom input text
  const handleCustomInputChange = (e) => {
    setState(prevState => ({ ...prevState, customInputText: e.target.value }));
  };
  
  // Update visualization shape
  const changeShape = (shape) => {
    setState(prevState => ({ ...prevState, visualizationShape: shape }));
    updateVisualization();
  };
  
  // Update color theme
  const changeTheme = (theme) => {
    setState(prevState => ({ ...prevState, colorTheme: theme }));
  };
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setState(prevState => ({ ...prevState, focusMode: !prevState.focusMode }));
    updateVisualization();
  };
  
  // Toggle shape detail level
  const changeShapeDetail = (level) => {
    setState(prevState => ({ ...prevState, shapeDetail: level }));
    updateVisualization();
  };
  
  // Update height scale factor
  const changeHeightScale = (scale) => {
    setState(prevState => ({ ...prevState, heightScaleFactor: scale }));
    updateVisualization();
  };
  
  // Toggle particle effects
  const toggleParticleEffects = () => {
    setState(prevState => {
      const newState = { ...prevState, particleEffects: !prevState.particleEffects };
      
      // Update particle system
      if (sceneRef.current && particleSystemRef.current) {
        sceneRef.current.remove(particleSystemRef.current);
        particleSystemRef.current = null;
        
        if (newState.particleEffects) {
          createParticleSystem(ColorThemes[state.colorTheme]);
        }
      }
      
      return newState;
    });
  };
  
  // Toggle auto-rotation
  const toggleAutoRotate = () => {
    setState(prevState => {
      const newAutoRotate = !prevState.autoRotate;
      
      if (controlsRef.current) {
        controlsRef.current.autoRotate = newAutoRotate;
      }
      
      return { ...prevState, autoRotate: newAutoRotate };
    });
  };
  
  // Show error message
  const showError = (message) => {
    setState(prevState => ({ ...prevState, error: message }));
    
    // Clear error after a delay
    setTimeout(() => {
      setState(prevState => ({ ...prevState, error: null }));
    }, 3000);
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
        'X-CSRFToken': getCsrfToken() // Get CSRF token for Django
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
      showError(`Error: ${error.message}`);
      setState(prevState => ({ ...prevState, loading: false }));
    });
  };
  
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
  
  // Save current visualization
  const saveVisualization = () => {
    if (!state.steps || state.steps.length === 0 || !onSave) {
      showError("Cannot save visualization: No data to save or save function not provided");
      return;
    }
    
    // Call the provided save function
    onSave({
      algorithm: state.algorithm,
      steps: state.steps,
      inputData: state.inputData
    });
  };
  
  // Update visualization based on current step
  const updateVisualization = () => {
    if (!sceneRef.current || !state.steps || state.steps.length === 0) return;
    
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
  
  // Clear visualization objects
  const clearVisualization = () => {
    if (!sceneRef.current) return;
    
    // Remove existing objects
    [...dataObjectsRef.current, ...textLabelsRef.current, ...arrowsRef.current].forEach(obj => {
      if (sceneRef.current.children.includes(obj)) {
        sceneRef.current.remove(obj);
      }
    });
    
    // Clear reference arrays
    dataObjectsRef.current = [];
    textLabelsRef.current = [];
    arrowsRef.current = [];
  };
  
  // Determine which elements should be focused based on the current step
  const determineFocusedElements = (step) => {
    if (!step) return [];
    
    let focusedElements = [];
    
    // Add elements based on step type
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
    
    // Add elements from other step types
    if (step.min_idx !== undefined) {
      if (!focusedElements.includes(step.min_idx)) {
        focusedElements.push(step.min_idx);
      }
    }
    
    if (step.pivot_index !== undefined) {
      if (!focusedElements.includes(step.pivot_index)) {
        focusedElements.push(step.pivot_index);
      }
    }
    
    if (step.checking_index !== undefined) {
      if (!focusedElements.includes(step.checking_index)) {
        focusedElements.push(step.checking_index);
      }
    }
    
    // If no specific focus, focus on everything for initial/final states
    if (focusedElements.length === 0 && (step.type === 'initial' || step.type === 'final')) {
      const data = step.state || [];
      focusedElements = Array.from({ length: data.length }, (_, i) => i);
    }
    
    return focusedElements;
  };
  
  // Create visualization from step data
  const createVisualization = (step, focusedIndices) => {
    if (!sceneRef.current || !step || !step.state) return;
    
    const data = step.state;
    const baseSize = state.focusMode ? 5 : 3; // Larger size in focus mode
    const spacing = state.focusMode ? 8 : 4;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1); // Ensure at least 1 to avoid division by zero
    
    // Determine which elements to render (all or just focused)
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
      let color = getElementColor(i, step);
      
      // Create geometry based on selected shape
      const shapeOptions = {
        heightScale: heightScale * state.heightScaleFactor,
        detail: state.shapeDetail,
        segments: state.shapeDetail
      };
      
      let geometry;
      if (ShapeFactory[state.visualizationShape]) {
        geometry = ShapeFactory[state.visualizationShape](baseSize, shapeOptions);
      } else {
        // Default to cube if shape not found
        geometry = ShapeFactory.cube(baseSize, shapeOptions);
      }
      
      // Create material with enhanced visual properties
      const theme = ColorThemes[state.colorTheme];
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: focusedIndices.includes(i) ? 1.0 : 0.85,
        metalness: theme.metalness,
        roughness: theme.roughness,
        reflectivity: 0.6,
        clearcoat: 0.3,
        clearcoatRoughness: 0.3,
        emissive: new THREE.Color(color).multiplyScalar(0.4),
        emissiveIntensity: focusedIndices.includes(i) ? theme.emission * 2 : theme.emission
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Store element index for interaction
      mesh.userData.index = i;
      
      // Position mesh (special handling for cube vs other shapes)
      const xPos = startX + i * (baseSize + spacing);
      let yPos = 0;
      
      // Different vertical position based on shape
      switch(state.visualizationShape) {
        case 'cube':
          yPos = height / 2;
          break;
        case 'cylinder':
        case 'cone':
        case 'pyramid':
        case 'hexagonalPrism':
          yPos = height / 2;
          break;
        default:
          // Center other shapes
          yPos = baseSize;
      }
      
      mesh.position.set(xPos, yPos, 0);
      
      // Add to scene
      sceneRef.current.add(mesh);
      dataObjectsRef.current[i] = mesh;
      
      // Add value label if enabled
      if (state.showLabels) {
        addValueLabel(value, mesh, i, height);
      }
      
      // Add glow effect for focused elements
      if (focusedIndices.includes(i)) {
        addGlowEffect(mesh, color);
      }
    });
    
    // Add operation indicators (arrows, etc.)
    if (state.showArrows) {
      addOperationIndicators(step, data);
    }
  };
  
  // Get color for an element based on its role in the current step
  const getElementColor = (index, step) => {
    const theme = ColorThemes[state.colorTheme];
    
    // Determine color based on element's role
    if (step.comparing && step.comparing.includes(index)) {
      return theme.comparison;
    } else if (step.swapped && step.swapped.includes(index)) {
      return theme.swap;
    } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
      return theme.sorted;
    } else if (step.min_idx === index || step.pivot_index === index) {
      return theme.selected;
    } else if (step.checking_index === index) {
      return theme.selected;
    } else {
      return theme.default;
    }
  };
  
  // Add operation indicators based on step type
  const addOperationIndicators = (step, data) => {
    if (!step) return;
    
    // Add comparison indicators
    if (step.comparing && step.comparing.length >= 2) {
      addComparisonIndicator(step.comparing[0], step.comparing[1], data);
    }
    
    // Add swap indicators
    if (step.swapped && step.swapped.length >= 2) {
      addSwapIndicator(step.swapped[0], step.swapped[1], data);
    }
    
    // Add step-specific overlays
    if (step.type === 'partition') {
      addPartitionIndicator(step, data);
    } else if (step.type === 'pivot') {
      addPivotIndicator(step.pivot_index, data);
    }
    
    // Add step description panel
    addStepDescriptionPanel(step);
  };
  
  // Add value label above an element
  const addValueLabel = (value, element, index, height) => {
    if (!element) return;
    
    // Use canvas to create the text texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    // Determine if this element is focused
    const isFocused = state.focusedElements.includes(index);
    
    // Text size based on focus
    const fontSize = isFocused ? 60 : 40;
    
    // Background with rounded corners
    ctx.fillStyle = isFocused ? 'rgba(30, 60, 100, 0.85)' : 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(24, 24, 80, 80, 10);
    ctx.fill();
    
    // Add border for focused elements
    if (isFocused) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.roundRect(24, 24, 80, 80, 10);
      ctx.stroke();
    }
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, 64, 64);
    
    // Create sprite with texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4; // Improve text quality
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: isFocused ? 1.0 : 0.8,
      alphaTest: 0.1
    });
    
    const sprite = new THREE.Sprite(material);
    
    // Scale sprite
    const scale = isFocused ? 7 : 5;
    sprite.scale.set(scale, scale, 1);
    
    // Position above element
    const yOffset = element.geometry.type === 'BoxGeometry' ? height / 2 + 6 : 10;
    sprite.position.set(element.position.x, element.position.y + yOffset, element.position.z);
    
    // Add to scene and tracking
    sceneRef.current.add(sprite);
    textLabelsRef.current.push(sprite);
  };
  
  // Add glow effect to focused elements
  const addGlowEffect = (mesh, color) => {
    if (!mesh) return;
    
    // Create the glow material using the custom shader
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        intensity: { value: 1.5 }
      },
      vertexShader: GlowShader.vertex,
      fragmentShader: GlowShader.fragment,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    // Create a larger mesh for the glow effect
    const glowMesh = new THREE.Mesh(
      mesh.geometry.clone(),
      glowMaterial
    );
    
    // Scale the glow mesh slightly larger
    glowMesh.scale.multiplyScalar(1.2);
    glowMesh.position.copy(mesh.position);
    sceneRef.current.add(glowMesh);
    
    // Track the glow effect with the data objects
    textLabelsRef.current.push(glowMesh);
  };
  
  // Add comparison indicator between elements
  const addComparisonIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Get midpoint and height for the arc
    const midX = (element1.position.x + element2.position.x) / 2;
    const peakY = Math.max(element1.position.y, element2.position.y) + 15;
    
    // Create curved arc for the comparison indicator
    const points = [];
    const segments = 30;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(element1.position.x, element2.position.x, t);
      
      // Create arc using sin function
      const y = THREE.MathUtils.lerp(element1.position.y, element2.position.y, t) + 
                Math.sin(t * Math.PI) * 10;
      
      points.push(new THREE.Vector3(x, y, 0));
    }
    
    // Create curve and tube geometry
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.4, 8, false);
    
    // Use theme color
    const theme = ColorThemes[state.colorTheme];
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: theme.comparison,
      emissive: theme.comparison,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.userData = { type: 'comparison' };
    
    sceneRef.current.add(tube);
    arrowsRef.current.push(tube);
    
    // Add arrowhead at the end
    const arrowHeadGeometry = new THREE.ConeGeometry(1, 2, 16);
    const arrowHeadMaterial = new THREE.MeshStandardMaterial({
      color: theme.comparison,
      emissive: theme.comparison,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
    
    // Position at the end of the curve
    const endPoint = curve.getPointAt(1);
    const tangent = curve.getTangentAt(1).normalize();
    
    arrowHead.position.copy(endPoint);
    
    // Orient the arrowhead along the curve
    const axis = new THREE.Vector3(0, 1, 0);
    arrowHead.quaternion.setFromUnitVectors(axis, tangent);
    arrowHead.rotateX(Math.PI / 2);
    
    sceneRef.current.add(arrowHead);
    arrowsRef.current.push(arrowHead);
    
    // Add comparison text label
    const comparisonLabel = createOperationLabel(
      `Comparing ${data[index1]} vs ${data[index2]}`,
      midX, peakY + 7, 0,
      theme.comparison
    );
    
    sceneRef.current.add(comparisonLabel);
    textLabelsRef.current.push(comparisonLabel);
  };
  
  // Add swap indicator between elements
  const addSwapIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const element1 = dataObjectsRef.current[index1];
    const element2 = dataObjectsRef.current[index2];
    
    // Calculate positions and distances
    const x1 = element1.position.x;
    const y1 = element1.position.y;
    const x2 = element2.position.x;
    const y2 = element2.position.y;
    const midX = (x1 + x2) / 2;
    
    // Use theme color
    const theme = ColorThemes[state.colorTheme];
    
    // Create two curved arrows for swap
    const createCurvedArrow = (fromX, fromY, toX, toY, upward) => {
      const points = [];
      const segments = 30;
      const arcHeight = upward ? 8 : -8;
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = THREE.MathUtils.lerp(fromX, toX, t);
        
        // Create arc using sin function
        const y = THREE.MathUtils.lerp(fromY, toY, t) + 
                  Math.sin(t * Math.PI) * arcHeight;
        
        points.push(new THREE.Vector3(x, y, 0));
      }
      
      // Create curve and tube
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 30, 0.4, 8, false);
      
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: theme.swap,
        emissive: theme.swap,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8
      });
      
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.userData = { type: 'swap' };
      
      sceneRef.current.add(tube);
      arrowsRef.current.push(tube);
      
      // Add arrowhead
      const arrowHeadGeometry = new THREE.ConeGeometry(0.8, 1.6, 16);
      const arrowHeadMaterial = new THREE.MeshStandardMaterial({
        color: theme.swap,
        emissive: theme.swap,
        emissiveIntensity: 0.5
      });
      
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
      
      // Position at the end of the curve
      const endPoint = curve.getPointAt(1);
      const tangent = curve.getTangentAt(1).normalize();
      
      arrowHead.position.copy(endPoint);
      
      // Orient the arrowhead along the curve
      const axis = new THREE.Vector3(0, 1, 0);
      arrowHead.quaternion.setFromUnitVectors(axis, tangent);
      arrowHead.rotateX(Math.PI / 2);
      
      sceneRef.current.add(arrowHead);
      arrowsRef.current.push(arrowHead);
      
      return curve;
    };
    
    // Create two arrows forming the swap
    createCurvedArrow(x1, y1, x2, y2, true);
    createCurvedArrow(x2, y2, x1, y1, false);
    
    // Add swap text label
    const swapLabel = createOperationLabel(
      `Swapping ${data[index1]} ⟷ ${data[index2]}`,
      midX, Math.max(y1, y2) + 12, 0,
      theme.swap
    );
    
    sceneRef.current.add(swapLabel);
    textLabelsRef.current.push(swapLabel);
  };
  
  // Add partition indicator for quicksort
  const addPartitionIndicator = (step, data) => {
    if (!step.pivot_index) return;
    
    const theme = ColorThemes[state.colorTheme];
    const pivotIdx = step.pivot_index;
    
    // Create partitioning line/plane
    if (dataObjectsRef.current[pivotIdx]) {
      const pivotElement = dataObjectsRef.current[pivotIdx];
      const x = pivotElement.position.x;
      
      // Create vertical line/plane
      const lineGeometry = new THREE.PlaneGeometry(0.2, 30);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: theme.selected,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(x, 10, 0);
      
      sceneRef.current.add(line);
      arrowsRef.current.push(line);
      
      // Add partition labels
      const leftLabel = createOperationLabel(
        "< Pivot",
        x - 10, 20, 0,
        theme.selected
      );
      
      const rightLabel = createOperationLabel(
        "≥ Pivot",
        x + 10, 20, 0,
        theme.selected
      );
      
      sceneRef.current.add(leftLabel);
      sceneRef.current.add(rightLabel);
      textLabelsRef.current.push(leftLabel);
      textLabelsRef.current.push(rightLabel);
    }
  };
  
  // Add pivot indicator for quicksort
  const addPivotIndicator = (pivotIndex, data) => {
    if (pivotIndex === undefined || !dataObjectsRef.current[pivotIndex]) return;
    
    const pivotElement = dataObjectsRef.current[pivotIndex];
    const theme = ColorThemes[state.colorTheme];
    
    // Add a ring to highlight the pivot
    const ringGeometry = new THREE.TorusGeometry(5, 0.5, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: theme.selected,
      emissive: theme.selected,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(pivotElement.position);
    
    // Orient the ring to be horizontal
    ring.rotation.x = Math.PI / 2;
    
    sceneRef.current.add(ring);
    arrowsRef.current.push(ring);
    
    // Add pivot text label
    const pivotLabel = createOperationLabel(
      `Pivot: ${data[pivotIndex]}`,
      pivotElement.position.x, pivotElement.position.y + 15, 0,
      theme.selected
    );
    
    sceneRef.current.add(pivotLabel);
    textLabelsRef.current.push(pivotLabel);
  };
  
  // Add floating step description panel
  const addStepDescriptionPanel = (step) => {
    if (!step || !step.description) return;
    
    // Create a floating text panel with the step description
    const theme = ColorThemes[state.colorTheme];
    
    // Create a sprite with description text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;
    
    // Fill background
    ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
    ctx.roundRect(20, 20, 984, 216, 15);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = 'rgba(100, 149, 237, 0.6)';
    ctx.lineWidth = 2;
    ctx.roundRect(20, 20, 984, 216, 15);
    ctx.stroke();
    
    // Add title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(step.description, 512, 80);
    
    // Add educational note if present
    if (step.educational_note) {
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
      
      // Wrap text to fit
      const maxWidth = 900;
      const words = step.educational_note.split(' ');
      let line = '';
      let y = 140;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 512, y);
          line = words[i] + ' ';
          y += 36;
        } else {
          line = testLine;
        }
      }
      
      ctx.fillText(line, 512, y);
    }
    
    // Create sprite from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(50, 12.5, 1);
    sprite.position.set(0, 35, 0);
    
    sceneRef.current.add(sprite);
    textLabelsRef.current.push(sprite);
  };
  
  // Create an operation label (for comparison, swap, etc.)
  const createOperationLabel = (text, x, y, z, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // Draw background with rounded corners
    const bgColor = new THREE.Color(color);
    ctx.fillStyle = `rgba(${bgColor.r * 255}, ${bgColor.g * 255}, ${bgColor.b * 255}, 0.8)`;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 15);
    ctx.fill();
    
    // Add subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 15);
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(20, 5, 1);
    sprite.position.set(x, y, z);
    
    return sprite;
  };
  
  // Render UI
  return (
    <div className={`algorithm-visualizer ${state.isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header with title and controls */}
      <div className="visualizer-header">
        <div className="visualizer-title">
          <h2>{state.algorithm.name || 'Algorithm Visualization'}</h2>
        </div>
        <div className="visualizer-controls-top">
          <button 
            className="control-button" 
            onClick={toggleFullscreen}
            title={state.isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {state.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button 
            className="control-button" 
            onClick={toggleSettingsPanel}
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            className="control-button" 
            onClick={toggleCodeView}
            title="View Code"
          >
            <Code size={20} />
          </button>
        </div>
      </div>
      
      <div className="visualizer-main">
        {/* Settings panel (collapsible) */}
        <div className={`visualizer-sidebar settings-panel ${state.showSettings ? 'open' : 'closed'}`}>
          {state.showSettings && (
            <div className="settings-content">
              <div className="settings-header">
                <h3>Visualization Settings</h3>
                <button className="close-button" onClick={toggleSettingsPanel}>
                  <X size={18} />
                </button>
              </div>
              
              {/* Visual Settings */}
              <div className="settings-section">
                <h4>Visual Style</h4>
                
                <div className="settings-group">
                  <div className="settings-label">Color Theme</div>
                  <div className="theme-selector">
                    {Object.keys(ColorThemes).map(theme => (
                      <button 
                        key={theme} 
                        className={`theme-option ${state.colorTheme === theme ? 'active' : ''}`}
                        onClick={() => changeTheme(theme)}
                        title={ColorThemes[theme].name}
                        style={{
                          backgroundColor: `#${ColorThemes[theme].default.toString(16).padStart(6, '0')}`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="settings-group">
                  <div className="settings-label">Element Shape</div>
                  <div className="shape-selector">
                    {Object.keys(ShapeFactory).map(shape => (
                      <button 
                        key={shape} 
                        className={`shape-option ${state.visualizationShape === shape ? 'active' : ''}`}
                        onClick={() => changeShape(shape)}
                        title={shape.charAt(0).toUpperCase() + shape.slice(1)}
                      >
                        {getShapeIcon(shape)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="settings-group">
                  <div className="settings-label">Detail Level</div>
                  <div className="slider-control">
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      value={state.shapeDetail} 
                      onChange={(e) => changeShapeDetail(parseInt(e.target.value))}
                    />
                    <span className="slider-value">{state.shapeDetail}</span>
                  </div>
                </div>
                
                <div className="settings-group">
                  <div className="settings-label">Height Scale</div>
                  <div className="slider-control">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      value={state.heightScaleFactor} 
                      onChange={(e) => changeHeightScale(parseFloat(e.target.value))}
                    />
                    <span className="slider-value">{state.heightScaleFactor.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
              
              {/* View Options */}
              <div className="settings-section">
                <h4>View Options</h4>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.focusMode} 
                      onChange={toggleFocusMode} 
                    />
                    <span>Focus Mode</span>
                  </label>
                </div>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.showLabels} 
                      onChange={() => setState(prev => ({ ...prev, showLabels: !prev.showLabels }))} 
                    />
                    <span>Show Labels</span>
                  </label>
                </div>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.showArrows} 
                      onChange={() => setState(prev => ({ ...prev, showArrows: !prev.showArrows }))} 
                    />
                    <span>Show Indicators</span>
                  </label>
                </div>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.showGrid} 
                      onChange={() => setState(prev => ({ ...prev, showGrid: !prev.showGrid }))} 
                    />
                    <span>Show Grid</span>
                  </label>
                </div>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.particleEffects} 
                      onChange={toggleParticleEffects} 
                    />
                    <span>Particle Effects</span>
                  </label>
                </div>
                
                <div className="toggle-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={state.autoRotate} 
                      onChange={toggleAutoRotate} 
                    />
                    <span>Auto-Rotate</span>
                  </label>
                </div>
              </div>
              
              {/* Input Data */}
              <div className="settings-section">
                <h4>Input Data</h4>
                
                <div className="settings-group">
                  <div className="settings-label">Input Size: {state.inputSize}</div>
                  <div className="slider-control">
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      value={state.inputSize} 
                      onChange={handleInputSizeChange} 
                    />
                  </div>
                </div>
                
                <div className="data-buttons">
                  <button className="data-button" onClick={generateRandomData}>Random</button>
                  <button className="data-button" onClick={generateNearlySortedData}>Nearly Sorted</button>
                  <button className="data-button" onClick={generateReversedData}>Reversed</button>
                </div>
                
                <div className="custom-input">
                  <div className="settings-label">Custom Input:</div>
                  <div className="input-control">
                    <input 
                      type="text" 
                      value={state.customInputText}
                      onChange={handleCustomInputChange}
                      placeholder="E.g. 5,3,1,4,2" 
                    />
                    <button className="apply-button" onClick={applyCustomData}>Apply</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main visualization area */}
        <div className="visualizer-content">
          <div className="visualization-canvas-container">
            {/* Canvas for Three.js rendering */}
            <div 
              className="visualization-canvas" 
              ref={canvasRef}
            />
            
            {/* Progress bar */}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${state.steps.length ? (state.currentStepIndex / (state.steps.length - 1)) * 100 : 0}%` }}
              />
            </div>
            
            {/* Playback controls */}
            <div className="playback-controls-container">
              <div className="playback-controls">
                <button 
                  className="control-button reset" 
                  onClick={resetVisualization}
                  title="Reset"
                >
                  <RefreshCw size={20} />
                </button>
                <button 
                  className="control-button" 
                  onClick={stepBackward}
                  title="Step Backward"
                  disabled={state.currentStepIndex === 0}
                >
                  <SkipBack size={20} />
                </button>
                <button 
                  className="control-button play-pause" 
                  onClick={togglePlayPause}
                  title={state.isPlaying ? "Pause" : "Play"}
                >
                  {state.isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button 
                  className="control-button" 
                  onClick={stepForward}
                  title="Step Forward"
                  disabled={state.currentStepIndex === state.steps.length - 1}
                >
                  <SkipForward size={20} />
                </button>
              </div>
              
              <div className="speed-control">
                <span>Speed:</span>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={state.playbackSpeed} 
                  onChange={(e) => updateSpeed(parseInt(e.target.value))}
                />
                <span id="speed-value">{state.playbackSpeed}x</span>
              </div>
              
              <div className="view-controls">
                <button 
                  className="control-button" 
                  onClick={resetCamera}
                  title="Reset Camera"
                >
                  <Eye size={20} />
                </button>
                <button 
                  className="control-button" 
                  onClick={toggle2D3DView}
                  title={state.is3DView ? "2D View" : "3D View"}
                >
                  {state.is3DView ? <Layers size={20} /> : <Cube size={20} />}
                </button>
                {onSave && (
                  <button 
                    className="control-button" 
                    onClick={saveVisualization}
                    title="Save Visualization"
                  >
                    <Save size={20} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Loading overlay */}
            {state.loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Processing algorithm...</p>
              </div>
            )}
            
            {/* Error message */}
            {state.error && (
              <div className="error-message">
                <p>{state.error}</p>
              </div>
            )}
          </div>
          
          {/* Step information panel */}
          <div className="step-info-panel">
            <div className="step-counter">
              Step {state.currentStepIndex + 1} of {state.steps.length}
            </div>
            
            {state.steps.length > 0 && state.currentStepIndex < state.steps.length && (
              <div className="step-description">
                <h3>{state.steps[state.currentStepIndex].description || 'No description available'}</h3>
                <p>{state.steps[state.currentStepIndex].educational_note || ''}</p>
              </div>
            )}
            
            <div className="algorithm-info">
              <div className="info-row">
                <span className="info-label">Time Complexity:</span>
                <span className="info-value">{state.algorithm.time_complexity || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Space Complexity:</span>
                <span className="info-value">{state.algorithm.space_complexity || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Code view panel (collapsible) */}
        <div className={`visualizer-sidebar code-panel ${state.showCode ? 'open' : 'closed'}`}>
          {state.showCode && (
            <div className="code-content">
              <div className="code-header">
                <h3>Algorithm Code</h3>
                <button className="close-button" onClick={toggleCodeView}>
                  <X size={18} />
                </button>
              </div>
              
              <pre className="code-block">
                {state.algorithm.code_implementation || `function ${state.algorithm.name?.replace(/\s/g, '') || 'algorithm'}(arr) {\n  // Algorithm implementation not available\n}`}
              </pre>
              
              <div className="code-explanation">
                <h4>How the Algorithm Works</h4>
                <p>{state.algorithm.description || 'No description available'}</p>
                
                {state.algorithm.best_use_cases && (
                  <>
                    <h4>Best Use Cases</h4>
                    <p>{state.algorithm.best_use_cases}</p>
                  </>
                )}
                
                {state.algorithm.limitations && (
                  <>
                    <h4>Limitations</h4>
                    <p>{state.algorithm.limitations}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Help modal */}
      {state.showHelpModal && (
        <div className="help-modal-backdrop" onClick={() => setState(prev => ({ ...prev, showHelpModal: false }))}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div className="help-modal-header">
              <h2>How to Use the Visualizer</h2>
              <button className="close-button" onClick={() => setState(prev => ({ ...prev, showHelpModal: false }))}>
                <X size={20} />
              </button>
            </div>
            
            <div className="help-modal-content">
              <div className="help-section">
                <h3>Playback Controls</h3>
                <ul>
                  <li><strong>Play/Pause</strong> - Start or pause the animation</li>
                  <li><strong>Step Forward/Backward</strong> - Move one step at a time</li>
                  <li><strong>Reset</strong> - Return to the beginning</li>
                  <li><strong>Speed</strong> - Adjust animation speed</li>
                </ul>
              </div>
              
              <div className="help-section">
                <h3>View Controls</h3>
                <ul>
                  <li><strong>Reset Camera</strong> - Return to the default view</li>
                  <li><strong>2D/3D Toggle</strong> - Switch between 2D and 3D views</li>
                  <li><strong>Save</strong> - Save the current visualization</li>
                </ul>
              </div>
              
              <div className="help-section">
                <h3>Interactive Elements</h3>
                <ul>
                  <li>Click and drag to rotate the view</li>
                  <li>Scroll to zoom in and out</li>
                  <li>Click on any element to highlight it and see details</li>
                </ul>
              </div>
              
              <div className="help-section">
                <h3>Keyboard Shortcuts</h3>
                <ul>
                  <li><strong>Space</strong> - Play/Pause</li>
                  <li><strong>Left/Right Arrow</strong> - Step backward/forward</li>
                  <li><strong>R</strong> - Reset</li>
                  <li><strong>F</strong> - Toggle fullscreen</li>
                  <li><strong>C</strong> - Toggle code view</li>
                  <li><strong>V</strong> - Toggle 2D/3D view</li>
                  <li><strong>S</strong> - Toggle settings</li>
                  <li><strong>+/-</strong> - Increase/decrease speed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get icon for shape button
function getShapeIcon(shape) {
  switch (shape) {
    case 'cube': return '□';
    case 'sphere': return '○';
    case 'cylinder': return '⊙';
    case 'cone': return '△';
    case 'pyramid': return '▲';
    case 'diamond': return '◆';
    case 'torus': return '⊗';
    case 'hexagonalPrism': return '⬡';
    case 'capsule': return '⬭';
    case 'dodecahedron': return '⬟';
    case 'icosahedron': return '⬢';
    case 'tetrahedron': return '△';
    default: return '□';
  }
}

export default AlgorithmVisualizer3D;