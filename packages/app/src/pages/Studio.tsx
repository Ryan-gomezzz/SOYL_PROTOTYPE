import { motion } from 'framer-motion';
import FashionStudio from '../components/FashionStudio';

const Studio = () => {
  return (
    <div className="pt-16 min-h-screen">
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-soyl-white mb-6">
            Design Studio
          </h1>
          <p className="text-xl text-soyl-silver max-w-2xl mx-auto">
            Transform your story into bespoke fashion. Begin your journey here.
          </p>
        </div>
        
        <FashionStudio />
      </motion.div>
    </div>
  );
};

export default Studio;
