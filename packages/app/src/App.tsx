import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import CustomCursor from './components/CustomCursor/CustomCursor';
import { ChatbotWidget } from './components/Chatbot';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Studio = lazy(() => import('./pages/Studio'));
const DesignStudio3D = lazy(() => import('./pages/DesignStudio3D'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Terms = lazy(() => import('./pages/Terms'));
const Login = lazy(() => import('./pages/Login'));
const Catalog = lazy(() => import('./pages/Catalog'));
const SoylRd = lazy(() => import('./pages/SoylRd'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <div className="min-h-screen bg-soyl-black text-soyl-white">
      <CustomCursor />
      <Header />
      <main className="min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              className="w-8 h-8 border-2 border-soyl-gold border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/design-studio-3d" element={<DesignStudio3D />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/soyl-rd" element={<SoylRd />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route 
              path="/admin" 
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default App;