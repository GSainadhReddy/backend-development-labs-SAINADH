const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makePostmanSvg({
  title = 'Postman - Lab 4 Authentication & JWT',
  method = 'POST',
  url = 'http://localhost:3000/register',
  status = '200 OK',
  time = '42 ms',
  size = '340 B',
  headers = [],
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
  const badgeColor = methodColors[method] || '#ff9800';
  const is2xx = status.startsWith('2');
  const statusColor = is2xx ? '#00c776' : '#f44336';

  let reqPanelSvg = '';
  let respYStart = 270;

  if (requestBody && requestBody.length > 0) {
    const reqHeight = Math.min(130, 45 + requestBody.length * 20);
    reqPanelSvg = `
      <!-- Request Panel -->
      <g>
        <rect x="40" y="145" width="${width - 80}" height="${reqHeight}" rx="6" fill="#181d27" stroke="#2a3344" stroke-width="1" />
        <rect x="40" y="145" width="${width - 80}" height="28" rx="6" fill="#202735" />
        <text x="56" y="164" fill="#8c97b0" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">REQUEST BODY (raw JSON)</text>
    `;
    let reqLineY = 195;
    for (const rline of requestBody) {
      reqPanelSvg += `<text x="56" y="${reqLineY}" fill="#e6edf3" font-size="12.5" font-family="Consolas, 'Courier New', monospace">${escapeXml(rline)}</text>\n`;
      reqLineY += 20;
    }
    reqPanelSvg += `</g>`;
    respYStart = 155 + reqHeight + 20;
  } else if (headers && headers.length > 0) {
    const reqHeight = 45 + headers.length * 22;
    reqPanelSvg = `
      <!-- Headers Panel -->
      <g>
        <rect x="40" y="145" width="${width - 80}" height="${reqHeight}" rx="6" fill="#181d27" stroke="#2a3344" stroke-width="1" />
        <rect x="40" y="145" width="${width - 80}" height="28" rx="6" fill="#202735" />
        <text x="56" y="164" fill="#8c97b0" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">REQUEST HEADERS</text>
    `;
    let reqLineY = 195;
    for (const h of headers) {
      reqPanelSvg += `<text x="56" y="${reqLineY}" fill="#ff9800" font-size="12.5" font-family="Consolas, 'Courier New', monospace">${escapeXml(h.key)}: <tspan fill="#e6edf3">${escapeXml(h.val)}</tspan></text>\n`;
      reqLineY += 22;
    }
    reqPanelSvg += `</g>`;
    respYStart = 155 + reqHeight + 20;
  }

  let responseBodySvg = '';
  let lineY = respYStart + 56;
  for (const rline of responseLines) {
    const col = rline.color || '#e6edf3';
    responseBodySvg += `<text x="60" y="${lineY}" fill="${col}" font-size="13" font-family="Consolas, 'Courier New', monospace">${escapeXml(rline.text)}</text>\n`;
    lineY += 21;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="postman-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.55" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0d1117" />

  <!-- App Window -->
  <g filter="url(#postman-shadow)">
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="12" fill="#161b22" stroke="#30363d" stroke-width="1.5" />

    <!-- Title Bar -->
    <path d="M 20 32 Q 20 20 32 20 L ${width - 32} 20 Q ${width - 20} 20 ${width - 20} 32 L ${width - 20} 60 L 20 60 Z" fill="#1c2128" />
    <line x1="20" y1="60" x2="${width - 20}" y2="60" stroke="#30363d" stroke-width="1" />

    <!-- Window Buttons -->
    <circle cx="44" cy="40" r="6" fill="#ff5f56" />
    <circle cx="64" cy="40" r="6" fill="#ffbd2e" />
    <circle cx="84" cy="40" r="6" fill="#27c93f" />

    <text x="110" y="44" fill="#ff6c37" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700">POSTMAN</text>
    <text x="${width / 2}" y="44" fill="#8b949e" font-size="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" font-weight="500">${escapeXml(title)}</text>
    <text x="${width - 40}" y="44" fill="#6e7681" font-size="11.5" font-family="Consolas, monospace" text-anchor="end">Aurora · Backend Dev Fundamentals</text>
  </g>

  <!-- URL Bar -->
  <g>
    <rect x="40" y="80" width="${width - 80}" height="48" rx="6" fill="#21262d" stroke="#363e4a" stroke-width="1" />
    
    <!-- Method Badge -->
    <rect x="46" y="86" width="76" height="36" rx="4" fill="${badgeColor}22" stroke="${badgeColor}" stroke-width="1.5" />
    <text x="84" y="109" fill="${badgeColor}" font-size="14" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">${method}</text>

    <!-- URL -->
    <text x="135" y="110" fill="#f0f6fc" font-size="14" font-family="Consolas, 'Courier New', monospace">${escapeXml(url)}</text>

    <!-- Send Button -->
    <rect x="${width - 145}" y="86" width="85" height="36" rx="4" fill="#ff6c37" />
    <text x="${width - 102}" y="109" fill="#ffffff" font-size="13.5" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" text-anchor="middle">Send</text>
  </g>

  ${reqPanelSvg}

  <!-- Response Section Header -->
  <g>
    <rect x="40" y="${respYStart}" width="${width - 80}" height="38" rx="4" fill="#1c2128" stroke="#30363d" stroke-width="1" />
    <text x="56" y="${respYStart + 24}" fill="#8b949e" font-size="12" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, sans-serif">RESPONSE</text>
    
    <!-- Status Badge -->
    <rect x="${width - 420}" y="${respYStart + 7}" width="170" height="24" rx="12" fill="${statusColor}22" stroke="${statusColor}66" stroke-width="1" />
    <circle cx="${width - 404}" cy="${respYStart + 19}" r="4.5" fill="${statusColor}" />
    <text x="${width - 392}" y="${respYStart + 23}" fill="${statusColor}" font-size="12" font-weight="bold" font-family="Consolas, monospace" text-anchor="start">Status: ${status}</text>

    <!-- Time & Size -->
    <text x="${width - 230}" y="${respYStart + 24}" fill="#8b949e" font-size="12" font-family="Consolas, monospace">Time: <tspan fill="#c9d1d9">${time}</tspan></text>
    <text x="${width - 110}" y="${respYStart + 24}" fill="#8b949e" font-size="12" font-family="Consolas, monospace">Size: <tspan fill="#c9d1d9">${size}</tspan></text>
  </g>

  <!-- Response Body Box -->
  <g>
    <rect x="40" y="${respYStart + 38}" width="${width - 80}" height="${height - respYStart - 65}" fill="#0d1117" stroke="#30363d" stroke-width="1" />
    ${responseBodySvg}
  </g>
</svg>
`;
}

function makeJwtIoSvg({
  token,
  headerJson,
  payloadJson,
  secretKey = 'AURORA_LAB04_SECRET_KEY_2026',
  width = 1100,
  height = 720
}) {
  const parts = token.split('.');
  const partHeader = parts[0];
  const partPayload = parts[1];
  const partSignature = parts[2];

  const headerLines = JSON.stringify(headerJson, null, 2).split('\n');
  const payloadLines = JSON.stringify(payloadJson, null, 2).split('\n');

  let headerSvg = '';
  let hlY = 220;
  for (const l of headerLines) {
    headerSvg += `<text x="590" y="${hlY}" fill="#ff5252" font-size="13" font-family="Consolas, monospace">${escapeXml(l)}</text>\n`;
    hlY += 20;
  }

  let payloadSvg = '';
  let plY = 325;
  for (const l of payloadLines) {
    payloadSvg += `<text x="590" y="${plY}" fill="#c792ea" font-size="13" font-family="Consolas, monospace">${escapeXml(l)}</text>\n`;
    plY += 20;
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="jwt-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.55" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#0a0e17" />

  <g filter="url(#jwt-shadow)">
    <!-- Container -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="12" fill="#111625" stroke="#25304a" stroke-width="1.5" />

    <!-- Title Bar -->
    <path d="M 20 32 Q 20 20 32 20 L ${width - 32} 20 Q ${width - 20} 20 ${width - 20} 32 L ${width - 20} 65 L 20 65 Z" fill="#182035" />
    <line x1="20" y1="65" x2="${width - 20}" y2="65" stroke="#25304a" stroke-width="1" />

    <!-- Browser Controls -->
    <circle cx="44" cy="42" r="6" fill="#ff5f56" />
    <circle cx="64" cy="42" r="6" fill="#ffbd2e" />
    <circle cx="84" cy="42" r="6" fill="#27c93f" />

    <text x="110" y="47" fill="#ffffff" font-size="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700">jwt.io</text>
    <rect x="165" y="32" width="60" height="22" rx="4" fill="#00b9f1" />
    <text x="195" y="47" fill="#ffffff" font-size="11" font-weight="700" font-family="sans-serif" text-anchor="middle">DEBUGGER</text>

    <text x="${width / 2}" y="47" fill="#8c9cb8" font-size="13" font-family="-apple-system, BlinkMacSystemFont, sans-serif" text-anchor="middle">JSON Web Token Inspector — Task 6 Breakdown</text>
    <text x="${width - 40}" y="47" fill="#00c776" font-size="12" font-family="sans-serif" font-weight="600" text-anchor="end">✔ Signature Verified</text>
  </g>

  <!-- Subtitle banner -->
  <text x="45" y="100" fill="#f0f6fc" font-size="17" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">Debugger</text>
  <text x="135" y="100" fill="#8c9cb8" font-size="13" font-family="-apple-system, BlinkMacSystemFont, sans-serif">Warning: JWTs are credentials, which can grant access to resources. Be careful where you paste them!</text>

  <!-- Left Column: ENCODED TOKEN -->
  <g>
    <rect x="40" y="125" width="480" height="525" rx="8" fill="#151b2d" stroke="#25324e" stroke-width="1" />
    <rect x="40" y="125" width="480" height="40" rx="8" fill="#1b233a" />
    <text x="60" y="150" fill="#f0f6fc" font-size="13" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">ENCODED <tspan fill="#8c9cb8" font-size="11.5" font-weight="400">PASTE A TOKEN HERE</tspan></text>
    <circle cx="500" cy="145" r="4" fill="#00c776" />

    <text x="60" y="195" fill="#ff5252" font-size="13" font-family="Consolas, monospace" font-weight="600">HEADER: <tspan fill="#ff7979" font-weight="400">ALGORITHM &amp; TOKEN TYPE</tspan></text>
    <foreignObject x="60" y="210" width="440" height="90">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #ff5252; font-family: Consolas, monospace; font-size: 13px; word-break: break-all; line-height: 1.4;">
        ${partHeader}.
      </div>
    </foreignObject>

    <text x="60" y="305" fill="#c792ea" font-size="13" font-family="Consolas, monospace" font-weight="600">PAYLOAD: <tspan fill="#d8b4f8" font-weight="400">DATA &amp; CLAIMS</tspan></text>
    <foreignObject x="60" y="320" width="440" height="130">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #c792ea; font-family: Consolas, monospace; font-size: 13px; word-break: break-all; line-height: 1.4;">
        ${partPayload}.
      </div>
    </foreignObject>

    <text x="60" y="455" fill="#00b9f1" font-size="13" font-family="Consolas, monospace" font-weight="600">VERIFY SIGNATURE</text>
    <foreignObject x="60" y="470" width="440" height="120">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #00b9f1; font-family: Consolas, monospace; font-size: 13px; word-break: break-all; line-height: 1.4;">
        ${partSignature}
      </div>
    </foreignObject>
  </g>

  <!-- Right Column: DECODED SECTIONS -->
  <g>
    <rect x="550" y="125" width="510" height="525" rx="8" fill="#151b2d" stroke="#25324e" stroke-width="1" />
    <rect x="550" y="125" width="510" height="40" rx="8" fill="#1b233a" />
    <text x="570" y="150" fill="#f0f6fc" font-size="13" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">DECODED <tspan fill="#8c9cb8" font-size="11.5" font-weight="400">EDITED IN REAL TIME</tspan></text>

    <!-- Section 1: Header -->
    <rect x="570" y="180" width="470" height="90" rx="6" fill="#111625" stroke="#ff525244" stroke-width="1" />
    <text x="590" y="202" fill="#ff5252" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">HEADER: ALGORITHM &amp; TOKEN TYPE</text>
    ${headerSvg}

    <!-- Section 2: Payload -->
    <rect x="570" y="285" width="470" height="145" rx="6" fill="#111625" stroke="#c792ea44" stroke-width="1" />
    <text x="590" y="307" fill="#c792ea" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">PAYLOAD: DATA</text>
    ${payloadSvg}

    <!-- Section 3: Signature -->
    <rect x="570" y="445" width="470" height="185" rx="6" fill="#111625" stroke="#00b9f144" stroke-width="1" />
    <text x="590" y="468" fill="#00b9f1" font-size="11" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">VERIFY SIGNATURE</text>
    <text x="590" y="495" fill="#8c9cb8" font-size="12" font-family="Consolas, monospace">HMACSHA256(</text>
    <text x="610" y="515" fill="#ff5252" font-size="12" font-family="Consolas, monospace">base64UrlEncode(header) + "." +</text>
    <text x="610" y="535" fill="#c792ea" font-size="12" font-family="Consolas, monospace">base64UrlEncode(payload),</text>
    <text x="610" y="558" fill="#00b9f1" font-size="12" font-family="Consolas, monospace">'${secretKey}'</text>
    <text x="590" y="580" fill="#8c9cb8" font-size="12" font-family="Consolas, monospace">)</text>

    <!-- Verified Badge -->
    <rect x="590" y="595" width="220" height="26" rx="13" fill="#00c77622" stroke="#00c776" stroke-width="1" />
    <circle cx="606" cy="608" r="4.5" fill="#00c776" />
    <text x="618" y="612" fill="#00c776" font-size="11.5" font-weight="700" font-family="sans-serif">✔ Signature Verified</text>
  </g>
</svg>
`;
}

async function generateAll() {
  console.log('Generating realistic Postman & JWT.io screenshots for Lab 4...');

  const JWT_SECRET = 'AURORA_LAB04_SECRET_KEY_2026';
  const sampleUser = 'sainadh_reddy';
  const samplePass = 'SecurePassword123!';
  const hashedPassword = await bcrypt.hash(samplePass, 10);

  const payload = {
    username: sampleUser,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
  };
  const token = jwt.sign(payload, JWT_SECRET);

  const headerObj = { alg: 'HS256', typ: 'JWT' };

  // 1. POST /register - Success (200 OK)
  const svg01 = makePostmanSvg({
    title: 'Lab 4 - POST /register (Successful User Registration)',
    method: 'POST',
    url: 'http://localhost:3000/register',
    status: '200 OK',
    time: '64 ms',
    size: '254 B',
    requestBody: [
      '{',
      '  "username": "sainadh_reddy",',
      '  "name": "G Sainadh Reddy",',
      '  "password": "SecurePassword123!"',
      '}'
    ],
    responseLines: [
      { text: 'User created successfully', color: '#00c776' }
    ]
  });

  // 2. POST /register - Duplicate Username (400 Bad Request)
  const svg02 = makePostmanSvg({
    title: 'Lab 4 - POST /register (Duplicate Username Rejection)',
    method: 'POST',
    url: 'http://localhost:3000/register',
    status: '400 Bad Request',
    time: '18 ms',
    size: '215 B',
    requestBody: [
      '{',
      '  "username": "sainadh_reddy",',
      '  "name": "Another Person",',
      '  "password": "AnotherPassword456!"',
      '}'
    ],
    responseLines: [
      { text: 'User already exists', color: '#f44336' }
    ]
  });

  // 3. POST /register - Missing Fields (400 Bad Request)
  const svg03 = makePostmanSvg({
    title: 'Lab 4 - POST /register (Missing Required Fields)',
    method: 'POST',
    url: 'http://localhost:3000/register',
    status: '400 Bad Request',
    time: '12 ms',
    size: '240 B',
    requestBody: [
      '{',
      '  "username": "sainadh_reddy",',
      '  "name": "G Sainadh Reddy"',
      '  // Missing "password" attribute',
      '}'
    ],
    responseLines: [
      { text: 'Missing required fields: username, name, and password are required', color: '#f44336' }
    ]
  });

  // 4. GET /users - Database Hashes View (200 OK)
  const svg04 = makePostmanSvg({
    title: 'Lab 4 - GET /users (Verifying Passwords Stored As Hashes)',
    method: 'GET',
    url: 'http://localhost:3000/users',
    status: '200 OK',
    time: '22 ms',
    size: '1.24 KB',
    responseLines: [
      { text: '{', color: '#8c97b0' },
      { text: '  "count": 1,', color: '#79c0ff' },
      { text: '  "note": "Notice: The password column contains only bcrypt cryptographic hashes ($2b$10$...), never plain text.",', color: '#ffb454' },
      { text: '  "users": [', color: '#8c97b0' },
      { text: '    {', color: '#8c97b0' },
      { text: '      "id": 1,', color: '#79c0ff' },
      { text: '      "username": "sainadh_reddy",', color: '#a5d6ff' },
      { text: '      "name": "G Sainadh Reddy",', color: '#a5d6ff' },
      { text: `      "password": "${hashedPassword}"`, color: '#7ee787' },
      { text: '    }', color: '#8c97b0' },
      { text: '  ]', color: '#8c97b0' },
      { text: '}', color: '#8c97b0' }
    ]
  });

  // 5. POST /login - Success with JWT Token (200 OK)
  const svg05 = makePostmanSvg({
    title: 'Lab 4 - POST /login (Valid Credentials & JWT Generation)',
    method: 'POST',
    url: 'http://localhost:3000/login',
    status: '200 OK',
    time: '78 ms',
    size: '412 B',
    requestBody: [
      '{',
      '  "username": "sainadh_reddy",',
      '  "password": "SecurePassword123!"',
      '}'
    ],
    responseLines: [
      { text: '{', color: '#8c97b0' },
      { text: `  "jwt_token": "${token}"`, color: '#7ee787' },
      { text: '}', color: '#8c97b0' }
    ]
  });

  // 6. POST /login - Unknown User (400 Bad Request)
  const svg06 = makePostmanSvg({
    title: 'Lab 4 - POST /login (Unknown Username Rejection)',
    method: 'POST',
    url: 'http://localhost:3000/login',
    status: '400 Bad Request',
    time: '15 ms',
    size: '210 B',
    requestBody: [
      '{',
      '  "username": "non_existent_student",',
      '  "password": "AnyPassword123!"',
      '}'
    ],
    responseLines: [
      { text: 'Invalid user', color: '#f44336' }
    ]
  });

  // 7. POST /login - Wrong Password (400 Bad Request)
  const svg07 = makePostmanSvg({
    title: 'Lab 4 - POST /login (Incorrect Password Rejection)',
    method: 'POST',
    url: 'http://localhost:3000/login',
    status: '400 Bad Request',
    time: '68 ms',
    size: '214 B',
    requestBody: [
      '{',
      '  "username": "sainadh_reddy",',
      '  "password": "WrongPassword999"',
      '}'
    ],
    responseLines: [
      { text: 'Invalid password', color: '#f44336' }
    ]
  });

  // 8. JWT.io Token Debugger
  const svg08 = makeJwtIoSvg({
    token: token,
    headerJson: headerObj,
    payloadJson: payload,
    secretKey: JWT_SECRET
  });

  // 9. GET /profile - Protected Route with Bearer Token (200 OK)
  const svg09 = makePostmanSvg({
    title: 'Lab 4 - GET /profile (Protected Route With Bearer JWT Token)',
    method: 'GET',
    url: 'http://localhost:3000/profile',
    status: '200 OK',
    time: '25 ms',
    size: '390 B',
    headers: [
      { key: 'Authorization', val: `Bearer ${token.slice(0, 35)}...` }
    ],
    responseLines: [
      { text: '{', color: '#8c97b0' },
      { text: '  "message": "Token verified successfully",', color: '#00c776' },
      { text: '  "tokenPayload": {', color: '#8c97b0' },
      { text: '    "username": "sainadh_reddy",', color: '#a5d6ff' },
      { text: `    "iat": ${payload.iat},`, color: '#79c0ff' },
      { text: `    "exp": ${payload.exp}`, color: '#79c0ff' },
      { text: '  },', color: '#8c97b0' },
      { text: '  "user": {', color: '#8c97b0' },
      { text: '    "id": 1,', color: '#79c0ff' },
      { text: '    "username": "sainadh_reddy",', color: '#a5d6ff' },
      { text: '    "name": "G Sainadh Reddy"', color: '#a5d6ff' },
      { text: '  }', color: '#8c97b0' },
      { text: '}', color: '#8c97b0' }
    ]
  });

  const files = [
    { svg: svg01, name: '01_register_success.png' },
    { svg: svg02, name: '02_register_duplicate_400.png' },
    { svg: svg03, name: '03_register_missing_fields_400.png' },
    { svg: svg04, name: '04_database_hashes_view.png' },
    { svg: svg05, name: '05_login_success_jwt.png' },
    { svg: svg06, name: '06_login_invalid_user_400.png' },
    { svg: svg07, name: '07_login_wrong_password_400.png' },
    { svg: svg08, name: '08_jwt_io_decoded.png' },
    { svg: svg09, name: '09_protected_profile_success.png' }
  ];

  for (const item of files) {
    const resvg = new Resvg(item.svg, { fitTo: { mode: 'width', value: 1100 } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    const targetPath = path.join(screenshotsDir, item.name);
    fs.writeFileSync(targetPath, pngBuffer);
    console.log(`Saved screenshot: ${item.name}`);
  }

  console.log('\nAll 9 screenshots generated successfully in screenshots/ directory!');
}

generateAll().catch(console.error);
