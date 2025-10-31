import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SoylRd = () => {
  const researchAreas = [
    {
      title: 'Large Language Models',
      description: 'Advanced NLP capabilities for design intent understanding and creative assistance.',
    },
    {
      title: 'Inference Optimization',
      description: 'High-performance model serving and real-time prediction pipelines.',
    },
    {
      title: 'Computer Vision for Design',
      description: 'Image recognition, style transfer, and fashion pattern analysis.',
    },
    {
      title: 'Manufacturing-Aware Models',
      description: 'AI that understands production constraints and material properties.',
    },
  ];

  return (
    <div className="min-h-screen pt-16 bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--panel)] via-[var(--bg)] to-[var(--panel)]" />
        
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(192, 192, 200, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(192, 192, 200, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(192, 192, 200, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(192, 192, 200, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-[var(--text)]">SOIL</span>
              <br />
              <span className="text-[var(--accent)]">R&D</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Pioneering AI research for the future of fashion design and manufacturing.
              Pushing boundaries where technology meets creativity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/contact"
                className="inline-block px-8 py-4 bg-[var(--accent)]/10 border-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-lg hover:bg-[var(--accent)]/20 transition-all duration-300 text-lg"
              >
                Request R&D Pilot
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-[var(--text)]">
            Research & Development
          </h2>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            SOIL R&D is our innovation laboratory, dedicated to advancing AI capabilities
            in fashion design, manufacturing, and creative workflows. We explore
            cutting-edge technologies and translate research into real-world applications.
          </p>
        </motion.div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {researchAreas.map((area, index) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[var(--panel)] border border-[var(--glass)] rounded-xl p-8 hover:border-[var(--accent)]/30 transition-all duration-300"
            >
              <h3 className="font-serif text-2xl font-semibold mb-4 text-[var(--accent)]">
                {area.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {area.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-[var(--panel)] border border-[var(--accent)]/20 rounded-2xl p-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-[var(--text)]">
            Partner with SOIL R&D
          </h2>
          <p className="text-lg text-[var(--muted)] mb-8 leading-relaxed">
            Interested in collaborating on research projects or piloting new AI technologies?
            Get in touch with our R&D team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-[var(--accent)]/10 border-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-lg hover:bg-[var(--accent)]/20 transition-all duration-300"
            >
              Contact R&D Team
            </Link>
            <a
              href="#whitepaper"
              className="px-8 py-4 bg-transparent border-2 border-[var(--muted)] text-[var(--muted)] font-semibold rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300"
            >
              View R&D Whitepaper
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default SoylRd;

