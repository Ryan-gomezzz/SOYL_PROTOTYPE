# SOYL UI Motion System

Modern, high-performance UI animations and micro-interactions for the SOYL project. All animations are GPU-accelerated, accessible, and respect `prefers-reduced-motion`.

## 🎨 What's Included

- **Animation Utilities**: `.fade-in`, `.slide-up`, `.pop`, `.pulse`, `.glow`, `.shimmer`, `.float`
- **Custom Cursor**: Smooth, interactive cursor with dot + trailing ring (desktop only)
- **Interactive Graphs**: Animated SVG line charts and sparklines
- **Micro-interactions**: Enhanced buttons, cards, inputs with hover/focus states
- **Theme System**: CSS variables for consistent theming and dark mode support

## 🚀 Quick Start

### Animation Utilities

```html
<!-- Fade in on mount -->
<div class="fade-in">Content appears smoothly</div>

<!-- Slide up with delay -->
<div class="slide-up delay-200">Delayed entrance</div>

<!-- Pop effect -->
<button class="pop">Click me!</button>

<!-- Stagger children animations -->
<ul class="stagger-children">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<!-- Ambient gradient background -->
<div class="ambient-gradient">Hero section</div>
```

### Custom Cursor

Add this snippet to your app initialization (e.g., `main.tsx` or `App.tsx`):

```javascript
// Initialize custom cursor (desktop only, 12 lines)
if (window.matchMedia('(pointer: fine)').matches && !('ontouchstart' in window)) {
  document.body.classList.add('custom-cursor-enabled');
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}
```

**To disable**: Remove the `custom-cursor-enabled` class from `<body>`.

### Interactive Graphs

```html
<div class="graph-container">
  <svg class="animated-graph graph-animate" viewBox="0 0 300 100" preserveAspectRatio="none">
    <!-- Animated line -->
    <path class="graph-line" 
          d="M0,80 L50,60 L100,70 L150,40 L200,50 L250,30 L300,20" 
          fill="none" stroke="currentColor" stroke-width="2"/>
    
    <!-- Animated points -->
    <circle class="graph-point pop delay-100" cx="0" cy="80" r="3"/>
    <circle class="graph-point pop delay-200" cx="50" cy="60" r="3"/>
    <circle class="graph-point pop delay-300" cx="100" cy="70" r="3"/>
  </svg>
</div>
```

**Trigger animation**: Add `graph-animate` class to the SVG element.

### Enhanced Components

```html
<!-- Button with micro-interactions -->
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary Action</button>

<!-- Card with hover effect -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content with smooth hover lift</p>
</div>

<!-- Glass effect -->
<div class="glass">Glassmorphism panel</div>

<!-- Badges and pills -->
<span class="badge">New</span>
<span class="pill">Featured</span>

<!-- Animated link -->
<a href="#" class="link-animated">Hover me</a>

<!-- Loading state -->
<div class="card loading-shimmer">Loading...</div>
```

## 🎯 CSS Variables

All animations use CSS variables for easy customization:

```css
:root {
  /* Colors */
  --color-bg: #000000;
  --color-primary: #D4AF37;
  --color-accent: #CD7F32;
  --color-text: #FFFFFF;
  
  /* Glass effects */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  
  /* Transitions */
  --transition-fast: 0.15s;
  --transition-medium: 0.3s;
  --transition-slow: 0.5s;
  
  /* Easing */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Shadows */
  --shadow-glow: 0 0 20px rgba(212, 175, 55, 0.3);
}
```

## ♿ Accessibility

All animations respect user preferences:

- **Reduced Motion**: Animations are disabled or simplified when `prefers-reduced-motion: reduce` is set
- **Focus States**: All interactive elements have visible focus indicators
- **Touch Devices**: Custom cursor is automatically disabled on touch devices
- **Keyboard Navigation**: Full keyboard support with visible focus states

### Manual Reduced Motion Mode

For testing or demos, add the `.reduced-motion-mode` class to `<body>`:

```javascript
document.body.classList.add('reduced-motion-mode');
```

## 🌓 Dark Mode

Toggle between light and dark themes:

```javascript
// Enable dark mode (default)
document.body.classList.add('theme-dark');

// Enable light mode
document.body.classList.remove('theme-dark');
document.body.classList.add('theme-light');
```

## 📦 File Structure

```
src/
├── styles/
│   ├── variables.css      # Theme variables and colors
│   ├── animations.css     # Animation utilities and keyframes
│   └── README.md          # This file
├── components/
│   ├── CustomCursor.css   # Custom cursor styles
│   └── InteractiveGraph.css # Graph and chart animations
└── index.css              # Main CSS with micro-interactions
```

## 🎨 Performance

- **GPU-Accelerated**: All animations use `transform` and `opacity` for 60fps performance
- **Will-Change**: Strategic use of `will-change` for smooth animations
- **No Layout Thrashing**: Avoids animating `width`, `height`, `left`, `top`
- **Lightweight**: < 40KB total CSS (gzipped)
- **No Dependencies**: Pure CSS + minimal vanilla JS

## 🔧 Customization

### Animation Delays

```html
<div class="fade-in delay-100">100ms delay</div>
<div class="fade-in delay-200">200ms delay</div>
<div class="fade-in delay-500">500ms delay</div>
```

### Custom Animations

Extend with your own animations:

```css
@keyframes myAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}

.my-element {
  animation: myAnimation 0.3s var(--ease-out) forwards;
}
```

## 📱 Mobile Considerations

- Custom cursor is automatically hidden on touch devices
- All hover effects have touch-friendly alternatives
- Animations are optimized for mobile performance
- Responsive breakpoints respect mobile-first design

## 🐛 Troubleshooting

**Animations not working?**
- Check that CSS files are imported in `index.css`
- Verify `prefers-reduced-motion` is not set to `reduce`
- Ensure `.reduced-motion-mode` class is not on `<body>`

**Custom cursor not appearing?**
- Verify the initialization script is running
- Check browser console for errors
- Ensure you're on a desktop device with a mouse

**Performance issues?**
- Reduce the number of animated elements on screen
- Use `will-change` sparingly
- Check for other CPU-intensive operations

## 📚 Resources

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web.dev: Animations Performance](https://web.dev/animations/)
- [WCAG 2.1: Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: SOYL Team

