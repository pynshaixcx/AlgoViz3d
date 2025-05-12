// Home page hero visualization

document.addEventListener('DOMContentLoaded', function() {
    const heroVisualization = document.getElementById('hero-visualization');
    
    if (heroVisualization) {
        createHeroVisualization(heroVisualization);
    }
});

function createHeroVisualization(container) {
    if (!window.THREE) {
        console.error('Three.js not loaded');
        return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1929);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create grid for reference
    const gridHelper = new THREE.GridHelper(40, 40, 0x555555, 0x333333);
    scene.add(gridHelper);
    
    // Create array visualization
    const arraySize = 16;
    const arrayData = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100));
    const arrayBars = createArrayVisualization(arrayData);
    scene.add(arrayBars);
    
    // Create binary tree visualization
    const treeDepth = 3;
    const treeRoot = createBinaryTreeNode(1, treeDepth);
    const treeVisualization = createTreeVisualization(treeRoot);
    treeVisualization.position.set(-20, 0, -10);
    scene.add(treeVisualization);
    
    // Create graph visualization
    const graphVisualization = createGraphVisualization();
    graphVisualization.position.set(20, 0, -10);
    scene.add(graphVisualization);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
    
    // Animation variables
    let time = 0;
    let sortingSteps = [];
    let currentStep = 0;
    let sortInterval = null;
    
    // Initialize sorting visualization
    initBubbleSort(arrayData);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate camera slowly
        time += 0.001;
        camera.position.x = 30 * Math.sin(time);
        camera.position.z = 30 * Math.cos(time);
        camera.lookAt(0, 5, 0);
        
        // Rotate graph slightly
        if (graphVisualization) {
            graphVisualization.rotation.y += 0.003;
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Create array visualization
    function createArrayVisualization(data) {
        const group = new THREE.Group();
        const barWidth = 1;
        const spacing = 0.5;
        const totalWidth = data.length * (barWidth + spacing) - spacing;
        const startX = -totalWidth / 2 + barWidth / 2;
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const height = Math.max(0.5, value / 10);
            
            // Create bar
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            const material = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
            const bar = new THREE.Mesh(geometry, material);
            
            // Position bar
            bar.position.x = startX + i * (barWidth + spacing);
            bar.position.y = height / 2;
            
            group.add(bar);
        }
        
        return group;
    }
    
    // Update array visualization
    function updateArrayVisualization(data, comparing = [], swapped = []) {
        // Remove previous bars
        while (arrayBars.children.length > 0) {
            arrayBars.remove(arrayBars.children[0]);
        }
        
        // Create new bars
        const barWidth = 1;
        const spacing = 0.5;
        const totalWidth = data.length * (barWidth + spacing) - spacing;
        const startX = -totalWidth / 2 + barWidth / 2;
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const height = Math.max(0.5, value / 10);
            
            // Determine color based on operation
            let color = 0x3b82f6; // Default blue
            
            if (comparing.includes(i)) {
                color = 0xef4444; // Red for comparison
            } else if (swapped.includes(i)) {
                color = 0xf59e0b; // Orange for swapped
            }
            
            // Create bar
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            const material = new THREE.MeshLambertMaterial({ color });
            const bar = new THREE.Mesh(geometry, material);
            
            // Position bar
            bar.position.x = startX + i * (barWidth + spacing);
            bar.position.y = height / 2;
            
            arrayBars.add(bar);
        }
    }
    
    // Initialize bubble sort steps
    function initBubbleSort(data) {
        const arr = [...data];
        const steps = [];
        const n = arr.length;
        
        // Initial state
        steps.push({
            state: [...arr],
            comparing: [],
            swapped: []
        });
        
        // Bubble sort algorithm with steps
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Comparing step
                steps.push({
                    state: [...arr],
                    comparing: [j, j + 1],
                    swapped: []
                });
                
                if (arr[j] > arr[j + 1]) {
                    // Swap
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    
                    // Swapped step
                    steps.push({
                        state: [...arr],
                        comparing: [],
                        swapped: [j, j + 1]
                    });
                }
            }
        }
        
        // Final state
        steps.push({
            state: [...arr],
            comparing: [],
            swapped: []
        });
        
        sortingSteps = steps;
        
        // Start sorting animation
        if (sortInterval) {
            clearInterval(sortInterval);
        }
        
        sortInterval = setInterval(() => {
            if (currentStep < sortingSteps.length) {
                const step = sortingSteps[currentStep];
                updateArrayVisualization(step.state, step.comparing, step.swapped);
                currentStep++;
            } else {
                // Reset and start over
                currentStep = 0;
            }
        }, 500);
    }
    
    // Create binary tree node
    function createBinaryTreeNode(value, depth, index = 0) {
        if (depth <= 0) return null;
        
        return {
            value,
            left: createBinaryTreeNode(value * 2, depth - 1, index * 2 + 1),
            right: createBinaryTreeNode(value * 2 + 1, depth - 1, index * 2 + 2),
            position: { x: index * 3, y: 0, z: 0 }
        };
    }
    
    // Create tree visualization
    function createTreeVisualization(root) {
        const group = new THREE.Group();
        
        // Calculate positions for tree nodes
        calculateTreePositions(root, 0, 0, 5);
        
        // Create nodes and edges
        createTreeNodes(root, group);
        
        return group;
    }
    
    // Calculate positions for tree nodes
    function calculateTreePositions(node, x, y, horizontalSpacing) {
        if (!node) return;
        
        node.position = { x, y: y, z: 0 };
        
        if (node.left) {
            calculateTreePositions(node.left, x - horizontalSpacing / 2, y - 3, horizontalSpacing / 2);
        }
        
        if (node.right) {
            calculateTreePositions(node.right, x + horizontalSpacing / 2, y - 3, horizontalSpacing / 2);
        }
    }
    
    // Create tree nodes and edges
    function createTreeNodes(node, group) {
        if (!node) return;
        
        // Create node sphere
        const geometry = new THREE.SphereGeometry(0.8, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
        const sphere = new THREE.Mesh(geometry, material);
        
        sphere.position.set(node.position.x, node.position.y, node.position.z);
        group.add(sphere);
        
        // Create edges to children
        if (node.left) {
            createTreeEdge(group, node.position, node.left.position, 0x8b5cf6);
            createTreeNodes(node.left, group);
        }
        
        if (node.right) {
            createTreeEdge(group, node.position, node.right.position, 0x8b5cf6);
            createTreeNodes(node.right, group);
        }
    }
    
    // Create edge between nodes
    function createTreeEdge(group, start, end, color) {
        const points = [
            new THREE.Vector3(start.x, start.y, start.z),
            new THREE.Vector3(end.x, end.y, end.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });
        const line = new THREE.Line(geometry, material);
        
        group.add(line);
    }
    
    // Create graph visualization
    function createGraphVisualization() {
        const group = new THREE.Group();
        
        // Create nodes
        const nodes = [];
        const nodeCount = 8;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 6;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.random() * 4;
            
            const node = {
                id: i,
                position: { x, y, z }
            };
            
            nodes.push(node);
            
            // Create node sphere
            const geometry = new THREE.SphereGeometry(0.7, 16, 16);
            const material = new THREE.MeshLambertMaterial({ color: 0x10b981 });
            const sphere = new THREE.Mesh(geometry, material);
            
            sphere.position.set(x, y, z);
            group.add(sphere);
        }
        
        // Create edges (not fully connected)
        for (let i = 0; i < nodeCount; i++) {
            // Connect to 2-3 random nodes
            const edgeCount = 2 + Math.floor(Math.random() * 2);
            const connectedIndices = new Set();
            
            while (connectedIndices.size < edgeCount) {
                const targetIndex = Math.floor(Math.random() * nodeCount);
                if (targetIndex !== i && !connectedIndices.has(targetIndex)) {
                    connectedIndices.add(targetIndex);
                    
                    // Create edge
                    const points = [
                        new THREE.Vector3(
                            nodes[i].position.x,
                            nodes[i].position.y,
                            nodes[i].position.z
                        ),
                        new THREE.Vector3(
                            nodes[targetIndex].position.x,
                            nodes[targetIndex].position.y,
                            nodes[targetIndex].position.z
                        )
                    ];
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({ color: 0x10b981 });
                    const line = new THREE.Line(geometry, material);
                    
                    group.add(line);
                }
            }
        }
        
        return group;
    }
    
    // Clean up on page navigation
    window.addEventListener('beforeunload', () => {
        if (sortInterval) {
            clearInterval(sortInterval);
        }
    });
}