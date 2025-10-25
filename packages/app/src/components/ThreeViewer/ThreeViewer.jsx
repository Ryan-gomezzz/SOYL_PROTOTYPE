/**
 * ThreeViewer Component
 * 3D viewer using Three.js with GLTFLoader, OrbitControls, and material manipulation
 */

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadTexture, TEXTURES, getFallbackColor } from './texture-utils';
import './ThreeViewer.css';

const ThreeViewer = forwardRef(({ modelUrl = '/models/placeholder.glb', onLoad, onError }, ref) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 1.5;
    controlsRef.current = controls;

    // Load model
    loadModel(modelUrl);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // Load 3D model
  const loadModel = async (url) => {
    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        
        // Remove old model if exists
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        
        // Add to scene
        sceneRef.current.add(model);
        modelRef.current = model;

        setModelInfo({
          vertices: 0,
          triangles: 0,
          materials: 0,
        });

        // Count geometry info
        let vertices = 0;
        let triangles = 0;
        const materials = new Set();
        
        model.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) {
              const positions = child.geometry.attributes.position;
              if (positions) {
                vertices += positions.count;
                triangles += positions.count / 3;
              }
            }
            if (child.material) {
              materials.add(child.material.uuid);
            }
          }
        });

        setModelInfo({
          vertices: Math.floor(vertices),
          triangles: Math.floor(triangles),
          materials: materials.size,
        });

        setLoading(false);
        if (onLoad) onLoad(model);
      },
      (progress) => {
        // Progress callback
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading: ${percent.toFixed(0)}%`);
      },
      (err) => {
        console.error('Error loading model:', err);
        
        // Create fallback cube
        const geometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x667eea,
          roughness: 0.5,
          metalness: 0.2,
        });
        const cube = new THREE.Mesh(geometry, material);
        
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
        
        sceneRef.current.add(cube);
        modelRef.current = cube;
        
        setError('Model not found. Using placeholder.');
        setLoading(false);
        if (onError) onError(err);
      }
    );
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setColor: (hexColor) => {
      if (!modelRef.current) return;
      
      const color = new THREE.Color(hexColor);
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.color.set(color);
              mat.needsUpdate = true;
            });
          } else {
            child.material.color.set(color);
            child.material.needsUpdate = true;
          }
        }
      });
    },

    applyTexture: async (textureKey) => {
      if (!modelRef.current) return;
      
      const textureInfo = TEXTURES[textureKey];
      if (!textureInfo) return;

      try {
        const texture = await loadTexture(textureInfo.url);
        
        modelRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.map = texture;
                mat.needsUpdate = true;
              });
            } else {
              child.material.map = texture;
              child.material.needsUpdate = true;
            }
          }
        });
      } catch (err) {
        console.warn('Texture load failed, using fallback color');
        const fallbackColor = getFallbackColor(textureKey);
        this.setColor(fallbackColor);
      }
    },

    removeTexture: () => {
      if (!modelRef.current) return;
      
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.map = null;
              mat.needsUpdate = true;
            });
          } else {
            child.material.map = null;
            child.material.needsUpdate = true;
          }
        }
      });
    },

    setRotation: (x, y, z) => {
      if (!modelRef.current) return;
      modelRef.current.rotation.set(x, y, z);
    },

    setScale: (scale) => {
      if (!modelRef.current) return;
      modelRef.current.scale.setScalar(scale);
    },

    resetCamera: () => {
      if (!cameraRef.current || !controlsRef.current) return;
      cameraRef.current.position.set(0, 1, 3);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    },

    setCameraView: (view) => {
      if (!cameraRef.current || !controlsRef.current) return;
      
      const distance = 3;
      const positions = {
        front: [0, 1, distance],
        back: [0, 1, -distance],
        left: [-distance, 1, 0],
        right: [distance, 1, 0],
        top: [0, distance, 0],
      };
      
      const pos = positions[view] || positions.front;
      cameraRef.current.position.set(...pos);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    },

    getScreenshot: () => {
      if (!rendererRef.current) return null;
      return rendererRef.current.domElement.toDataURL('image/png');
    },

    getModel: () => modelRef.current,
    getScene: () => sceneRef.current,
    getCamera: () => cameraRef.current,
    getRenderer: () => rendererRef.current,
  }));

  return (
    <div className="three-viewer-container" ref={containerRef}>
      <canvas className="three-viewer-canvas" ref={canvasRef} />
      
      {loading && (
        <div className="three-viewer-loading">
          <div className="three-viewer-spinner" />
          <div>Loading 3D Model...</div>
        </div>
      )}
      
      {error && (
        <div className="three-viewer-error">
          <strong>⚠️ {error}</strong>
        </div>
      )}
      
      {modelInfo && !loading && (
        <div className="three-viewer-info">
          <div>Vertices: {modelInfo.vertices.toLocaleString()}</div>
          <div>Triangles: {modelInfo.triangles.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
});

ThreeViewer.displayName = 'ThreeViewer';

export default ThreeViewer;

