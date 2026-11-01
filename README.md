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
| `lab-02/` | Lab 2: Express Middleware & Request Processing | Upcoming | - |
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

## Running Lab 1
For full installation instructions, endpoint documentation, viva answers, and screenshots, visit the [Lab 1 README](./lab-01/README.md).
```bash
cd lab-01
npm install
npm start
```
Server runs on: `http://localhost:3000`
