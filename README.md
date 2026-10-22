# SafeDrop: Parcel and Delivery Management System with SafeRoute Reports API

SafeDrop is a MERN stack web application that manages parcel deliveries from start to finish. Customers create and track parcels, admins assign delivery agents, and agents update delivery status and report road problems.

Its special feature is the **SafeRoute score**: every parcel gets a safety score (0 to 100) for its delivery area, based on road issues reported nearby.

## Features

- Customers can register, log in, create parcels and track them
- Admins can view all parcels and assign delivery agents
- Agents can update parcel status and report road issues
- Road issue reports with location (flooding, potholes, accidents, roadblocks)
- SafeRoute safety score for every parcel
- Public parcel tracking using a tracking ID
- Secure login with JWT and role-based access

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Bootstrap 5, Axios, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Security | JWT, bcrypt |

## User Roles

| Role | Can do |
|---|---|
| Customer | Register and login, create parcel, view my parcels, track parcel, view reports |
| Agent | See assigned parcels, update parcel status, report an issue, view reports |
| Admin | See all parcels, assign an agent, report an issue, manage reports (resolve or reject), view report statistics |
| Public | Track a parcel with its tracking ID |

## Parcel Delivery Flow

1. Customer creates a parcel and gets a tracking ID
2. Admin assigns a delivery agent
3. Agent picks up the parcel
4. Agent delivers it (in-transit)
5. Customer receives the parcel (delivered)

Parcel status values: `pending`, `picked`, `in-transit`, `delivered`, `cancelled`.
Only the assigned agent can change the status of a parcel.

## SafeRoute Safety Score

1. Find active reports within 2 km of the delivery location (MongoDB `$near`)
2. Start with a score of 100
3. Subtract 20 for each high, 10 for each medium and 5 for each low severity report
4. The score never goes below 0

| Score | Meaning |
|---|---|
| 70 to 100 | Safe (green) |
| 40 to 69 | Caution (yellow) |
| 0 to 39 | Risky (red) |

Example: one high and one low severity report nearby gives 100 - 20 - 5 = **75 / 100 (Safe)**.

## Database Design (MongoDB)

- **users**: name, email (unique), password (hashed), role
- **parcels**: trackingId, sender, receiverName, phone, address, weight, deliveryLocation (lng, lat), status, assignedAgent
- **routereports**: category, description, severity, location (lng, lat), city, status, reportedBy

Location fields use a `2dsphere` index so MongoDB can search by distance.

## API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Login and get a token |
| GET | `/api/auth/agents` | Admin | List delivery agents |
| POST | `/api/parcels` | Customer | Create a parcel |
| GET | `/api/parcels` | Logged in | Parcels based on role |
| GET | `/api/parcels/track/:trackingId` | Public | Track parcel and safety score |
| PUT | `/api/parcels/:id/assign` | Admin | Assign an agent |
| PUT | `/api/parcels/:id/status` | Agent | Update parcel status |
| POST | `/api/reports` | Agent, Admin | Add a road issue report |
| GET | `/api/reports` | Public | List reports with filters |
| GET | `/api/reports/stats` | Public | Reports count per category |
| PUT | `/api/reports/:id/status` | Admin | Resolve or reject a report |

## Project Structure

```
.
├── safedrop-frontend/   # React + Vite app
├── server/              # Express backend (controllers, middleware, models, routes)
└── backend-changes/     # Extra backend files (getAgents.js, trackParcel.js)
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB (local installation or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder (see `.env.example`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the server:

```bash
node server.js
```

### 3. Set up the frontend

```bash
cd safedrop-frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Future Scope

- Show road reports on a map
- Live GPS tracking of agents
- Email or SMS notifications
- Charts and analytics for the admin
- Online payment and a mobile app

## Author

Aashna
