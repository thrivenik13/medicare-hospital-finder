# Medicare Hospital Finder

This project is a starter app for discovering nearby hospitals and Medicare-covered services using location-based search and interactive hospital listings.

## Features

- Search hospitals by city, state, ZIP code, and specialty
- Filter results for Medicare-accepted facilities
- View hospital ratings, distance, and service type
- Frontend + backend architecture for easy extension

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Data: JSON sample hospital dataset

## Getting started

1. Install dependencies from the root:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

3. Visit:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

## Example API calls

```bash
curl "http://localhost:5000/api/hospitals?city=Austin&state=TX"
curl "http://localhost:5000/api/hospitals?specialty=Cardiology"
```

## Project structure

```text
medicare-hospital-finder/
├── backend/
│   ├── data/
│   │   └── hospitals.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
├── package.json
└── README.md
```
