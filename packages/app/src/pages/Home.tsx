import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import { ChatbotWidget } from '../components/Chatbot';

const Home = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  // Studio cards with placeholder images
  const studioCards = [
    {
      title: 'Studio',
      description: 'Create custom designs with AI-powered tools',
      href: '/studio',
      image: '/placeholder-product.svg',
      color: 'from-soyl-gold/20 to-soyl-bronze/20',
    },
    {
      title: '3D Studio',
      description: 'Visualize your designs in three dimensions',
      href: '/design-studio-3d',
      image: '/placeholder-product.svg',
      color: 'from-soyl-silver/20 to-soyl-silver/10',
    },
    {
      title: 'Catalog',
      description: 'Browse our curated collection of designs',
      href: '/catalog',
      image: '/placeholder-product.svg',
      color: 'from-soyl-bronze/20 to-soyl-gold/20',
    },
  ];

  // Why SOIL cards
  const whySoilCards = [
    {
      title: 'AI-Powered Design',
      description: 'Advanced algorithms that understand your vision',
      icon: '🎨',
    },
    {
      title: 'Luxury Craftsmanship',
      description: 'Meticulously crafted by master artisans',
      icon: '✨',
    },
    {
      title: 'Personal Narrative',
      description: 'Every piece tells your unique story',
      icon: '📖',
    },
  ];

  return (
    <div className="pt-16 bg-[var(--bg)]">
      {/* Visual-first Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient with large imagery placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--panel)] via-[var(--bg)] to-[var(--panel)]" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(192, 192, 200, 0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 20%, rgba(192, 192, 200, 0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 40% 80%, rgba(192, 192, 200, 0.15) 0%, transparent 60%)',
              'radial-gradient(circle at 20% 50%, rgba(192, 192, 200, 0.15) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero Image Grid Placeholder */}
            <motion.div
              className="mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-[var(--panel)] border border-[var(--glass)] rounded-lg overflow-hidden"
                  >
                    <img
                      src="/placeholder-product.svg"
                      alt={`Hero image ${i}`}
                      className="w-full h-full object-cover opacity-30"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.h1
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <span className="text-[var(--text)]">SOYL:</span>
              <br />
              <span className="text-[var(--accent)]">Story Of Your Life</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              AI design that listens. Transform your narrative into bespoke luxury fashion.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button
                onClick={() => setShowChatbot(true)}
                className="px-8 py-4 bg-[var(--accent)]/10 border-2 border-[var(--accent)] text-[var(--accent)] font-semibold rounded-lg hover:bg-[var(--accent)]/20 transition-all duration-300 text-lg"
              >
                Design with AI
              </button>
              <Link
                to="/studio"
                className="px-8 py-4 bg-transparent border-2 border-[var(--muted)] text-[var(--muted)] font-semibold rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300 text-lg"
              >
                Begin Your Story
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Studio/3D/Catalog Cards Section */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-[var(--text)]">
            Explore Our Studios
          </h2>
          <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Create, visualize, and browse your designs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {studioCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                to={card.href}
                className="block group relative overflow-hidden rounded-xl bg-[var(--panel)] border border-[var(--glass)] hover:border-[var(--accent)]/30 transition-all duration-300"
              >
                <div className={`aspect-[4/5] bg-gradient-to-br ${card.color} relative overflow-hidden`}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="text-left">
                      <h3 className="font-serif text-2xl font-bold mb-2 text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why SOIL Section */}
      <section className="py-20 bg-[var(--panel)]/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-[var(--text)]">
              Why SOIL
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
              Where technology meets artistry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whySoilCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="bg-[var(--panel)] border border-[var(--glass)] rounded-xl p-8 text-center hover:border-[var(--accent)]/30 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="font-serif text-xl font-semibold mb-3 text-[var(--accent)]">
                  {card.title}
                </h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Stories of Transformation (Testimonials) */}
      <Testimonials />

      {/* Chatbot Widget - deferred load */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md mx-4">
            <ChatbotWidget
              autoOpenDelay={0}
              onComplete={() => setShowChatbot(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
