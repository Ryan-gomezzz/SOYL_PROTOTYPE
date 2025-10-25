/**
 * VoiceController Component
 * Web Speech API wrapper for voice commands
 */

import { useState, useEffect, useRef } from 'react';

// Color name to hex mapping
const COLOR_MAP = {
  red: '#ff0000',
  blue: '#0000ff',
  green: '#00ff00',
  yellow: '#ffff00',
  purple: '#800080',
  pink: '#ffc0cb',
  orange: '#ffa500',
  black: '#000000',
  white: '#ffffff',
  gray: '#808080',
  grey: '#808080',
  brown: '#a52a2a',
  navy: '#000080',
  teal: '#008080',
  lime: '#00ff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  maroon: '#800000',
  olive: '#808000',
};

// Texture name mapping
const TEXTURE_MAP = {
  denim: 'denim',
  leather: 'leather',
  silk: 'silk',
  cotton: 'cotton',
};

const VoiceController = ({ viewerRef, onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported in this browser');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        processCommand(finalTranscript.toLowerCase().trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Ignore no-speech errors
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Process voice command
  const processCommand = (command) => {
    console.log('Processing command:', command);
    setLastCommand(command);

    if (!viewerRef.current) {
      console.warn('Viewer not ready');
      return;
    }

    // Rotation commands
    if (command.includes('rotate left')) {
      viewerRef.current.setRotation(0, Math.PI / 4, 0);
      notifyCommand('Rotating left');
    } else if (command.includes('rotate right')) {
      viewerRef.current.setRotation(0, -Math.PI / 4, 0);
      notifyCommand('Rotating right');
    } else if (command.match(/rotate (\d+)/)) {
      const degrees = parseInt(command.match(/rotate (\d+)/)[1]);
      const radians = (degrees * Math.PI) / 180;
      viewerRef.current.setRotation(0, radians, 0);
      notifyCommand(`Rotating ${degrees} degrees`);
    }

    // Zoom commands
    else if (command.includes('zoom in')) {
      viewerRef.current.setScale(1.5);
      notifyCommand('Zooming in');
    } else if (command.includes('zoom out')) {
      viewerRef.current.setScale(0.7);
      notifyCommand('Zooming out');
    } else if (command.includes('reset zoom')) {
      viewerRef.current.setScale(1);
      notifyCommand('Resetting zoom');
    }

    // Color commands
    else if (command.includes('make it')) {
      const colorMatch = command.match(/make it (\w+)/);
      if (colorMatch) {
        const colorName = colorMatch[1];
        const hexColor = COLOR_MAP[colorName];
        if (hexColor) {
          viewerRef.current.setColor(hexColor);
          notifyCommand(`Changing color to ${colorName}`);
        }
      }
    } else if (command.includes('color')) {
      // Try to extract color name
      for (const [name, hex] of Object.entries(COLOR_MAP)) {
        if (command.includes(name)) {
          viewerRef.current.setColor(hex);
          notifyCommand(`Changing color to ${name}`);
          break;
        }
      }
    }

    // Texture commands
    else if (command.includes('apply')) {
      for (const [name, key] of Object.entries(TEXTURE_MAP)) {
        if (command.includes(name)) {
          viewerRef.current.applyTexture(key);
          notifyCommand(`Applying ${name} texture`);
          break;
        }
      }
    } else if (command.includes('remove texture')) {
      viewerRef.current.removeTexture();
      notifyCommand('Removing texture');
    }

    // View commands
    else if (command.includes('front view')) {
      viewerRef.current.setCameraView('front');
      notifyCommand('Front view');
    } else if (command.includes('back view')) {
      viewerRef.current.setCameraView('back');
      notifyCommand('Back view');
    } else if (command.includes('left view')) {
      viewerRef.current.setCameraView('left');
      notifyCommand('Left view');
    } else if (command.includes('right view')) {
      viewerRef.current.setCameraView('right');
      notifyCommand('Right view');
    } else if (command.includes('top view')) {
      viewerRef.current.setCameraView('top');
      notifyCommand('Top view');
    } else if (command.includes('reset camera') || command.includes('reset view')) {
      viewerRef.current.resetCamera();
      notifyCommand('Resetting camera');
    }

    // Save/Export commands
    else if (command.includes('save design')) {
      notifyCommand('Saving design...');
      if (onCommand) {
        onCommand({ type: 'save' });
      }
    } else if (command.includes('export')) {
      notifyCommand('Exporting design...');
      if (onCommand) {
        onCommand({ type: 'export' });
      }
    }

    // Help command
    else if (command.includes('help') || command.includes('commands')) {
      notifyCommand('Available commands: rotate, zoom, color, texture, view, save, export');
    }
  };

  // Notify user of command execution
  const notifyCommand = (message) => {
    if (onCommand) {
      onCommand({ type: 'notification', message });
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice commands are not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="voice-controller">
      <button
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        aria-label={isListening ? 'Stop voice commands' : 'Start voice commands'}
        aria-pressed={isListening}
      >
        <span className="voice-icon">{isListening ? '🎤' : '🎙️'}</span>
        <span className="voice-label">
          {isListening ? 'Listening...' : 'Voice Commands'}
        </span>
      </button>

      {transcript && (
        <div className="voice-transcript" role="status" aria-live="polite">
          <strong>Hearing:</strong> {transcript}
        </div>
      )}

      {lastCommand && !transcript && (
        <div className="voice-last-command" role="status">
          <strong>Last command:</strong> {lastCommand}
        </div>
      )}

      <style jsx>{`
        .voice-controller {
          position: relative;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-primary, #667eea);
          color: white;
          border: none;
          border-radius: 9999px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .voice-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .voice-btn.listening {
          background: #dc2626;
          animation: pulse 2s infinite;
        }

        .voice-btn:focus-visible {
          outline: 2px solid var(--color-primary, #667eea);
          outline-offset: 2px;
        }

        .voice-icon {
          font-size: 1.25rem;
        }

        .voice-label {
          font-size: 0.875rem;
        }

        .voice-transcript,
        .voice-last-command {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .voice-transcript {
          background: rgba(102, 126, 234, 0.9);
        }

        .voice-last-command {
          background: rgba(0, 0, 0, 0.6);
          font-size: 0.75rem;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .voice-btn {
            transition: none;
          }
          .voice-btn:hover {
            transform: none;
          }
          .voice-btn.listening {
            animation: none;
          }
        }

        @media (max-width: 768px) {
          .voice-btn {
            padding: 0.625rem 1.25rem;
          }
          .voice-icon {
            font-size: 1rem;
          }
          .voice-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceController;

