# Smart Waste Collection & Recycling Management Platform

A university-level MVP designed to demonstrate how a digital platform can improve council waste collection services, resident communication and recycling awareness.

## Features

- Collection schedule search
- Recycling guide search
- Waste issue reporting with reference numbers
- Admin dashboard
- Report status management
- Collection schedule CRUD
- Route planning prototype
- SQLite database
- Responsive interface

## Technologies

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- SQLite

## Installation

1. Install Node.js from https://nodejs.org
2. Open this project folder in VS Code.
3. Open Terminal in VS Code.
4. Run:

```bash
npm install
npm start
```

5. Open your browser and visit:

```text
http://localhost:3000
```

The SQLite database is created automatically when the app starts.

## Pages

- `/` Home
- `/schedule` Collection schedules
- `/recycling` Recycling guide
- `/report` Resident issue reporting
- `/routes` Route planning
- `/admin` Admin dashboard

## SDG 11

The project supports Sustainable Development Goal 11 by improving access to reliable waste services, recycling information and responsive local service reporting.

## Limitations

This is a student prototype. It uses sample data and does not include real council integrations, authentication, live GPS tracking or production-grade route optimisation.

## Future Improvements

- Secure authentication
- Email/SMS reminders
- Real address lookup
- Live vehicle GPS data
- Smart-bin sensors
- Route optimisation algorithms
- Maps
- Analytics charts
- Cloud deployment

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial smart waste management project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Recommended future commits:

```text
Add waste collection schedule
Add recycling guide
Add issue reporting feature
Add SQLite database
Add admin dashboard
Add collection management
Add route planning prototype
Improve responsive interface
Update project documentation
```