# Gyantra

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

> An AI-powered quiz platform built with React + Node.js

---

## Project Structure

<details>
<summary><b>Click to expand full structure</b></summary>

```
Gyantra/
│
├── Backend/                            → Node.js + Express API
│   ├── src/                            → Config, controllers, models, routes, utils
│   ├── scratch/                        → Scratch/working files (dev use)
│   ├── temp_runs/                      → Temporary output from code execution / test runs
│   ├── seedProblems.js                 → Script to seed problem data into MongoDB
│   ├── server.js                       → Entry point
│   ├── package.json
│   └── package-lock.json
│
├── signin-signup_frontend/             → React + Vite frontend
│   ├── src/                            → Components, assets, styles, app entry
│   ├── public/                         → Static assets
│   ├── dist/                           → Production build output
│   ├── index.html                      → HTML shell
│   ├── netlify.toml                    → Netlify deployment config
│   ├── vite.config.js                  → Vite configuration
│   ├── tailwind.config.js              → Tailwind configuration
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── package-lock.json
│
├── package.json                        → Root scripts (e.g. concurrently runner)
├── package-lock.json
└── README.md
```

</details>

---

## Folder Breakdown

| Folder / File | Type | Description |
|---|---|---|
| `Backend/` | Package | Node.js + Express REST API |
| `Backend/src/` | Source | Config, controllers, models, routes, and utils |
| `Backend/scratch/` | Dev | Scratch space for local/dev experimentation |
| `Backend/temp_runs/` | Runtime | Temporary artifacts from code execution / test runs |
| `Backend/seedProblems.js` | Script | Seeds quiz/problem data into MongoDB |
| `Backend/server.js` | Entry | Server entry point |
| `signin-signup_frontend/` | Package | React + Vite frontend app |
| `signin-signup_frontend/src/` | Source | Components, assets, styles, app entry |
| `signin-signup_frontend/dist/` | Build | Production build output |
| `signin-signup_frontend/netlify.toml` | Config | Netlify deployment configuration |
| `signin-signup_frontend/vite.config.js` | Config | Vite build configuration |
| `package.json` (root) | Config | Root-level scripts to run Backend + Frontend together |
| `.env` | Secret | Environment variables (git ignored) |

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Google OAuth (`@react-oauth`)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT + Google OAuth
- **Deployment:** Netlify (frontend)
- **Dev tooling:** `concurrently` to run Backend and Frontend in parallel from the root

---

## Getting Started

### Install all dependencies
Run this from the project root, then in each subfolder as needed:
```bash
npm install
```

### Run Backend + Frontend together (from root)
```bash
npm run dev
```
> Uses `concurrently` to start both the Backend server and the Frontend dev server.

### Run individually

**Backend**
```bash
cd Backend
npm install
npm run dev
```

**Frontend**
```bash
cd signin-signup_frontend
npm install
npm run dev
```

---

## Seeding Data

To populate the database with initial problem/quiz data:
```bash
cd Backend
node seedProblems.js
```

---

## Environment Variables

Create a `.env` file inside `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## Deployment

The frontend (`signin-signup_frontend/`) is configured for **Netlify** deployment via `netlify.toml`, building to the `dist/` folder.
