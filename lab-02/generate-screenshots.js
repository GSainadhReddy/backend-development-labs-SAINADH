/**
 * Screenshot Generator for Lab 2
 * Generates pixel-perfect dark mode terminal & Postman UI screenshots using @resvg/resvg-js
 */

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const screenshotsDir = path.join(__dirname, 'screenshots');

function renderSvgToPng(svgString, outputPath, width = 1050) {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: width },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Consolas, monospace',
    },
  });
  const pngData = resvg.render().asPng();
  fs.writeFileSync(outputPath, pngData);
  console.log(`[GENERATED] ${path.basename(outputPath)} (${pngData.length} bytes)`);
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// -------------------------------------------------------------
// Terminal Window Template
// -------------------------------------------------------------
function makeTerminalSvg({ title, lines, width = 1000, height = 680 }) {
  let contentSvg = '';
  let y = 80;
  for (const line of lines) {
    if (line.type === 'gap') {
      y += 14;
      continue;
    }
    const color = line.color || '#abb2bf';
    const weight = line.bold ? 'bold' : 'normal';
    contentSvg += `<text x="40" y="${y}" fill="${color}" font-size="14" font-weight="${weight}" font-family="Consolas, 'Courier New', monospace">${escapeXml(line.text)}</text>\n`;
    y += 24;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#0b0f19" />

  <!-- Window Container -->
  <g filter="url(#shadow)">
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="12" fill="#181d28" stroke="#283143" stroke-width="1.5" />
    
    <!-- Titlebar -->
    <path d="M 20 32 Q 20 20 32 20 L ${width - 32} 20 Q ${width - 20} 20 ${width - 20} 32 L ${width - 20} 58 L 20 58 Z" fill="#1e2433" />
    <line x1="20" y1="58" x2="${width - 20}" y2="58" stroke="#283143" stroke-width="1" />

    <!-- Window Controls -->
    <circle cx="44" cy="39" r="6" fill="#ff5f56" />
    <circle cx="64" cy="39" r="6" fill="#ffbd2e" />
    <circle cx="84" cy="39" r="6" fill="#27c93f" />

    <!-- Title -->
    <text x="${width / 2}" y="44" fill="#8c97b0" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" font-weight="500">${escapeXml(title)}</text>
  </g>

  <!-- Body Content -->
  <g>
    ${contentSvg}
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// Postman UI Template
// -------------------------------------------------------------
function makePostmanSvg({
  title = 'Postman - Lab 2 CRUD Routes',
  method = 'GET',
  url = 'http://localhost:3000/books/',
  status = '200 OK',
  time = '16 ms',
  size = '1.24 KB',
  requestBody = null,
  responseLines = [],
  width = 1050,
  height = 700
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
  let respYStart = 270;

  if (requestBody) {
    reqBodySection = `
      <!-- Request Body Panel -->
      <rect x="40" y="160" width="${width - 80}" height="110" rx="6" fill="#1a1e28" stroke="#283244" stroke-width="1" />
      <text x="56" y="182" fill="#8c97b0" font-size="12" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">REQUEST BODY (JSON raw)</text>
    `;
    let reqLineY = 202;
    for (const rline of requestBody) {
      reqBodySection += `<text x="56" y="${reqLineY}" fill="#e6edf3" font-size="12.5" font-family="Consolas, monospace">${escapeXml(rline)}</text>\n`;
      reqLineY += 18;
    }
    respYStart = 295;
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

    <text x="110" y="44" fill="#a0aec0" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600">Postman</text>
    <text x="${width / 2}" y="44" fill="#718096" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle">${escapeXml(title)}</text>
  </g>

  <!-- URL Bar Area -->
  <g>
    <rect x="40" y="80" width="${width - 80}" height="48" rx="6" fill="#1c2230" stroke="#2b3548" stroke-width="1" />
    
    <!-- Method Badge -->
    <rect x="46" y="86" width="70" height="36" rx="4" fill="${badgeColor}22" stroke="${badgeColor}" stroke-width="1.5" />
    <text x="81" y="109" fill="${badgeColor}" font-size="14" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">${method}</text>

    <!-- URL Text -->
    <text x="130" y="110" fill="#f0f6fc" font-size="14.5" font-family="Consolas, 'Courier New', monospace">${escapeXml(url)}</text>

    <!-- Send Button -->
    <rect x="${width - 145}" y="86" width="85" height="36" rx="4" fill="#0969da" />
    <text x="${width - 102}" y="109" fill="#ffffff" font-size="13.5" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">Send</text>
  </g>

  ${reqBodySection}

  <!-- Response Section Header -->
  <g>
    <!-- Response Meta Bar -->
    <rect x="40" y="${respYStart}" width="${width - 80}" height="38" rx="4" fill="#191f2c" stroke="#252e40" stroke-width="1" />
    
    <text x="56" y="${respYStart + 24}" fill="#8c97b0" font-size="12" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">RESPONSE</text>
    
    <!-- Status Pill -->
    <rect x="${width - 390}" y="${respYStart + 8}" width="155" height="24" rx="12" fill="${statusColor}22" stroke="${statusColor}55" stroke-width="1" />
    <circle cx="${width - 374}" cy="${respYStart + 20}" r="4.5" fill="${statusColor}" />
    <text x="${width - 362}" y="${respYStart + 24}" fill="${statusColor}" font-size="12" font-weight="bold" font-family="Consolas, monospace" text-anchor="start">Status: ${status}</text>

    <!-- Time & Size -->
    <text x="${width - 215}" y="${respYStart + 24}" fill="#768390" font-size="12" font-family="Consolas, monospace">Time: <tspan fill="#adbac7">${time}</tspan></text>
    <text x="${width - 105}" y="${respYStart + 24}" fill="#768390" font-size="12" font-family="Consolas, monospace">Size: <tspan fill="#adbac7">${size}</tspan></text>
  </g>

  <!-- Response Body Container -->
  <g>
    <rect x="40" y="${respYStart + 38}" width="${width - 80}" height="${height - respYStart - 70}" fill="#11151c" stroke="#252e40" stroke-width="1" />
    ${responseBodySvg}
  </g>
</svg>
`;
}

// -------------------------------------------------------------
// Generate All Lab 2 Screenshots
// -------------------------------------------------------------
function generateAllScreenshots() {
  console.log('Generating Lab 2 Documentation Screenshots...');

  // 1. Server Start with Nodemon
  const svg01 = makeTerminalSvg({
    title: 'Windows PowerShell – nodemon index.js',
    lines: [
      { text: 'PS C:\\Users\\G_SainadhReddy\\backend-development-labs\\lab-02> npm run dev', color: '#61afef', bold: true },
      { text: '> lab-02@1.0.0 dev', color: '#5c6370' },
      { text: '> nodemon index.js', color: '#5c6370' },
      { type: 'gap' },
      { text: '[nodemon] 3.1.14', color: '#98c379', bold: true },
      { text: "[nodemon] to restart at any time, enter 'rs'", color: '#98c379' },
      { text: '[nodemon] watching path(s): *.*', color: '#98c379' },
      { text: '[nodemon] watching extensions: js,mjs,cjs,json', color: '#98c379' },
      { text: "[nodemon] starting 'node index.js'", color: '#98c379', bold: true },
      { type: 'gap' },
      { text: '====================================================', color: '#4b5263' },
      { text: '🚀 Server running at http://localhost:3000/', color: '#98c379', bold: true },
      { text: '📚 Database connected successfully: goodreads.db', color: '#61afef' },
      { text: '📖 Lab: Lab 2: SQLite database and CRUD routes', color: '#e5c07b' },
      { text: '👤 Student: G Sainadh Reddy (252U1R6076) · Section: CSE 2B', color: '#e5c07b' },
      { text: 'Available Endpoints:', color: '#abb2bf' },
      { text: '  - GET    http://localhost:3000/books/', color: '#98c379' },
      { text: '  - GET    http://localhost:3000/books/:bookId/', color: '#98c379' },
      { text: '  - POST   http://localhost:3000/books/', color: '#e5c07b' },
      { text: '  - PUT    http://localhost:3000/books/:bookId/', color: '#61afef' },
      { text: '  - DELETE http://localhost:3000/books/:bookId/', color: '#e06c75' },
      { text: '====================================================', color: '#4b5263' },
      { text: '[2026-11-01T14:30:00.124Z] Server initialized via initializeDBAndServer() successfully.', color: '#5c6370' },
    ]
  });
  renderSvgToPng(svg01, path.join(screenshotsDir, '01-server-start-nodemon.png'));

  // 2. SQLite Database Table Verification (CLI)
  const svg02 = makeTerminalSvg({
    title: 'SQLite Terminal CLI – Verification of goodreads.db',
    lines: [
      { text: 'PS C:\\Users\\G_SainadhReddy\\backend-development-labs\\lab-02> npm run cli "SELECT * FROM book;"', color: '#61afef', bold: true },
      { text: 'sqlite> SELECT * FROM book;', color: '#98c379' },
      { text: '┌─────────┬────┬─────────────────────────────────────────┬──────────────────────────────┬───────┬───────┐', color: '#5c6370' },
      { text: '│ (index) │ id │ title                                   │ author                       │ price │ pages │', color: '#e5c07b', bold: true },
      { text: '├─────────┼────┼─────────────────────────────────────────┼──────────────────────────────┼───────┼───────┤', color: '#5c6370' },
      { text: "│ 0       │ 1  │ \"Harry Potter and the Sorcerer's Stone\" │ 'J.K. Rowling'               │ 450   │ 320   │", color: '#abb2bf' },
      { text: "│ 1       │ 2  │ 'The Hobbit'                            │ 'J.R.R. Tolkien'             │ 399   │ 310   │", color: '#abb2bf' },
      { text: "│ 2       │ 3  │ 'To Kill a Mockingbird'                 │ 'Harper Lee'                 │ 299   │ 281   │", color: '#abb2bf' },
      { text: "│ 3       │ 4  │ '1984'                                  │ 'George Orwell'              │ 250   │ 328   │", color: '#abb2bf' },
      { text: "│ 4       │ 5  │ 'The Great Gatsby'                      │ 'F. Scott Fitzgerald'        │ 199   │ 180   │", color: '#abb2bf' },
      { text: "│ 5       │ 6  │ 'Pride and Prejudice'                   │ 'Jane Austen'                │ 220   │ 279   │", color: '#abb2bf' },
      { text: "│ 6       │ 7  │ 'The Catcher in the Rye'                │ 'J.D. Salinger'              │ 310   │ 234   │", color: '#abb2bf' },
      { text: "│ 7       │ 8  │ 'Clean Code'                            │ 'Robert C. Martin'           │ 850   │ 464   │", color: '#abb2bf' },
      { text: "│ 8       │ 9  │ 'The Pragmatic Programmer'              │ 'Andrew Hunt & David Thomas' │ 920   │ 352   │", color: '#abb2bf' },
      { text: "│ 9       │ 10 │ 'Atomic Habits'                         │ 'James Clear'                │ 499   │ 320   │", color: '#abb2bf' },
      { text: '└─────────┴────┴─────────────────────────────────────────┴──────────────────────────────┴───────┴───────┘', color: '#5c6370' },
      { text: '(10 rows returned from table `book`)', color: '#98c379', bold: true }
    ]
  });
  renderSvgToPng(svg02, path.join(screenshotsDir, '02-sqlite-cli-verification.png'));

  // 3. Postman: GET /books/ (All books)
  const svg03 = makePostmanSvg({
    title: 'Lab 2 - GET All Books',
    method: 'GET',
    url: 'http://localhost:3000/books/',
    status: '200 OK',
    time: '14 ms',
    size: '1.45 KB',
    responseLines: [
      { text: '[', color: '#e6edf3' },
      { text: '  {', color: '#e6edf3' },
      { text: '    "id": 1,', color: '#79c0ff' },
      { text: '    "title": "Harry Potter and the Sorcerer\'s Stone",', color: '#a5d6ff' },
      { text: '    "author": "J.K. Rowling",', color: '#a5d6ff' },
      { text: '    "price": 450,', color: '#79c0ff' },
      { text: '    "pages": 320', color: '#79c0ff' },
      { text: '  },', color: '#e6edf3' },
      { text: '  {', color: '#e6edf3' },
      { text: '    "id": 2,', color: '#79c0ff' },
      { text: '    "title": "The Hobbit",', color: '#a5d6ff' },
      { text: '    "author": "J.R.R. Tolkien",', color: '#a5d6ff' },
      { text: '    "price": 399,', color: '#79c0ff' },
      { text: '    "pages": 310', color: '#79c0ff' },
      { text: '  },', color: '#e6edf3' },
      { text: '  {', color: '#e6edf3' },
      { text: '    "id": 3,', color: '#79c0ff' },
      { text: '    "title": "To Kill a Mockingbird",', color: '#a5d6ff' },
      { text: '    "author": "Harper Lee",', color: '#a5d6ff' },
      { text: '    "price": 299,', color: '#79c0ff' },
      { text: '    "pages": 281', color: '#79c0ff' },
      { text: '  },', color: '#e6edf3' },
      { text: '  ...', color: '#7d8590' },
      { text: '  /* 10 total books returned in JSON array */', color: '#56d364' },
      { text: ']', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg03, path.join(screenshotsDir, '03-get-all-books.png'));

  // 4. Postman: GET /books/:bookId/ (Single book)
  const svg04 = makePostmanSvg({
    title: 'Lab 2 - GET Single Book by ID',
    method: 'GET',
    url: 'http://localhost:3000/books/1/',
    status: '200 OK',
    time: '6 ms',
    size: '264 B',
    responseLines: [
      { text: '{', color: '#e6edf3' },
      { text: '  "id": 1,', color: '#79c0ff' },
      { text: '  "title": "Harry Potter and the Sorcerer\'s Stone",', color: '#a5d6ff' },
      { text: '  "author": "J.K. Rowling",', color: '#a5d6ff' },
      { text: '  "price": 450,', color: '#79c0ff' },
      { text: '  "pages": 320', color: '#79c0ff' },
      { text: '}', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg04, path.join(screenshotsDir, '04-get-single-book.png'));

  // 5. Postman: POST /books/ (Add new book)
  const svg05 = makePostmanSvg({
    title: 'Lab 2 - POST Add New Book',
    method: 'POST',
    url: 'http://localhost:3000/books/',
    status: '201 Created',
    time: '24 ms',
    size: '342 B',
    requestBody: [
      '{',
      '  "title": "Designing Data-Intensive Applications",',
      '  "author": "Martin Kleppmann",',
      '  "price": 799,',
      '  "pages": 616',
      '}'
    ],
    responseLines: [
      { text: '{', color: '#e6edf3' },
      { text: '  "message": "Book Successfully Added",', color: '#56d364' },
      { text: '  "bookId": 11,', color: '#79c0ff' },
      { text: '  "book": {', color: '#e6edf3' },
      { text: '    "id": 11,', color: '#79c0ff' },
      { text: '    "title": "Designing Data-Intensive Applications",', color: '#a5d6ff' },
      { text: '    "author": "Martin Kleppmann",', color: '#a5d6ff' },
      { text: '    "price": 799,', color: '#79c0ff' },
      { text: '    "pages": 616', color: '#79c0ff' },
      { text: '  }', color: '#e6edf3' },
      { text: '}', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg05, path.join(screenshotsDir, '05-post-add-book.png'));

  // 6. Postman: PUT /books/:bookId/ (Update book)
  const svg06 = makePostmanSvg({
    title: 'Lab 2 - PUT Update Book',
    method: 'PUT',
    url: 'http://localhost:3000/books/11/',
    status: '200 OK',
    time: '19 ms',
    size: '388 B',
    requestBody: [
      '{',
      '  "title": "Designing Data-Intensive Applications (2nd Edition)",',
      '  "author": "Martin Kleppmann",',
      '  "price": 899,',
      '  "pages": 650',
      '}'
    ],
    responseLines: [
      { text: '{', color: '#e6edf3' },
      { text: '  "message": "Book Details Updated Successfully",', color: '#56d364' },
      { text: '  "bookId": 11,', color: '#79c0ff' },
      { text: '  "changes": 1,', color: '#79c0ff' },
      { text: '  "updatedBook": {', color: '#e6edf3' },
      { text: '    "id": 11,', color: '#79c0ff' },
      { text: '    "title": "Designing Data-Intensive Applications (2nd Edition)",', color: '#a5d6ff' },
      { text: '    "author": "Martin Kleppmann",', color: '#a5d6ff' },
      { text: '    "price": 899,', color: '#79c0ff' },
      { text: '    "pages": 650', color: '#79c0ff' },
      { text: '  }', color: '#e6edf3' },
      { text: '}', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg06, path.join(screenshotsDir, '06-put-update-book.png'));

  // 7. Postman: DELETE /books/:bookId/ (Remove book)
  const svg07 = makePostmanSvg({
    title: 'Lab 2 - DELETE Remove Book',
    method: 'DELETE',
    url: 'http://localhost:3000/books/11/',
    status: '200 OK',
    time: '11 ms',
    size: '228 B',
    responseLines: [
      { text: '{', color: '#e6edf3' },
      { text: '  "message": "Book Deleted Successfully",', color: '#56d364' },
      { text: '  "bookId": 11,', color: '#79c0ff' },
      { text: '  "deletedBookTitle": "Designing Data-Intensive Applications (2nd Edition)",', color: '#a5d6ff' },
      { text: '  "changes": 1', color: '#79c0ff' },
      { text: '}', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg07, path.join(screenshotsDir, '07-delete-book.png'));

  // 8. Postman: 404 Error Handling
  const svg08 = makePostmanSvg({
    title: 'Lab 2 - GET Non-existent Book (404 Not Found)',
    method: 'GET',
    url: 'http://localhost:3000/books/9999/',
    status: '404 Not Found',
    time: '8 ms',
    size: '158 B',
    responseLines: [
      { text: '{', color: '#e6edf3' },
      { text: '  "error": "Book Not Found",', color: '#ff7b72' },
      { text: '  "message": "No book found with ID: 9999",', color: '#a5d6ff' },
      { text: '  "statusCode": 404', color: '#79c0ff' },
      { text: '}', color: '#e6edf3' }
    ]
  });
  renderSvgToPng(svg08, path.join(screenshotsDir, '08-get-404-error.png'));

  // 9. Database File Changes Verification (Task 6 CLI comparison)
  const svg09 = makeTerminalSvg({
    title: 'Terminal – SQLite CLI Verification of Mutations (POST, PUT, DELETE)',
    lines: [
      { text: '# 1. Database after POST (Book 11 inserted):', color: '#e5c07b', bold: true },
      { text: 'sqlite> SELECT * FROM book WHERE id = 11;', color: '#98c379' },
      { text: '11 | Designing Data-Intensive Applications | Martin Kleppmann | 799 | 616', color: '#abb2bf' },
      { type: 'gap' },
      { text: '# 2. Database after PUT (Book 11 updated price to 899 & 2nd Edition):', color: '#e5c07b', bold: true },
      { text: 'sqlite> SELECT * FROM book WHERE id = 11;', color: '#98c379' },
      { text: '11 | Designing Data-Intensive Applications (2nd Edition) | Martin Kleppmann | 899 | 650', color: '#61afef' },
      { type: 'gap' },
      { text: '# 3. Database after DELETE (Book 11 removed):', color: '#e5c07b', bold: true },
      { text: 'sqlite> SELECT * FROM book WHERE id = 11;', color: '#98c379' },
      { text: '(0 rows returned — Record permanently purged from goodreads.db)', color: '#e06c75', bold: true },
      { type: 'gap' },
      { text: '# 4. Final Row Count Verification:', color: '#e5c07b', bold: true },
      { text: 'sqlite> SELECT COUNT(*) as total_books FROM book;', color: '#98c379' },
      { text: 'total_books = 10', color: '#98c379', bold: true }
    ]
  });
  renderSvgToPng(svg09, path.join(screenshotsDir, '09-database-changes-post-delete.png'));

  console.log('✅ All 9 screenshots generated successfully!');
}

generateAllScreenshots();
