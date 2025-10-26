import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { getCurrentUser, logout } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'luxury'
  });
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Load products from localStorage
    const savedProducts = localStorage.getItem('soyl_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('soyl_products', JSON.stringify(updatedProducts));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.image) {
      alert('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: `product-${Date.now()}`,
      ...newProduct,
      createdAt: new Date().toISOString()
    };

    saveProducts([...products, product]);
    setNewProduct({ name: '', description: '', price: 0, image: '', category: 'luxury' });
    setShowAddForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-soyl-gold mb-2">
              Admin Panel
            </h1>
            <p className="text-soyl-silver">
              Welcome, {currentUser?.name || currentUser?.email}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-primary">
            Logout
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div className="card" whileHover={{ y: -5 }}>
            <div className="text-soyl-gold text-4xl font-bold mb-2">
              {products.length}
            </div>
            <div className="text-soyl-silver">Total Products</div>
          </motion.div>
          <motion.div className="card" whileHover={{ y: -5 }}>
            <div className="text-soyl-gold text-4xl font-bold mb-2">
              {products.filter(p => p.category === 'luxury').length}
            </div>
            <div className="text-soyl-silver">Luxury Items</div>
          </motion.div>
          <motion.div className="card" whileHover={{ y: -5 }}>
            <div className="text-soyl-gold text-4xl font-bold mb-2">
              Admin
            </div>
            <div className="text-soyl-silver">Access Level</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-secondary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            {showAddForm ? 'Cancel' : 'Add New Product'}
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <motion.div
            className="card mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-serif text-2xl font-semibold text-soyl-white mb-6">
              Add New Product
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-soyl-white font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-soyl-white font-medium mb-2">Price *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="input-field"
                  placeholder="Enter price"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-soyl-white font-medium mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="input-field h-24"
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <label className="block text-soyl-white font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-soyl-white font-medium mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="input-field"
                >
                  <option value="luxury">Luxury</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button onClick={handleAddProduct} className="btn-primary flex-1">
                  Add Product
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products List */}
        <div className="card">
          <h2 className="font-serif text-2xl font-semibold text-soyl-white mb-6">
            Manage Products
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="h-20 w-20 text-soyl-silver/30 mx-auto mb-4" />
              <p className="text-soyl-silver">No products yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-soyl-gold/20">
                    <th className="text-left p-4 text-soyl-gold">Name</th>
                    <th className="text-left p-4 text-soyl-gold">Category</th>
                    <th className="text-left p-4 text-soyl-gold">Price</th>
                    <th className="text-left p-4 text-soyl-gold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-soyl-silver/10 hover:bg-soyl-black/50">
                      <td className="p-4 text-soyl-white">{product.name}</td>
                      <td className="p-4 text-soyl-silver">{product.category}</td>
                      <td className="p-4 text-soyl-gold font-bold">${product.price}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

