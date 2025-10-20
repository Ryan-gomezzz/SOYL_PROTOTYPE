import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-8xl mb-8">👑</div>
          <h1 className="font-serif text-6xl md:text-7xl font-bold text-soyl-white mb-6">
            404
          </h1>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-soyl-gold mb-6">
            Page Not Found
          </h2>
          <p className="text-xl text-soyl-silver mb-12 max-w-2xl mx-auto leading-relaxed">
            The page you're looking for doesn't exist in our story. 
            Let's redirect you to where your journey begins.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/" className="btn-secondary">
              Return Home
            </Link>
            <Link to="/studio" className="btn-primary">
              Start Creating
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
