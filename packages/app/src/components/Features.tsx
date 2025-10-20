import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      title: "AI-Powered Design",
      description: "Advanced algorithms transform your story into unique fashion concepts, ensuring every piece is truly one-of-a-kind.",
      icon: "🎨"
    },
    {
      title: "Luxury Materials",
      description: "Curated selection of premium fabrics and materials, sourced from the world's finest suppliers.",
      icon: "✨"
    },
    {
      title: "Bespoke Craftsmanship",
      description: "Each piece is meticulously crafted by master artisans, ensuring exceptional quality and attention to detail.",
      icon: "👑"
    },
    {
      title: "Personal Narrative",
      description: "Your story becomes the foundation of your design, creating garments that are deeply personal and meaningful.",
      icon: "📖"
    }
  ];

  return (
    <section ref={ref} className="py-24 bg-soyl-black/50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-soyl-white mb-6">
            Why Choose SOYL
          </h2>
          <p className="text-xl text-soyl-silver max-w-2xl mx-auto">
            Experience the future of luxury fashion, where technology meets artistry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-serif text-xl font-semibold text-soyl-white mb-3">
                {feature.title}
              </h3>
              <p className="text-soyl-silver text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
