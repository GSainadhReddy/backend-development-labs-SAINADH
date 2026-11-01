# Backend Development Fundamentals — Course Laboratory Repository

**Course:** Backend Development Fundamentals  
**Academic Year:** Year II Term II  
**Institution:** Aurora  
**Faculty:** Joel Prashanth D  

**Student Name:** G Sainadh Reddy  
**Registration Number:** 252U1R6076  
**Section:** CSE 2B  
**GitHub Repository:** [GSainadhReddy/backend-development-labs-SAINADH](https://github.com/GSainadhReddy/backend-development-labs-SAINADH)  

---

## Repository Structure

This repository contains all laboratory assignments (from `lab-01` through `lab-10`) for the Backend Development Fundamentals curriculum. Each laboratory experiment is housed in its own isolated subfolder with dedicated code, dependencies, documentation, test scripts, and execution screenshots.

| Lab Folder | Title / Topic | Status | Documentation Link |
| :--- | :--- | :--- | :--- |
| [`lab-01/`](./lab-01/) | Node.js and Express server setup, routing, status codes & 404 handler | **Completed** | [Lab 1 Documentation](./lab-01/README.md) |
| [`lab-02/`](./lab-02/) | Lab 2: SQLite database and CRUD routes | **Completed** | [Lab 2 Documentation](./lab-02/README.md) |
| `lab-03/` | Lab 3: RESTful CRUD APIs | Upcoming | - |
| `lab-04/` | Lab 4: Database Integration & Parameterised Queries | Upcoming | - |
| `lab-05/` | Lab 5: Authentication & Password Hashing | Upcoming | - |
| `lab-06/` | Lab 6: JWT Authorization & Protected Routes | Upcoming | - |
| `lab-07/` | Lab 7: Relational Data Modeling & Joins | Upcoming | - |
| `lab-08/` | Lab 8: Error Handling & Logging Middleware | Upcoming | - |
| `lab-09/` | Lab 9: File Uploads & Cloud Storage | Upcoming | - |
| `lab-10/` | Lab 10: Full-Stack Integration & Cloud Deployment | Upcoming | - |

---

## Lab Standards & Guidelines
- **Zero Secrets Policy:** Never commit or push `.env` files. Provide `.env.example` templates for configuration.
- **Dependency Hygiene:** `node_modules` is excluded from Git via `.gitignore`.
- **Security:** Passwords are never stored or logged in plain text. All database queries use parameterised inputs.
- **Status Codes:** Every HTTP endpoint returns an appropriate standard HTTP response status code.

---

## Running the Labs

### Running Lab 1: Node.js & Express Server
See [Lab 1 README](./lab-01/README.md) for full endpoint documentation and screenshots.
```bash
cd lab-01
npm install
npm start
```
Server runs on: `http://localhost:3000`

### Running Lab 2: SQLite Database & CRUD Routes
See [Lab 2 README](./lab-02/README.md) for full endpoint documentation, viva answers, and Postman screenshots.
```bash
cd lab-02
npm install
npm run dev     # Starts with nodemon live reloading
npm test        # Runs 15 automated integration tests
```
Server runs on: `http://localhost:3000`
Interactive SQLite CLI: `npm run cli`

