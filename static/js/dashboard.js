// Dashboard JS

document.addEventListener('DOMContentLoaded', function() {
    // Handle accordion toggles
    setupAccordion();
    
    // Set up algorithm and data structure preview
    setupPreviews();
});

// Set up accordion functionality
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            
            // Toggle active class
            content.classList.toggle('active');
            
            // Toggle plus/minus icon
            if (icon.textContent === '+') {
                icon.textContent = '-';
            } else {
                icon.textContent = '+';
            }
            
            // Toggle max-height for animation
            if (content.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
    });
}

// Set up algorithm and data structure previews
function setupPreviews() {
    const algorithmLinks = document.querySelectorAll('.algorithm-link');
    const structureLinks = document.querySelectorAll('.structure-link');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const timeComplexity = document.getElementById('time-complexity');
    const spaceComplexity = document.getElementById('space-complexity');
    const previewStartBtn = document.getElementById('preview-start-btn');
    const previewInfo = document.querySelector('.preview-info');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    
    // Handle algorithm link clicks
    algorithmLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get algorithm details via AJAX
            const url = `/api/algorithms/${this.dataset.algorithmId || this.href.split('/').slice(-2)[0]}/`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // Update preview info
                    previewTitle.textContent = data.name;
                    previewDescription.textContent = data.description;
                    timeComplexity.textContent = data.time_complexity;
                    spaceComplexity.textContent = data.space_complexity;
                    
                    // Update start button link
                    previewStartBtn.href = `/visualization/${data.id}/`;
                    
                    // Show preview info
                    previewInfo.classList.remove('hidden');
                    previewPlaceholder.classList.add('hidden');
                    
                    // Show a simple preview in the visualization area
                    showPreview(data.name);
                })
                .catch(error => {
                    console.error('Error fetching algorithm details:', error);
                });
        });
    });
    
    // Handle data structure link clicks
    structureLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get data structure details via AJAX
            const url = `/api/data-structures/${this.dataset.structureId}/`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // Update preview info
                    previewTitle.textContent = data.name;
                    previewDescription.textContent = data.description;
                    timeComplexity.textContent = '-';
                    spaceComplexity.textContent = '-';
                    
                    // Update start button to show related algorithms
                    previewStartBtn.href = `/dashboard/?structure=${data.id}`;
                    previewStartBtn.textContent = 'Show Related Algorithms';
                    
                    // Show preview info
                    previewInfo.classList.remove('hidden');
                    previewPlaceholder.classList.add('hidden');
                    
                    // Show a simple preview in the visualization area
                    showDataStructurePreview(data.name);
                })
                .catch(error => {
                    console.error('Error fetching data structure details:', error);
                });
        });
    });
    
    // Generate random data for preview
    document.getElementById('preview-random').addEventListener('click', function() {
        if (!previewInfo.classList.contains('hidden')) {
            showPreview(previewTitle.textContent);
        }
    });
}

// Show algorithm preview in the preview container
function showPreview(algorithmName) {
    const previewContainer = document.getElementById('preview-visualization');
    
    // Clear previous visualization
    while (previewContainer.firstChild) {
        if (previewContainer.firstChild.tagName !== 'DIV' || 
            !previewContainer.firstChild.classList.contains('preview-placeholder')) {
            previewContainer.removeChild(previewContainer.firstChild);
        } else {
            previewContainer.firstChild.style.display = 'none';
        }
    }
    
    // Create a new visualization preview
    // This is a simple implementation using Three.js
    if (window.THREE) {
        const width = previewContainer.clientWidth;
        const height = previewContainer.clientHeight;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 10, 20);
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        previewContainer.appendChild(renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Add grid
        const gridHelper = new THREE.GridHelper(30, 30, 0xaaaaaa, 0xcccccc);
        scene.add(gridHelper);
        
        // Generate random data
        const dataSize = 10;
        const data = Array.from({ length: dataSize }, () => Math.floor(Math.random() * 100));
        
        // Create visualization bars
        const barWidth = 1;
        const spacing = 0.2;
        const totalWidth = data.length * (barWidth + spacing) - spacing;
        const startX = -totalWidth / 2 + barWidth / 2;
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const height = Math.max(0.1, value / 5); // Scale the height
            
            // Create 3D bar geometry
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            const material = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
            const bar = new THREE.Mesh(geometry, material);
            
            // Position the bar
            bar.position.x = startX + i * (barWidth + spacing);
            bar.position.y = height / 2;
            
            // Add to scene
            scene.add(bar);
        }
        
        // Add animation based on algorithm type
        let animationFrame;
        
        function animate() {
            animationFrame = requestAnimationFrame(animate);
            
            // Rotate camera slightly for effect
            camera.position.x = 20 * Math.sin(Date.now() * 0.0005);
            camera.position.z = 20 * Math.cos(Date.now() * 0.0005);
            camera.lookAt(0, 0, 0);
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Clean up on page navigation or refresh
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrame);
            renderer.dispose();
            scene.clear();
        });
    } else {
        // Fallback if Three.js is not loaded
        const placeholderText = document.createElement('p');
        placeholderText.textContent = `Preview for ${algorithmName}`;
        placeholderText.style.textAlign = 'center';
        placeholderText.style.paddingTop = '120px';
        placeholderText.style.color = '#6b7280';
        previewContainer.appendChild(placeholderText);
    }
}

// Show data structure preview
function showDataStructurePreview(structureName) {
    // Implementation similar to showPreview but with data structure-specific visualization
    showPreview(structureName); // For now, use the same preview function
}