const fs = require('fs');
const path = require('path');
const appDir = path.join(__dirname, '..', 'packages', 'app');

fs.writeFileSync(path.join(appDir, 'tailwind.config.cjs'), `
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        soyl: {
          black: '#0b0b0b',
          white: '#ffffff',
          gold: '#D4AF37',
          silver: '#C0C0C0',
          bronze: '#CD7F32'
        }
      }
    }
  },
  plugins: []
}
`.trim());

fs.writeFileSync(path.join(appDir, 'postcss.config.cjs'), `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
`.trim());

console.log('Tailwind fallback files created in packages/app/');
