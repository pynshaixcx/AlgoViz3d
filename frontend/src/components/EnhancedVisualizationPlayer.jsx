import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// A simplified, fixed version of the visualization player
const EnhancedVisualizationPlayer = ({ algorithm, initialSteps = [], initialInputData = [] }) => {
  // Core state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(3);
  const [steps, setSteps] = useState(initialSteps);
  const [inputData, setInputData] = useState(initialInputData);
  
  // Refs for 3D elements
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationRef = useRef(null);
  const dataObjectsRef = useRef([]);
  const intervalRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredObjectRef = useRef(null);
  
  // State for appearance and behavior
  const [focusMode, setFocusMode] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [is3DView, setIs3DView] = useState(true);
  const [selectedShape, setSelectedShape] = useState('cube');
  
  // Initialize scene on component mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set up Three.js scene
    initScene();
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    
    // If we have initial steps, update the visualization
    if (steps.length > 0) {
      setTimeout(() => updateVisualization(), 300);
    } else {
      // Otherwise generate random data for demo
      generateRandomData();
    }
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      cleanupScene();
    };
  }, []);
  
  // Update visualization when step changes
  useEffect(() => {
    updateVisualization();
  }, [currentStepIndex]);
  
  // Initialize Three.js scene
  const initScene = () => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1929);
    sceneRef.current = scene;
    
    // Create renderer with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    canvas.innerHTML = '';
    canvas.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 30, 50);
    cameraRef.current = camera;
    
    // Add controls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;
    
    // Add lighting
    addLighting();
    
    // Add grid for better visuals
    addGrid();
    
    // Setup raycaster for mouse interaction
    raycasterRef.current = new THREE.Raycaster();
    
    // Start animation loop
    animate();
    
    // Add mouse event listeners
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleMouseClick);
  };
  
  // Animation loop
  const animate = () => {
    animationRef.current = requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // Check for hover interactions
    updateHoverEffects();
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // Add lighting to the scene
  const addLighting = () => {
    if (!sceneRef.current) return;
    
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    sceneRef.current.add(ambientLight);
    
    // Directional light (sun-like)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 30, 20);
    mainLight.castShadow = true;
    
    // Configure shadow properties
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    
    sceneRef.current.add(mainLight);
    
    // Add accent light for highlights
    const accentLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
    accentLight.position.set(-10, 20, 5);
    sceneRef.current.add(accentLight);
  };
  
  // Add grid for reference
  const addGrid = () => {
    if (!sceneRef.current) return;
    
    const gridHelper = new THREE.GridHelper(100, 50, 0x304FFE, 0x1A237E);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    gridHelper.position.y = -10;
    sceneRef.current.add(gridHelper);
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };
  
  // Update mouse hover effects
  const updateHoverEffects = () => {
    if (!raycasterRef.current || !cameraRef.current || !dataObjectsRef.current.length) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(dataObjectsRef.current);
    
    if (intersects.length > 0) {
      if (hoveredObjectRef.current !== intersects[0].object) {
        // Reset previous hover
        if (hoveredObjectRef.current) {
          resetHoverEffect(hoveredObjectRef.current);
        }
        
        // Set new hover
        hoveredObjectRef.current = intersects[0].object;
        applyHoverEffect(hoveredObjectRef.current);
      }
    } else if (hoveredObjectRef.current) {
      // Reset hover when mouse leaves object
      resetHoverEffect(hoveredObjectRef.current);
      hoveredObjectRef.current = null;
    }
  };
  
  // Apply hover effect to object
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
      object.scale.set(1.1, 1.1, 1.1);
      
      // Change cursor to indicate interactivity
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.style.cursor = 'pointer';
      }
    }
  };
  
  // Reset hover effect
  const resetHoverEffect = (object) => {
    if (!object.material || !object.userData.originalMaterial) return;
    
    // Restore original values
    object.material.emissiveIntensity = object.userData.originalMaterial.emissiveIntensity;
    object.scale.set(1, 1, 1);
    delete object.userData.originalMaterial;
    
    // Reset cursor
    if (rendererRef.current && rendererRef.current.domElement) {
      rendererRef.current.domElement.style.cursor = 'default';
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
    if (hoveredObjectRef.current && hoveredObjectRef.current.userData.index !== undefined) {
      const index = hoveredObjectRef.current.userData.index;
      
      // Show detailed info about this element
      showElementDetails(index);
    }
  };
  
  // Show element details popup
  const showElementDetails = (index) => {
    if (!steps || !steps.length) return;
    
    const currentStep = steps[currentStepIndex];
    const element = dataObjectsRef.current[index];
    
    if (!element || !currentStep) return;
    
    // Create popup content
    let popupContent = document.createElement('div');
    popupContent.className = 'element-popup';
    popupContent.innerHTML = `
      <div class="popup-content">
        <h3>Element Details</h3>
        <p><strong>Value:</strong> ${currentStep.state[index]}</p>
        <p><strong>Index:</strong> ${index}</p>
        <p><strong>Status:</strong> ${getElementStatus(index, currentStep)}</p>
      </div>
    `;
    popupContent.style.position = 'absolute';
    popupContent.style.zIndex = '1000';
    popupContent.style.backgroundColor = 'rgba(20, 30, 50, 0.9)';
    popupContent.style.color = 'white';
    popupContent.style.padding = '15px';
    popupContent.style.borderRadius = '8px';
    popupContent.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    popupContent.style.maxWidth = '300px';
    
    // Position the popup near the 3D element
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(element.matrixWorld);
    position.project(cameraRef.current);
    
    const x = (position.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
    const y = (-(position.y * 0.5) + 0.5) * canvasRect.height + canvasRect.top;
    
    popupContent.style.left = `${x}px`;
    popupContent.style.top = `${y - 150}px`;
    
    // Add to DOM
    document.body.appendChild(popupContent);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(popupContent);
    }, 3000);
  };
  
  // Helper to get element status in current step
  const getElementStatus = (index, step) => {
    if (step.comparing && step.comparing.includes(index)) {
      return 'Being compared';
    } else if (step.swapped && step.swapped.includes(index)) {
      return 'Being swapped';
    } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
      return 'Sorted';
    } else if (step.min_idx === index) {
      return 'Current minimum';
    } else if (step.pivot_index === index) {
      return 'Pivot element';
    } else {
      return 'Standard element';
    }
  };
  
  // Clean up Three.js resources
  const cleanupScene = () => {
    if (sceneRef.current) {
      // Remove all objects
      while(sceneRef.current.children.length > 0) { 
        const object = sceneRef.current.children[0];
        sceneRef.current.remove(object);
        
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    }
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };
  
  // Create 3D visualization based on current step
  const updateVisualization = () => {
    if (!sceneRef.current || !steps || steps.length === 0) return;
    
    // Clear previous visualization
    clearVisualization();
    
    // Get current step
    const currentStep = steps[currentStepIndex];
    
    // Create visualization for the step
    createVisualization(currentStep);
    
    // Update step counter display
    const stepCounter = document.getElementById('step-counter');
    if (stepCounter) {
      stepCounter.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;
    }
    
    // Update step description
    const stepDescription = document.getElementById('step-description');
    if (stepDescription && currentStep) {
      stepDescription.textContent = currentStep.description || 'No description';
    }
  };
  
  // Clear previous visualization objects
  const clearVisualization = () => {
    if (!sceneRef.current) return;
    
    // Remove old data objects
    dataObjectsRef.current.forEach(obj => {
      if (sceneRef.current.children.includes(obj)) {
        sceneRef.current.remove(obj);
      }
      
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    dataObjectsRef.current = [];
  };
  
  // Create visualization from step data with larger, fewer elements
  const createVisualization = (step) => {
    if (!sceneRef.current || !step || !step.state) return;
    
    const data = step.state;
    
    // Use larger base size for better visibility (doubled from original)
    const baseSize = 8;
    const spacing = 12;
    
    // Calculate total width for centering
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1);
    
    // Create shapes for each element
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const heightScale = Math.max(0.2, value / maxValue);
      const height = baseSize * 5 * heightScale;
      
      // Determine color based on element status
      let color;
      if (step.comparing && step.comparing.includes(i)) {
        color = 0xef4444; // Red for comparison
      } else if (step.swapped && step.swapped.includes(i)) {
        color = 0xf59e0b; // Orange for swapped
      } else if (step.sorted_indices && step.sorted_indices.includes(i)) {
        color = 0x10b981; // Green for sorted
      } else if (step.min_idx === i || step.pivot_index === i) {
        color = 0x9333ea; // Purple for selected
      } else {
        color = 0x3b82f6; // Blue for default
      }
      
      // Create geometry based on selected shape
      let geometry;
      switch (selectedShape) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(baseSize * 0.7, 32, 24);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(baseSize * 0.5, baseSize * 0.5, height, 32);
          break;
        case 'pyramid':
          geometry = new THREE.ConeGeometry(baseSize * 0.7, height, 4);
          break;
        case 'cube':
        default:
          geometry = new THREE.BoxGeometry(baseSize, height, baseSize);
      }
      
      // For non-box geometries, adjust position calculation
      let yOffset = 0;
      if (selectedShape === 'cylinder' || selectedShape === 'pyramid') {
        yOffset = height / 2;
      } else if (selectedShape === 'cube') {
        yOffset = height / 2;
      } else if (selectedShape === 'sphere') {
        // Scale sphere to show size difference
        geometry.scale(1, heightScale * 3, 1);
        yOffset = baseSize * 0.7;
      }
      
      // Create improved material with glow effect
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.7,
        roughness: 0.2, 
        emissive: color,
        emissiveIntensity: 0.2,
        clearcoat: 0.4,
        reflectivity: 0.6
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Store index for interaction
      mesh.userData.index = i;
      
      // Position the shape
      mesh.position.set(startX + i * (baseSize + spacing), yOffset, 0);
      
      // Cast shadows
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add to scene
      sceneRef.current.add(mesh);
      dataObjectsRef.current[i] = mesh;
      
      // Add text label for value
      if (showLabels) {
        addValueLabel(value, mesh, i, height);
      }
    }
    
    // Show comparison or swap arrows if needed
    if (step.comparing && step.comparing.length === 2) {
      addComparisonIndicator(step.comparing[0], step.comparing[1], data);
    }
    
    if (step.swapped && step.swapped.length === 2) {
      addSwapIndicator(step.swapped[0], step.swapped[1], data);
    }
  };
  
  // Add text label for element value
  const addValueLabel = (value, element, index, height) => {
    if (!element) return;
    
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 128;
    
    // Draw text background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(24, 24, 80, 80, 10);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), 64, 64);
    
    // Create sprite with texture
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // Scale the sprite
    sprite.scale.set(7, 7, 1);
    
    // Position above element
    const yOffset = selectedShape === 'cube' ? height + 6 : height + 3;
    sprite.position.set(element.position.x, element.position.y + yOffset, element.position.z);
    
    // Add to scene
    sceneRef.current.add(sprite);
  };
  
  // Add arrow showing comparison
  const addComparisonIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const elem1 = dataObjectsRef.current[index1];
    const elem2 = dataObjectsRef.current[index2];
    
    // Create arc to connect elements
    const midPoint = new THREE.Vector3().addVectors(
      elem1.position, 
      elem2.position
    ).multiplyScalar(0.5);
    midPoint.y += 15; // Raise the arc
    
    // Create arrow material
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    
    // Use a curved line for better visibility
    const curve = new THREE.QuadraticBezierCurve3(
      elem1.position.clone().add(new THREE.Vector3(0, 5, 0)),
      midPoint,
      elem2.position.clone().add(new THREE.Vector3(0, 5, 0))
    );
    
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, arrowMaterial);
    
    sceneRef.current.add(line);
    
    // Add "Compare" text above
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw background
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 108, 15);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('COMPARE', 128, 64);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // Scale and position
    sprite.scale.set(15, 7.5, 1);
    sprite.position.set(midPoint.x, midPoint.y + 5, midPoint.z);
    
    sceneRef.current.add(sprite);
  };
  
  // Add arrow showing swap
  const addSwapIndicator = (index1, index2, data) => {
    if (!sceneRef.current || !dataObjectsRef.current[index1] || !dataObjectsRef.current[index2]) return;
    
    const elem1 = dataObjectsRef.current[index1];
    const elem2 = dataObjectsRef.current[index2];
    
    // Create arrow material
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    
    // Create two curved arrows showing swap
    const midY1 = Math.max(elem1.position.y, elem2.position.y) + 10;
    const midY2 = Math.max(elem1.position.y, elem2.position.y) + 20;
    
    // First curve
    const curvePoints1 = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = elem1.position.x + (elem2.position.x - elem1.position.x) * t;
      const y = elem1.position.y + 5 + Math.sin(Math.PI * t) * midY1;
      curvePoints1.push(new THREE.Vector3(x, y, 0));
    }
    
    // Second curve
    const curvePoints2 = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = elem2.position.x + (elem1.position.x - elem2.position.x) * t;
      const y = elem2.position.y + 5 + Math.sin(Math.PI * t) * midY2;
      curvePoints2.push(new THREE.Vector3(x, y, 0));
    }
    
    // Create lines
    const geometry1 = new THREE.BufferGeometry().setFromPoints(curvePoints1);
    const geometry2 = new THREE.BufferGeometry().setFromPoints(curvePoints2);
    
    const line1 = new THREE.Line(geometry1, arrowMaterial);
    const line2 = new THREE.Line(geometry2, arrowMaterial);
    
    sceneRef.current.add(line1);
    sceneRef.current.add(line2);
    
    // Add "Swap" text above
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw background
    ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 108, 15);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAP', 128, 64);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    // Scale and position
    sprite.scale.set(15, 7.5, 1);
    const middleX = (elem1.position.x + elem2.position.x) / 2;
    sprite.position.set(middleX, midY2 + 15, 0);
    
    sceneRef.current.add(sprite);
  };
  
  // Generate random input data
  const generateRandomData = () => {
    // Generate smaller dataset for more visible elements
    const size = 8; // Reduced from typical 10-30 elements
    const data = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    setInputData(data);
    executeAlgorithm(data);
  };
  
  // Execute algorithm
  const executeAlgorithm = (data) => {
    if (!algorithm || !algorithm.id) {
      console.error('No algorithm specified');
      return;
    }
    
    // Setup API call to execute algorithm
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
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      return response.json();
    })
    .then(result => {
      console.log('Algorithm executed', result);
      setSteps(result.steps);
      setCurrentStepIndex(0);
      setTimeout(() => updateVisualization(), 300);
    })
    .catch(error => {
      console.error('Error executing algorithm:', error);
      
      // For demo purposes, generate fake steps
      const fakeSteps = generateFakeSteps(data);
      setSteps(fakeSteps);
      setCurrentStepIndex(0);
      setTimeout(() => updateVisualization(), 300);
    });
  };
  
  // Generate fake steps for demo
  const generateFakeSteps = (data) => {
    const steps = [];
    
    // Initial step
    steps.push({
      type: 'initial',
      state: [...data],
      description: 'Initial unsorted array'
    });
    
    // Compare steps (simplified bubble sort)
    for (let i = 0; i < data.length - 1; i++) {
      for (let j = 0; j < data.length - i - 1; j++) {
        // Comparison step
        steps.push({
          type: 'comparison',
          state: [...data],
          description: `Comparing elements at positions ${j} and ${j+1}`,
          comparing: [j, j+1]
        });
        
        // Swap if needed
        if (data[j] > data[j+1]) {
          [data[j], data[j+1]] = [data[j+1], data[j]];
          steps.push({
            type: 'swap',
            state: [...data],
            description: `Swapping elements at positions ${j} and ${j+1}`,
            swapped: [j, j+1]
          });
        }
      }
    }
    
    // Final step
    steps.push({
      type: 'final',
      state: [...data],
      description: 'Array is now sorted',
      sorted_indices: [...Array(data.length).keys()]
    });
    
    return steps;
  };
  
  // Get CSRF token from cookies
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
  
  // ---- Playback Controls ----
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Start playback
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            // Stop at end
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
  };
  
  // Step forward
  const stepForward = () => {
    if (isPlaying) {
      // Stop playback
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    }
    
    setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  // Step backward
  const stepBackward = () => {
    if (isPlaying) {
      // Stop playback
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
      // Stop playback
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    }
    
    setCurrentStepIndex(0);
  };
  
  // Toggle 2D/3D view
  const toggle2D3DView = () => {
    if (!cameraRef.current) return;
    
    const newView = !is3DView;
    setIs3DView(newView);
    
    // Animate camera transition
    const startPos = cameraRef.current.position.clone();
    const endPos = newView ? 
      new THREE.Vector3(0, 30, 50) : // 3D view
      new THREE.Vector3(0, 80, 0.1);  // 2D view (top-down)
    
    const duration = 1000; // ms
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
  };
  
  // Reset camera position
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    // Animate to default position
    const startPos = cameraRef.current.position.clone();
    const endPos = new THREE.Vector3(0, 30, 50);
    
    const duration = 1000; // ms
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
        // Set final position
        cameraRef.current.position.copy(endPos);
        cameraRef.current.lookAt(0, 0, 0);
        
        // Reset controls
        controlsRef.current.reset();
      }
    };
    
    animateReset();
  };
  
  // Render component
  return (
    <div className="algorithm-visualizer">
      {/* Visualization canvas */}
      <div className="visualization-canvas-container" style={{ height: '600px', position: 'relative' }}>
        <div 
          className="visualization-canvas" 
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#0a1929',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
        
        {/* Overlay controls */}
        <div className="visualization-controls" style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          backgroundColor: 'rgba(20, 30, 50, 0.8)',
          padding: '12px 25px',
          borderRadius: '30px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Reset button */}
          <button 
            onClick={resetVisualization}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Reset"
          >
            ↺
          </button>
          
          {/* Previous button */}
          <button 
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            style={{
              backgroundColor: 'rgba(60, 70, 100, 0.8)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStepIndex === 0 ? 0.5 : 1
            }}
            title="Previous"
          >
            ⏮
          </button>
          
          {/* Play/Pause button */}
          <button 
            onClick={togglePlayPause}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.5rem'
            }}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          
          {/* Next button */}
          <button 
            onClick={stepForward}
            disabled={currentStepIndex === steps.length - 1}
            style={{
              backgroundColor: 'rgba(60, 70, 100, 0.8)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStepIndex === steps.length - 1 ? 0.5 : 1
            }}
            title="Next"
          >
            ⏭
          </button>
          
          {/* Toggle 2D/3D button */}
          <button 
            onClick={toggle2D3DView}
            style={{
              backgroundColor: 'rgba(60, 70, 100, 0.8)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={is3DView ? "2D View" : "3D View"}
          >
            {is3DView ? "2D" : "3D"}
          </button>
          
          {/* Reset camera button */}
          <button 
            onClick={resetCamera}
            style={{
              backgroundColor: 'rgba(60, 70, 100, 0.8)',
              color: 'white',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Reset Camera"
          >
            👁️
          </button>
        </div>
      </div>
      
      {/* Shape selector */}
      <div className="shape-controls" style={{
        display: 'flex',
        gap: '15px',
        marginTop: '15px',
        backgroundColor: 'rgba(20, 30, 50, 0.7)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <div style={{ color: 'white' }}>Element Shape:</div>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          {['cube', 'sphere', 'cylinder', 'pyramid'].map(shape => (
            <button 
              key={shape}
              onClick={() => setSelectedShape(shape)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: selectedShape === shape ? 'rgba(59, 130, 246, 0.8)' : 'rgba(60, 70, 100, 0.7)',
                border: '1px solid',
                borderColor: selectedShape === shape ? 'white' : 'rgba(100, 149, 237, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.2rem'
              }}
            >
              {shape === 'cube' ? '□' : 
               shape === 'sphere' ? '○' : 
               shape === 'cylinder' ? '⊙' : '△'}
            </button>
          ))}
        </div>
        
        <div style={{ color: 'white', marginLeft: '15px' }}>Options:</div>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
            <input 
              type="checkbox" 
              checked={showLabels} 
              onChange={() => setShowLabels(!showLabels)}
            />
            Show Labels
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
            <input 
              type="checkbox" 
              checked={focusMode} 
              onChange={() => setFocusMode(!focusMode)}
            />
            Focus Mode
          </label>
        </div>
      </div>
      
      {/* Step info panel */}
      <div className="step-info" style={{
        marginTop: '15px',
        backgroundColor: 'rgba(20, 30, 50, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <div id="step-counter" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          Step {currentStepIndex + 1} of {steps.length}
        </div>
        <div id="step-description" style={{ fontSize: '1.1rem' }}>
          {steps[currentStepIndex]?.description || 'No description available'}
        </div>
        {steps[currentStepIndex]?.educational_note && (
          <div style={{ marginTop: '10px', color: '#aaa', fontSize: '0.9rem' }}>
            {steps[currentStepIndex].educational_note}
          </div>
        )}
      </div>
      
      {/* Usage instructions */}
      <div style={{
        marginTop: '15px',
        backgroundColor: 'rgba(20, 30, 50, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h3 style={{ marginTop: 0 }}>How to Interact:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Click and drag to rotate the view</li>
          <li>Scroll to zoom in/out</li>
          <li>Click on individual elements to see details</li>
          <li>Try different shapes using the selector above</li>
          <li>Toggle between 2D and 3D views</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedVisualizationPlayer;