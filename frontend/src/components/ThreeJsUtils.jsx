import * as THREE from 'three';

// Collection of shape generators for various 3D shapes
export const ShapeFactory = {
  // Standard cube/box shape
  cube: (size, heightScale = 1) => {
    return new THREE.BoxGeometry(size, size * heightScale, size);
  },
  
  // Sphere shape
  sphere: (size, heightScale = 1) => {
    const geometry = new THREE.SphereGeometry(size * 0.7, 32, 24);
    geometry.scale(1, heightScale, 1);
    return geometry;
  },
  
  // Cylinder shape
  cylinder: (size, heightScale = 1) => {
    return new THREE.CylinderGeometry(
      size * 0.5,  // top radius
      size * 0.5,  // bottom radius
      size * heightScale, // height
      32 // radial segments
    );
  },
  
  // Pyramid (cone with 4 sides)
  pyramid: (size, heightScale = 1) => {
    return new THREE.ConeGeometry(
      size * 0.7, // radius
      size * heightScale, // height
      4 // radial segments
    );
  },
  
  // Helper for calculating position adjustments based on shape
  getPositionAdjustment: (shape, size, height) => {
    switch(shape) {
      case 'cylinder':
      case 'pyramid':
        return height / 2;
      case 'cube':
        return height / 2;
      case 'sphere':
        return size * 0.7;
      default:
        return height / 2;
    }
  }
};

// Color themes for different algorithm operations
export const ColorThemes = {
  default: 0x3b82f6,    // Blue
  comparison: 0xef4444, // Red
  swap: 0xf59e0b,       // Orange
  sorted: 0x10b981,     // Green
  selected: 0x9333ea,   // Purple
  highlight: 0x64b5f6   // Light blue
};

// Helper to determine the color of an element based on its role in the current step
export const getElementColor = (index, step) => {
  if (!step) return ColorThemes.default;
  
  if (step.comparing && step.comparing.includes(index)) {
    return ColorThemes.comparison;
  } else if (step.swapped && step.swapped.includes(index)) {
    return ColorThemes.swap;
  } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
    return ColorThemes.sorted;
  } else if (step.min_idx === index || step.pivot_index === index) {
    return ColorThemes.selected;
  }
  
  return ColorThemes.default;
};

// Helper to get status text for an element
export const getElementStatus = (index, step) => {
  if (!step) return 'Standard element';
  
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
  } else if (step.checking_index === index) {
    return 'Being checked';
  }
  
  return 'Standard element';
};

// Create a label for a 3D element
export const createValueLabel = (value, position, size = 7) => {
  // Create canvas for the text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;
  
  // Draw text background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(24, 24, 80, 80, 10);
  ctx.fill();
  
  // Draw border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
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
  
  // Scale and position the sprite
  sprite.scale.set(size, size, 1);
  sprite.position.copy(position);
  
  return sprite;
};

// Create a comparison indicator between two elements
export const createComparisonIndicator = (element1, element2, color = ColorThemes.comparison) => {
  if (!element1 || !element2) return null;
  
  const group = new THREE.Group();
  
  // Calculate midpoint for the arc
  const midPoint = new THREE.Vector3().addVectors(
    element1.position, 
    element2.position
  ).multiplyScalar(0.5);
  midPoint.y += 15; // Raise the arc
  
  // Create curved line
  const curve = new THREE.QuadraticBezierCurve3(
    element1.position.clone().add(new THREE.Vector3(0, 5, 0)),
    midPoint,
    element2.position.clone().add(new THREE.Vector3(0, 5, 0))
  );
  
  const points = curve.getPoints(20);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ 
    color: color, 
    linewidth: 2 
  });
  
  const line = new THREE.Line(geometry, material);
  group.add(line);
  
  // Create "COMPARE" text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;
  
  // Draw background
  ctx.fillStyle = `rgba(${(color>>16)&255}, ${(color>>8)&255}, ${color&255}, 0.8)`;
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
  const material2 = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material2);
  
  // Scale and position
  sprite.scale.set(15, 7.5, 1);
  sprite.position.set(midPoint.x, midPoint.y + 5, midPoint.z);
  
  group.add(sprite);
  return group;
};

// Create a swap indicator between two elements
export const createSwapIndicator = (element1, element2, color = ColorThemes.swap) => {
  if (!element1 || !element2) return null;
  
  const group = new THREE.Group();
  
  // Calculate arc heights
  const midY1 = Math.max(element1.position.y, element2.position.y) + 10;
  const midY2 = Math.max(element1.position.y, element2.position.y) + 20;
  
  // Create material
  const material = new THREE.LineBasicMaterial({ 
    color: color, 
    linewidth: 2 
  });
  
  // First curve (element1 to element2)
  const curvePoints1 = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = element1.position.x + (element2.position.x - element1.position.x) * t;
    const y = element1.position.y + 5 + Math.sin(Math.PI * t) * midY1;
    curvePoints1.push(new THREE.Vector3(x, y, 0));
  }
  
  // Second curve (element2 to element1)
  const curvePoints2 = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = element2.position.x + (element1.position.x - element2.position.x) * t;
    const y = element2.position.y + 5 + Math.sin(Math.PI * t) * midY2;
    curvePoints2.push(new THREE.Vector3(x, y, 0));
  }
  
  // Create lines
  const geometry1 = new THREE.BufferGeometry().setFromPoints(curvePoints1);
  const geometry2 = new THREE.BufferGeometry().setFromPoints(curvePoints2);
  
  const line1 = new THREE.Line(geometry1, material);
  const line2 = new THREE.Line(geometry2, material);
  
  group.add(line1);
  group.add(line2);
  
  // Create "SWAP" text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;
  
  // Draw background
  ctx.fillStyle = `rgba(${(color>>16)&255}, ${(color>>8)&255}, ${color&255}, 0.8)`;
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
  const material2 = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material2);
  
  // Scale and position
  sprite.scale.set(15, 7.5, 1);
  const middleX = (element1.position.x + element2.position.x) / 2;
  sprite.position.set(middleX, midY2 + 15, 0);
  
  group.add(sprite);
  return group;
};

// Setup the Three.js scene with standard configuration
export const setupScene = (container) => {
  if (!container) return null;
  
  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1929);
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 30, 50);
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Clear container and add renderer
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  
  // Add lighting
  addLighting(scene);
  
  // Add grid
  addGrid(scene);
  
  return { scene, camera, renderer };
};

// Add standard lighting to a scene
export const addLighting = (scene) => {
  if (!scene) return;
  
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
  scene.add(ambientLight);
  
  // Main directional light
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
  
  scene.add(mainLight);
  
  // Add accent light for better highlights
  const accentLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
  accentLight.position.set(-10, 20, 5);
  scene.add(accentLight);
  
  // Add a subtle hemisphere light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0a1929, 0.3);
  scene.add(hemiLight);
};

// Add a grid to the scene
export const addGrid = (scene) => {
  if (!scene) return;
  
  const gridHelper = new THREE.GridHelper(100, 50, 0x304FFE, 0x1A237E);
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  gridHelper.position.y = -10;
  scene.add(gridHelper);
  
  // Add a subtle ground plane for shadow reception
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x0a1929,
    opacity: 0.2,
    transparent: true,
    roughness: 0.8,
    metalness: 0.2
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -10.1;
  ground.receiveShadow = true;
  scene.add(ground);
};

// Apply hover effect to an object
export const applyHoverEffect = (object) => {
  if (!object || !object.material) return;
  
  // Store original material properties
  if (!object.userData.originalMaterial) {
    object.userData.originalMaterial = {
      emissiveIntensity: object.material.emissiveIntensity || 0,
      scale: object.scale.x
    };
    
    // Enhance emission for hover effect
    object.material.emissiveIntensity = (object.material.emissiveIntensity || 0) * 2;
    object.scale.set(1.1, 1.1, 1.1);
  }
};

// Reset hover effect
export const resetHoverEffect = (object) => {
  if (!object || !object.material || !object.userData.originalMaterial) return;
  
  // Restore original values
  object.material.emissiveIntensity = object.userData.originalMaterial.emissiveIntensity;
  object.scale.set(1, 1, 1);
  delete object.userData.originalMaterial;
};

// Create elements for visualization
export const createVisualizationElements = (scene, step, options = {}) => {
  if (!scene || !step || !step.state) return [];
  
  const {
    selectedShape = 'cube',
    baseSize = 8,
    spacing = 12,
    showLabels = true,
    maxItems = 20 // Limit number of items for better visibility
  } = options;
  
  const data = step.state.slice(0, maxItems);
  const elements = [];
  
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
    
    // Get color based on element's role in the step
    const color = getElementColor(i, step);
    
    // Create geometry based on selected shape
    let geometry;
    switch (selectedShape) {
      case 'sphere':
        geometry = ShapeFactory.sphere(baseSize, heightScale * 3);
        break;
      case 'cylinder':
        geometry = ShapeFactory.cylinder(baseSize, heightScale * 5);
        break;
      case 'pyramid':
        geometry = ShapeFactory.pyramid(baseSize, heightScale * 5);
        break;
      case 'cube':
      default:
        geometry = ShapeFactory.cube(baseSize, heightScale * 5);
    }
    
    // Calculate position adjustment based on shape
    const yOffset = ShapeFactory.getPositionAdjustment(selectedShape, baseSize, height);
    
    // Create material with glow effect
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
    
    // Set element position
    const xPos = startX + i * (baseSize + spacing);
    mesh.position.set(xPos, yOffset, 0);
    
    // Store element index for interaction
    mesh.userData.index = i;
    
    // Add shadow casting
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add to scene
    scene.add(mesh);
    elements.push(mesh);
    
    // Add value label if enabled
    if (showLabels) {
      const labelPosition = new THREE.Vector3(
        xPos, 
        yOffset + (selectedShape === 'cube' ? height + 6 : height + 3), 
        0
      );
      
      const label = createValueLabel(value, labelPosition);
      scene.add(label);
      
      // Also add this to the elements array to track and remove later
      elements.push(label);
    }
  }
  
  // Add operation indicators if needed
  if (step.comparing && step.comparing.length === 2) {
    const idx1 = step.comparing[0];
    const idx2 = step.comparing[1];
    
    if (idx1 < elements.length && idx2 < elements.length) {
      const compareArrow = createComparisonIndicator(
        elements[idx1], 
        elements[idx2], 
        ColorThemes.comparison
      );
      
      if (compareArrow) {
        scene.add(compareArrow);
        elements.push(compareArrow);
      }
    }
  }
  
  if (step.swapped && step.swapped.length === 2) {
    const idx1 = step.swapped[0];
    const idx2 = step.swapped[1];
    
    if (idx1 < elements.length && idx2 < elements.length) {
      const swapArrow = createSwapIndicator(
        elements[idx1], 
        elements[idx2], 
        ColorThemes.swap
      );
      
      if (swapArrow) {
        scene.add(swapArrow);
        elements.push(swapArrow);
      }
    }
  }
  
  return elements;
};

// Clear all visualization elements from a scene
export const clearVisualization = (scene, elements) => {
  if (!scene) return;
  
  // Remove all elements from the scene
  elements.forEach(element => {
    scene.remove(element);
    
    // Dispose of geometries and materials
    if (element.geometry) {
      element.geometry.dispose();
    }
    
    if (element.material) {
      if (Array.isArray(element.material)) {
        element.material.forEach(material => material.dispose());
      } else {
        element.material.dispose();
      }
    }
  });
};

// Clean up all Three.js resources
export const cleanupScene = (scene, renderer) => {
  if (scene) {
    // Dispose of all scene objects
    scene.traverse(object => {
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
  }
  
  if (renderer) {
    renderer.dispose();
  }
};