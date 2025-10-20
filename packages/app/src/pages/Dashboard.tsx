import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserConcepts } from '../lib/api';

interface Design {
  designId: string;
  design?: any;
  previewUrl?: string;
  ready?: boolean;
  createdAt?: string;
}

const Dashboard = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user ID - in real app, get from auth context
    const userId = 'user-123';
    
    const fetchDesigns = async () => {
      try {
        const userDesigns = await getUserConcepts(userId);
        setDesigns(userDesigns);
      } catch (error) {
        console.error('Error fetching designs:', error);
        // Mock data for demo
        setDesigns([
          {
            designId: 'design-1',
            design: { title: 'Midnight Royal Jacket' },
            previewUrl: 'https://via.placeholder.com/300x400?text=Design+1',
            ready: true,
            createdAt: '2024-01-15'
          },
          {
            designId: 'design-2',
            design: { title: 'Vintage Travel Dress' },
            previewUrl: 'https://via.placeholder.com/300x400?text=Design+2',
            ready: true,
            createdAt: '2024-01-10'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-soyl-gold border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-soyl-white mb-6">
            Your Designs
          </h1>
          <p className="text-xl text-soyl-silver">
            A collection of your stories transformed into fashion.
          </p>
        </motion.div>

        {designs.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6">🎨</div>
            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              No Designs Yet
            </h2>
            <p className="text-soyl-silver mb-8">
              Start your journey by creating your first design.
            </p>
            <motion.a
              href="/studio"
              className="btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Your First Design
            </motion.a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design, index) => (
              <motion.div
                key={design.designId}
                className="card group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-[3/4] bg-soyl-black/50 rounded-lg mb-4 overflow-hidden">
                  {design.previewUrl ? (
                    <img
                      src={design.previewUrl}
                      alt={design.design?.title || 'Design preview'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-soyl-silver text-center">
                        <div className="text-4xl mb-2">⏳</div>
                        <p className="text-sm">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-soyl-white">
                    {design.design?.title || 'Untitled Design'}
                  </h3>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-soyl-silver">
                      {design.createdAt ? new Date(design.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      design.ready 
                        ? 'bg-soyl-gold/20 text-soyl-gold' 
                        : 'bg-soyl-silver/20 text-soyl-silver'
                    }`}>
                      {design.ready ? 'Ready' : 'Processing'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn-primary flex-1 text-sm py-2">
                      View
                    </button>
                    <button className="btn-secondary flex-1 text-sm py-2">
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
