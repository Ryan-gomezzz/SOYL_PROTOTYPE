/**
 * Texture utilities for Three.js viewer
 * Handles texture loading with caching and fallbacks
 */

import * as THREE from 'three';

// Texture cache to avoid reloading
const textureCache = new Map<string, THREE.Texture>();

// Available textures
export const TEXTURES = {
  denim: {
    name: 'Denim',
    url: '/textures/denim.jpg',
    color: '#4a5568', // fallback color
  },
  leather: {
    name: 'Leather',
    url: '/textures/leather.jpg',
    color: '#2d3748',
  },
  silk: {
    name: 'Silk',
    url: '/textures/silk.jpg',
    color: '#edf2f7',
  },
  cotton: {
    name: 'Cotton',
    url: '/textures/cotton.jpg',
    color: '#ffffff',
  },
} as const;

/**
 * Load a texture with caching
 * @param {string} url - Texture URL
 * @returns {Promise<THREE.Texture>}
 */
export async function loadTexture(url: string): Promise<THREE.Texture> {
  // Check cache first
  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (texture: THREE.Texture) => {
        // Configure texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Cache it
        textureCache.set(url, texture);
        resolve(texture);
      },
      undefined,
      (error: ErrorEvent) => {
        console.warn(`Failed to load texture ${url}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Preload all textures
 * @returns {Promise<void>}
 */
export async function preloadTextures(): Promise<void> {
  const promises = Object.values(TEXTURES).map(({ url }) => {
    return loadTexture(url).catch((err: Error) => {
      console.warn(`Skipping texture ${url}:`, err);
    });
  });
  
  await Promise.allSettled(promises);
}

/**
 * Clear texture cache
 */
export function clearTextureCache(): void {
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
}

/**
 * Get fallback color for a texture
 * @param {string} textureKey - Key from TEXTURES object
 * @returns {string} - Hex color
 */
export function getFallbackColor(textureKey: keyof typeof TEXTURES): string {
  return TEXTURES[textureKey]?.color || '#cccccc';
}

