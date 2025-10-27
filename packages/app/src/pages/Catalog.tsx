import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addToCart } from '../components/Cart';
import { addToWishlist } from '../components/Wishlist';
import { PhotoIcon, TrashIcon, PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getCurrentUser, isAdmin } from '../lib/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'luxury'
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      ...newProduct
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

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      priceAtAdd: product.price,
      image: product.image,
    });
    alert(`${product.name} added to cart!`);
  };

  const categories = ['all', 'luxury', 'casual', 'formal', 'accessories'];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-soyl-gold mb-4">
            Product Catalog
          </h1>
          <p className="text-xl text-soyl-silver max-w-2xl mx-auto">
            Discover our exclusive collection of bespoke designs
          </p>
        </motion.div>

        {/* Add Product Button - Only show for admins */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-primary ${selectedCategory === cat ? 'bg-soyl-gold text-soyl-black' : ''}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          {isAdmin() && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Product
            </button>
          )}
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
                <p className="text-soyl-silver text-sm mt-2">
                  Tip: Upload images to an image hosting service like Imgur, Cloudinary, or AWS S3, then paste the URL here
                </p>
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
                <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <PhotoIcon className="h-20 w-20 text-soyl-silver/30 mx-auto mb-4" />
            <p className="text-soyl-silver text-xl mb-6">No products yet</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Add Your First Product
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="card group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-[3/4] bg-soyl-black/50 rounded-lg mb-4 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x600?text=Product+Image';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-soyl-gold text-soyl-black px-3 py-1 rounded-full text-sm font-semibold">
                    ${product.price}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-semibold text-soyl-white">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-soyl-silver text-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary flex-1"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => addToWishlist({ productId: product.id })}
                      className="p-2 hover:bg-soyl-gold/10 rounded transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <HeartIcon className="h-5 w-5 text-soyl-gold" />
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Delete product"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;

