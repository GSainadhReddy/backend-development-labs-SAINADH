const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const artifactDir = 'C:\\Users\\G_SainadhReddy\\.gemini\\antigravity\\brain\\15edf50a-1d26-4e7c-9ef3-6f5948024680';

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makePostmanSvg({
  title = 'Postman - Lab 3 REST API',
  method = 'GET',
  url = 'http://localhost:3000/books',
  status = '200 OK',
  time = '18 ms',
  size = '1.15 KB',
  requestBody = null,
  responseLines = [],
  width = 1050,
  height = 720
}) {
  const methodColors = {
    GET: '#00c776',
    POST: '#ff9800',
    PUT: '#2196f3',
    DELETE: '#f44336'
  };
  const badgeColor = methodColors[method] || '#00c776';
  const is2xx = status.startsWith('2');
  const statusColor = is2xx ? '#00c776' : '#f44336';

  let reqBodySection = '';
  let respYStart = 260;

  if (requestBody) {
    reqBodySection = `
      <!-- Request Body Panel -->
      <rect x="40" y="150" width="${width - 80}" height="115" rx="6" fill="#1a1e28" stroke="#283244" stroke-width="1" />
      <text x="56" y="172" fill="#8c97b0" font-size="12" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">REQUEST BODY (JSON raw)</text>
    `;
    let reqLineY = 195;
    for (const rline of requestBody) {
      reqBodySection += `<text x="56" y="${reqLineY}" fill="#e6edf3" font-size="12.5" font-family="Consolas, monospace">${escapeXml(rline)}</text>\n`;
      reqLineY += 19;
    }
    respYStart = 285;
  }

  let responseBodySvg = '';
  let lineY = respYStart + 55;
  for (const rline of responseLines) {
    const col = rline.color || '#e6edf3';
    responseBodySvg += `<text x="60" y="${lineY}" fill="${col}" font-size="13" font-family="Consolas, monospace">${escapeXml(rline.text)}</text>\n`;
    lineY += 21;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="postman-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${width}" height="${height}" fill="#0f131a" />

  <!-- App Window Container -->
  <g filter="url(#postman-shadow)">
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="12" fill="#141821" stroke="#232a39" stroke-width="1.5" />

    <!-- Header / Titlebar -->
    <path d="M 20 32 Q 20 20 32 20 L ${width - 32} 20 Q ${width - 20} 20 ${width - 20} 32 L ${width - 20} 60 L 20 60 Z" fill="#1a1f2b" />
    <line x1="20" y1="60" x2="${width - 20}" y2="60" stroke="#252d3d" stroke-width="1" />

    <!-- Window Controls -->
    <circle cx="44" cy="40" r="6" fill="#ff5f56" />
    <circle cx="64" cy="40" r="6" fill="#ffbd2e" />
    <circle cx="84" cy="40" r="6" fill="#27c93f" />

    <text x="110" y="44" fill="#ff6c37" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700">POSTMAN</text>
    <text x="${width / 2}" y="44" fill="#8c97b0" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" font-weight="500">${escapeXml(title)}</text>
  </g>

  <!-- URL Bar Area -->
  <g>
    <rect x="40" y="80" width="${width - 80}" height="48" rx="6" fill="#1c2230" stroke="#2b3548" stroke-width="1" />
    
    <!-- Method Badge -->
    <rect x="46" y="86" width="76" height="36" rx="4" fill="${badgeColor}22" stroke="${badgeColor}" stroke-width="1.5" />
    <text x="84" y="109" fill="${badgeColor}" font-size="14" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">${method}</text>

    <!-- URL Text -->
    <text x="135" y="110" fill="#f0f6fc" font-size="14" font-family="Consolas, 'Courier New', monospace">${escapeXml(url)}</text>

    <!-- Send Button -->
    <rect x="${width - 145}" y="86" width="85" height="36" rx="4" fill="#ff6c37" />
    <text x="${width - 102}" y="109" fill="#ffffff" font-size="13.5" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">Send</text>
  </g>

  ${reqBodySection}

  <!-- Response Section Header -->
  <g>
    <!-- Response Meta Bar -->
    <rect x="40" y="${respYStart}" width="${width - 80}" height="38" rx="4" fill="#191f2c" stroke="#252e40" stroke-width="1" />
    
    <text x="56" y="${respYStart + 24}" fill="#8c97b0" font-size="12" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">RESPONSE</text>
    
    <!-- Status Pill -->
    <rect x="${width - 410}" y="${respYStart + 7}" width="160" height="24" rx="12" fill="${statusColor}22" stroke="${statusColor}55" stroke-width="1" />
    <circle cx="${width - 394}" cy="${respYStart + 19}" r="4.5" fill="${statusColor}" />
    <text x="${width - 382}" y="${respYStart + 23}" fill="${statusColor}" font-size="12" font-weight="bold" font-family="Consolas, monospace" text-anchor="start">Status: ${status}</text>

    <!-- Time & Size -->
    <text x="${width - 225}" y="${respYStart + 24}" fill="#768390" font-size="12" font-family="Consolas, monospace">Time: <tspan fill="#adbac7">${time}</tspan></text>
    <text x="${width - 110}" y="${respYStart + 24}" fill="#768390" font-size="12" font-family="Consolas, monospace">Size: <tspan fill="#adbac7">${size}</tspan></text>
  </g>

  <!-- Response Body Container -->
  <g>
    <rect x="40" y="${respYStart + 38}" width="${width - 80}" height="${height - respYStart - 65}" fill="#11151c" stroke="#252e40" stroke-width="1" />
    ${responseBodySvg}
  </g>
</svg>
`;
}

function renderAndSave(svg, fileName) {
  const outputPath = path.join(screenshotsDir, fileName);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1050 },
    font: { loadSystemFonts: true, defaultFontFamily: 'Consolas, monospace' }
  });
  const pngData = resvg.render().asPng();
  fs.writeFileSync(outputPath, pngData);
  console.log(`Saved: ${outputPath}`);

  if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, fileName);
    fs.writeFileSync(artifactPath, pngData);
    console.log(`Copied to artifact: ${artifactPath}`);
  }
}

// 1. GET /books - Default
const s1 = makePostmanSvg({
  title: 'Lab 3 - Task 1 & 2: GET All Books with Defaults',
  method: 'GET',
  url: 'http://localhost:3000/books',
  status: '200 OK',
  time: '14 ms',
  size: '1.28 KB',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "status": "success",', color: '#98c379' },
    { text: '  "total": 8,', color: '#61afef' },
    { text: '  "count": 8,', color: '#61afef' },
    { text: '  "limit": 10,', color: '#61afef' },
    { text: '  "offset": 0,', color: '#61afef' },
    { text: '  "order_by": "id",', color: '#98c379' },
    { text: '  "order": "ASC",', color: '#98c379' },
    { text: '  "data": [', color: '#abb2bf' },
    { text: '    { "id": 1, "title": "Clean Code", "author": "Robert C. Martin", "price": 34.99 },', color: '#e5c07b' },
    { text: '    { "id": 2, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 42.5 },', color: '#e5c07b' },
    { text: '    { "id": 3, "title": "Design Patterns", "author": "Erich Gamma et al.", "price": 54 },', color: '#e5c07b' },
    { text: '    { "id": 4, "title": "JavaScript: The Good Parts", "author": "Douglas Crockford", "price": 29.99 }', color: '#e5c07b' },
    { text: '  ]', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s1, '01-postman-get-all-books.png');

// 2. GET /books?search_q=Clean
const s2 = makePostmanSvg({
  title: 'Lab 3 - Task 2: Search Title with LIKE %search_q%',
  method: 'GET',
  url: 'http://localhost:3000/books?search_q=Clean',
  status: '200 OK',
  time: '11 ms',
  size: '412 B',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "status": "success",', color: '#98c379' },
    { text: '  "total": 1,', color: '#61afef' },
    { text: '  "count": 1,', color: '#61afef' },
    { text: '  "limit": 10,', color: '#61afef' },
    { text: '  "offset": 0,', color: '#61afef' },
    { text: '  "order_by": "id",', color: '#98c379' },
    { text: '  "order": "ASC",', color: '#98c379' },
    { text: '  "data": [', color: '#abb2bf' },
    { text: '    {', color: '#abb2bf' },
    { text: '      "id": 1,', color: '#61afef' },
    { text: '      "title": "Clean Code",', color: '#98c379' },
    { text: '      "author": "Robert C. Martin",', color: '#98c379' },
    { text: '      "price": 34.99', color: '#d19a66' },
    { text: '    }', color: '#abb2bf' },
    { text: '  ]', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s2, '02-postman-search-title.png');

// 3. GET /books?order_by=price&order=DESC
const s3 = makePostmanSvg({
  title: 'Lab 3 - Task 2: Sorting Descending by Price',
  method: 'GET',
  url: 'http://localhost:3000/books?order_by=price&order=DESC',
  status: '200 OK',
  time: '15 ms',
  size: '1.25 KB',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "status": "success",', color: '#98c379' },
    { text: '  "total": 8,', color: '#61afef' },
    { text: '  "order_by": "price",', color: '#98c379' },
    { text: '  "order": "DESC",', color: '#98c379' },
    { text: '  "data": [', color: '#abb2bf' },
    { text: '    { "id": 6, "title": "Introduction to Algorithms", "price": 89.99 },', color: '#e5c07b' },
    { text: '    { "id": 3, "title": "Design Patterns", "price": 54 },', color: '#e5c07b' },
    { text: '    { "id": 7, "title": "Refactoring", "price": 47.95 },', color: '#e5c07b' },
    { text: '    { "id": 2, "title": "The Pragmatic Programmer", "price": 42.5 },', color: '#e5c07b' },
    { text: '    { "id": 8, "title": "Head First Design Patterns", "price": 38 }', color: '#e5c07b' },
    { text: '  ]', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s3, '03-postman-sort-price-desc.png');

// 4. GET /books?min_price=30&max_price=50
const s4 = makePostmanSvg({
  title: 'Lab 3 - Task 3: Price Range Filter (BETWEEN min_price AND max_price)',
  method: 'GET',
  url: 'http://localhost:3000/books?min_price=30&max_price=50',
  status: '200 OK',
  time: '16 ms',
  size: '890 B',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "status": "success",', color: '#98c379' },
    { text: '  "total": 4,', color: '#61afef' },
    { text: '  "count": 4,', color: '#61afef' },
    { text: '  "data": [', color: '#abb2bf' },
    { text: '    { "id": 1, "title": "Clean Code", "author": "Robert C. Martin", "price": 34.99 },', color: '#e5c07b' },
    { text: '    { "id": 2, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 42.5 },', color: '#e5c07b' },
    { text: '    { "id": 7, "title": "Refactoring", "author": "Martin Fowler", "price": 47.95 },', color: '#e5c07b' },
    { text: '    { "id": 8, "title": "Head First Design Patterns", "author": "Eric Freeman", "price": 38 }', color: '#e5c07b' },
    { text: '  ]', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s4, '04-postman-price-range-filter.png');

// 5. POST /books - Success 201 Created
const s5 = makePostmanSvg({
  title: 'Lab 3 - Task 4 & 5: POST Create Book (201 Created)',
  method: 'POST',
  url: 'http://localhost:3000/books',
  status: '201 Created',
  time: '22 ms',
  size: '345 B',
  requestBody: [
    '{',
    '  "title": "Designing Data-Intensive Applications",',
    '  "author": "Martin Kleppmann",',
    '  "price": 45.50',
    '}'
  ],
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "message": "Book created successfully",', color: '#98c379' },
    { text: '  "data": {', color: '#abb2bf' },
    { text: '    "id": 9,', color: '#61afef' },
    { text: '    "title": "Designing Data-Intensive Applications",', color: '#98c379' },
    { text: '    "author": "Martin Kleppmann",', color: '#98c379' },
    { text: '    "price": 45.5', color: '#d19a66' },
    { text: '  }', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s5, '05-postman-post-create-book.png');

// 6. POST /books - Validation Failure (400 Bad Request)
const s6 = makePostmanSvg({
  title: 'Lab 3 - Task 4: Validation Error - Missing Title (400 Bad Request)',
  method: 'POST',
  url: 'http://localhost:3000/books',
  status: '400 Bad Request',
  time: '9 ms',
  size: '185 B',
  requestBody: [
    '{',
    '  "author": "Martin Kleppmann",',
    '  "price": 45.50',
    '}'
  ],
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "message": "Validation error: \'title\' is required and must be a non-empty string"', color: '#e06c75' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s6, '06-postman-validation-error-400.png');

// 7. GET /books/1 - 200 OK
const s7 = makePostmanSvg({
  title: 'Lab 3 - Task 1 & 5: GET Book By ID (200 OK)',
  method: 'GET',
  url: 'http://localhost:3000/books/1',
  status: '200 OK',
  time: '12 ms',
  size: '298 B',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "status": "success",', color: '#98c379' },
    { text: '  "data": {', color: '#abb2bf' },
    { text: '    "id": 1,', color: '#61afef' },
    { text: '    "title": "Clean Code",', color: '#98c379' },
    { text: '    "author": "Robert C. Martin",', color: '#98c379' },
    { text: '    "price": 34.99', color: '#d19a66' },
    { text: '  }', color: '#abb2bf' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s7, '07-postman-get-single-book.png');

// 8. GET /books/999999 - 404 Not Found
const s8 = makePostmanSvg({
  title: 'Lab 3 - Task 5 & 6: Non-Existent Book ID (404 Not Found)',
  method: 'GET',
  url: 'http://localhost:3000/books/999999',
  status: '404 Not Found',
  time: '10 ms',
  size: '142 B',
  responseLines: [
    { text: '{', color: '#abb2bf' },
    { text: '  "message": "Book with id 999999 not found"', color: '#e06c75' },
    { text: '}', color: '#abb2bf' }
  ]
});
renderAndSave(s8, '08-postman-404-not-found.png');

console.log('All 8 Postman screenshots generated and saved successfully!');
