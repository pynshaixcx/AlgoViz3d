// Enhanced Algorithm Visualization Player

// DOM Elements with error handling
let visualizationCanvas, playPauseBtn, stepForwardBtn, stepBackwardBtn, resetBtn,
    speedSlider, currentStepElement, stepDescriptionElement, stepCounterElement,
    cameraResetBtn, toggleViewBtn, inputSizeSlider, sizeValueElement, randomDataBtn,
    nearlySortedBtn, reversedBtn, customInputField, applyCustomBtn, codeElement,
    shapeSelector, themeSelector;

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
    }
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

// Set up Three.js scene
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
        const gridHelper = new THREE.GridHelper(50, 50, 0x304FFE, 0x1A237E);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
        
        // Create camera
        const aspect = visualizationCanvas.clientWidth / visualizationCanvas.clientHeight || 2;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(0, 15, 30);
        
        // Create renderer with better antialiasing
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
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
        scene.add(ambientLight);
        
        // Directional light with shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 20, 15);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        scene.add(mainLight);
        
        // Add a subtle point light for highlights
        const pointLight = new THREE.PointLight(0x3f51b5, 0.8, 50);
        pointLight.position.set(-10, 20, 5);
        scene.add(pointLight);
        
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
    renderer.render(scene, camera);
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
    }, 1200 / state.playbackSpeed); // Slightly slower base speed for better viewing
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
    const endPos = new THREE.Vector3(0, 15, 30);
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
        const endPos = new THREE.Vector3(0, 15, 30);
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
        const endPos = new THREE.Vector3(0, 30, 0.0001);
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
}

// Generate random data with animation
function generateRandomData() {
    if (!inputSizeSlider) return;
    
    const size = parseInt(inputSizeSlider.value);
    state.inputData = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    
    // Add visual feedback for data generation
    pulseButton(randomDataBtn);
    
    console.log('Generated random data:', state.inputData);
    executeAlgorithm();
}

// Generate nearly sorted data
function generateNearlySortedData() {
    if (!inputSizeSlider) return;
    
    const size = parseInt(inputSizeSlider.value);
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
    
    const size = parseInt(inputSizeSlider.value);
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
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: white;
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
    
    // Add styles inline
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            z-index: 9999;
            animation: fadeInOut 5s forwards;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .notification.info {
            background-color: #2196F3;
        }
        .notification.error {
            background-color: #F44336;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    
    document.head.appendChild(style);
    
    // Remove after animation
    setTimeout(() => {
        notification.remove();
        
        const notificationStyle = document.getElementById('notification-style');
        if (notificationStyle) {
            notificationStyle.remove();
        }
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
    
    // Clear previous visualization
    clearVisualization();
    
    // Create new visualization based on the step
    createVisualizationFromData(currentStep.state, currentStep, animated);
}

// Clear the visualization scene
function clearVisualization() {
    if (!scene) return;
    
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
}

// Create visualization from data with current step info
function createVisualizationFromData(data, step, animated = false) {
    if (!scene || !THREE || !data || !Array.isArray(data)) {
        console.warn('Invalid visualization data');
        return;
    }
    
    const baseSize = 1;
    const spacing = 0.2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    // Find max value for proper scaling
    const maxValue = Math.max(...data, 1); // Ensure at least 1 to avoid division by zero
    
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        
        // Scale height based on max value, with a minimum size
        const heightScale = Math.max(0.1, value / maxValue);
        const height = baseSize * 5 * heightScale; // Scale up for better visibility
        
        // Determine element coloring based on step type and state
        let color = getElementColor(i, step, data.length);
        let opacity = 0.9;
        let metalness = 0.5;
        let roughness = 0.2;
        
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
            clearcoatRoughness: 0.2
        });
        
        // Create the mesh
        const element = new THREE.Mesh(geometry, material);
        
        // Calculate position
        const xPos = startX + i * (baseSize + spacing);
        const yPos = state.visualizationShape === 'cube' ? height / 2 : 0;
        
        // Position with animation if needed
        if (animated) {
            // Start position (below the grid)
            element.position.x = xPos;
            element.position.y = -2;
            element.position.z = 0;
            element.scale.y = 0.1; // Start small
            
            // Create animation sequence with staggered timing
            const delay = i * 30; // Stagger the animations
            const duration = 700; // Total animation time
            const startTime = Date.now() + delay;
            
            function animateElement() {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < 0) {
                    requestAnimationFrame(animateElement);
                    return;
                }
                
                const progress = Math.min(elapsedTime / duration, 1);
                const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease in-out
                
                element.position.y = -2 + (yPos + 2) * easeProgress;
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
        
        // Add value label for smaller arrays
        if (data.length <= 30) {
            try {
                const textCanvas = document.createElement('canvas');
                const ctx = textCanvas.getContext('2d');
                textCanvas.width = 64;
                textCanvas.height = 64;
                ctx.fillStyle = 'white';
                ctx.font = '48px Inter, Arial';
                ctx.textAlign = 'center';
                ctx.fillText(value, 32, 48);
                
                const textTexture = new THREE.CanvasTexture(textCanvas);
                const textMaterial = new THREE.SpriteMaterial({ 
                    map: textTexture,
                    transparent: true,
                    opacity: animated ? 0 : 1 // Start invisible if animated
                });
                const textSprite = new THREE.Sprite(textMaterial);
                const scaleFactor = 0.5;
                textSprite.scale.set(scaleFactor, scaleFactor, scaleFactor);
                
                // Position above the element, higher for non-cube shapes
                const textY = state.visualizationShape === 'cube' 
                    ? height + 1
                    : heightScale * 5 + 1;
                
                textSprite.position.set(xPos, textY, 0);
                
                // Animate text fade-in if needed
                if (animated) {
                    const textDelay = i * 30 + 300; // Slightly delayed after elements
                    const textDuration = 500;
                    const textStartTime = Date.now() + textDelay;
                    
                    function animateText() {
                        const textElapsedTime = Date.now() - textStartTime;
                        if (textElapsedTime < 0) {
                            requestAnimationFrame(animateText);
                            return;
                        }
                        
                        const textProgress = Math.min(textElapsedTime / textDuration, 1);
                        textMaterial.opacity = textProgress;
                        
                        if (textProgress < 1) {
                            requestAnimationFrame(animateText);
                        } else {
                            textMaterial.opacity = 1;
                        }
                    }
                    
                    animateText();
                }
                
                scene.add(textSprite);
                dataObjects.push(textSprite);
            } catch (error) {
                console.warn('Error creating text label:', error);
            }
        }
    }
    
    // Add visual indicators for operations (arrows, highlights, etc.)
    addOperationIndicators(data, step);
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
}

// Add comparison arrow
function addComparisonArrow(index1, index2, data) {
    // Calculate positions
    const baseSize = 1;
    const spacing = 0.2;
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
    const segments = 20;
    const height = 3; // Arc height
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = height * Math.sin(Math.PI * t);
        points.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: 0xEA4335 }); // Red
    
    const tube = new THREE.Mesh(geometry, material);
    scene.add(tube);
    dataObjects.push(tube);
    
    // Add arrow tips
    const tipSize = 0.3;
    const tipGeometry = new THREE.ConeGeometry(tipSize, tipSize * 2, 8);
    const tipMaterial = new THREE.MeshBasicMaterial({ color: 0xEA4335 });
    
    // Tip at end
    const endTip = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip.position.set(x2, height * Math.sin(Math.PI * 1), 0);
    endTip.rotation.z = arrowDir > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(endTip);
    dataObjects.push(endTip);
    
    // Add comparison text
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 128;
    textCanvas.height = 64;
    ctx.fillStyle = 'white';
    ctx.font = '24px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Compare', 64, 32);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(3, 1.5, 1.5);
    textSprite.position.set(arrowCenter, height + 1, 0);
    scene.add(textSprite);
    dataObjects.push(textSprite);
}

// Add swap arrows
function addSwapArrows(index1, index2, data) {
    // Calculate positions
    const baseSize = 1;
    const spacing = 0.2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    const x1 = startX + index1 * (baseSize + spacing);
    const x2 = startX + index2 * (baseSize + spacing);
    
    // Create two curved arrows in opposite directions
    const height1 = 2; // Arc height for first arrow
    const height2 = 3.5; // Arc height for second arrow
    
    // First arrow (index1 to index2)
    const points1 = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = height1 * Math.sin(Math.PI * t);
        points1.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve1 = new THREE.CatmullRomCurve3(points1);
    const geometry1 = new THREE.TubeGeometry(curve1, 20, 0.1, 8, false);
    const material1 = new THREE.MeshBasicMaterial({ color: 0xFBBC05 }); // Yellow
    
    const tube1 = new THREE.Mesh(geometry1, material1);
    scene.add(tube1);
    dataObjects.push(tube1);
    
    // Second arrow (index2 to index1)
    const points2 = [];
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x2 + (x1 - x2) * t;
        const y = height2 * Math.sin(Math.PI * t);
        points2.push(new THREE.Vector3(x, y, 0));
    }
    
    const curve2 = new THREE.CatmullRomCurve3(points2);
    const geometry2 = new THREE.TubeGeometry(curve2, 20, 0.1, 8, false);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xFBBC05 }); // Yellow
    
    const tube2 = new THREE.Mesh(geometry2, material2);
    scene.add(tube2);
    dataObjects.push(tube2);
    
    // Add arrow tips
    const tipSize = 0.3;
    const tipGeometry = new THREE.ConeGeometry(tipSize, tipSize * 2, 8);
    const tipMaterial = new THREE.MeshBasicMaterial({ color: 0xFBBC05 });
    
    // Tip at end of first arrow
    const endTip1 = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip1.position.set(x2, height1 * Math.sin(Math.PI * 1), 0);
    endTip1.rotation.z = Math.PI / 2;
    scene.add(endTip1);
    dataObjects.push(endTip1);
    
    // Tip at end of second arrow
    const endTip2 = new THREE.Mesh(tipGeometry, tipMaterial);
    endTip2.position.set(x1, height2 * Math.sin(Math.PI * 1), 0);
    endTip2.rotation.z = -Math.PI / 2;
    scene.add(endTip2);
    dataObjects.push(endTip2);
    
    // Add swap text
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 128;
    textCanvas.height = 64;
    ctx.fillStyle = 'white';
    ctx.font = '24px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Swap', 64, 32);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(3, 1.5, 1.5);
    textSprite.position.set((x1 + x2) / 2, height2 + 1, 0);
    scene.add(textSprite);
    dataObjects.push(textSprite);
}

// Add pivot indicator for quicksort
function addPivotIndicator(pivotIndex, data) {
    // Calculate position
    const baseSize = 1;
    const spacing = 0.2;
    const totalWidth = data.length * (baseSize + spacing) - spacing;
    const startX = -totalWidth / 2 + baseSize / 2;
    
    const pivotX = startX + pivotIndex * (baseSize + spacing);
    
    // Create a ring to highlight the pivot
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.1, 16, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x4285F4, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(pivotX, 5, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    dataObjects.push(ring);
    
    // Add pivot text
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 128;
    textCanvas.height = 64;
    ctx.fillStyle = 'white';
    ctx.font = '24px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pivot', 64, 32);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(3, 1.5, 1.5);
    textSprite.position.set(pivotX, 7, 0);
    scene.add(textSprite);
    dataObjects.push(textSprite);
    
    // Animate the ring
    const initialScale = ring.scale.clone();
    const startTime = Date.now();
    const duration = 2000;
    
    function animateRing() {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        const scale = 1 + 0.2 * Math.sin(progress * Math.PI * 2);
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