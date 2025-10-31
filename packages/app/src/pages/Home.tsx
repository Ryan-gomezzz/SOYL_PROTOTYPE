import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <div className="pt-16">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
    </div>
  );
};

export default Home;
