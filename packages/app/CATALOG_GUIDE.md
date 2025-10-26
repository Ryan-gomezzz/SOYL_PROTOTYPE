# Catalog Feature Guide

## How to Use the Catalog

### Adding Products

1. Navigate to the **Catalog** page using the navigation menu
2. Click the **"Add Product"** button
3. Fill in the product details:
   - **Product Name** (required)
   - **Price** (required)
   - **Description** (optional)
   - **Image URL** (required)
   - **Category** (Luxury, Casual, Formal, or Accessories)

### How to Upload Product Images

#### Option 1: Use Imgur (Free & Easy)
1. Go to [imgur.com](https://imgur.com) (no account needed)
2. Click "New post"
3. Upload your product image
4. Copy the direct image link (right-click image → "Copy image address")
5. Paste the URL in the "Image URL" field

#### Option 2: Use Cloudinary (Free)
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Upload your images to Cloudinary
3. Copy the image URL provided
4. Paste it in the catalog form

#### Option 3: Use AWS S3
1. Upload images to your S3 bucket
2. Make the image public or use signed URLs
3. Paste the S3 URL in the form

#### Option 4: Use Other Services
- GitHub (public repos can host images)
- Dropbox (direct links)
- Google Drive (use sharing links)
- Other image hosting services

### Managing Products

- **Filter by Category**: Click the category buttons at the top to filter products
- **Add to Cart**: Click "Add to Cart" on any product to add it to your cart
- **Delete Product**: Click the trash icon to remove a product from the catalog

### Notes

- Products are stored locally in your browser (localStorage)
- To make this production-ready with database storage, integrate with your backend API
- Images should be in common formats: JPG, PNG, GIF, WebP
- Recommended image size: 800x1200px or larger for best quality

