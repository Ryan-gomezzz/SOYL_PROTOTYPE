# 3D Design Studio

Interactive 3D garment design studio with real-time preview, material customization, and voice commands.

## Features

- **3D Viewer**: Real-time 3D garment preview using Three.js
- **Material Customization**: Change colors and apply textures
- **Camera Controls**: Multiple view presets and free rotation
- **Voice Commands**: Hands-free design control using Web Speech API
- **Save/Export**: Save designs to backend and export as PNG
- **Keyboard Shortcuts**: Quick access to common actions
- **Accessibility**: Full keyboard navigation and reduced motion support

## Installation

### Dependencies

The 3D studio requires the following packages:

```bash
# Frontend (already installed)
pnpm add three -F soyl-app

# Backend (already installed)
pnpm add cors multer -F soyl-server
```

### Assets Required

1. **3D Model**: Place a GLB file at `packages/app/public/models/placeholder.glb`
   - Recommended: T-shirt, hoodie, or other garment model
   - Format: GLB (binary GLTF)
   - Size: < 5MB
   - Scale: Centered at origin, 1-2 units tall

2. **Textures** (optional): Add fabric textures to `packages/app/public/textures/`
   - `denim.jpg`
   - `leather.jpg`
   - `silk.jpg`
   - `cotton.jpg`

See the README files in those directories for download sources.

## Usage

### Starting the Application

```bash
# Start backend server
cd packages/server
npm run dev:express

# Start frontend (in another terminal)
cd packages/app
npm run dev
```

Navigate to: `http://localhost:5173/design-studio-3d`

### Controls

#### Mouse/Touch
- **Drag**: Rotate model
- **Scroll/Pinch**: Zoom in/out
- **Right-click drag**: Pan camera

#### Keyboard Shortcuts
- **Arrow Left/Right**: Rotate model
- **+/-**: Zoom in/out
- **R**: Reset camera

#### Voice Commands

Click the microphone button and say:

- **"Rotate left"** / **"Rotate right"** - Rotate model
- **"Rotate 45"** - Rotate to specific angle
- **"Zoom in"** / **"Zoom out"** - Adjust zoom
- **"Make it [color]"** - Change color (e.g., "Make it red")
- **"Apply [texture]"** - Apply texture (e.g., "Apply denim")
- **"Front view"** / **"Back view"** / **"Left view"** / **"Right view"** / **"Top view"** - Change camera angle
- **"Reset camera"** - Reset to default view
- **"Save design"** - Save current design
- **"Export"** - Export as PNG

Supported colors: red, blue, green, yellow, purple, pink, orange, black, white, gray, brown, navy, teal, lime, cyan, magenta, maroon, olive

Supported textures: denim, leather, silk, cotton

## API Endpoints

### Save Design

```http
POST /api/designs/save
Content-Type: application/json

{
  "name": "My Design",
  "params": {
    "color": "#667eea",
    "texture": "denim",
    "scale": 1,
    "rotationY": 45
  },
  "thumbnail": "data:image/png;base64,..."
}
```

Response:
```json
{
  "success": true,
  "id": "uuid",
  "url": "/uploads/uuid.png",
  "message": "Design saved successfully"
}
```

### Get Design

```http
GET /api/designs/:id
```

Response:
```json
{
  "success": true,
  "design": {
    "id": "uuid",
    "name": "My Design",
    "params": {...},
    "thumbnailUrl": "/uploads/uuid.png",
    "createdAt": "2025-10-25T...",
    "updatedAt": "2025-10-25T..."
  }
}
```

### List Designs

```http
GET /api/designs?page=1&limit=20
```

Response:
```json
{
  "success": true,
  "designs": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Export Design

```http
POST /api/designs/export
Content-Type: application/json

{
  "imageBase64": "data:image/png;base64,...",
  "filename": "my-design.png"
}
```

Response:
```json
{
  "success": true,
  "url": "/uploads/uuid.png",
  "message": "Design exported successfully"
}
```

### Delete Design

```http
DELETE /api/designs/:id
```

Response:
```json
{
  "success": true,
  "message": "Design deleted successfully"
}
```

## Architecture

### Frontend Components

```
src/
├── pages/
│   └── DesignStudio3D.tsx          # Main page component
├── components/
│   ├── ThreeViewer/
│   │   ├── ThreeViewer.jsx         # 3D viewer component
│   │   ├── ThreeViewer.css         # Viewer styles
│   │   └── texture-utils.js        # Texture loading utilities
│   ├── Controls/
│   │   ├── InspectorPanel.jsx      # Control panel
│   │   └── InspectorPanel.css      # Panel styles
│   └── VoiceController.js          # Voice command handler
├── hooks/
│   └── useScreenshot.js            # Canvas capture utility
└── styles/
    └── 3d-studio.css               # Page styles
```

### Backend Structure

```
packages/server/
├── routes/
│   └── designs.js                  # API routes
├── storage/
│   └── localStore.js               # Storage abstraction
├── data/
│   └── designs/                    # JSON design files
├── uploads/                        # Exported images
└── tests/
    └── designs.test.js             # API tests
```

## Adding New Models

1. Export your 3D model as GLB from Blender, Maya, or other 3D software
2. Ensure the model is:
   - Centered at origin (0, 0, 0)
   - Facing forward (positive Z axis)
   - Appropriately scaled (1-2 units tall)
   - Has clean UVs for texture mapping
3. Place the GLB file in `packages/app/public/models/`
4. Update the `modelUrl` prop in `DesignStudio3D.tsx`:

```tsx
<ThreeViewer
  ref={viewerRef}
  modelUrl="/models/your-model.glb"
  onLoad={handleModelLoad}
  onError={handleModelError}
/>
```

## Adding New Textures

1. Add texture image to `packages/app/public/textures/`
2. Update `texture-utils.js`:

```javascript
export const TEXTURES = {
  // ... existing textures
  yourTexture: {
    name: 'Your Texture',
    url: '/textures/your-texture.jpg',
    color: '#hexcolor', // fallback color
  },
};
```

3. The texture will automatically appear in the Inspector Panel

## Cloud Storage (S3) Configuration

To use AWS S3 instead of local storage:

1. Set environment variables:

```bash
USE_S3=true
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

2. Implement S3 methods in `storage/localStore.js`:
   - `_saveToS3()`
   - `_getFromS3()`
   - `_listFromS3()`
   - `_deleteFromS3()`

Use `@aws-sdk/client-s3` for S3 operations.

## Testing

Run API tests:

```bash
cd packages/server
npm test
```

Tests cover:
- Design save/load/list/delete
- Image export
- Storage abstraction
- Error handling

## Browser Compatibility

### 3D Viewer
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Voice Commands
- ✅ Chrome 90+ (best support)
- ✅ Edge 90+
- ✅ Safari 14.1+ (limited)
- ❌ Firefox (not supported)

Voice commands gracefully degrade - the button won't appear in unsupported browsers.

## Performance Optimization

### Model Optimization
- Keep polygon count < 50,000 triangles
- Use compressed textures (JPG for photos, PNG for graphics)
- Limit texture size to 2048x2048

### Rendering
- The viewer uses:
  - Automatic LOD (Level of Detail)
  - Frustum culling
  - GPU-accelerated rendering
  - Damped camera controls

### Memory Management
- Textures are cached and reused
- Geometry is disposed on unmount
- Canvas is properly cleaned up

## Accessibility

### Keyboard Navigation
- All controls are keyboard accessible
- Tab through interactive elements
- Enter/Space to activate buttons

### Screen Readers
- ARIA labels on all controls
- Live regions for notifications
- Semantic HTML structure

### Reduced Motion
- Respects `prefers-reduced-motion`
- Disables camera animations
- Disables voice visualizations

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapping in modals

## Troubleshooting

### Model Not Loading
- Check browser console for errors
- Verify GLB file exists at specified path
- Ensure model is valid GLB format
- Check file size (< 5MB recommended)

### Voice Commands Not Working
- Check browser compatibility (Chrome/Edge recommended)
- Grant microphone permissions
- Check browser console for errors
- Ensure HTTPS (required for microphone access in production)

### Textures Not Applying
- Verify texture files exist in `/public/textures/`
- Check texture format (JPG/PNG)
- Ensure model has proper UV mapping
- Check browser console for loading errors

### Save/Export Failing
- Verify backend server is running
- Check network tab for API errors
- Ensure CORS is properly configured
- Check server logs for errors

## Future Enhancements

- [ ] Multiple garment layers
- [ ] Custom pattern upload
- [ ] Real-time collaboration (Socket.io)
- [ ] AR preview (WebXR)
- [ ] AI-generated textures
- [ ] Animation support
- [ ] Material library
- [ ] Lighting presets
- [ ] HDR environment maps

## License

Part of the SOYL MVP project.

## Support

For issues or questions, please contact the development team or create an issue in the repository.

