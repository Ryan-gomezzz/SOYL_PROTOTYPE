/**
 * useScreenshot Hook
 * Utility to capture canvas and return Blob/dataURL
 */

import { useState, useCallback } from 'react';

const useScreenshot = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Capture screenshot from a canvas element
   * @param {HTMLCanvasElement} canvas - Canvas element to capture
   * @param {Object} options - Capture options
   * @returns {Promise<{dataUrl: string, blob: Blob}>}
   */
  const captureCanvas = useCallback(async (canvas: HTMLCanvasElement, options: any = {}) => {
    const {
      format = 'image/png',
      quality = 0.95,
      width = null,
      height = null,
    }: any = options;

    setIsCapturing(true);
    setError(null);

    try {
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Invalid canvas element');
      }

      // Get data URL
      const dataUrl = canvas.toDataURL(format, quality);

      // Convert to Blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          format,
          quality
        );
      });

      // Optionally resize
      if (width || height) {
        const resizedCanvas = document.createElement('canvas');
        const ctx = resizedCanvas.getContext('2d');
        
        const aspectRatio = canvas.width / canvas.height;
        resizedCanvas.width = width || height * aspectRatio;
        resizedCanvas.height = height || width / aspectRatio;
        
        ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
        
        const resizedDataUrl = resizedCanvas.toDataURL(format, quality);
        const resizedBlob = await new Promise((resolve, reject) => {
          resizedCanvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create resized blob'));
              }
            },
            format,
            quality
          );
        });

        setIsCapturing(false);
        return { dataUrl: resizedDataUrl, blob: resizedBlob };
      }

      setIsCapturing(false);
      return { dataUrl, blob };
    } catch (err) {
      console.error('Screenshot capture error:', err);
      setError(err.message);
      setIsCapturing(false);
      throw err;
    }
  }, []);

  /**
   * Download screenshot
   * @param {string} dataUrl - Data URL to download
   * @param {string} filename - Filename for download
   */
  const downloadScreenshot = useCallback((dataUrl, filename = 'screenshot.png') => {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Convert data URL to File
   * @param {string} dataUrl - Data URL
   * @param {string} filename - Filename
   * @returns {File}
   */
  const dataUrlToFile = useCallback((dataUrl, filename = 'screenshot.png') => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }, []);

  /**
   * Convert blob to data URL
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<string>}
   */
  const blobToDataUrl = useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  return {
    captureCanvas,
    downloadScreenshot,
    dataUrlToFile,
    blobToDataUrl,
    isCapturing,
    error,
  };
};

export default useScreenshot;

