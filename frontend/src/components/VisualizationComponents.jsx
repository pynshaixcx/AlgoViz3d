import React from 'react';

// Control Button component for player controls
export const ControlButton = ({ 
  onClick, 
  disabled = false, 
  title = "", 
  className = "", 
  children 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`control-button ${className}`}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};

// Shape Button component for shape selection
export const ShapeButton = ({ 
  shape, 
  currentShape, 
  onClick 
}) => {
  // Get the appropriate shape icon
  const getShapeIcon = (shapeName) => {
    switch(shapeName) {
      case 'cube': return '□';
      case 'sphere': return '○';
      case 'cylinder': return '⊙';
      case 'pyramid': return '△';
      default: return '□';
    }
  };
  
  return (
    <button 
      onClick={() => onClick(shape)}
      className={`shape-button ${currentShape === shape ? 'active' : ''}`}
      title={`${shape.charAt(0).toUpperCase() + shape.slice(1)} Shape`}
    >
      {getShapeIcon(shape)}
    </button>
  );
};

// Step Information panel
export const StepInfoPanel = ({ 
  currentStep, 
  currentStepIndex, 
  totalSteps 
}) => {
  return (
    <div className="step-info">
      <div className="step-counter">
        Step {currentStepIndex + 1} of {totalSteps}
      </div>
      <div className="step-description">
        {currentStep?.description || 'No description available'}
      </div>
      {currentStep?.educational_note && (
        <div className="educational-note">
          {currentStep.educational_note}
        </div>
      )}
    </div>
  );
};

// Shape Controls panel
export const ShapeControls = ({ 
  selectedShape, 
  setSelectedShape, 
  showLabels, 
  setShowLabels, 
  focusMode, 
  setFocusMode 
}) => {
  const shapes = ['cube', 'sphere', 'cylinder', 'pyramid'];
  
  return (
    <div className="shape-controls">
      <div className="shape-label">Element Shape:</div>
      <div className="shape-options">
        {shapes.map(shape => (
          <ShapeButton 
            key={shape}
            shape={shape}
            currentShape={selectedShape}
            onClick={setSelectedShape}
          />
        ))}
      </div>
      
      <div className="options-label">Options:</div>
      <div className="options-controls">
        <label className="option-checkbox">
          <input 
            type="checkbox" 
            checked={showLabels} 
            onChange={() => setShowLabels(!showLabels)}
          />
          Show Labels
        </label>
        
        <label className="option-checkbox">
          <input 
            type="checkbox" 
            checked={focusMode} 
            onChange={() => setFocusMode(!focusMode)}
          />
          Focus Mode
        </label>
      </div>
    </div>
  );
};

// Instructions Panel
export const InstructionsPanel = () => {
  return (
    <div className="instructions-panel">
      <h3>How to Interact:</h3>
      <ul>
        <li>Click and drag to rotate the view</li>
        <li>Scroll to zoom in/out</li>
        <li>Click on individual elements to see details</li>
        <li>Try different shapes using the selector above</li>
        <li>Toggle between 2D and 3D views</li>
      </ul>
    </div>
  );
};

// Loading Indicator
export const LoadingIndicator = ({ message = "Loading visualization..." }) => {
  return (
    <div className="loading-indicator">
      <div className="loading-spinner"></div>
      <div className="loading-text">{message}</div>
    </div>
  );
};

// Control Buttons Panel for playback controls
export const ControlButtons = ({
  isPlaying,
  togglePlayPause,
  stepForward,
  stepBackward,
  resetVisualization,
  toggle2D3DView,
  resetCamera,
  currentStepIndex,
  totalSteps,
  is3DView
}) => {
  return (
    <div className="visualization-controls">
      <ControlButton 
        onClick={resetVisualization}
        title="Reset"
        className="reset"
      >
        ↺
      </ControlButton>
      
      <ControlButton 
        onClick={stepBackward}
        disabled={currentStepIndex === 0}
        title="Previous Step"
      >
        ⏮
      </ControlButton>
      
      <ControlButton 
        onClick={togglePlayPause}
        title={isPlaying ? "Pause" : "Play"}
        className="play"
      >
        {isPlaying ? "⏸" : "▶"}
      </ControlButton>
      
      <ControlButton 
        onClick={stepForward}
        disabled={currentStepIndex === totalSteps - 1}
        title="Next Step"
      >
        ⏭
      </ControlButton>
      
      <ControlButton 
        onClick={toggle2D3DView}
        title={is3DView ? "2D View" : "3D View"}
      >
        {is3DView ? "2D" : "3D"}
      </ControlButton>
      
      <ControlButton 
        onClick={resetCamera}
        title="Reset Camera"
      >
        👁️
      </ControlButton>
    </div>
  );
};

// Element Details Popup
export const ElementPopup = ({ element, position, onClose }) => {
  return (
    <div className="element-popup" style={position}>
      <div className="popup-content">
        <h3>Element Details</h3>
        <p><strong>Value:</strong> {element.value}</p>
        <p><strong>Index:</strong> {element.index}</p>
        <p><strong>Status:</strong> {element.status}</p>
      </div>
    </div>
  );
};