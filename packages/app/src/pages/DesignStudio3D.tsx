/**
 * DesignStudio3D Page
 * Interactive 3D design studio with viewer, controls, and voice commands
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeViewer from '../components/ThreeViewer/ThreeViewer';
import InspectorPanel from '../components/Controls/InspectorPanel';
import VoiceController from '../components/VoiceController';
import useScreenshot from '../hooks/useScreenshot';
import axios from 'axios';
import '../styles/3d-studio.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DesignStudio3D = () => {
  const viewerRef = useRef<any>(null);
  const [designName, setDesignName] = useState('Untitled Design');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle save design
  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/designs/save`, {
        name: data.name,
        params: data.params,
        thumbnail: data.thumbnail,
      });

      showNotification(`Design saved successfully! ID: ${response.data.id}`, 'success');
      console.log('Design saved:', response.data);
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save design. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export design
  const handleExport = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/designs/export`, {
        imageBase64: data.imageBase64,
        filename: `${designName.replace(/\s+/g, '-')}.png`,
      });

      showNotification('Design exported successfully!', 'success');
      
      // Download the file
      if (response.data.url) {
        window.open(`${API_BASE_URL}${response.data.url}`, '_blank');
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export design. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle voice commands
  const handleVoiceCommand = (command: any) => {
    if (command.type === 'notification') {
      showNotification(command.message, 'info');
    } else if (command.type === 'save') {
      // Trigger save from inspector panel
      if (viewerRef.current) {
        const screenshot = viewerRef.current.getScreenshot();
        handleSave({
          name: designName,
          params: {},
          thumbnail: screenshot,
        });
      }
    } else if (command.type === 'export') {
      // Trigger export
      if (viewerRef.current) {
        const screenshot = viewerRef.current.getScreenshot();
        handleExport({ imageBase64: screenshot });
      }
    }
  };

  // Handle model load
  const handleModelLoad = (model: any) => {
    console.log('Model loaded:', model);
    showNotification('3D model loaded successfully!', 'success');
  };

  // Handle model error
  const handleModelError = (error: any) => {
    console.error('Model load error:', error);
    showNotification('Using placeholder model. Add your own GLB file to /public/models/', 'info');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!viewerRef.current) return;

      // Arrow keys for rotation
      if (e.key === 'ArrowLeft') {
        const current = viewerRef.current.getModel();
        if (current) {
          current.rotation.y += 0.1;
        }
      } else if (e.key === 'ArrowRight') {
        const current = viewerRef.current.getModel();
        if (current) {
          current.rotation.y -= 0.1;
        }
      }
      // +/- for zoom
      else if (e.key === '+' || e.key === '=') {
        const current = viewerRef.current.getModel();
        if (current) {
          current.scale.multiplyScalar(1.1);
        }
      } else if (e.key === '-' || e.key === '_') {
        const current = viewerRef.current.getModel();
        if (current) {
          current.scale.multiplyScalar(0.9);
        }
      }
      // R for reset
      else if (e.key === 'r' || e.key === 'R') {
        viewerRef.current.resetCamera();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="studio-3d-page">
      <div className="studio-3d-container">
        {/* Header */}
        <header className="studio-3d-header">
          <h1 className="studio-3d-title">3D Design Studio</h1>
          <p className="studio-3d-subtitle">
            Create, customize, and export your garment designs in 3D
          </p>
        </header>

        {/* Main Layout */}
        <div className="studio-3d-layout">
          {/* Viewer Section */}
          <div className="studio-3d-viewer-section">
            <ThreeViewer
              ref={viewerRef}
              modelUrl="/models/placeholder.glb"
              onLoad={handleModelLoad}
              onError={handleModelError}
            />
            
            {/* Voice Controller */}
            <div className="studio-3d-voice-section">
              <VoiceController
                viewerRef={viewerRef}
                onCommand={handleVoiceCommand}
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="studio-3d-controls-section">
            {/* Inspector Panel */}
            <InspectorPanel
              viewerRef={viewerRef}
              onSave={handleSave}
              onExport={handleExport}
              designName={designName}
            />

            {/* Help Panel */}
            <div className="studio-3d-help">
              <h3 className="studio-3d-help-title">🎮 Controls</h3>
              <ul className="studio-3d-help-list">
                <li className="studio-3d-help-item">
                  <span className="studio-3d-help-command">Mouse drag:</span> Rotate model
                </li>
                <li className="studio-3d-help-item">
                  <span className="studio-3d-help-command">Scroll:</span> Zoom in/out
                </li>
                <li className="studio-3d-help-item">
                  <span className="studio-3d-help-command">Arrow keys:</span> Rotate left/right
                </li>
                <li className="studio-3d-help-item">
                  <span className="studio-3d-help-command">+/-:</span> Zoom in/out
                </li>
                <li className="studio-3d-help-item">
                  <span className="studio-3d-help-command">R:</span> Reset camera
                </li>
              </ul>

              <h3 className="studio-3d-help-title" style={{ marginTop: '1.5rem' }}>
                🎤 Voice Commands
              </h3>
              <ul className="studio-3d-help-list">
                <li className="studio-3d-help-item">"Rotate left/right"</li>
                <li className="studio-3d-help-item">"Zoom in/out"</li>
                <li className="studio-3d-help-item">"Make it [color]"</li>
                <li className="studio-3d-help-item">"Apply [texture]"</li>
                <li className="studio-3d-help-item">"Front/back/left/right view"</li>
                <li className="studio-3d-help-item">"Save design"</li>
                <li className="studio-3d-help-item">"Export"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`studio-3d-notification ${notification.type}`} role="alert">
          {notification.message}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="studio-3d-loading-overlay">
          <div className="studio-3d-loading-content">
            <div className="studio-3d-spinner" />
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignStudio3D;

