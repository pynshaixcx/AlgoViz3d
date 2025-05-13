#!/bin/bash
# Setup script for AlgoViz3D with React integration

# Check if Python and Node.js are installed
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }

echo "Setting up AlgoViz3D with React..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
pip install django-webpack-loader==1.8.1

# Create frontend directory if it doesn't exist
mkdir -p frontend/src/components

# Initialize npm and create package.json
echo "Setting up frontend dependencies..."
cd frontend

# Create package.json if not exists
if [ ! -f package.json ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "algo-viz3d-frontend",
  "version": "1.0.0",
  "description": "Frontend for AlgoViz3D",
  "main": "src/index.js",
  "scripts": {
    "dev": "webpack --watch --mode development",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.152.2",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@babel/core": "^7.22.5",
    "@babel/preset-env": "^7.22.5",
    "@babel/preset-react": "^7.22.5",
    "babel-loader": "^9.1.2",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3",
    "webpack": "^5.88.0",
    "webpack-bundle-tracker": "^1.8.1",
    "webpack-cli": "^5.1.4"
  }
}
EOF
fi

# Install frontend dependencies
echo "Installing frontend dependencies (this may take a few minutes)..."
npm install

# Create webpack.config.js
echo "Creating webpack configuration..."
cat > webpack.config.js << 'EOF'
const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve('../static/frontend/'),
    filename: '[name]-[fullhash].js',
    publicPath: '/static/frontend/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: './webpack-stats.json'
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
EOF

# Create src directory and React components
echo "Creating React components..."
mkdir -p src/components

# Create index.js
cat > src/index.js << 'EOF'
import React from 'react';
import { createRoot } from 'react-dom/client';
import VisualizationPlayer from './components/VisualizationPlayer';

// Initialize visualization player with default or saved data
window.initVisualizationPlayer = (containerId, algorithmData, initialSteps = []) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <VisualizationPlayer 
      algorithm={algorithmData}
      initialSteps={initialSteps}
    />
  );
};

// Allow loading saved visualizations
window.loadSavedVisualization = (containerId, visualizationData) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found`);
    return;
  }
  
  const root = createRoot(container);
  root.render(
    <VisualizationPlayer 
      algorithm={visualizationData.algorithm}
      initialSteps={visualizationData.steps}
      initialInputData={visualizationData.input_data}
      savedVisualization={true}
    />
  );
};
EOF

# Create VisualizationPlayer.jsx component (placeholder - actual content is quite large)
cat > src/components/VisualizationPlayer.jsx << 'EOF'
import React, { useState, useEffect, useRef } from 'react';

// This is a placeholder component. The full implementation should be pasted here.
// For brevity, we just include a basic structure.

const VisualizationPlayer = ({ algorithm, initialSteps = [], initialInputData = [], savedVisualization = false }) => {
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>{algorithm?.name || 'Algorithm Visualization'}</h2>
      </div>
      <div className="visualization-main">
        <div className="visualization-canvas-container">
          <div className="visualization-canvas">
            {/* Canvas will be initialized here */}
            <div style={{ textAlign: 'center', paddingTop: '40%' }}>
              <p>Visualization component loaded. Please replace this placeholder with the full implementation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPlayer;
EOF

echo "NOTE: Please replace the placeholder VisualizationPlayer.jsx with the full implementation."

# Return to root directory
cd ..

# Create static/frontend directory for compiled assets
mkdir -p static/frontend

# Build the frontend
echo "Building frontend assets..."
cd frontend && npm run build
cd ..

# Database setup
echo "Setting up database..."
python manage.py migrate

# Create a superuser if needed
read -p "Do you want to create a superuser? (y/n): " createuser
if [ "$createuser" = "y" ] || [ "$createuser" = "Y" ]; then
    python manage.py createsuperuser
fi

# Load initial data
read -p "Do you want to load initial algorithm data? (y/n): " loaddata
if [ "$loaddata" = "y" ] || [ "$loaddata" = "Y" ]; then
    python manage.py load_initial_data
fi

echo "Setup complete! Run the server with 'python manage.py runserver'"
echo "For development mode, run 'cd frontend && npm run dev' in another terminal to watch for frontend changes."