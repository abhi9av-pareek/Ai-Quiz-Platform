# BrainByte

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

> An AI-powered quiz platform built with React + Node.js

---

## Project Structure

<details>
<summary><b>Click to expand full structure</b></summary>

```
Brain-byte/
│
├── Backend/                            → Node.js + Express API
│   ├── src/
│   │   ├── config/                     → DB & env configuration
│   │   ├── controllers/
│   │   │   └── authController.js       → Auth logic (login/signup)
│   │   ├── models/
│   │   │   └── user.js                 → Mongoose user schema
│   │   ├── routes/                     → API route definitions
│   │   └── utils/                      → Helper functions
│   ├── server.js                       → Entry point
│   ├── package.json
│   ├── package-lock.json
│   └── .env                            → Ignored by git
│
└── signin-signup_frontend/             → React + Vite frontend
    ├── src/
    │   ├── assets/                     → Images, icons, fonts
    │   ├── components/
    │   │   ├── LoginModern.jsx          → Login page
    │   │   ├── Signup.jsx               → Signup page
    │   │   ├── Dashboard.jsx            → Main dashboard
    │   │   └── QuizSetup.jsx            → 4-step quiz configurator
    │   ├── styles/                     → Global styles
    │   ├── App.jsx                      → Root component & routes
    │   ├── main.jsx                     → React DOM entry
    │   ├── index.css                    → Base CSS
    │   └── tailwind.css                 → Tailwind imports
    ├── public/
    │   └── index.html                   → HTML shell
    ├── package.json
    ├── vite.config.js                   → Vite configuration
    ├── tailwind.config.js               → Tailwind configuration
    ├── postcss.config.js
    └── eslint.config.js
```

</details>

---

## Folder Breakdown

| Folder / File | Type | Description |
|---|---|---|
| `Backend/` | Package | Node.js + Express REST API |
| `Backend/src/config/` | Config | Database and environment setup |
| `Backend/src/controllers/authController.js` | Controller | Handles login & signup logic |
| `Backend/src/models/user.js` | Model | MongoDB user schema |
| `Backend/src/routes/` | Routes | API endpoint definitions |
| `Backend/src/utils/` | Utils | Reusable helper functions |
| `Backend/server.js` | Entry | Server entry point |
| `signin-signup_frontend/` | Package | React + Vite frontend app |
| `signin-signup_frontend/src/components/LoginModern.jsx` | Component | Modern login UI |
| `signin-signup_frontend/src/components/Signup.jsx` | Component | Signup UI |
| `signin-signup_frontend/src/components/Dashboard.jsx` | Component | Main dashboard |
| `signin-signup_frontend/src/components/QuizSetup.jsx` | Component | 4-step quiz setup flow |
| `signin-signup_frontend/src/App.jsx` | Root | App root & React Router setup |
| `signin-signup_frontend/vite.config.js` | Config | Vite build configuration |
| `.env` | Secret | Environment variables (git ignored) |

---

## Getting Started

### Backend
```bash
cd Backend
npm install
npm run dev
```

### Frontend
```bash
cd signin-signup_frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
