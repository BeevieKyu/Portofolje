
# Spanish Poker Dice Platform - Setup Guide

## Quick start

### 1. Start Backend
```bash
cd idg2100-2026-oblig3-frontend-BeevieKyu/backend/project
npm install
npm run seed
npm run dev
```
output should be: `Server running on http://localhost:6767`

### 2. Start Frontend in a Second Terminal
```bash
cd idg2100-2026-oblig3-frontend-BeevieKyu/frontend
npm install
npm run dev
```
output should be: `Local: http://localhost:6969`

### 3. Open Browser
Open: **http://localhost:6969**

## Backend Setup

### 1. Navigate to Backend
```bash
cd idg2100-2026-oblig3-frontend-BeevieKyu/backend/project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Ensure MongoDB Is Running
The backend requires MongoDB. Default connection in `.env`:

`MONGO_URI=mongodb://localhost:27017/spanish_poker`

### 4. Seed Database
```bash
npm run seed
```
The seed will create some sample data in the database:
- test users with varied Elo ratings
- matches
- tournaments

### 5. Start Backend
```bash
npm run dev
```
Backend runs on `http://localhost:6767`

## Frontend Setup

### 1. Navigate to Frontend
```bash
cd idg2100-2026-oblig3-frontend-BeevieKyu/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Frontend runs on `http://localhost:6969`

- setup guide was made with help from Ben(shoxxza) Hughes Tretnes.