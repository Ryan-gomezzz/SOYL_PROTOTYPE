# 3D Models Directory

## Placeholder Model Required

This directory needs a `placeholder.glb` file for the 3D viewer to function.

### Quick Setup Options:

1. **Download a free T-shirt model:**
   - Visit [Sketchfab](https://sketchfab.com/search?q=t-shirt&type=models&features=downloadable&sort_by=-likeCount)
   - Download a free GLB/GLTF model
   - Rename to `placeholder.glb`
   - Place in this directory

2. **Use Blender to create a simple model:**
   ```bash
   # Export as GLB format
   # Recommended scale: 1 unit = 1 meter
   # Center the model at origin (0,0,0)
   ```

3. **Temporary fallback:**
   - The viewer will show a colored cube if no model is found
   - This allows development to continue without a model

### Model Requirements:
- Format: GLB (binary GLTF)
- Size: < 5MB recommended
- Centered at origin
- Appropriate scale (1-2 units tall for clothing)
- Clean topology for texture mapping

### Supported Garment Types:
- T-shirts
- Hoodies
- Pants
- Dresses
- Jackets

Place your GLB files here and reference them in the DesignStudio3D component.


