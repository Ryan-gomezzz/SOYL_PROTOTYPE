/**
 * DesignStudio3D Page
 * Interactive 3D design studio with viewer, controls, and voice commands
 */

import React, { useRef, useState, useEffect } from 'react';
import ThreeViewer from '../components/ThreeViewer/ThreeViewer';
import InspectorPanel from '../components/Controls/InspectorPanel';
import VoiceController from '../components/VoiceController';
import TemplateSelector from '../components/TemplateSelector/TemplateSelector';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import axios from 'axios';
import '../styles/3d-studio.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DesignStudio3D = () => {
  const viewerRef = useRef<any>(null);
  const [designName] = useState('Untitled Design');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    showNotification(`Loaded ${template.name} template`, 'success');
  };

  return (
    <div className="studio-3d-page-enhanced">
      <CustomCursor />
      
      {/* Top Header Bar */}
      <header className="studio-enhanced-header">
        <div className="studio-header-content">
          <div>
            <h1 className="studio-title">3D Design Studio</h1>
            <p className="studio-subtitle">Create bespoke garment designs with interactive 3D controls</p>
          </div>
          <VoiceController viewerRef={viewerRef} onCommand={handleVoiceCommand} />
        </div>
      </header>

      <div className="studio-enhanced-main">
        {/* Main 3D Viewer (Left/Center) */}
        <div className="studio-viewer-container">
          <ThreeViewer
            ref={viewerRef}
            modelUrl="/models/placeholder.glb"
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
        </div>

        {/* Right Panel - Templates & Controls */}
        <aside className="studio-sidebar-right">
          <TemplateSelector onSelectTemplate={handleTemplateSelect} selectedTemplateId={selectedTemplate?.id} />
          
          <div className="sidebar-spacer" />
          
          <InspectorPanel
            viewerRef={viewerRef}
            onSave={handleSave}
            onExport={handleExport}
            designName={designName}
          />
        </aside>
      </div>

      {/* Bottom Toolbar */}
      <div className="studio-bottom-bar">
        <div className="bottom-bar-section">
          <span className="bar-label">Quick Tools:</span>
          <button className="bar-btn" onClick={() => viewerRef.current?.resetCamera()}>Reset View</button>
          <button className="bar-btn" onClick={() => viewerRef.current?.setCameraView('front')}>Front</button>
          <button className="bar-btn" onClick={() => viewerRef.current?.setCameraView('side')}>Side</button>
          <button className="bar-btn" onClick={() => viewerRef.current?.setCameraView('top')}>Top</button>
        </div>
        
        <div className="bottom-bar-section">
          <span className="bar-label">Actions:</span>
          <button className="bar-btn bar-btn-primary" onClick={handleSave}>Save Design</button>
          <button className="bar-btn bar-btn-secondary" onClick={handleExport}>Export PNG</button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`studio-enhanced-notification ${notification.type}`} role="alert">
          {notification.message}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="studio-loading-overlay">
          <div className="studio-loading-content">
            <div className="studio-spinner-animated" />
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignStudio3D;

