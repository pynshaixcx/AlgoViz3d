// Enhanced Algorithm Visualization Player

// DOM Elements with error handling
let visualizationCanvas, playPauseBtn, stepForwardBtn, stepBackwardBtn, resetBtn,
    speedSlider, currentStepElement, stepDescriptionElement, stepCounterElement,
    cameraResetBtn, toggleViewBtn, inputSizeSlider, sizeValueElement, randomDataBtn,
    nearlySortedBtn, reversedBtn, customInputField, applyCustomBtn, codeElement,
    shapeSelector, themeSelector, focusDescriptionElement, focusModeToggle;

// Global state
const state = {
    algorithmId: null,
    algorithmName: '',
    inputData: [],
    steps: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 5,
    is3DView: true,
    intervalId: null,
    visualizationShape: 'cube', // cube, sphere, pyramid, custom
    colorTheme: 'blue', // blue, green, purple, orange, rainbow
    highlightColors: {
        default: 0x4285F4, // Blue
        comparison: 0xEA4335, // Red
        swap: 0xFBBC05, // Yellow
        sorted: 0x34A853, // Green
        selected: 0xAA46BC  // Purple
    },
    // Enhanced focus mode
    focusMode: true,
    focusedElements: []
};

// Custom shape geometries
const shapes = {
    cube: (size) => new THREE.BoxGeometry(size, size, size),
    sphere: (size) => new THREE.SphereGeometry(size * 0.6, 16, 16),
    cylinder: (size) => new THREE.CylinderGeometry(size * 0.5, size * 0.5, size, 16),
    pyramid: (size) => new THREE.ConeGeometry(size * 0.7, size, 4),
    diamond: (size) => {
        // Custom diamond geometry
        const geometry = new THREE.OctahedronGeometry(size * 0.7);
        return geometry;
    }
};

// Color themes
const themes = {
    blue: {
        default: 0x4285F4,
        comparison: 0xEA4335,
        swap: 0xFBBC05,
        sorted: 0x34A853,
        selected: 0xAA46BC
    },
    green: {
        default: 0x34A853,
        comparison: 0xEA4335,
        swap: 0xFBBC05,
        sorted: 0x4285F4,
        selected: 0xAA46BC
    },
    purple: {
        default: 0xAA46BC,
        comparison: 0xEA4335,
        swap: 0xFBBC05,
        sorted: 0x34A853,
        selected: 0x4285F4
    },
    orange: {
        default: 0xFA7B17,
        comparison: 0xEA4335,
        swap: 0x4285F4,
        sorted: 0x34A853,
        selected: 0xAA46BC
    },
    rainbow: {
        getRainbowColor: (index, total) => {
            // Generate a rainbow color based on index
            const hue = (index / total) * 360;
            return new THREE.Color(`hsl(${hue}, 100%, 60%)`);
        }
    }
};

// Three.js variables
let scene, camera, renderer, controls;
let dataObjects = [];
let stepLabels = [];
let focusSpotlight = null;
let arrowObjects = [];

// Initialize the visualization
function init() {
    console.log('Initializing enhanced visualization...');
    
    // Get algorithm data
    if (typeof algorithmData !== 'undefined') {
        state.algorithmId = algorithmData.id;
        state.algorithmName = algorithmData.name;
        console.log('Algorithm data loaded:', state.algorithmName);
    } else {
        console.error('Algorithm data not found!');
    }
    
    // Get DOM elements with error handling
    try {
        visualizationCanvas = document.getElementById('visualization-canvas');
        playPauseBtn = document.getElementById('play-pause');
        stepForwardBtn = document.getElementById('step-forward');
        stepBackwardBtn = document.getElementById('step-backward');
        resetBtn = document.getElementById('reset');
        speedSlider = document.getElementById('animation-speed');
        currentStepElement = document.getElementById('current-step');
        stepDescriptionElement = document.getElementById('step-description');
        stepCounterElement = document.getElementById('step-counter');
        cameraResetBtn = document.getElementById('camera-reset');
        toggleViewBtn = document.getElementById('toggle-2d-3d');
        inputSizeSlider = document.getElementById('input-size');
        sizeValueElement = document.getElementById('size-value');
        randomDataBtn = document.getElementById('generate-random');
        nearlySortedBtn = document.getElementById('generate-nearly-sorted');
        reversedBtn = document.getElementById('generate-reversed');
        customInputField = document.getElementById('custom-input-data');
        applyCustomBtn = document.getElementById('apply-custom');
        codeElement = document.getElementById('algorithm-code');
        focusDescriptionElement = document.getElementById('focused-step-description');
        focusModeToggle = document.getElementById('focus-mode-toggle');
        
        // New elements for shape and theme selection
        shapeSelector = document.getElementById('shape-selector');
        themeSelector = document.getElementById('theme-selector');
        
        // Check if crucial elements exist
        if (!visualizationCanvas) {
            throw new Error('Visualization canvas not found!');
        }
    } catch (error) {
        console.error('Error getting DOM elements:', error);
        return;
    }
    
    // Set up focus mode toggle
    if (focusModeToggle) {
        focusModeToggle.checked = state.focusMode;
        focusModeToggle.addEventListener('change', function() {
            state.focusMode = this.checked;
            updateVisualization(true);
        });
    }
    
    // Set up UI interactivity for new controls
    setupShapeSelector();
    setupThemeSelector();
    
    // Set up Three.js scene
    if (!setupScene()) {
        console.error('Failed to set up Three.js scene');
        return;
    }
    
    // Generate random data initially
    generateRandomData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    console.log('Enhanced visualization initialized successfully');
}

// Set up shape selector
function setupShapeSelector() {
    if (!shapeSelector) return;
    
    // Create shape options if they don't exist
    if (shapeSelector.children.length === 0) {
        const shapeOptions = [
            { id: 'cube', icon: '□', label: 'Cube' },
            { id: 'sphere', icon: '○', label: 'Sphere' },
            { id: 'cylinder', icon: '⊙', label: 'Cylinder' },
            { id: 'pyramid', icon: '△', label: 'Pyramid' },
            { id: 'diamond', icon: '◆', label: 'Diamond' }
        ];
        
        shapeOptions.forEach(shape => {
            const option = document.createElement('div');
            option.className = `shape-option ${state.visualizationShape === shape.id ? 'active' : ''}`;
            option.setAttribute('data-shape', shape.id);
            option.setAttribute('title', shape.label);
            option.textContent = shape.icon;
            option.addEventListener('click', () => {
                // Remove active class from all options
                document.querySelectorAll('.shape-option').forEach(el => el.classList.remove('active'));
                // Add active class to selected option
                option.classList.add('active');
                // Update state
                state.visualizationShape = shape.id;
                // Redraw visualization
                updateVisualization();
            });
            shapeSelector.appendChild(option);
        });
    }
}

// Set up theme selector
function setupThemeSelector() {
    if (!themeSelector) return;
    
    // Create theme options if they don't exist
    if (themeSelector.children.length === 0) {
        const themeOptions = [
            { id: 'blue', class: 'theme-blue', label: 'Blue Theme' },
            { id: 'green', class: 'theme-green', label: 'Green Theme' },
            { id: 'purple', class: 'theme-purple', label: 'Purple Theme' },
            { id: 'orange', class: 'theme-orange', label: 'Orange Theme' },
            { id: 'rainbow', class: 'theme-rainbow', label: 'Rainbow Theme' }
        ];
        
        themeOptions.forEach(theme => {
            const option = document.createElement('div');
            option.className = `theme-option ${theme.class} ${state.colorTheme === theme.id ? 'active' : ''}`;
            option.setAttribute('data-theme', theme.id);
            option.setAttribute('title', theme.label);
            option.addEventListener('click', () => {
                // Remove active class from all options
                document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
                // Add active class to selected option
                option.classList.add('active');
                // Update state
                state.colorTheme = theme.id;
                state.highlightColors = themes[theme.id];
                // Redraw visualization
                updateVisualization();
            });
            themeSelector.appendChild(option);
        });
    }
}

// Set up Three.js scene with enhanced lighting and setup
function setupScene() {
    try {
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded!');
            // Create a fallback message
            if (visualizationCanvas) {
                const fallbackMsg = document.createElement('div');
                fallbackMsg.className = 'fallback-message';
                fallbackMsg.innerHTML = '<p>3D visualization library not loaded.</p><p>Please check your internet connection and refresh the page.</p>';
                visualizationCanvas.appendChild(fallbackMsg);
            }
            return false;
        }
        
        // Create scene with improved lighting
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a1929); // Dark blue background
        
        // Improved grid with subtle fade
        const gridHelper = new THREE.GridHelper(100, 50, 0x304FFE, 0x1A237E);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        
        // Create camera with better positioning
        const aspect = visualizationCanvas.clientWidth / visualizationCanvas.clientHeight || 2;
        camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
        camera.position.set(0, 40, 60); // Positioned better for viewing
        
        // Create renderer with enhanced quality
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        visualizationCanvas.innerHTML = ''; // Clear any existing content
        visualizationCanvas.appendChild(renderer.domElement);
        
        // Add enhanced lighting for better 3D effect
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
        scene.add(ambientLight);
        
        // Main directional light with shadows
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
        
        // Fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0x9090ff, 0.6);
        fillLight.position.set(-10, 20, -15);
        scene.add(fillLight);
        
        // Add a subtle point light for highlights
        const pointLight = new THREE.PointLight(0x3f51b5, 0.8, 100);
        pointLight.position.set(-10, 20, 5);
        scene.add(pointLight);
        
        // Add spotlight for focused element
        focusSpotlight = new THREE.SpotLight(0xffffff, 1.2);
        focusSpotlight.position.set(0, 60, 0);
        focusSpotlight.angle = Math.PI / 6;
        focusSpotlight.penumbra = 0.3;
        focusSpotlight.decay = 1;
        focusSpotlight.distance = 200;
        focusSpotlight.castShadow = true;
        focusSpotlight.visible = false;
        scene.add(focusSpotlight);
        
        // Add orbit controls with smoother damping
        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('THREE.OrbitControls not found, using basic camera controls');
            controls = {
                update: function() {} // Dummy update function
            };
        } else {
            // Add orbit controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.rotateSpeed = 0.7;
            controls.enableZoom = true;
            controls.autoRotate = false;
            controls.autoRotateSpeed = 0.5;
            controls.enablePan = true;
        }
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        return true;
    } catch (error) {
        console.error('Error setting up scene:', error);
        return false;
    }
}

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer || !visualizationCanvas) return;
    
    camera.aspect = visualizationCanvas.clientWidth / visualizationCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
}

// Animation loop
function animate() {
    if (!renderer || !scene || !camera) return;
    
    requestAnimationFrame(animate);
    if (controls && typeof controls.update === 'function') {
        controls.update();
    }
    
    // Animate any elements that need continuous updates
    animateFocusElements();
    
    renderer.render(scene, camera);
}

// Create a more visible step indicator
function createStepIndicator(step, totalSteps) {
    // Remove any existing step indicator
    const existingIndicator = document.getElementById('enhanced-step-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create a new step indicator
    const indicator = document.createElement('div');
    indicator.id = 'enhanced-step-indicator';
    indicator.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background-color: rgba(30, 30, 50, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 1000;
        border: 2px solid rgba(100, 149, 237, 0.5);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    `;
    indicator.textContent = `Step ${step + 1} of ${totalSteps}`;
    
    visualizationCanvas.appendChild(indicator);
}

// Animate focused elements (pulsing, rotation, etc.)
function animateFocusElements() {
    // If we have focused elements, apply a subtle pulsing effect
    if (state.focusMode && state.focusedElements.length > 0 && dataObjects.length > 0) {
        const time = Date.now() * 0.001;
        state.focusedElements.forEach(index => {
            if (index >= 0 && index < dataObjects.length) {
                const element = dataObjects[index];
                if (element && element.scale) {
                    // Apply a pulsing scale effect
                    const pulseFactor = 1 + Math.sin(time * 3) * 0.1;
                    element.scale.set(pulseFactor, pulseFactor, pulseFactor);
                    
                    // Update spotlight position to follow the focused element
                    if (focusSpotlight && state.focusedElements.length === 1) {
                        focusSpotlight.position.x = element.position.x;
                        focusSpotlight.position.z = element.position.z + 10;
                        focusSpotlight.target = element;
                    }
                }
            }
        });
    }
    
    // Animate arrows if they exist
    animateArrows();
}

// Animate arrows
function animateArrows() {
    if (arrowObjects.length > 0) {
        const time = Date.now() * 0.001;
        arrowObjects.forEach(arrow => {
            if (arrow && arrow.scale) {
                // Pulse the arrow
                const pulseFactor = 1 + Math.sin(time * 3) * 0.1;
                arrow.scale.y = pulseFactor;
            }
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    try {
        // Playback controls
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        if (stepForwardBtn) stepForwardBtn.addEventListener('click', stepForward);
        if (stepBackwardBtn) stepBackwardBtn.addEventListener('click', stepBackward);
        if (resetBtn) resetBtn.addEventListener('click', resetVisualization);
        
        // Speed control
        if (speedSlider) speedSlider.addEventListener('input', updateSpeed);
        
        // View controls
        if (cameraResetBtn) cameraResetBtn.addEventListener('click', resetCamera);
        if (toggleViewBtn) toggleViewBtn.addEventListener('click', toggle2D3DView);
        
        // Input controls
        if (inputSizeSlider) inputSizeSlider.addEventListener('input', updateSizeValue);
        if (randomDataBtn) randomDataBtn.addEventListener('click', generateRandomData);
        if (nearlySortedBtn) nearlySortedBtn.addEventListener('click', generateNearlySortedData);
        if (reversedBtn) reversedBtn.addEventListener('click', generateReversedData);
        if (applyCustomBtn) applyCustomBtn.addEventListener('click', applyCustomData);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Only process shortcuts if not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case ' ': // Space bar - play/pause
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
        case 'r': // R - reset
            resetVisualization();
            event.preventDefault();
            break;
        case 'c': // C - reset camera
            resetCamera();
            event.preventDefault();
            break;
        case 'v': // V - toggle 2D/3D
            toggle2D3DView();
            event.preventDefault();
            break;
        case 'f': // F - toggle focus mode
            if (focusModeToggle) {
                focusModeToggle.checked = !focusModeToggle.checked;
                state.focusMode = focusModeToggle.checked;
                updateVisualization(true);
            }
            event.preventDefault();
            break;
    }
}

// Toggle play/pause with improved animation
function togglePlayPause() {
    if (!playPauseBtn) return;
    
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H10V19H8V5Z" fill="currentColor"/><path d="M14 5H16V19H14V5Z" fill="currentColor"/></svg>`;
        playPauseBtn.classList.add('active');
        startPlayback();
    } else {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;
        playPauseBtn.classList.remove('active');
        stopPlayback();
    }
}

// Start playback with improved timing
function startPlayback() {
    if (state.intervalId) {
        clearInterval(state.intervalId);
    }
    
    if (state.steps.length === 0) {
        console.warn('No steps to play');
        return;
    }
    
    state.intervalId = setInterval(() => {
        if (state.currentStepIndex < state.steps.length - 1) {
            state.currentStepIndex++;
            updateVisualization(true); // true for animated transition
        } else {
            togglePlayPause(); // Stop when we reach the end
        }
    }, 2000 / state.playbackSpeed); // Slower base speed for better viewing and comprehension
}

// Stop playback
function stopPlayback() {
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
}

// Step forward with animated transition
function stepForward() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex++;
        updateVisualization(true); // true for animated transition
    }
}

// Step backward with animated transition
function stepBackward() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        updateVisualization(true); // true for animated transition
    }
}

// Reset visualization with clear indication
function resetVisualization() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    // Add visual feedback for reset
    if (visualizationCanvas) {
        visualizationCanvas.classList.add('reset-flash');
        setTimeout(() => {
            visualizationCanvas.classList.remove('reset-flash');
        }, 300);
    }
    
    state.currentStepIndex = 0;
    updateVisualization(true);
}

// Update visualization speed with feedback
function updateSpeed() {
    if (!speedSlider) return;
    
    state.playbackSpeed = parseInt(speedSlider.value);
    
    // Show visual feedback of speed change
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        speedDisplay.textContent = `${state.playbackSpeed}x`;
        speedDisplay.classList.add('speed-changed');
        setTimeout(() => {
            speedDisplay.classList.remove('speed-changed');
        }, 500);
    }
    
    if (state.isPlaying) {
        stopPlayback();
        startPlayback();
    }
}

// Reset camera position with smooth animation
function resetCamera() {
    if (!camera || !controls) return;
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(0, 40, 60); // Positioned better for viewing
    const duration = 800; // milliseconds
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease in-out
        
        camera.position.lerpVectors(startPos, endPos, easeProgress);
        camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            camera.position.copy(endPos);
            camera.lookAt(0, 0, 0);
            if (typeof controls.reset === 'function') {
                controls.reset();
            }
        }
    }
    
    animateCamera();
}

// Toggle between 2D and 3D view with smooth transition
function toggle2D3DView() {
    if (!camera) return;
    
    state.is3DView = !state.is3DView;
    
    // Update button state
    if (toggleViewBtn) {
        toggleViewBtn.innerHTML = state.is3DView ? 
            `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" stroke-width="2"/></svg>` : 
            `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5H20V19H4V5Z" stroke="currentColor" stroke-width="2"/></svg>`;
    }
    
    if (state.is3DView) {
        // Smooth transition to 3D view
        const startPos = camera.position.clone();
        const endPos = new THREE.Vector3(0, 40, 60);
        const duration = 1000; // milliseconds
        const startTime = Date.now();
        
        // Turn on autoRotate
        if (controls.autoRotate !== undefined) {
            controls.autoRotate = true;
        }
        
        function animate() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease in-out
            
            camera.position.lerpVectors(startPos, endPos, easeProgress);
            camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // After transition completes
                updateVisualization();
            }
        }
        
        animate();
    } else {
        // Smooth transition to 2D view
        const startPos = camera.position.clone();
        const endPos = new THREE.Vector3(0, 80, 0.0001);
        const duration = 1000; // milliseconds
        const startTime = Date.now();
        
        // Turn off autoRotate
        if (controls.autoRotate !== undefined) {
            controls.autoRotate = false;
        }
        
        function animate() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease in-out
            
            camera.position.lerpVectors(startPos, endPos, easeProgress);
            camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // After transition completes
                updateVisualization();
            }
        }
        
        animate();
    }
}

// Update size value display
function updateSizeValue() {
    if (!inputSizeSlider || !sizeValueElement) return;
    
    const size = inputSizeSlider.value;
    sizeValueElement.textContent = size;
    
    // Limit the maximum size to improve focus on individual elements
    if (state.focusMode && size > 20) {
        inputSizeSlider.value = 20;
        sizeValueElement.textContent = 20;
    }
}

// Generate random data with animation
function generateRandomData() {
    if (!inputSizeSlider) return;
    
    // Limit the data size for better focus on individual elements
    let size = parseInt(inputSizeSlider.value);
    if (state.focusMode && size > 20) {
        size = 20;
        inputSizeSlider.value = size;
        sizeValueElement.textContent = size;
    }
    
    state.inputData = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    // Add visual feedback for data generation
    pulseButton(randomDataBtn);
    
    console.log('Generated random data:', state.inputData);
    executeAlgorithm();
}

// Generate nearly sorted data
function generateNearlySortedData() {
    if (!inputSizeSlider) return;
    
    // Limit the data size for better focus on individual elements
    let size = parseInt(inputSizeSlider.value);
    if (state.focusMode && size > 20) {
        size = 20;
        inputSizeSlider.value = size;
        sizeValueElement.textContent = size;
    }
    
    state.inputData = Array.from({ length: size }, (_, i) => i + 1);
    
    // Swap a few elements to make it nearly sorted
    for (let i = 0; i < Math.max(1, size / 10); i++) {
        const idx1 = Math.floor(Math.random() * size);
        const idx2 = Math.floor(Math.random() * size);
        [state.inputData[idx1], state.inputData[idx2]] = [state.inputData[idx2], state.inputData[idx1]];
    }
    
    // Add visual feedback for data generation
    pulseButton(nearlySortedBtn);
    
    console.log('Generated nearly sorted data:', state.inputData);
    executeAlgorithm();
}

// Generate reversed data
function generateReversedData() {
    if (!inputSizeSlider) return;
    
    // Limit the data size for better focus on individual elements
    let size = parseInt(inputSizeSlider.value);
    if (state.focusMode && size > 20) {
        size = 20;
        inputSizeSlider.value = size;
        sizeValueElement.textContent = size;
    }
    
    state.inputData = Array.from({ length: size }, (_, i) => size - i);
    
    // Add visual feedback for data generation
    pulseButton(reversedBtn);
    
    console.log('Generated reversed data:', state.inputData);
    executeAlgorithm();
}

// Helper function for button feedback
function pulseButton(button) {
    if (!button) return;
    
    button.classList.add('button-pulse');
    setTimeout(() => {
        button.classList.remove('button-pulse');
    }, 300);
}

// Apply custom data
function applyCustomData() {
    if (!customInputField) return;
    
    const customInput = customInputField.value;
    
    try {
        // Parse the input (e.g., "3,1,4,1,5,9")
        const data = customInput.split(',').map(item => {
            const parsed = parseInt(item.trim());
            if (isNaN(parsed)) {
                throw new Error('Invalid input');
            }
            return parsed;
        });
        
        if (data.length === 0) {
            throw new Error('Empty input');
        }
        
        // Limit the data size for better focus
        if (state.focusMode && data.length > 20) {
            data.length = 20;
            customInputField.value = data.join(', ');
        }
        
        state.inputData = data;
        console.log('Applied custom data:', state.inputData);
        
        // Add visual feedback
        pulseButton(applyCustomBtn);
        
        executeAlgorithm();
    } catch (error) {
        console.error('Error parsing custom input:', error);
        // Show error message with fade
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Please enter valid data (comma-separated numbers)';
        
        const parent = customInputField.parentElement;
        parent.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.classList.add('fade-out');
            setTimeout(() => {
                parent.removeChild(errorMsg);
            }, 500);
        }, 3000);
    }
}

// Execute the selected algorithm
function executeAlgorithm() {
    if (!state.algorithmId) {
        console.error('No algorithm selected');
        return;
    }
    
    if (state.inputData.length === 0) {
        console.error('No input data');
        return;
    }
    
    // Reset visualization state
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    state.currentStepIndex = 0;
    
    // Clear all 3D objects
    clearVisualization();
    
    // Show loading state
    addLoadingAnimation();
    
    console.log('Executing algorithm:', state.algorithmName, 'with data:', state.inputData);
    
    // Call the API to execute the algorithm
    fetch('/api/execute-algorithm/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            algorithm_id: state.algorithmId,
            input_data: state.inputData
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Algorithm execution response:', data);
        
        removeLoadingAnimation();
        
        if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
            throw new Error('Invalid algorithm steps data');
        }
        
        state.steps = data.steps;
        updateVisualization(true); // animated transition
        
        // Highlight the code based on the algorithm
        highlightRelevantCode();
    })
    .catch(error => {
        console.error('Error executing algorithm:', error);
        removeLoadingAnimation();
        
        // Create simple visualization with the input data as fallback
        createFallbackVisualization();
        
        // Show error notification
        showNotification('Error executing algorithm. Showing input data only.', 'error');
    });
}

// Add loading animation
function addLoadingAnimation() {
    if (!visualizationCanvas) return;
    
    // Remove any existing loading animation
    removeLoadingAnimation();
    
    // Create loading element
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-animation';
    loadingElement.innerHTML = `
        <div class="spinner"></div>
        <p>Processing algorithm...</p>
    `;
    
    // Add styles inline
    const style = document.createElement('style');
    style.id = 'loading-animation-style';
    style.textContent = `
        .loading-animation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            color: white;
            font-size: 14px;
            z-index: 1000;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(100, 149, 237, 0.2);
            border-left-color: rgba(100, 149, 237, 0.8);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    visualizationCanvas.appendChild(loadingElement);
}

// Remove loading animation
function removeLoadingAnimation() {
    const loadingElement = document.querySelector('.loading-animation');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    const loadingStyle = document.getElementById('loading-animation-style');
    if (loadingStyle) {
        loadingStyle.remove();
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Create a fallback visualization if the API fails
function createFallbackVisualization() {
    clearVisualization();
    
    if (!scene || !THREE) return;
    
    // Show the input data with enhanced styling
    const data = state.inputData;
    createVisualizationFromData(data, {
        type: 'fallback',
        description: 'Algorithm execution failed, showing input data only.'
    });
    
    if (stepCounterElement) {
        stepCounterElement.textContent = 'Input Data';
    }
    
    if (stepDescriptionElement) {
        stepDescriptionElement.textContent = `Showing ${data.length} elements`;
    }
}

// Update the visualization based on the current step
function updateVisualization(animated = false) {
    if (state.steps.length === 0) {
        console.warn('No steps to visualize');
        return;
    }
    
    const currentStep = state.steps[state.currentStepIndex];
    
    // Update step information with animation
    if (stepCounterElement) {
        stepCounterElement.textContent = `Step ${state.currentStepIndex + 1} of ${state.steps.length}`;
        if (animated) {
            stepCounterElement.classList.add('step-transition');
            setTimeout(() => {
                stepCounterElement.classList.remove('step-transition');
            }, 300);
        }
    }
    
    // Create enhanced step indicator
    createStepIndicator(state.currentStepIndex, state.steps.length);
    
    if (stepDescriptionElement) {
        // Format step description with highlighted elements
        let description = currentStep.description || 'No description';
        
        // Add specific highlight based on step type
        if (currentStep.type === 'comparison' && currentStep.comparing) {
            description = description.replace(
                /comparing (.*?) and (.*?)($|\s)/i,
                'comparing <span class="step-highlight">$1</span> and <span class="step-highlight">$2</span>$3'
            );
        } else if (currentStep.type === 'swap' && currentStep.swapped) {
            description = description.replace(
                /swapped (.*?) and (.*?)($|\s)/i,
                'swapped <span class="step-highlight">$1</span> and <span class="step-highlight">$2</span>$3'
            );
        }
        
        stepDescriptionElement.innerHTML = description;
        
        if (animated) {
            stepDescriptionElement.classList.add('step-transition');
            setTimeout(() => {
                stepDescriptionElement.classList.remove('step-transition');
            }, 300);
        }
    }
    
    // Update focused element description
    updateFocusedDescription(currentStep);
    
    // Clear previous visualization
    clearVisualization();
    
    // Determine focused elements for this step
    determineFocusedElements(currentStep);
    
    // Create new visualization based on the step
    createVisualizationFromData(currentStep.state, currentStep, animated);
}

// Update focused description
function updateFocusedDescription(step) {
    if (!focusDescriptionElement) return;
    
    let focusedHTML = '';
    
    switch (step.type) {
        case 'initial':
            focusedHTML = `<div class="focus-title">Initial Array</div>
                          <div class="focus-detail">We'll start with an array of ${step.state.length} elements.</div>
                          <div class="focus-explanation">${step.educational_note || `In ${state.algorithmName}, we'll compare and rearrange these elements to sort them.`}</div>`;
            break;
        case 'comparison':
            if (step.comparing && step.comparing.length >= 2) {
                const i1 = step.comparing[0];
                const i2 = step.comparing[1];
                const v1 = step.state[i1];
                const v2 = step.state[i2];
                focusedHTML = `<div class="focus-title">Comparing Elements</div>
                              <div class="focus-detail">Comparing <span class="highlight-value">${v1}</span> with <span class="highlight-value">${v2}</span></div>
                              <div class="focus-explanation">${step.educational_note || 'The algorithm decides whether to swap based on the comparison result.'}</div>`;
            }
            break;
        case 'swap':
            if (step.swapped && step.swapped.length >= 2) {
                const i1 = step.swapped[0];
                const i2 = step.swapped[1];
                const v1 = step.state[i1];
                const v2 = step.state[i2];
                focusedHTML = `<div class="focus-title">Swapping Elements</div>
                              <div class="focus-detail">Swapped <span class="highlight-value">${v2}</span> with <span class="highlight-value">${v1}</span></div>
                              <div class="focus-explanation">${step.educational_note || 'Elements are rearranged to move toward the sorted order.'}</div>`;
            }
            break;
        case 'min_selected':
            if (step.min_idx !== undefined) {
                const val = step.state[step.min_idx];
                focusedHTML = `<div class="focus-title">Current Minimum</div>
                              <div class="focus-detail">Selected <span class="highlight-value">${val}</span> as current minimum</div>
                              <div class="focus-explanation">${step.educational_note || 'We\'ll check if any remaining elements are smaller.'}</div>`;
            }
            break;
        case 'new_min':
            if (step.min_idx !== undefined) {
                const val = step.state[step.min_idx];
                focusedHTML = `<div class="focus-title">New Minimum Found</div>
                              <div class="focus-detail">Found new minimum: <span class="highlight-value">${val}</span></div>
                              <div class="focus-explanation">${step.educational_note || 'This element will be swapped to its correct position.'}</div>`;
            }
            break;
        case 'sorted':
            focusedHTML = `<div class="focus-title">Partial Sorting Complete</div>
                          <div class="focus-detail">Elements in green are in their final sorted positions.</div>
                          <div class="focus-explanation">${step.educational_note || 'We continue sorting the remaining unsorted elements.'}</div>`;
            break;
        case 'final':
            focusedHTML = `<div class="focus-title">Sorting Complete!</div>
                          <div class="focus-detail">All elements are now in the correct order.</div>
                          <div class="focus-explanation">${step.educational_note || `The ${state.algorithmName} algorithm has successfully sorted the array.`}</div>`;
            break;
        case 'pivot':
            if (step.pivot_index !== undefined) {
                const pivot = step.state[step.pivot_index];
                focusedHTML = `<div class="focus-title">Pivot Selection</div>
                              <div class="focus-detail">Selected <span class="highlight-value">${pivot}</span> as pivot</div>
                              <div class="focus-explanation">${step.educational_note || 'Elements smaller than the pivot will go to the left, larger to the right.'}</div>`;
            }
            break;
        case 'partition':
            focusedHTML = `<div class="focus-title">Partition Complete</div>
                          <div class="focus-detail">The array is now partitioned around the pivot.</div>
                          <div class="focus-explanation">${step.educational_note || 'The algorithm will now recursively sort each partition.'}</div>`;
            break;
        default:
            focusedHTML = `<div class="focus-title">${state.algorithmName}</div>
                          <div class="focus-detail">${step.description || ''}</div>
                          <div class="focus-explanation">${step.educational_note || 'Watch how the algorithm processes the data step by step.'}</div>`;
    }
    
    focusDescriptionElement.innerHTML = focusedHTML;
    
    // Add animation to the focus description
    focusDescriptionElement.classList.add('focus-transition');
    setTimeout(() => {
        focusDescriptionElement.classList.remove('focus-transition');
    }, 500);
}

// Determine focused elements for current step
function determineFocusedElements(step) {
    state.focusedElements = [];
    
    if (!state.focusMode) return;
    
    // Use current_focus from step if available
    if (step.current_focus && Array.isArray(step.current_focus)) {
        state.focusedElements = [...step.current_focus];
        return;
    }
    
    // Otherwise, add elements to focus based on step type
    switch (step.type) {
        case 'comparison':
            if (step.comparing) {
                state.focusedElements = [...step.comparing];
            }
            break;
        case 'swap':
        case 'before_swap':
        case 'after_swap':
            if (step.swapped) {
                state.focusedElements = [...step.swapped];
            } else if (step.swapping) {
                state.focusedElements = [...step.swapping];
            }
            break;
        case 'min_selected':
        case 'new_min':
            if (step.min_idx !== undefined) {
                state.focusedElements = [step.min_idx];
            }
            break;
        case 'pivot':
            if (step.pivot_index !== undefined) {
                state.focusedElements = [step.pivot_index];
            }
            break;
        case 'checking':
            if (step.checking_index !== undefined) {
                state.focusedElements = [step.checking_index];
            }
            break;
        case 'found':
            if (step.found_index !== undefined) {
                state.focusedElements = [step.found_index];
            }
            break;
        case 'insert':
            if (step.inserted_index !== undefined) {
                state.focusedElements = [step.inserted_index];
            }
            break;
    }
    
    // Show spotlight if we have exactly one or two focused elements
    if (focusSpotlight) {
        focusSpotlight.visible = (state.focusedElements.length > 0 && state.focusedElements.length <= 2);
    }
}

// Clear the visualization scene
function clearVisualization() {
    if (!scene) return;
    
    // Remove meshes and geometries
    for (const obj of dataObjects) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(material => material.dispose());
            } else {
                obj.material.dispose();
            }
        }
        scene.remove(obj);
    }
    dataObjects = [];
    
    // Remove step labels
    for (const label of stepLabels) {
        scene.remove(label);
    }
    stepLabels = [];
    
    // Clear arrow objects
    for (const arrow of arrowObjects) {
        scene.remove(arrow);
    }
    arrowObjects = [];
}

// Create visualization from data with current step info
function createVisualizationFromData(data, step, animated = false) {
    if (!scene || !THREE || !data || !Array.isArray(data)) {
        console.warn('Invalid visualization data');
        return;
    }
    
    // For focus mode, we'll make the elements much larger
    const baseSize = state.focusMode ? 6 : 2;
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1); // Ensure at least 1 to avoid division by zero
    
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        
        // Scale height based on max value, with a minimum size
        const heightScale = Math.max(0.2, value / maxValue);
        const height = baseSize * 5 * heightScale; // Scale up for better visibility
        
        // Determine element coloring based on operation type and state
        let color = getElementColor(i, step, data.length);
        let opacity = 0.95; // Higher base opacity
        let metalness = 0.5;
        let roughness = 0.2;
        
        // If using focus mode, reduce opacity for non-focused elements
        if (state.focusMode && !state.focusedElements.includes(i)) {
            if (step.sorted_indices && step.sorted_indices.includes(i)) {
                // Keep sorted elements visible but slightly dimmed
                opacity = 0.8;
            } else {
                // Significantly dim other elements
                opacity = 0.2; // Make non-focused elements very transparent
            }
        }
        
        // Create shape geometry based on selected shape
        let geometry;
        const shapeSize = baseSize;
        
        switch (state.visualizationShape) {
            case 'sphere':
                geometry = shapes.sphere(shapeSize);
                break;
            case 'cylinder':
                geometry = shapes.cylinder(shapeSize);
                break;
            case 'pyramid':
                geometry = shapes.pyramid(shapeSize);
                break;
            case 'diamond':
                geometry = shapes.diamond(shapeSize);
                break;
            case 'cube':
            default:
                geometry = state.is3DView 
                    ? new THREE.BoxGeometry(shapeSize, height, shapeSize)
                    : new THREE.BoxGeometry(shapeSize, height, shapeSize * 0.2);
        }
        
        // For non-cube shapes, scale to represent value
        if (state.visualizationShape !== 'cube') {
            geometry.scale(1, heightScale * 5, 1);
        }
        
        // Create material with glass effect
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            metalness: metalness,
            roughness: roughness,
            reflectivity: 0.5,
            clearcoat: 0.3,
            clearcoatRoughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.05 // Subtle glow
        });
        
        // Create the mesh
        const element = new THREE.Mesh(geometry, material);
        
        // Enable shadows
        element.castShadow = true;
        element.receiveShadow = true;
        
        // Calculate position
        const xPos = startX + i * (baseSize + spacing);
        const yPos = state.visualizationShape === 'cube' ? height / 2 : 0;
        
        // Position with animation if needed
        if (animated) {
            // Start position (below the grid)
            element.position.x = xPos;
            element.position.y = -10; // Start lower for more dramatic entrance
            element.position.z = 0;
            element.scale.y = 0.1; // Start small
            
            // Create animation sequence with staggered timing
            const delay = i * 80; // Longer stagger for a more dramatic effect
            const duration = 1000; // Total animation time
            const startTime = Date.now() + delay;
            
            function animateElement() {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < 0) {
                    requestAnimationFrame(animateElement);
                    return;
                }
                
                const progress = Math.min(elapsedTime / duration, 1);
                const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease in-out
                
                element.position.y = -10 + (yPos + 10) * easeProgress;
                element.scale.y = 0.1 + (1 - 0.1) * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateElement);
                } else {
                    element.position.y = yPos;
                    element.scale.y = 1;
                }
            }
            
            animateElement();
        } else {
            // Set final position directly
            element.position.x = xPos;
            element.position.y = yPos;
            element.position.z = 0;
        }
        
        // Add to scene
        scene.add(element);
        dataObjects.push(element);
        
        // Add value label
        addValueLabel(value, element, i, height, animated);
    }
    
    // Add visual indicators for operations (arrows, highlights, etc.)
    addOperationIndicators(data, step);
}

// Add value label above each shape
function addValueLabel(value, element, index, height, animated) {
    try {
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        textCanvas.width = 256;
        textCanvas.height = 256;
        
        // Set font size based on focus mode
        const fontSize = state.focusMode ? 160 : 84;
        
        // Clear canvas
        ctx.clearRect(0, 0, 256, 256);
        
        // Add value text with improved visibility
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, 128, 128);
        
        // Add drop shadow for better visibility
        if (state.focusMode) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.SpriteMaterial({ 
            map: textTexture,
            transparent: true,
            opacity: animated ? 0 : 1 // Start invisible if animated
        });
        
        const textSprite = new THREE.Sprite(textMaterial);
        // Scale the text larger in focus mode
        const scaleFactor = state.focusMode ? 3 : 1.5;
        textSprite.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        // Position above the element, higher for non-cube shapes
        const textY = element.position.y + 
            (state.visualizationShape === 'cube' ? height + 4 : height * 0.5 + 7);
        
        textSprite.position.set(element.position.x, textY, 0);
        
        // Determine visibility based on focus mode
        if (state.focusMode && !state.focusedElements.includes(index)) {
            if (step && step.sorted_indices && step.sorted_indices.includes(index)) {
                // Keep sorted elements more visible
                textMaterial.opacity = animated ? 0 : 0.8;
            } else {
                // Dim non-focused elements
                textMaterial.opacity = animated ? 0 : 0.3;
            }
        }
        
        // Animate text fade-in if needed
        if (animated) {
            const textDelay = index * 80 + 500; // Slightly delayed after elements
            const textDuration = 500;
            const textStartTime = Date.now() + textDelay;
            
            function animateText() {
                const textElapsedTime = Date.now() - textStartTime;
                if (textElapsedTime < 0) {
                    requestAnimationFrame(animateText);
                    return;
                }
                
                const textProgress = Math.min(textElapsedTime / textDuration, 1);
                const targetOpacity = state.focusMode && !state.focusedElements.includes(index) ? 
                    (step && step.sorted_indices && step.sorted_indices.includes(index) ? 0.8 : 0.3) : 1;
                
                textMaterial.opacity = textProgress * targetOpacity;
                
                if (textProgress < 1) {
                    requestAnimationFrame(animateText);
                } else {
                    textMaterial.opacity = targetOpacity;
                }
            }
            
            animateText();
        }
        
        scene.add(textSprite);
        stepLabels.push(textSprite);
    } catch (error) {
        console.warn('Error creating text label:', error);
    }
}

// Helper function to get element color based on operation type and theme
function getElementColor(index, step, totalElements) {
    // Default color from theme
    let defaultColor = state.highlightColors.default;
    
    // For rainbow theme, generate color based on index
    if (state.colorTheme === 'rainbow') {
        return themes.rainbow.getRainbowColor(index, totalElements);
    }
    
    // Determine color based on element's role in current step
    if (step.type === 'comparison' && step.comparing && step.comparing.includes(index)) {
        return state.highlightColors.comparison;
    } else if (step.type === 'swap' && step.swapped && step.swapped.includes(index)) {
        return state.highlightColors.swap;
    } else if (step.sorted_indices && step.sorted_indices.includes(index)) {
        return state.highlightColors.sorted;
    } else if ((step.type === 'min_selected' || step.type === 'new_min') && step.min_idx === index) {
        return state.highlightColors.selected;
    } else if (step.type === 'pivot' && step.pivot_index === index) {
        return 0xFF9800; // Orange for pivot
    } else if (step.found_index === index) {
        return 0x00E676; // Bright green for found element
    } else if (step.checking_index === index) {
        return 0xFFD54F; // Amber for element being checked
    }
    
    return defaultColor;
}

// Add visual indicators for algorithm operations
function addOperationIndicators(data, step) {
    if (!scene || !step) return;
    
    // Add different indicators based on step type
    if (step.type === 'comparison' && step.comparing && step.comparing.length >= 2) {
        // Add comparison arrow between elements being compared
        const index1 = step.comparing[0];
        const index2 = step.comparing[1];
        
        if (index1 >= 0 && index2 >= 0 && index1 < data.length && index2 < data.length) {
            addComparisonArrow(index1, index2, data);
        }
    } 
    
    if (step.type === 'swap' && step.swapped && step.swapped.length >= 2) {
        // Add swap arrows between elements being swapped
        const index1 = step.swapped[0];
        const index2 = step.swapped[1];
        
        if (index1 >= 0 && index2 >= 0 && index1 < data.length && index2 < data.length) {
            addSwapArrows(index1, index2, data);
        }
    }
    
    if (step.pivot_index !== undefined) {
        // Add pivot indicator for quicksort
        addPivotIndicator(step.pivot_index, data);
    }
    
    // Add a step floating description for clarity
    addStepFloatingDescription(step, data);
}

// Add a floating step description for clarity
function addStepFloatingDescription(step, data) {
    // Skip if we're not in focus mode
    if (!state.focusMode) return;
    
    let descriptionText = '';
    
    // Generate a concise description based on step type
    switch (step.type) {
        case 'initial':
            descriptionText = 'Starting with unsorted array';
            break;
        case 'comparison':
            if (step.comparing && step.comparing.length >= 2) {
                const i1 = step.comparing[0];
                const i2 = step.comparing[1];
                descriptionText = `Comparing ${data[i1]} with ${data[i2]}`;
            }
            break;
        case 'swap':
            if (step.swapped && step.swapped.length >= 2) {
                const i1 = step.swapped[0];
                const i2 = step.swapped[1];
                descriptionText = `Swapped ${data[i1]} and ${data[i2]}`;
            }
            break;
        case 'sorted':
            descriptionText = 'Elements in green are sorted';
            break;
        case 'pivot':
            if (step.pivot_index !== undefined) {
                descriptionText = `Pivot: ${data[step.pivot_index]}`;
            }
            break;
        case 'final':
            descriptionText = 'Array is sorted';
            break;
        default:
            // Use the original description if available
            descriptionText = step.description || '';
    }
    
    if (!descriptionText) return;
    
    // Create a floating text label with better visibility
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 1024;
    textCanvas.height = 256;
    
    // Clear canvas
    ctx.clearRect(0, 0, 1024, 256);
    
    // Draw a background for the text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.roundRect(20, 20, 984, 216, 20);
    ctx.fill();
    
    // Add a colored border based on step type
    let borderColor = '#3f51b5'; // Default blue
    
    if (step.type === 'comparison') borderColor = '#EA4335'; // Red
    else if (step.type === 'swap') borderColor = '#FBBC05'; // Yellow
    else if (step.type === 'sorted' || step.type === 'final') borderColor = '#34A853'; // Green
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;
    ctx.roundRect(20, 20, 984, 216, 20);
    ctx.stroke();
    
    // Draw the text with better styling
    ctx.fillStyle = 'white';
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    ctx.fillText(descriptionText, 512, 128);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(30, 7.5, 1);
    
    // Position at the top of the visualization
    textSprite.position.set(0, data.length > 10 ? 40 : 30, 10);
    
    // Add to scene and track for cleanup
    scene.add(textSprite);
    stepLabels.push(textSprite);
}

// Add comparison arrow with enhanced styling
function addComparisonArrow(index1, index2, data) {
    // Calculate positions
    const baseSize = state.focusMode ? 6 : 2; // Larger elements in focus mode
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    const x1 = startX + index1 * (baseSize + spacing);
    const x2 = startX + index2 * (baseSize + spacing);
    
    // Create arrow
    const arrowLength = Math.abs(x2 - x1);
    const arrowDir = Math.sign(x2 - x1);
    const arrowCenter = (x1 + x2) / 2;
    
    // Create curved arc for better visibility
    const points = [];
    const segments = 30; // More segments for smoother curve
    const height = state.focusMode ? 15 : 4; // Taller arc in focus mode
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = height * Math.sin(Math.PI * t);
        points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 30, state.focusMode ? 0.6 : 0.2, 12, false);
    
    // Use glowing material for better visibility
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xEA4335,
        emissive: 0xEA4335,
        emissiveIntensity: 0.5,
    });
    
    const tube = new THREE.Mesh(geometry, material);
    
    // Create arrow group for animations
    const arrowGroup = new THREE.Group();
    arrowGroup.add(tube);
    scene.add(arrowGroup);
    arrowObjects.push(arrowGroup);
    
    // Add arrow tips
    const tipSize = state.focusMode ? 1.2 : 0.4;
    const tipGeometry = new THREE.ConeGeometry(tipSize, tipSize * 2, 16);
    const tipMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xEA4335,
        emissive: 0xEA4335,
        emissiveIntensity: 0.5
    });
    
    // Tip at end
    const endTip = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip.position.set(x2, height * Math.sin(Math.PI * 1), 0);
    endTip.rotation.z = arrowDir > 0 ? -Math.PI / 2 : Math.PI / 2;
    arrowGroup.add(endTip);
    
    // Add comparison text above the arrow
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    // Create a background for better text visibility
    ctx.fillStyle = 'rgba(234, 67, 53, 0.9)'; // Red background
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('COMPARE', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    const textScale = state.focusMode ? 8 : 4;
    textSprite.scale.set(textScale, textScale / 4, 1);
    textSprite.position.set(arrowCenter, height + (state.focusMode ? 6 : 2), 0);
    scene.add(textSprite);
    stepLabels.push(textSprite);
    
    // Add specific comparison text
    const compTextCanvas = document.createElement('canvas');
    const compCtx = compTextCanvas.getContext('2d');
    compTextCanvas.width = 512;
    compTextCanvas.height = 128;
    
    // Create background
    compCtx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    compCtx.roundRect(0, 0, 512, 128, 16);
    compCtx.fill();
    
    // Add border
    compCtx.strokeStyle = 'rgba(234, 67, 53, 0.8)';
    compCtx.lineWidth = 4;
    compCtx.roundRect(0, 0, 512, 128, 16);
    compCtx.stroke();
    
    // Add text
    compCtx.fillStyle = 'white';
    compCtx.font = 'bold 48px Inter, Arial, sans-serif';
    compCtx.textAlign = 'center';
    compCtx.textBaseline = 'middle';
    compCtx.fillText(`${data[index1]} ${data[index1] > data[index2] ? '>' : '<'} ${data[index2]}`, 256, 64);
    
    const compTextTexture = new THREE.CanvasTexture(compTextCanvas);
    const compTextMaterial = new THREE.SpriteMaterial({ map: compTextTexture });
    const compTextSprite = new THREE.Sprite(compTextMaterial);
    compTextSprite.scale.set(textScale, textScale / 4, 1);
    compTextSprite.position.set(arrowCenter, height + (state.focusMode ? 12 : 5), 0);
    scene.add(compTextSprite);
    stepLabels.push(compTextSprite);
}

// Add swap arrows with enhanced styling
function addSwapArrows(index1, index2, data) {
    // Calculate positions
    const baseSize = state.focusMode ? 6 : 2;
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    const x1 = startX + index1 * (baseSize + spacing);
    const x2 = startX + index2 * (baseSize + spacing);
    
    // Create two curved arrows in opposite directions
    const height1 = state.focusMode ? 12 : 3; // Arc height for first arrow
    const height2 = state.focusMode ? 20 : 5; // Arc height for second arrow
    
    // First arrow (index1 to index2)
    const points1 = [];
    const segments = 30;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = height1 * Math.sin(Math.PI * t);
        points1.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve1 = new THREE.CatmullRomCurve3(points1);
    const geometry1 = new THREE.TubeGeometry(curve1, 30, state.focusMode ? 0.6 : 0.2, 12, false);
    const material1 = new THREE.MeshStandardMaterial({ 
        color: 0xFBBC05,
        emissive: 0xFBBC05,
        emissiveIntensity: 0.5
    });
    
    const tube1 = new THREE.Mesh(geometry1, material1);
    
    // Create arrow group for animations
    const arrowGroup = new THREE.Group();
    arrowGroup.add(tube1);
    scene.add(arrowGroup);
    arrowObjects.push(arrowGroup);
    
    // Second arrow (index2 to index1)
    const points2 = [];
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x2 + (x1 - x2) * t;
        const y = height2 * Math.sin(Math.PI * t);
        points2.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve2 = new THREE.CatmullRomCurve3(points2);
    const geometry2 = new THREE.TubeGeometry(curve2, 30, state.focusMode ? 0.6 : 0.2, 12, false);
    const material2 = new THREE.MeshStandardMaterial({ 
        color: 0xFBBC05,
        emissive: 0xFBBC05,
        emissiveIntensity: 0.5
    });
    
    const tube2 = new THREE.Mesh(geometry2, material2);
    arrowGroup.add(tube2);
    
    // Add arrow tips
    const tipSize = state.focusMode ? 1.2 : 0.4;
    const tipGeometry = new THREE.ConeGeometry(tipSize, tipSize * 2, 16);
    const tipMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFBBC05,
        emissive: 0xFBBC05,
        emissiveIntensity: 0.5
    });
    
    // Tip at end of first arrow
    const endTip1 = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip1.position.set(x2, height1 * Math.sin(Math.PI * 1), 0);
    endTip1.rotation.z = Math.PI / 2;
    arrowGroup.add(endTip1);
    
    // Tip at end of second arrow
    const endTip2 = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip2.position.set(x1, height2 * Math.sin(Math.PI * 1), 0);
    endTip2.rotation.z = -Math.PI / 2;
    arrowGroup.add(endTip2);
    
    // Add swap text with enhanced styling
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    // Create a background for better text visibility
    ctx.fillStyle = 'rgba(251, 188, 5, 0.9)'; // Yellow background
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Add text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAP', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    const textScale = state.focusMode ? 8 : 4;
    textSprite.scale.set(textScale, textScale / 4, 1);
    textSprite.position.set((x1 + x2) / 2, height2 + (state.focusMode ? 6 : 2), 0);
    scene.add(textSprite);
    stepLabels.push(textSprite);
    
    // Add specific swap text showing values
    const swapTextCanvas = document.createElement('canvas');
    const swapCtx = swapTextCanvas.getContext('2d');
    swapTextCanvas.width = 512;
    swapTextCanvas.height = 128;
    
    // Create background
    swapCtx.fillStyle = 'rgba(30, 30, 50, 0.95)';
    swapCtx.roundRect(0, 0, 512, 128, 16);
    swapCtx.fill();
    
    // Add border
    swapCtx.strokeStyle = 'rgba(251, 188, 5, 0.8)';
    swapCtx.lineWidth = 4;
    swapCtx.roundRect(0, 0, 512, 128, 16);
    swapCtx.stroke();
    
    // Add text
    swapCtx.fillStyle = 'white';
    swapCtx.font = 'bold 48px Inter, Arial, sans-serif';
    swapCtx.textAlign = 'center';
    swapCtx.textBaseline = 'middle';
    swapCtx.fillText(`${data[index1]} ⟷ ${data[index2]}`, 256, 64);
    
    const swapTextTexture = new THREE.CanvasTexture(swapTextCanvas);
    const swapTextMaterial = new THREE.SpriteMaterial({ map: swapTextTexture });
    const swapTextSprite = new THREE.Sprite(swapTextMaterial);
    swapTextSprite.scale.set(textScale, textScale / 4, 1);
    swapTextSprite.position.set((x1 + x2) / 2, height2 + (state.focusMode ? 12 : 5), 0);
    scene.add(swapTextSprite);
    stepLabels.push(swapTextSprite);
}

// Add pivot indicator for quicksort with enhanced styling
function addPivotIndicator(pivotIndex, data) {
    // Calculate position
    const baseSize = state.focusMode ? 6 : 2;
    const spacing = state.focusMode ? 10 : 2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    const pivotX = startX + pivotIndex * (baseSize + spacing);
    
    // Create a ring to highlight the pivot
    const ringSize = state.focusMode ? 5 : 1.5;
    const ringGeometry = new THREE.TorusGeometry(ringSize, ringSize * 0.15, 32, 48);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF9800,
        emissive: 0xFF9800,
        emissiveIntensity: 0.5,
        transparent: true, 
        opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(pivotX, state.focusMode ? 20 : 8, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    dataObjects.push(ring);
    
    // Add pivot text with enhanced styling
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    // Create a background for better text visibility
    ctx.fillStyle = 'rgba(255, 152, 0, 0.9)'; // Orange background
    ctx.roundRect(0, 0, 512, 128, 20);
    ctx.fill();
    
    // Add text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PIVOT', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    const textScale = state.focusMode ? 8 : 4;
    textSprite.scale.set(textScale, textScale / 4, 1);
    textSprite.position.set(pivotX, state.focusMode ? 30 : 12, 0);
    scene.add(textSprite);
    stepLabels.push(textSprite);
    
    // Animate the ring with pulsing effect
    const initialScale = ring.scale.clone();
    const startTime = Date.now();
    const duration = 2000;
    
    function animateRing() {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        const scale = 1 + 0.3 * Math.sin(progress * Math.PI * 2);
        ring.scale.set(scale, scale, scale);
        
        requestAnimationFrame(animateRing);
    }
    
    animateRing();
}

// Highlight relevant code based on the current step
function highlightRelevantCode() {
    if (!codeElement) return;
    
    // Add animated highlight to the code
    codeElement.classList.add('highlighted-code');
    
    // Add a subtle animation to draw attention to the code
    codeElement.classList.add('code-pulse');
    setTimeout(() => {
        codeElement.classList.remove('code-pulse');
    }, 1000);
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);