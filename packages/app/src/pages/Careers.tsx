import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Careers = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const positions = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote",
      description: "Lead the development of our AI design generation algorithms and machine learning models."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      description: "Shape the future of luxury fashion technology through intuitive and elegant user experiences."
    },
    {
      title: "Fashion Technology Specialist",
      department: "Product",
      location: "Remote",
      description: "Bridge the gap between fashion expertise and technology innovation in our product development."
    },
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      description: "Build and scale our platform infrastructure to support our growing community of creators."
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
              Join Our Story
            </h1>
            <p className="text-xl text-soyl-silver max-w-3xl mx-auto leading-relaxed">
              Be part of the revolution in luxury fashion. Help us create the future 
              where every story becomes a masterpiece.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            {positions.map((position, index) => (
              <motion.div
                key={position.title}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-xl font-semibold text-soyl-white">
                    {position.title}
                  </h3>
                  <span className="text-soyl-gold text-sm font-medium">
                    {position.department}
                  </span>
                </div>
                
                <p className="text-soyl-silver text-sm mb-4">
                  {position.location}
                </p>
                
                <p className="text-soyl-silver text-sm leading-relaxed mb-6">
                  {position.description}
                </p>
                
                <motion.a
                  href={`mailto:careers@soyl.com?subject=Application for ${position.title}`}
                  className="btn-primary inline-block"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Now
                </motion.a>
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
              Don't See Your Role?
            </h2>
            <p className="text-soyl-silver mb-6">
              We're always looking for exceptional talent to join our mission.
            </p>
            <motion.a
              href="mailto:careers@soyl.com?subject=General Application"
              className="btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Us Your Story
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
