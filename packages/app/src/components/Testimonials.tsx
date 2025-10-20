import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      quote: "SOYL transformed my grandmother's story into the most beautiful dress I've ever worn. Every detail tells her tale.",
      author: "Elena Rodriguez",
      role: "Fashion Enthusiast"
    },
    {
      quote: "The AI understood my vision better than I could express it. The result exceeded all my expectations.",
      author: "Marcus Chen",
      role: "Art Collector"
    },
    {
      quote: "Finally, fashion that truly represents who I am. SOYL created something that feels authentically me.",
      author: "Isabella Thompson",
      role: "Creative Director"
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
            Stories of Transformation
          </h2>
          <p className="text-xl text-soyl-silver max-w-2xl mx-auto">
            Hear from those who have experienced the magic of SOYL.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="text-soyl-gold text-2xl mb-4">"</div>
              <p className="text-soyl-white text-sm leading-relaxed mb-6">
                {testimonial.quote}
              </p>
              <div>
                <div className="font-semibold text-soyl-white">
                  {testimonial.author}
                </div>
                <div className="text-soyl-silver text-sm">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
