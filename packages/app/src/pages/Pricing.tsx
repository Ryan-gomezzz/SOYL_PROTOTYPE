import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Explorer",
      price: "$299",
      description: "Perfect for your first bespoke piece",
      features: [
        "AI-powered design generation",
        "1 design concept",
        "Basic material selection",
        "Digital preview",
        "Email support"
      ],
      cta: "Start Your Story",
      popular: false
    },
    {
      name: "Creator",
      price: "$599",
      description: "For those who want to explore multiple concepts",
      features: [
        "Everything in Explorer",
        "3 design concepts",
        "Premium material selection",
        "Design refinement session",
        "Priority support",
        "Design history access"
      ],
      cta: "Create More",
      popular: true
    },
    {
      name: "Collector",
      price: "$999",
      description: "For the ultimate luxury experience",
      features: [
        "Everything in Creator",
        "Unlimited design concepts",
        "Luxury material selection",
        "Personal design consultant",
        "VIP support",
        "Exclusive access to new features",
        "Custom packaging"
      ],
      cta: "Go Premium",
      popular: false
    }
  ];

  return (
    <div className="pt-16">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-soyl-white mb-6">
              Choose Your Journey
            </h1>
            <p className="text-xl text-soyl-silver max-w-3xl mx-auto leading-relaxed">
              Select the experience that matches your story. Every plan includes 
              our signature AI-powered design generation and luxury craftsmanship.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`card relative ${plan.popular ? 'border-soyl-gold' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-soyl-gold text-soyl-black px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl font-semibold text-soyl-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-soyl-gold mb-2">
                    {plan.price}
                  </div>
                  <p className="text-soyl-silver text-sm">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-5 h-5 bg-soyl-gold/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <div className="w-2 h-2 bg-soyl-gold rounded-full"></div>
                      </div>
                      <span className="text-soyl-silver text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-soyl-gold text-soyl-black hover:bg-soyl-gold/90'
                      : 'bg-transparent border-2 border-soyl-gold text-soyl-gold hover:bg-soyl-gold hover:text-soyl-black'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              Need Something Custom?
            </h2>
            <p className="text-soyl-silver mb-6">
              Contact us for enterprise solutions and custom pricing.
            </p>
            <motion.a
              href="mailto:enterprise@soyl.com"
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Contact Enterprise
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
