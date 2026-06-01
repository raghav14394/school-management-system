# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://client/package.json)
- [vite.config.js](file://client/vite.config.js)
- [api.js](file://client/src/api.js)
- [App.jsx](file://client/src/App.jsx)
- [main.jsx](file://client/src/main.jsx)
- [package.json](file://server/package.json)
- [server.js](file://server/server.js)
- [db.js](file://server/config/db.js)
- [server-memory.js](file://server/server-memory.js)
- [seed.js](file://server/seed.js)
- [start.bat](file://start.bat)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation and Setup](#installation-and-setup)
4. [Environment Setup](#environment-setup)
5. [Database Configuration](#database-configuration)
6. [Initial Application Launch](#initial-application-launch)
7. [Development Workflow](#development-workflow)
8. [Build Processes](#build-processes)
9. [Basic Usage Examples](#basic-usage-examples)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)

## Introduction
This guide helps new developers set up and run the Educational Management System (EMS) locally. The system consists of:
- A React-based client application (frontend) using Vite for development and building
- An Express.js server (backend) with two operational modes:
  - In-memory mode for quick local development
  - MongoDB-backed mode for persistent data storage

The application supports multiple user roles (admin, teacher, student, parent) with role-based routing and protected routes.

## System Requirements
- Operating System: Windows, macOS, or Linux
- Node.js: Version 18.x or later
- npm: Included with Node.js
- Git: Optional, for cloning the repository
- Text editor or IDE: VS Code recommended

These requirements align with the project's scripts and tooling:
- Client uses Vite and React
- Server uses Express and Node.js
- Scripts reference Node.js executables and npm commands

**Section sources**
- [package.json:1-34](file://client/package.json#L1-L34)
- [package.json:1-21](file://server/package.json#L1-L21)

## Installation and Setup
Follow these steps to install dependencies for both client and server:

1. Open a terminal/command prompt in the repository root.
2. Install client dependencies:
   - Run: `npm install` inside the `client` directory
3. Install server dependencies:
   - Run: `npm install` inside the `server` directory

Verification:
- Both directories should now contain a `node_modules` folder after installation completes.

Notes:
- The client uses Vite for development and building, while the server uses Express for the API.
- Scripts for both projects are defined in their respective `package.json` files.

**Section sources**
- [package.json:6-11](file://client/package.json#L6-L11)
- [package.json:6-10](file://server/package.json#L6-L10)

## Environment Setup
The server supports two modes of operation. Choose one based on your needs.

### Option A: In-Memory Mode (Recommended for Local Development)
- Starts the server without requiring MongoDB.
- Automatically seeds demo data for immediate use.
- Ideal for local development and testing.

To run in-memory mode:
- Use the provided batch script: `start.bat`
- Alternatively, run the server manually:
  - From the `server` directory, execute: `node server-memory.js`

Expected behavior:
- The server logs indicate it is running in-memory mode.
- Demo users are available for login (see "Initial Application Launch").

**Section sources**
- [start.bat:10-13](file://start.bat#L10-L13)
- [server-memory.js:89-128](file://server/server-memory.js#L89-L128)

### Option B: MongoDB Mode (Persistent Data)
- Requires a running MongoDB instance.
- Uses Mongoose models and routes for data persistence.
- Useful for production-like environments or when you need persistent state.

To run MongoDB mode:
- Ensure MongoDB is installed and running.
- Set the connection URI via the `MONGODB_URI` environment variable.
- From the `server` directory, execute: `npm run start:mongo`

Database connection:
- The server attempts to connect to MongoDB using the configured URI.
- On successful connection, the server logs confirm the connection host.

**Section sources**
- [server.js:9-10](file://server/server.js#L9-L10)
- [db.js:3-11](file://server/config/db.js#L3-L11)
- [package.json:7-8](file://server/package.json#L7-L8)

## Database Configuration
This section covers both in-memory and MongoDB configurations.

### In-Memory Mode
- No external database required.
- Data is stored in memory and seeded automatically when the server starts.
- Demo users and entities are created programmatically.

Key behaviors:
- Automatic seeding occurs during startup.
- Token generation and verification are handled internally.
- No environment variables are required for this mode.

**Section sources**
- [server-memory.js:91-124](file://server/server-memory.js#L91-L124)

### MongoDB Mode
- Requires setting the `MONGODB_URI` environment variable.
- The server connects to MongoDB using Mongoose.
- Models and routes are defined under the `server/models` and `server/routes` directories respectively.

Connection flow:
- The server loads environment variables.
- It attempts to connect to MongoDB using the provided URI.
- On failure, the process exits with an error message.

**Section sources**
- [db.js:3-11](file://server/config/db.js#L3-L11)
- [server.js:6-10](file://server/server.js#L6-L10)

## Initial Application Launch
Launch the application using the provided batch script for convenience.

Steps:
1. Double-click `start.bat` in the repository root.
2. The script:
   - Starts the backend server in-memory mode
   - Waits briefly for the server to become ready
   - Starts the frontend using Vite
3. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

Demo credentials:
- Admin: admin@school.com / admin123
- Teacher: john.smith@school.com / teacher123
- Student: student1@school.com / student123
- Parent: parent1@school.com / parent123

Notes:
- The client proxies API requests from `/api` to the backend server.
- Authentication tokens are stored in the browser's local storage.

**Section sources**
- [start.bat:1-38](file://start.bat#L1-L38)
- [vite.config.js:7-15](file://client/vite.config.js#L7-L15)
- [api.js:8-25](file://client/src/api.js#L8-L25)

## Development Workflow
The development workflow leverages Vite for the client and Node.js for the server.

Client development:
- Start the React development server:
  - From the `client` directory, run: `npm run dev`
  - Vite serves the app on port 3000 with hot module replacement enabled
- Proxy configuration forwards `/api` requests to the backend server

Server development:
- Start the Express server:
  - From the `server` directory, run: `node server-memory.js` (for in-memory mode)
  - Or run: `node server.js` (for MongoDB mode)
- The server exposes REST endpoints under `/api/*`

Routing and protection:
- The client enforces role-based routing and protected routes.
- Authentication interceptors attach tokens to outgoing requests and handle 401 responses.

**Section sources**
- [package.json:6-11](file://client/package.json#L6-L11)
- [vite.config.js:7-15](file://client/vite.config.js#L7-L15)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)
- [api.js:8-25](file://client/src/api.js#L8-L25)
- [package.json:6-10](file://server/package.json#L6-L10)

## Build Processes
Build the client application for production deployment.

Client build:
- From the `client` directory, run: `npm run build`
- Vite compiles the React application into optimized static assets in the `dist` folder
- Preview the built application locally: `npm run preview`

Server considerations:
- The server is a Node.js/Express application and does not require a separate build step.
- For MongoDB mode, ensure the `MONGODB_URI` environment variable is set before deployment.

**Section sources**
- [package.json:8-10](file://client/package.json#L8-L10)
- [package.json:6-8](file://server/package.json#L6-L8)

## Basic Usage Examples
This section demonstrates common tasks using the application.

Logging in:
- Navigate to the login page at the frontend URL.
- Use one of the demo credentials to sign in.
- After successful authentication, the client stores the token and redirects to the user's role-specific dashboard.

Admin actions:
- Access admin dashboards and manage users, classes, fees, and notices.
- Use the admin role to create and modify entities.

Teacher actions:
- Mark attendance for students in assigned classes.
- Upload exam results and assignments.

Student actions:
- View personal attendance, results, fees, timetable, and notices.

Parent actions:
- View child-related information including attendance, results, and fees.

Note:
- Role-based routing ensures users only access permitted areas.
- Protected routes redirect unauthenticated users to the login page.

**Section sources**
- [App.jsx:26-72](file://client/src/App.jsx#L26-L72)
- [api.js:8-25](file://client/src/api.js#L8-L25)

## Troubleshooting Guide
Common issues and resolutions:

- Port conflicts:
  - The client runs on port 3000; the server runs on port 5000.
  - If either port is busy, update the Vite server configuration or environment variables accordingly.

- CORS errors:
  - The server enables CORS for all routes.
  - Ensure the client and server are running on the expected ports.

- Authentication failures:
  - If receiving 401 errors, the token may be missing or invalid.
  - Clear local storage and log in again.
  - Verify that the interceptor attaches the Authorization header.

- MongoDB connectivity:
  - For MongoDB mode, ensure the `MONGODB_URI` environment variable is set correctly.
  - Confirm the MongoDB instance is reachable and accepting connections.

- In-memory mode limitations:
  - Data resets when the server restarts.
  - Use this mode for development and testing.

**Section sources**
- [vite.config.js:7-15](file://client/vite.config.js#L7-L15)
- [api.js:8-25](file://client/src/api.js#L8-L25)
- [db.js:3-11](file://server/config/db.js#L3-L11)
- [server.js:14-16](file://server/server.js#L14-L16)

## Conclusion
You now have the essentials to set up, configure, and run the Educational Management System locally. Use the in-memory mode for quick development, and switch to MongoDB mode when you need persistent data. Leverage the provided scripts and configurations to streamline your workflow, and refer to the troubleshooting section if you encounter issues.