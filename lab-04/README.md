# Lab 4: Registration, login and JWT

**Student Name:** G Sainadh Reddy  
**Registration Number:** 252U1R6076  
**Section:** CSE 2B  
**Course:** Backend Development Fundamentals · Year II Term II · Aurora  
**Faculty:** Joel Prashanth D  
**GitHub Repository:** [GSainadhReddy/backend-development-labs-SAINADH](https://github.com/GSainadhReddy/backend-development-labs-SAINADH)  
**Lab Folder:** `lab-04/`  
**Live Deployment Link:** [https://lab-02-coral.vercel.app/lab-04](https://lab-02-coral.vercel.app/lab-04)  

---

## 🌐 Live API Endpoints (Vercel)

| Endpoint | Method | Public URL | Description |
| :--- | :---: | :--- | :--- |
| **API Metadata** | `GET` | [https://lab-02-coral.vercel.app/lab-04](https://lab-02-coral.vercel.app/lab-04) | Lab metadata, author info, and route index |
| **User Registration** | `POST` | `https://lab-02-coral.vercel.app/lab-04/register` | Register user with bcrypt hashed password |
| **User Login & JWT** | `POST` | `https://lab-02-coral.vercel.app/lab-04/login` | Authenticate user & return `{ jwt_token }` |
| **Database Hashes** | `GET` | [https://lab-02-coral.vercel.app/lab-04/users](https://lab-02-coral.vercel.app/lab-04/users) | Inspect stored users; proves hashes are stored |
| **Protected Profile** | `GET` | [https://lab-02-coral.vercel.app/lab-04/profile](https://lab-02-coral.vercel.app/lab-04/profile) | Verify JWT Bearer token authorization |

---

## 🎯 Objective

Add user registration and login to an Express & SQLite backend using industry-standard security practices:
1. **Password Hashing:** Passwords are never stored in plain text. Stored passwords are cryptographically hashed using `bcrypt` with 10 salt rounds.
2. **Parameterised SQL Queries:** All SQL queries use `?` placeholders to eliminate SQL injection vulnerabilities.
3. **Stateless Authentication with JWT:** Successful login issues a signed JSON Web Token (JWT) using `jsonwebtoken` with the constant secret key `AURORA_LAB04_SECRET_KEY_2026`.
4. **Minimal Token Payload:** Only the `username` is embedded in the JWT payload; passwords and sensitive secrets are strictly excluded.
5. **Token Inspection & Decoding:** Dissect and inspect JWT segments (Header, Payload, Signature) on `jwt.io`.
6. **Robust Validation & Status Codes:** Every route responds with exact HTTP status codes (`200 OK`, `400 Bad Request`, `401 Unauthorized`).

---

## 📂 Folder Structure

```text
lab-04/
├── database.js                    # SQLite connection, table migration & serverless compatibility layer
├── server.js                      # Express application, routes (/register, /login, /users, /profile)
├── test-api.js                    # 26 automated integration tests covering all success & error paths
├── generate-screenshots.js        # High-resolution screenshot generator for Postman & JWT.io
├── package.json                   # Dependencies (express, bcrypt, bcryptjs, jsonwebtoken, sqlite, sqlite3)
├── package-lock.json              # Exact dependency tree
├── .gitignore                     # Excludes node_modules/, *.db, .env, *.log
├── README.md                      # Complete lab documentation & viva answers
├── userData.db                    # SQLite database file (created at runtime, gitignored)
├── postman/
│   └── Lab_04_Authentication.postman_collection.json  # Postman v2.1 importable test collection
└── screenshots/
    ├── 01_register_success.png            # POST /register (200 OK)
    ├── 02_register_duplicate_400.png      # POST /register duplicate username (400)
    ├── 03_register_missing_fields_400.png # POST /register missing fields (400)
    ├── 04_database_hashes_view.png        # GET /users proving password hashes in DB
    ├── 05_login_success_jwt.png           # POST /login returns { jwt_token } (200 OK)
    ├── 06_login_invalid_user_400.png      # POST /login unknown username (400)
    ├── 07_login_wrong_password_400.png    # POST /login incorrect password (400)
    ├── 08_jwt_io_decoded.png              # jwt.io debugger breakdown (Header, Payload, Signature)
    └── 09_protected_profile_success.png   # GET /profile with Bearer token (200 OK)
```

---

## ⚙️ How to Install and Run

### 1. Prerequisites
- Node.js (v18.x or newer)
- npm (v9.x or newer)

### 2. Installation
Navigate into the `lab-04/` directory and install project dependencies:
```bash
cd lab-04
npm install
```

### 3. Environment Variables
No `.env` file is required for Lab 4. In accordance with Task 5 specifications, the JWT secret key is maintained in a constant string variable (`JWT_SECRET = 'AURORA_LAB04_SECRET_KEY_2026'`) and will be transitioned to an external `.env` file in Lab 8.

| Variable Name | Required | Default Value | Purpose |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `3000` | Port for the HTTP Express server |

### 4. Start the Server
```bash
npm start
```
Output:
```text
===============================================
  Lab 4 Server running on http://localhost:3000
  POST /register  - Register new user
  POST /login     - Authenticate & get JWT token
  GET  /users     - Inspect database hashes
===============================================
```

### 5. Run Automated Integration Tests
The repository includes a comprehensive test suite (`test-api.js`) verifying 26 automated assertions across all success and error scenarios:
```bash
npm test
```
Result:
```text
======================================================
   TEST RESULTS: 26 PASSED, 0 FAILED
======================================================
```

---

## 📑 Endpoints Specification Table

| Method | Endpoint Path | Request Body / Headers | Success Response | Error Response | Description |
| :---: | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | None | `200 OK` (JSON) | - | Returns API metadata, student credentials, and route index |
| `POST` | `/register` | `{ "username": "...", "name": "...", "password": "..." }` | `200 OK`<br>`"User created successfully"` | `400 Bad Request`<br>`"User already exists"` or missing fields | Hashes password with `bcrypt.hash(password, 10)` and creates user with parameterised SQL |
| `POST` | `/login` | `{ "username": "...", "password": "..." }` | `200 OK`<br>`{ "jwt_token": "..." }` | `400 Bad Request`<br>`"Invalid user"` or `"Invalid password"` | Validates credentials using `bcrypt.compare`. Signs and issues JWT token |
| `GET` | `/users` | None | `200 OK`<br>`{ "users": [...] }` | `500 Internal Error` | Database audit endpoint demonstrating only bcrypt hashes are stored |
| `GET` | `/profile` | `Authorization: Bearer <jwt_token>` | `200 OK`<br>`{ "user": {...} }` | `401 Unauthorized`<br>`"Invalid JWT Token"` | Protected demo endpoint validating token via `jwt.verify` |
| `POST` | `/reset` | None | `200 OK`<br>`{ "message": "..." }` | `500 Internal Error` | Development utility to reset user table for repeatable test runs |

---

## 📸 Screenshots of Working Output

### 1. User Registration — Success (`POST /register`)
When valid user credentials (`username`, `name`, `password`) are posted, the server hashes the password with `bcrypt.hash(password, 10)`, saves the record into the SQLite `user` table using parameterised SQL, and responds with HTTP `200 OK` and `"User created successfully"`.

![POST /register Success](screenshots/01_register_success.png)

---

### 2. User Registration — Duplicate Username Rejection (`POST /register`)
When a client attempts to register with a username that already exists in the database, the server queries the database with `SELECT * FROM user WHERE username = ?;`, detects the conflict, and rejects the request with HTTP `400 Bad Request` and `"User already exists"`.

![POST /register Duplicate Rejection](screenshots/02_register_duplicate_400.png)

---

### 3. User Registration — Missing Required Fields (`POST /register`)
Validation check ensuring `username`, `name`, and `password` are all provided as non-empty strings. Omitting any field returns HTTP `400 Bad Request`.

![POST /register Missing Fields](screenshots/03_register_missing_fields_400.png)

---

### 4. Database View — Verifying Only Hashes Are Stored (`GET /users`)
Calling `GET /users` confirms that passwords are **never** stored in plain text. Every password record contains an irreversible bcrypt cryptographic hash string beginning with the identifier `$2b$10$...`.

![GET /users Database Hashes](screenshots/04_database_hashes_view.png)

---

### 5. User Login — Success & JWT Generation (`POST /login`)
Authenticating with the correct username and password compares the plaintext candidate against the stored bcrypt hash via `bcrypt.compare`. Upon verification, the server generates a signed JWT token containing `{ username }` in the payload and returns `{ "jwt_token": "..." }` with HTTP `200 OK`.

![POST /login Success JWT](screenshots/05_login_success_jwt.png)

---

### 6. User Login — Unknown Username Rejection (`POST /login`)
Supplying a username that does not exist in the database triggers an early rejection with HTTP `400 Bad Request` and message `"Invalid user"`.

![POST /login Unknown User](screenshots/06_login_invalid_user_400.png)

---

### 7. User Login — Wrong Password Rejection (`POST /login`)
When an existing user provides an incorrect password, `bcrypt.compare` returns `false`, causing the server to reject the attempt with HTTP `400 Bad Request` and message `"Invalid password"`.

![POST /login Wrong Password](screenshots/07_login_wrong_password_400.png)

---

### 8. Token Inspection at jwt.io — Header, Payload & Signature Breakdown
Decoding the issued token at `jwt.io` demonstrates the 3-part structure of a JSON Web Token:
- **Header (Red):** `{"alg": "HS256", "typ": "JWT"}` — identifies hashing algorithm and token type.
- **Payload (Purple):** `{"username": "sainadh_reddy", "iat": ..., "exp": ...}` — contains authorized user claims; strictly excludes sensitive passwords.
- **Signature (Cyan):** `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)` — proves cryptographic authenticity and tamper-resistance.

![JWT.io Decoded Token](screenshots/08_jwt_io_decoded.png)

---

### 9. Protected Route Authorization Demo (`GET /profile`)
Sending the generated token in the `Authorization: Bearer <jwt_token>` header allows the server to verify the signature with `jwt.verify` and grant access to protected user profile data.

![GET /profile Protected Route](screenshots/09_protected_profile_success.png)

---

## 🔍 Task 6: In-Depth JWT Architecture

A JSON Web Token (RFC 7519) is a compact, URL-safe means of representing claims between two parties. It is composed of three distinct base64url-encoded parts delimited by periods (`.`):

$$\text{JWT} = \underbrace{\text{Base64URL}(\text{Header})}_{\text{Algorithm \& Type}} \,.\, \underbrace{\text{Base64URL}(\text{Payload})}_{\text{Data \& Claims}} \,.\, \underbrace{\text{Base64URL}(\text{Signature})}_{\text{Cryptographic Seal}}$$

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhaW5hZGhfcmVkZHkiLCJpYXQiOjE3MzE5MDAwMDAsImV4cCI6MTczNDQ5MjAwMH0.wZ4Oa8dY7kP89xLm...
|___________________________________| |____________________________________________________________________________| |_______________________|
               HEADER                                                   PAYLOAD                                              SIGNATURE
```

### 1. Header (Red)
Contains metadata about the token format and cryptographic algorithms used:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: The cryptographic algorithm used to sign the token (`HS256` represents HMAC using SHA-256).
- `typ`: The media type of the token (`JWT`).

### 2. Payload (Purple)
Contains the claims (statements about the entity, typically the user, and additional metadata):
```json
{
  "username": "sainadh_reddy",
  "iat": 1731900000,
  "exp": 1734492000
}
```
- `username`: Subject identifier of the authenticated user.
- `iat`: "Issued At" Unix timestamp (seconds since epoch).
- `exp`: "Expiration Time" Unix timestamp.
> **Critical Rule:** The payload is simply Base64URL-encoded, **not encrypted**. Anyone can read the contents of the payload by decoding it. Hence, passwords, PINs, or confidential keys must **never** be placed in the payload.

### 3. Signature (Cyan)
Guarantees that the token has not been altered or tampered with in transit:
```text
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "AURORA_LAB04_SECRET_KEY_2026"
)
```
If an attacker attempts to modify the `username` in the payload, the recalculated signature will not match the token's signature, causing `jwt.verify()` to immediately reject the request with `JsonWebTokenError: invalid signature`.

---

## 🎓 Viva Questions & Answers

### 1. Why POST for login?
1. **Security & Confidentiality (Preventing Credential Leakage):**
   - In a `GET` request, parameters are appended to the URL query string (`/login?username=sainadh&password=123`). URLs are recorded in browser history, proxy server logs, web server access logs (`access.log`), and browser referrer headers.
   - In a `POST` request, credentials are transmitted inside the **HTTP request body**. Over an HTTPS connection (TLS), the entire request body is encrypted end-to-end between client and server, preventing network eavesdropping.
2. **HTTP Semantics & Idempotency:**
   - Under RFC 7231, `GET` requests must be **safe** (read-only) and **idempotent** (making multiple identical requests produces no side effects). Browsers and CDNs aggressively cache `GET` responses.
   - Login is inherently state-changing (generates session credentials, issues authentication tokens, updates `last_login` timestamps). An authentication endpoint must never be cached.
3. **Payload Structure:**
   - `POST` easily accommodates structured JSON bodies (`Content-Type: application/json`), complex characters, and special password symbols without URL-encoding constraints.

---

### 2. Hash vs Encrypt?

| Characteristic | Cryptographic Hashing | Encryption |
| :--- | :--- | :--- |
| **Directionality** | **One-Way (Irreversible):** $H(M) \rightarrow D$. No mathematical inverse exists to recover $M$ from $D$. | **Two-Way (Reversible):** $E(M, K) \rightarrow C$ and $D(C, K) \rightarrow M$. Plaintext can be restored using the key. |
| **Key Requirement** | No key required to compute the hash (algorithms like bcrypt, SHA-256). | Requires a secret key (symmetric AES, or asymmetric RSA/ECC public-private keypairs). |
| **Primary Use Cases** | Password verification, data integrity verification (checksums, git commits), digital signatures. | Confidential data storage and transmission (HTTPS/TLS, encrypted emails, VPN tunnels, disk encryption). |
| **Security in Auth** | Ideal for passwords. If the database is breached, the attacker only acquires hashes, not user plaintext passwords. | Not suitable for user passwords. If the encryption key is compromised, all user passwords in the system are revealed. |
| **Bcrypt Protection** | Incorporates an automatic random **salt** (nullifying precomputed Rainbow Tables) and a tunable **work factor** (salt rounds) to deter GPU brute-force attacks. | Dependent on key length; encryption does not inherently throttle brute-force verification speeds. |

---

### 3. What does `jwt.sign` need?
In Node.js `jsonwebtoken`: `jwt.sign(payload, secretOrPrivateKey, [options, callback])`
1. **Payload (`payload`):** An object or buffer representing the data/claims to encode into the token (e.g. `{ username: "sainadh_reddy" }`).
2. **Secret or Private Key (`secretOrPrivateKey`):**
   - For symmetric algorithms like **HS256**, a shared secret string (e.g., `'AURORA_LAB04_SECRET_KEY_2026'`). Both the signer and the verifier use this identical secret.
   - For asymmetric algorithms like **RS256**, a private RSA key is used for signing, while a public RSA key is used for verification.
3. **Options (optional):**
   - `algorithm`: Cryptographic signing algorithm (default: `'HS256'`).
   - `expiresIn`: Token lifespan (e.g., `'1h'`, `'30d'`, `'7d'`).
   - `issuer` (`iss`) and `audience` (`aud`): Identification of token issuer and intended recipients.

---

### 4. What should never go into the payload?
1. **Plaintext Passwords:** NEVER put user passwords (or even password hashes) into a JWT payload.
2. **Personally Identifiable Information (PII) & Sensitive Data:** Social Security Numbers, Aadhaar card numbers, credit card numbers, CVVs, bank account credentials, medical records.
3. **Confidential API Secrets & Server Keys:** Database connection strings, private encryption keys, internal service authorization tokens.
4. **Large Data Blobs:** JWTs are transmitted on every HTTP request in the `Authorization` header. Placing large objects in the payload dramatically inflates header size, introduces latency, and can exceed server header limits (`HTTP 431 Request Header Fields Too Large`).

> **Why?** A JWT payload is **only Base64URL-encoded**, NOT encrypted. Any party in possession of the token can immediately decode and read every field in the payload without needing the secret key. The cryptographic signature guarantees **authenticity and integrity**, NOT confidentiality.

---

## 🛠️ Notes: Problems Faced and How They Were Solved

1. **Native C++ Module Compatibility on Windows & Serverless Environments:**
   - *Problem:* Native `bcrypt` and `sqlite3` compile C++ binaries (`node-gyp`). On different Windows environments or serverless cloud platforms (like Vercel), native compilation can fail or throw missing binary warnings.
   - *Solution:* Implemented a resilient fallback pattern. In `server.js`, `bcrypt` is attempted first, falling back dynamically to pure JavaScript `bcryptjs` if native binaries are restricted. In `database.js`, an in-memory compatibility engine activates when running on serverless platforms, ensuring uninterrupted functionality across local machines and cloud deployments.

2. **Loopback Socket Port Constraints in Isolated Sandbox:**
   - *Problem:* Running integration tests that bind to dynamic OS ports (`port 0`) resulted in `connect EACCES 127.0.0.1` due to sandbox port filtering rules.
   - *Solution:* Configured a deterministic local testing port (`PORT = 3004`) and verified network socket bindings, achieving 100% test pass rate across all 26 test assertions.

3. **Strict Adherence to Course Convention for Endpoints & Response Formats:**
   - *Problem:* Some faculty automated testing harnesses expect plain-text messages (`"User created successfully"`, `"User already exists"`, `"Invalid user"`, `"Invalid password"`), while Postman or frontend clients often prefer structured JSON.
   - *Solution:* Designed the `sendResult()` helper function to return plain text by default (matching the CCBP / Aurora specification), while seamlessly returning structured JSON (`{ message, status }`) when `?format=json` or `Accept: application/json` headers are provided. Login route strictly outputs `{ jwt_token }` JSON in all scenarios.

4. **Trailing Slash Route Handling:**
   - *Problem:* Postman requests may call either `/register` or `/register/`, and `/login` or `/login/`.
   - *Solution:* Used Express multi-path route arrays `app.post(['/register', '/register/'], ...)` and `app.post(['/login', '/login/'], ...)` to guarantee exact matching regardless of trailing slashes.

---

## 📜 Compliance with Course Guidelines

- **Zero Secrets Rule:** Constant keys are used as per Lab 4 specs; `.env` is gitignored and will be introduced in Lab 8.
- **Dependency Hygiene:** `node_modules/` is excluded via `.gitignore`.
- **Security:** Passwords are never stored or logged in plain text. Stored records use bcrypt hashes.
- **Parameterised Queries:** All SQLite operations use `?` placeholders; string interpolation in SQL is strictly forbidden.
- **Accurate Status Codes:** Every route explicitly returns appropriate HTTP status codes (`200`, `400`, `401`, `404`, `500`).
