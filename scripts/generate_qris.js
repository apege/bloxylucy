const sharp = require('sharp');
const path = require('path');

const svg = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="white" rx="24"/>
  <!-- QR Header -->
  <text x="200" y="45" font-family="sans-serif" font-size="24" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="2">QRIS</text>
  <text x="200" y="70" font-family="sans-serif" font-size="12" font-weight="700" fill="#e11d48" text-anchor="middle">GPN</text>
  <text x="200" y="95" font-family="monospace" font-size="12" font-weight="700" fill="#52525b" text-anchor="middle">BLOXYLUCY OFFICIAL</text>
  
  <!-- Corner squares -->
  <rect x="60" y="120" width="60" height="60" fill="none" stroke="#000" stroke-width="8" rx="8"/>
  <rect x="76" y="136" width="28" height="28" fill="#000" rx="4"/>
  
  <rect x="280" y="120" width="60" height="60" fill="none" stroke="#000" stroke-width="8" rx="8"/>
  <rect x="296" y="136" width="28" height="28" fill="#000" rx="4"/>
  
  <rect x="60" y="280" width="60" height="60" fill="none" stroke="#000" stroke-width="8" rx="8"/>
  <rect x="76" y="296" width="28" height="28" fill="#000" rx="4"/>
  
  <!-- Decorative barcode dots -->
  <rect x="150" y="120" width="20" height="20" fill="#000" rx="3"/>
  <rect x="190" y="120" width="20" height="20" fill="#000" rx="3"/>
  <rect x="230" y="120" width="20" height="20" fill="#000" rx="3"/>
  <rect x="150" y="160" width="30" height="20" fill="#000" rx="3"/>
  <rect x="210" y="160" width="40" height="20" fill="#000" rx="3"/>
  
  <rect x="140" y="200" width="20" height="30" fill="#000" rx="3"/>
  <rect x="180" y="200" width="40" height="20" fill="#000" rx="3"/>
  <rect x="240" y="200" width="30" height="30" fill="#000" rx="3"/>
  <rect x="280" y="200" width="20" height="20" fill="#000" rx="3"/>
  <rect x="320" y="200" width="20" height="30" fill="#000" rx="3"/>
  
  <rect x="140" y="250" width="40" height="20" fill="#000" rx="3"/>
  <rect x="200" y="250" width="30" height="20" fill="#000" rx="3"/>
  <rect x="250" y="250" width="30" height="40" fill="#000" rx="3"/>
  <rect x="300" y="250" width="40" height="20" fill="#000" rx="3"/>
  
  <rect x="150" y="300" width="30" height="40" fill="#000" rx="3"/>
  <rect x="200" y="300" width="40" height="20" fill="#000" rx="3"/>
  <rect x="260" y="310" width="30" height="30" fill="#000" rx="3"/>
  <rect x="310" y="290" width="30" height="40" fill="#000" rx="3"/>
  
  <!-- Center Cute BloxyLucy Badge -->
  <circle cx="200" cy="220" r="24" fill="#db2777" stroke="white" stroke-width="4"/>
  <text x="200" y="226" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle">🌸</text>
  
  <!-- Footer NMID -->
  <text x="200" y="375" font-family="sans-serif" font-size="11" font-weight="600" fill="#a1a1aa" text-anchor="middle">NMID: ID102003004050</text>
</svg>
`;

sharp(Buffer.from(svg))
  .webp({ quality: 95 })
  .toFile(path.join(__dirname, '../public/images/qris.webp'))
  .then(info => console.log('Created public/images/qris.webp:', info))
  .catch(err => console.error(err));
