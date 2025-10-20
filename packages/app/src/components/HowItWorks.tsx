import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Share Your Story",
      description: "Tell us about your journey, your dreams, your essence. Every detail matters in crafting your unique narrative."
    },
    {
      number: "02", 
      title: "AI Design Generation",
      description: "Our advanced AI analyzes your story and generates bespoke design concepts, ensuring each piece reflects your personality."
    },
    {
      number: "03",
      title: "Refine & Perfect",
      description: "Collaborate with our design team to refine your concept, select materials, and perfect every detail to your vision."
    },
    {
      number: "04",
      title: "Craft & Deliver",
      description: "Master artisans bring your design to life using premium materials and traditional techniques, delivered to your door."
    }
  ];

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-soyl-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-soyl-silver max-w-2xl mx-auto">
            From story to style, discover the journey of creating your bespoke fashion piece.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="card h-full">
                <div className="text-soyl-gold text-6xl font-bold mb-4 opacity-20">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-semibold text-soyl-white mb-3">
                  {step.title}
                </h3>
                <p className="text-soyl-silver text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-soyl-gold to-transparent transform -translate-y-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
