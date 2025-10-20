import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
              About SOYL
            </h1>
            <p className="text-xl text-soyl-silver max-w-3xl mx-auto leading-relaxed">
              We believe every story deserves to be told through fashion. 
              SOYL transforms your narrative into bespoke luxury pieces that embody your essence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-3xl font-semibold text-soyl-white mb-6">
                Our Mission
              </h2>
              <p className="text-soyl-silver leading-relaxed mb-6">
                At SOYL, we bridge the gap between personal narrative and luxury fashion. 
                Our AI-powered platform understands the depth of your story and translates 
                it into designs that speak to your soul.
              </p>
              <p className="text-soyl-silver leading-relaxed">
                Every piece we create is more than clothing—it's a wearable memoir, 
                a testament to your journey, and a celebration of your unique essence.
              </p>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-square bg-gradient-to-br from-soyl-gold/20 to-soyl-bronze/20 rounded-xl flex items-center justify-center">
                <div className="text-6xl">👑</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            ref={ref}
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl font-bold text-soyl-white mb-12">
              Founding Team
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-soyl-gold to-soyl-bronze rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-soyl-black font-bold text-2xl">SP</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-soyl-white mb-2">
                Siddharth Priyatham
              </h3>
              <p className="text-soyl-gold font-medium mb-4">CEO & Co-Founder</p>
              <p className="text-soyl-silver text-sm leading-relaxed">
                Visionary leader with a passion for merging technology and artistry. 
                Siddharth brings deep expertise in AI and luxury fashion, driving SOYL's 
                mission to democratize bespoke design.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-soyl-silver to-soyl-gold rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-soyl-black font-bold text-2xl">RG</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-soyl-white mb-2">
                Ryan Gomez
              </h3>
              <p className="text-soyl-gold font-medium mb-4">CTO & Co-Founder</p>
              <p className="text-soyl-silver text-sm leading-relaxed">
                Technical architect behind SOYL's innovative platform. Ryan's expertise 
                in full-stack development and AI integration ensures our technology 
                delivers seamless, personalized experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
