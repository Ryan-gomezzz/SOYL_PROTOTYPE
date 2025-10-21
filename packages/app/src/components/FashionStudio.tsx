import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fabric } from 'fabric';
import { useInterval } from '../hooks/useInterval';
import { generateDesign, getConceptStatus } from '../lib/api';

type ConceptResponse = {
  designId: string;
  design?: any;
  previewUrl?: string;
  ready?: boolean;
};

const FashionStudio = () => {
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('jacket');
  const [style, setStyle] = useState('modern royal');
  const [_file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 800,
        backgroundColor: '#000000'
      });
    }
  }, []);

  // Poll for concept status
  useInterval(
    async () => {
      if (result?.designId) {
        try {
          console.log('Polling for design:', result.designId);
          const status = await getConceptStatus(result.designId);
          console.log('Polling response:', status);
          
          if (status.ready) {
            setResult(status);
            if (status.previewUrl) {
              console.log('✅ Preview URL received:', status.previewUrl);
              setPreviews(prev => {
                const newPreviews = [...prev, status.previewUrl!];
                console.log('Updated previews array:', newPreviews);
                return newPreviews;
              });
              setPolling(false);
            } else {
              console.log('⚠️ Ready but no preview URL yet, continuing to poll...');
            }
          } else {
            console.log('⏳ Not ready yet, continuing to poll...');
          }
        } catch (error) {
          console.error('Error polling status:', error);
          setPolling(false);
        }
      }
    },
    polling ? 2000 : null
  );

  const handleSubmit = async () => {
    if (!story.trim()) {
      alert('Please enter your story.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateDesign({
        brief: story,
        options: {
          product: category,
          style: style,
          canvas: { w: 600, h: 800 },
          retrieval: true
        }
      });

      setResult(response);
      setPolling(true);
    } catch (error) {
      console.error('Error generating design:', error);
      alert('Failed to generate design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportCanvas = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      const link = document.createElement('a');
      link.download = 'soyl-design.png';
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Form */}
      <motion.div
        className="card"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-6">
          Tell Your Story
        </h2>

        <div className="space-y-6">
          {/* Story Input */}
          <div>
            <label className="block text-soyl-white font-medium mb-2">
              Your Story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Share your journey, dreams, or the essence you want to capture in your design..."
              className="input-field h-32 resize-none"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-soyl-white font-medium mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="jacket">Jacket</option>
              <option value="dress">Dress</option>
              <option value="suit">Suit</option>
              <option value="shirt">Shirt</option>
              <option value="pants">Pants</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-soyl-white font-medium mb-2">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input-field"
            >
              <option value="modern royal">Modern Royal</option>
              <option value="minimalist">Minimalist</option>
              <option value="vintage">Vintage</option>
              <option value="avant-garde">Avant-Garde</option>
              <option value="classic">Classic</option>
              <option value="bohemian">Bohemian</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-soyl-white font-medium mb-2">
              Reference Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading || !story.trim()}
            className="btn-secondary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-soyl-black border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </div>
            ) : (
              'Generate Design'
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Right Panel - Canvas & Previews */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Canvas */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-xl font-semibold text-soyl-white">
              Design Preview
            </h3>
            <button
              onClick={exportCanvas}
              className="btn-primary text-sm px-4 py-2"
            >
              Export PNG
            </button>
          </div>
          
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-soyl-silver/30 rounded-lg"
            />
          </div>
        </div>

        {/* Generated Previews */}
        {previews.length > 0 && (
          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-soyl-white mb-4">
              Generated Previews ({previews.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => {
                console.log(`Rendering preview ${index}:`, preview);
                return (
                  <motion.div
                    key={index}
                    className="relative group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <img
                      src={preview}
                      alt={`Design preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-soyl-silver/30"
                      onLoad={() => console.log(`✅ Image ${index} loaded successfully`)}
                      onError={(e) => console.log(`❌ Image ${index} failed to load:`, e)}
                    />
                    <div className="absolute inset-0 bg-soyl-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button className="btn-primary text-sm px-3 py-1">
                        View Full
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status */}
        {result && (
          <div className="card">
            <h3 className="font-serif text-xl font-semibold text-soyl-white mb-4">
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-soyl-silver">Design ID:</span>
                <span className="text-soyl-white font-mono text-sm">
                  {result.designId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-soyl-silver">Status:</span>
                <span className={`font-medium ${
                  result.ready ? 'text-soyl-gold' : 'text-soyl-silver'
                }`}>
                  {result.ready ? 'Ready' : 'Processing...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FashionStudio;