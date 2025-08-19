const fs = require('fs');
const path = require('path');

// Create the BaliyoBan icon SVG
const createAstronautIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#EC4899;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#F97316;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#F59E0B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EAB308;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bgGradient)"/>
  
  <!-- Astronaut -->
  <g transform="translate(${size * 0.5}, ${size * 0.5}) scale(${size * 0.001})">
    <!-- Helmet -->
    <circle cx="0" cy="-80" r="60" fill="white" stroke="white" stroke-width="3"/>
    <!-- Visor -->
    <ellipse cx="0" cy="-80" rx="35" ry="25" fill="none" stroke="white" stroke-width="4"/>
    
    <!-- Body -->
    <rect x="-25" y="-20" width="50" height="80" fill="white" rx="8"/>
    
    <!-- Arms -->
    <rect x="-60" y="0" width="35" height="12" fill="white" rx="6"/>
    <rect x="25" y="0" width="35" height="12" fill="white" rx="6"/>
    
    <!-- Barbell -->
    <rect x="-80" y="5" width="160" height="8" fill="white" rx="4"/>
    <!-- Weight plates -->
    <circle cx="-70" cy="9" r="15" fill="white" stroke="white" stroke-width="2"/>
    <circle cx="70" cy="9" r="15" fill="white" stroke="white" stroke-width="2"/>
    
    <!-- Legs -->
    <rect x="-20" y="60" width="15" height="40" fill="white" rx="8"/>
    <rect x="5" y="60" width="15" height="40" fill="white" rx="8"/>
  </g>
</svg>`;
};

// Icon sizes needed for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach(size => {
  const svgContent = createAstronautIcon(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created astronaut icon-${size}x${size}.svg`);
});

// Create a simple browserconfig.xml for Windows tiles
const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/icon-152x152.svg"/>
            <TileColor>#8B5CF6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(iconsDir, 'browserconfig.xml'), browserConfig);
console.log('Created browserconfig.xml');

// Create safari-pinned-tab.svg (monochrome version)
const safariIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <defs>
    <linearGradient id="safariGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EAB308;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="16" height="16" rx="3" fill="url(#safariGradient)"/>
  <g transform="translate(8, 8) scale(0.08)">
    <!-- Simplified astronaut for small size -->
    <circle cx="0" cy="-80" r="60" fill="white"/>
    <rect x="-25" y="-20" width="50" height="80" fill="white" rx="8"/>
    <rect x="-60" y="0" width="35" height="12" fill="white" rx="6"/>
    <rect x="25" y="0" width="35" height="12" fill="white" rx="6"/>
    <rect x="-80" y="5" width="160" height="8" fill="white" rx="4"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), safariIcon);
console.log('Created safari-pinned-tab.svg');

console.log('\nBaliyoBan PWA icons generated successfully!');
console.log('The icons feature a gradient background with a white astronaut holding a barbell.');
