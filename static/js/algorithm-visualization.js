// Algorithm Visualization Main JS

// DOM Elements
const visualizationCanvas = document.getElementById('visualization-canvas');
const playPauseBtn = document.getElementById('play-pause');
const stepForwardBtn = document.getElementById('step-forward');
const stepBackwardBtn = document.getElementById('step-backward');
const resetBtn = document.getElementById('reset');
const speedSlider = document.getElementById('animation-speed');
const currentStepElement = document.getElementById('current-step');
const stepDescriptionElement = document.getElementById('step-description');
const detailedStepDescriptionElement = document.getElementById('detailed-step-description');
const cameraResetBtn = document.getElementById('camera-reset');
const toggleViewBtn = document.getElementById('toggle-2d-3d');
const inputSizeSlider = document.getElementById('input-size');
const sizeValueElement = document.getElementById('size-value');
const randomDataBtn = document.getElementById('generate-random');
const nearlySortedBtn = document.getElementById('generate-nearly-sorted');
const reversedBtn = document.getElementById('generate-reversed');
const customInputField = document.getElementById('custom-input-data');
const applyCustomBtn = document.getElementById('apply-custom');
const codeElement = document.getElementById('algorithm-code');

// Global state
const state = {
    algorithmId: algorithmData.id,
    algorithmName: algorithmData.name,
    inputData: [],
    steps: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 5,
    is3DView: true,
    intervalId: null
};

// Three.js variables
let scene, camera, renderer, controls;
let dataObjects = [];

// Initialize the visualization
function init() {
    // Set up Three.js scene
    setupScene();
    
    // Generate random data initially
    generateRandomData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
}

// Set up Three.js scene
function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, visualizationCanvas.clientWidth / visualizationCanvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
    visualizationCanvas.appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(30, 30, 0xaaaaaa, 0xcccccc);
    scene.add(gridHelper);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = visualizationCanvas.clientWidth / visualizationCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Set up event listeners
function setupEventListeners() {
    // Playback controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    stepForwardBtn.addEventListener('click', stepForward);
    stepBackwardBtn.addEventListener('click', stepBackward);
    resetBtn.addEventListener('click', resetVisualization);
    
    // Speed control
    speedSlider.addEventListener('input', updateSpeed);
    
    // View controls
    cameraResetBtn.addEventListener('click', resetCamera);
    toggleViewBtn.addEventListener('click', toggle2D3DView);
    
    // Input controls
    inputSizeSlider.addEventListener('input', updateSizeValue);
    randomDataBtn.addEventListener('click', generateRandomData);
    nearlySortedBtn.addEventListener('click', generateNearlySortedData);
    reversedBtn.addEventListener('click', generateReversedData);
    applyCustomBtn.addEventListener('click', applyCustomData);
    
    // Save visualization if authenticated
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', showSaveForm);
        document.getElementById('confirm-save').addEventListener('click', saveVisualization);
    }
}

// Toggle play/pause
function togglePlayPause() {
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H10V19H8V5Z" fill="currentColor"/><path d="M14 5H16V19H14V5Z" fill="currentColor"/></svg>`;
        startPlayback();
    } else {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;
        stopPlayback();
    }
}

// Start playback
function startPlayback() {
    if (state.intervalId) {
        clearInterval(state.intervalId);
    }
    
    state.intervalId = setInterval(() => {
        if (state.currentStepIndex < state.steps.length - 1) {
            state.currentStepIndex++;
            updateVisualization();
        } else {
            togglePlayPause(); // Stop when we reach the end
        }
    }, 1000 / state.playbackSpeed);
}

// Stop playback
function stopPlayback() {
    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
}

// Step forward
function stepForward() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex++;
        updateVisualization();
    }
}

// Step backward
function stepBackward() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        updateVisualization();
    }
}

// Reset visualization
function resetVisualization() {
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    state.currentStepIndex = 0;
    updateVisualization();
}

// Update visualization speed
function updateSpeed() {
    state.playbackSpeed = parseInt(speedSlider.value);
    
    if (state.isPlaying) {
        stopPlayback();
        startPlayback();
    }
}

// Reset camera position
function resetCamera() {
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

// Toggle between 2D and 3D view
function toggle2D3DView() {
    state.is3DView = !state.is3DView;
    
    if (state.is3DView) {
        camera.position.set(0, 10, 20);
    } else {
        camera.position.set(0, 20, 0.0001);
        camera.lookAt(0, 0, 0);
    }
    
    updateVisualization();
}

// Update size value display
function updateSizeValue() {
    const size = inputSizeSlider.value;
    sizeValueElement.textContent = size;
}

// Generate random data
function generateRandomData() {
    const size = parseInt(inputSizeSlider.value);
    state.inputData = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    executeAlgorithm();
}

// Generate nearly sorted data
function generateNearlySortedData() {
    const size = parseInt(inputSizeSlider.value);
    state.inputData = Array.from({ length: size }, (_, i) => i + 1);
    
    // Swap a few elements to make it nearly sorted
    for (let i = 0; i < size / 10; i++) {
        const idx1 = Math.floor(Math.random() * size);
        const idx2 = Math.floor(Math.random() * size);
        [state.inputData[idx1], state.inputData[idx2]] = [state.inputData[idx2], state.inputData[idx1]];
    }
    
    executeAlgorithm();
}

// Generate reversed data
function generateReversedData() {
    const size = parseInt(inputSizeSlider.value);
    state.inputData = Array.from({ length: size }, (_, i) => size - i);
    executeAlgorithm();
}

// Apply custom data
function applyCustomData() {
    const customInput = customInputField.value;
    
    try {
        // Parse the input (e.g., "3,1,4,1,5,9")
        const data = customInput.split(',').map(item => parseInt(item.trim()));
        
        if (data.some(isNaN)) {
            throw new Error('Invalid input');
        }
        
        state.inputData = data;
        executeAlgorithm();
    } catch (error) {
        alert('Please enter valid data (comma-separated numbers)');
    }
}

// Execute the selected algorithm
function executeAlgorithm() {
    // Reset visualization state
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    state.currentStepIndex = 0;
    
    // Clear all 3D objects
    clearVisualization();
    
    // Show loading state
    detailedStepDescriptionElement.textContent = 'Loading...';
    
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
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        state.steps = data.steps;
        updateVisualization();
        
        // Highlight the code based on the algorithm
        highlightRelevantCode();
    })
    .catch(error => {
        console.error('Error executing algorithm:', error);
        detailedStepDescriptionElement.textContent = 'Error executing algorithm. Please try again.';
    });
}

// Update the visualization based on the current step
function updateVisualization() {
    if (state.steps.length === 0) {
        return;
    }
    
    const currentStep = state.steps[state.currentStepIndex];
    
    // Update step information
    currentStepElement.textContent = `Step ${state.currentStepIndex + 1} of ${state.steps.length}`;
    stepDescriptionElement.textContent = currentStep.description;
    detailedStepDescriptionElement.textContent = getDetailedDescription(currentStep);
    
    // Clear previous visualization
    clearVisualization();
    
    // Create new visualization based on the step
    createVisualization(currentStep);
}

// Clear the visualization scene
function clearVisualization() {
    for (const obj of dataObjects) {
        scene.remove(obj);
    }
    
    dataObjects = [];
}

// Create visualization for the current step
function createVisualization(step) {
    const data = step.state;
    if (!data || !Array.isArray(data)) {
        return;
    }
    
    const barWidth = 1;
    const spacing = 0.2;
    const totalWidth = data.length * (barWidth + spacing) - spacing;
    const startX = -totalWidth / 2 + barWidth / 2;
    
    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        const height = Math.max(0.1, value / 5); // Scale the height
        
        // Determine color based on step type
        let color = 0x3b82f6; // Default blue
        
        if (step.type === 'comparison' && step.comparing && step.comparing.includes(i)) {
            color = 0xef4444; // Red for comparison
        } else if (step.type === 'swap' && step.swapped && step.swapped.includes(i)) {
            color = 0xf59e0b; // Orange for swapped
        } else if (step.sorted_indices && step.sorted_indices.includes(i)) {
            color = 0x22c55e; // Green for sorted
        } else if (step.type === 'min_selected' && step.min_idx === i) {
            color = 0x8b5cf6; // Purple for selected minimum
        } else if (step.type === 'new_min' && step.min_idx === i) {
            color = 0x8b5cf6; // Purple for new minimum
        }
        
        // Create 3D bar geometry
        const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
        const material = new THREE.MeshLambertMaterial({ color });
        const bar = new THREE.Mesh(geometry, material);
        
        // Position the bar
        bar.position.x = startX + i * (barWidth + spacing);
        bar.position.y = height / 2;
        
        // Add to scene and keep track
        scene.add(bar);
        dataObjects.push(bar);
        
        // Add value label
        if (data.length <= 20) { // Only show labels for smaller arrays
            const textCanvas = document.createElement('canvas');
            const ctx = textCanvas.getContext('2d');
            textCanvas.width = 64;
            textCanvas.height = 64;
            ctx.fillStyle = 'black';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, 32, 48);
            
            const textTexture = new THREE.CanvasTexture(textCanvas);
            const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
            const textSprite = new THREE.Sprite(textMaterial);
            textSprite.scale.set(0.5, 0.5, 0.5);
            textSprite.position.set(bar.position.x, height + 0.5, 0);
            
            scene.add(textSprite);
            dataObjects.push(textSprite);
        }
    }
}

// Get detailed description for the current step
function getDetailedDescription(step) {
    if (!step) return '';
    
    let description = step.description;
    
    // Add more detailed info based on step type
    switch (step.type) {
        case 'initial':
            description += ` (${step.state.length} elements)`;
            break;
        case 'comparison':
            description += ` [${step.comparing.join(' and ')}]`;
            break;
        case 'swap':
            description += ` [${step.swapped.join(' and ')}]`;
            break;
        case 'sorted':
            description += ` [${step.sorted_indices.length} elements sorted]`;
            break;
    }
    
    return description;
}

// Highlight relevant code based on the current step
function highlightRelevantCode() {
    // This is a simple implementation
    // A more advanced implementation would highlight specific lines based on the step
    if (codeElement) {
        codeElement.classList.add('highlighted-code');
    }
}

// Show save form
function showSaveForm() {
    document.getElementById('save-form').classList.toggle('hidden');
}

// Save visualization
function saveVisualization() {
    const name = document.getElementById('visualization-name').value;
    
    if (!name) {
        alert('Please enter a name for this visualization');
        return;
    }
    
    fetch('/api/visualizations/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            algorithm: state.algorithmId,
            input_data: state.inputData,
            steps: state.steps,
            name: name
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        alert('Visualization saved successfully');
        document.getElementById('save-form').classList.add('hidden');
    })
    .catch(error => {
        console.error('Error saving visualization:', error);
        alert('Error saving visualization. Please try again.');
    });
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