/**
 * InspectorPanel Component
 * Control panel for 3D viewer with color picker, texture selector, view presets, and export
 */

import { useState, useEffect } from 'react';
import { TEXTURES } from '../ThreeViewer/texture-utils';
import './InspectorPanel.css';

const InspectorPanel = ({ viewerRef, onSave, onExport, designName = 'Untitled Design' }) => {
  const [color, setColor] = useState('#667eea');
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotationY, setRotationY] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Apply color change
  const handleColorChange = (newColor) => {
    setColor(newColor);
    if (viewerRef.current) {
      viewerRef.current.setColor(newColor);
      // Remove texture when color is applied
      viewerRef.current.removeTexture();
      setSelectedTexture(null);
    }
  };

  // Apply texture
  const handleTextureSelect = (textureKey) => {
    if (selectedTexture === textureKey) {
      // Deselect texture
      setSelectedTexture(null);
      if (viewerRef.current) {
        viewerRef.current.removeTexture();
        viewerRef.current.setColor(color);
      }
    } else {
      setSelectedTexture(textureKey);
      if (viewerRef.current) {
        viewerRef.current.applyTexture(textureKey);
      }
    }
  };

  // Apply scale
  const handleScaleChange = (newScale) => {
    setScale(newScale);
    if (viewerRef.current) {
      viewerRef.current.setScale(parseFloat(newScale));
    }
  };

  // Apply rotation
  const handleRotationChange = (newRotation) => {
    setRotationY(newRotation);
    if (viewerRef.current) {
      const radians = (parseFloat(newRotation) * Math.PI) / 180;
      viewerRef.current.setRotation(0, radians, 0);
    }
  };

  // Set camera view
  const handleViewPreset = (view) => {
    if (viewerRef.current) {
      viewerRef.current.setCameraView(view);
    }
  };

  // Reset camera
  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.resetCamera();
    }
  };

  // Save design
  const handleSave = async () => {
    if (!viewerRef.current || isSaving) return;
    
    setIsSaving(true);
    try {
      const screenshot = viewerRef.current.getScreenshot();
      const params = {
        color,
        texture: selectedTexture,
        scale,
        rotationY,
      };
      
      if (onSave) {
        await onSave({ name: designName, params, thumbnail: screenshot });
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export design
  const handleExport = async () => {
    if (!viewerRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const screenshot = viewerRef.current.getScreenshot();
      
      if (onExport) {
        await onExport({ imageBase64: screenshot });
      } else {
        // Fallback: download directly
        const link = document.createElement('a');
        link.download = `${designName.replace(/\s+/g, '-')}.png`;
        link.href = screenshot;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export design. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <h2 className="inspector-title">Design Inspector</h2>
      </div>

      {/* Color Picker */}
      <div className="inspector-section">
        <div className="inspector-section-title">Color</div>
        <div className="color-picker-group">
          <input
            type="color"
            className="color-picker-input"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            aria-label="Choose color"
          />
          <div className="color-hex-display">{color.toUpperCase()}</div>
        </div>
      </div>

      {/* Texture Selector */}
      <div className="inspector-section">
        <div className="inspector-section-title">Texture</div>
        <div className="texture-grid">
          {Object.entries(TEXTURES).map(([key, texture]) => (
            <button
              key={key}
              className={`texture-option ${selectedTexture === key ? 'active' : ''}`}
              onClick={() => handleTextureSelect(key)}
              aria-label={`Apply ${texture.name} texture`}
              aria-pressed={selectedTexture === key}
            >
              <div 
                className="texture-fallback"
                style={{ backgroundColor: texture.color }}
              >
                {/* Texture preview would go here if images exist */}
                <span style={{ fontSize: '1.5rem' }}>
                  {texture.name.charAt(0)}
                </span>
              </div>
              <div className="texture-label">{texture.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* View Presets */}
      <div className="inspector-section">
        <div className="inspector-section-title">Camera Views</div>
        <div className="view-presets">
          <button
            className="view-preset-btn"
            onClick={() => handleViewPreset('front')}
            aria-label="Front view"
          >
            Front
          </button>
          <button
            className="view-preset-btn"
            onClick={() => handleViewPreset('back')}
            aria-label="Back view"
          >
            Back
          </button>
          <button
            className="view-preset-btn"
            onClick={() => handleViewPreset('left')}
            aria-label="Left view"
          >
            Left
          </button>
          <button
            className="view-preset-btn"
            onClick={() => handleViewPreset('right')}
            aria-label="Right view"
          >
            Right
          </button>
          <button
            className="view-preset-btn"
            onClick={() => handleViewPreset('top')}
            aria-label="Top view"
          >
            Top
          </button>
          <button
            className="view-preset-btn"
            onClick={handleResetCamera}
            aria-label="Reset camera"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Scale Control */}
      <div className="inspector-section">
        <div className="inspector-section-title">Transform</div>
        <div className="slider-group">
          <div className="slider-label">
            <span>Scale</span>
            <span className="slider-value">{scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            className="slider-input"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => handleScaleChange(e.target.value)}
            aria-label="Scale model"
          />
        </div>
        
        <div className="slider-group">
          <div className="slider-label">
            <span>Rotation</span>
            <span className="slider-value">{rotationY}°</span>
          </div>
          <input
            type="range"
            className="slider-input"
            min="0"
            max="360"
            step="15"
            value={rotationY}
            onChange={(e) => handleRotationChange(e.target.value)}
            aria-label="Rotate model"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="inspector-actions">
        <button
          className="inspector-btn inspector-btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Save design"
        >
          {isSaving ? (
            <>
              <span>💾</span> Saving...
            </>
          ) : (
            <>
              <span>💾</span> Save Design
            </>
          )}
        </button>
        
        <button
          className="inspector-btn inspector-btn-secondary"
          onClick={handleExport}
          disabled={isExporting}
          aria-label="Export as PNG"
        >
          {isExporting ? (
            <>
              <span>📥</span> Exporting...
            </>
          ) : (
            <>
              <span>📥</span> Export PNG
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InspectorPanel;

