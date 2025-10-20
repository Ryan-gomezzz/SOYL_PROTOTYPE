import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="pt-16">
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-soyl-white mb-6">
              Terms of Service
            </h1>
            <p className="text-soyl-silver">
              Last updated: January 2024
            </p>
          </motion.div>

          <motion.div
            className="prose prose-invert max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              By accessing and using SOYL's services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              2. Use License
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              Permission is granted to temporarily download one copy of SOYL's materials for 
              personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not modify or copy the materials.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              3. Design Ownership
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              You retain ownership of your personal stories and input. SOYL retains rights to the 
              AI-generated designs and our proprietary technology. Custom designs created for you 
              are licensed for your personal use.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              4. Privacy Policy
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
              and protect your information when you use our service.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              In no event shall SOYL or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use SOYL's materials.
            </p>

            <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-4">
              6. Contact Information
            </h2>
            <p className="text-soyl-silver mb-6 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at 
              <a href="mailto:legal@soyl.com" className="text-soyl-gold hover:text-soyl-silver">
                legal@soyl.com
              </a>.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
