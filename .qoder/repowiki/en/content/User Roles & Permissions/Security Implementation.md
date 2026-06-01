# Security Implementation

<cite>
**Referenced Files in This Document**
- [server.js](file://server/server.js)
- [server-memory.js](file://server/server-memory.js)
- [auth.js](file://server/middleware/auth.js)
- [authController.js](file://server/controllers/authController.js)
- [User.js](file://server/models/User.js)
- [auth.js](file://server/routes/auth.js)
- [AuthContext.jsx](file://client/src/context/AuthContext.jsx)
- [api.js](file://client/src/api.js)
- [adminController.js](file://server/controllers/adminController.js)
- [db.js](file://server/config/db.js)
- [package.json](file://server/package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document details the security implementation of the School Management System, focusing on authentication and authorization mechanisms. It covers password encryption, sessionless JWT-based authentication, middleware protection, input handling, and client-side token management. It also outlines areas for improvement regarding input sanitization, SQL injection prevention (as applicable), XSS protection, security headers, CORS configuration, and operational monitoring.

## Project Structure
The system comprises:
- A Node.js/Express backend with MongoDB via Mongoose and an in-memory alternative for development
- React frontend with local storage for tokens and automatic bearer token injection
- Centralized authentication middleware enforcing JWT verification and role-based access control
- Controllers implementing registration, login, profile updates, and password changes
- A user model with bcrypt-based password hashing

```mermaid
graph TB
subgraph "Client"
AC["AuthContext.jsx"]
AX["api.js"]
end
subgraph "Server"
SRV["server.js"]
MEM["server-memory.js"]
DB["db.js"]
RT_AUTH["routes/auth.js"]
MW_AUTH["middleware/auth.js"]
CTRL_AUTH["controllers/authController.js"]
MODEL_USER["models/User.js"]
end
AC --> AX
AX --> SRV
SRV --> RT_AUTH
RT_AUTH --> CTRL_AUTH
CTRL_AUTH --> MODEL_USER
SRV --> DB
SRV --> MW_AUTH
MEM --> MW_AUTH
MEM --> CTRL_AUTH
```

**Diagram sources**
- [server.js:1-38](file://server/server.js#L1-L38)
- [server-memory.js:1-128](file://server/server-memory.js#L1-L128)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [db.js:1-14](file://server/config/db.js#L1-L14)

**Section sources**
- [server.js:1-38](file://server/server.js#L1-L38)
- [server-memory.js:1-128](file://server/server-memory.js#L1-L128)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [db.js:1-14](file://server/config/db.js#L1-L14)

## Core Components
- Password Encryption: bcryptjs is used in the user model to hash passwords during save hooks and compare during login.
- JWT Token Security: Tokens are generated with a secret and expiration, verified by middleware, and attached to requests via Authorization headers.
- Middleware Protection: Authentication middleware validates Bearer tokens; authorization middleware enforces role-based access.
- Access Control: Route handlers are protected by middleware, and admin endpoints enforce admin-only access.
- Client-Side Token Management: Axios interceptors automatically attach tokens; unauthorized responses trigger logout.

**Section sources**
- [User.js:15-24](file://server/models/User.js#L15-L24)
- [authController.js:6-8](file://server/controllers/authController.js#L6-L8)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [AuthContext.jsx:20-37](file://client/src/context/AuthContext.jsx#L20-L37)
- [api.js:8-25](file://client/src/api.js#L8-L25)

## Architecture Overview
The authentication flow integrates client and server components to securely manage user sessions without cookies.

```mermaid
sequenceDiagram
participant C as "Client App"
participant AX as "Axios Interceptor<br/>api.js"
participant S as "Express Server<br/>server.js"
participant R as "Routes<br/>routes/auth.js"
participant M as "Auth Middleware<br/>middleware/auth.js"
participant U as "User Model<br/>models/User.js"
participant A as "Auth Controller<br/>controllers/authController.js"
C->>AX : "POST /api/auth/login"
AX->>S : "HTTP Request with Authorization header"
S->>R : "Route dispatch"
R->>M : "Verify JWT"
M->>U : "Find user by decoded ID"
M-->>R : "Attach user to request"
R->>A : "Call login handler"
A->>U : "Compare password"
A-->>S : "Generate JWT and respond"
S-->>AX : "Response with token"
AX-->>C : "Store token in localStorage"
```

**Diagram sources**
- [server.js:14-28](file://server/server.js#L14-L28)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [User.js:22-24](file://server/models/User.js#L22-L24)
- [authController.js:31-59](file://server/controllers/authController.js#L31-L59)
- [api.js:8-14](file://client/src/api.js#L8-L14)
- [AuthContext.jsx:20-25](file://client/src/context/AuthContext.jsx#L20-L25)

## Detailed Component Analysis

### Password Encryption with bcrypt
- Hashing occurs in a pre-save hook to ensure plaintext passwords are never persisted.
- Password comparison uses bcrypt compare for login verification.
- Minimum password length is enforced in the schema.

```mermaid
flowchart TD
Start(["Save User"]) --> CheckMod["Check if password is modified"]
CheckMod --> |No| Next["Skip hashing"]
CheckMod --> |Yes| Salt["Generate salt"]
Salt --> Hash["Hash password with salt"]
Hash --> Save["Persist hashed password"]
Save --> End(["Done"])
Next --> End
```

**Diagram sources**
- [User.js:15-20](file://server/models/User.js#L15-L20)

**Section sources**
- [User.js:15-24](file://server/models/User.js#L15-L24)

### JWT Token Generation and Verification
- Token generation uses a secret and expiration configured via environment variables.
- Middleware extracts Bearer token from Authorization header, verifies signature, and attaches user to request.
- Role-based authorization middleware checks allowed roles.

```mermaid
flowchart TD
GenStart["Generate Token"] --> Sign["Sign payload with secret and expiry"]
Sign --> TokenOut["Return token"]
VerifyStart["Verify Token"] --> Extract["Extract token from Authorization header"]
Extract --> HasToken{"Token present?"}
HasToken --> |No| AuthFail["401 Not authorized"]
HasToken --> |Yes| Decode["Verify signature with secret"]
Decode --> Verified{"Valid and unexpired?"}
Verified --> |No| AuthFail
Verified --> |Yes| Attach["Attach user to request"]
Attach --> Next["Proceed to route handler"]
```

**Diagram sources**
- [authController.js:6-8](file://server/controllers/authController.js#L6-L8)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)

**Section sources**
- [authController.js:6-8](file://server/controllers/authController.js#L6-L8)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)

### Authentication Middleware and Authorization
- Authentication middleware validates tokens and populates req.user.
- Authorization middleware enforces role-based access control for protected routes.
- Routes for auth endpoints are mounted with appropriate middleware.

```mermaid
classDiagram
class AuthMiddleware {
+auth(req,res,next)
+authorize(...roles)(req,res,next)
}
class Routes {
+GET /auth/me
+PUT /auth/profile
+PUT /auth/change-password
}
class Controllers {
+getMe(req,res)
+updateProfile(req,res)
+changePassword(req,res)
}
AuthMiddleware <.. Routes : "applied to"
Routes --> Controllers : "call"
```

**Diagram sources**
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:61-106](file://server/controllers/authController.js#L61-L106)

**Section sources**
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:61-106](file://server/controllers/authController.js#L61-L106)

### Client-Side Token Management
- Axios interceptor injects Authorization header when a token exists.
- Unauthorized responses remove stored user data and redirect to login.
- Local storage persists user data after login/register.

```mermaid
sequenceDiagram
participant C as "Client App"
participant CTX as "AuthContext.jsx"
participant AX as "api.js"
participant S as "Server"
C->>CTX : "login(email,password)"
CTX->>S : "POST /api/auth/login"
S-->>CTX : "User with token"
CTX->>AX : "Store token in localStorage"
AX->>S : "Subsequent requests with Authorization"
S-->>AX : "401 Unauthorized"
AX->>CTX : "Remove user and redirect"
```

**Diagram sources**
- [AuthContext.jsx:20-37](file://client/src/context/AuthContext.jsx#L20-L37)
- [api.js:8-25](file://client/src/api.js#L8-L25)

**Section sources**
- [AuthContext.jsx:20-37](file://client/src/context/AuthContext.jsx#L20-L37)
- [api.js:8-25](file://client/src/api.js#L8-L25)

### Access Control and Protected Routes
- Admin endpoints are protected by both authentication and role-based authorization.
- Controllers handle user CRUD operations with proper error handling.

```mermaid
flowchart TD
Req["Incoming Request"] --> Auth["Auth Middleware"]
Auth --> Allowed{"Authorized?"}
Allowed --> |No| Deny["401/403"]
Allowed --> |Yes| Role["Authorize Roles"]
Role --> RoleOk{"Allowed role?"}
RoleOk --> |No| Deny
RoleOk --> |Yes| Handler["Controller Handler"]
Handler --> Resp["Response"]
```

**Diagram sources**
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)
- [adminController.js:20-37](file://server/controllers/adminController.js#L20-L37)

**Section sources**
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)
- [adminController.js:20-37](file://server/controllers/adminController.js#L20-L37)

### Database Connectivity and Environment Variables
- MongoDB connection uses environment variables for URI.
- JWT secret and expiration are environment variables used by controllers and middleware.

```mermaid
graph LR
ENV["Environment Variables"] --> DB["connectDB()<br/>config/db.js"]
ENV --> CTRL["generateToken()<br/>controllers/authController.js"]
ENV --> MW["jwt.verify()<br/>middleware/auth.js"]
```

**Diagram sources**
- [db.js:4-5](file://server/config/db.js#L4-L5)
- [authController.js:6-8](file://server/controllers/authController.js#L6-L8)
- [auth.js:13](file://server/middleware/auth.js#L13)

**Section sources**
- [db.js:4-5](file://server/config/db.js#L4-L5)
- [authController.js:6-8](file://server/controllers/authController.js#L6-L8)
- [auth.js:13](file://server/middleware/auth.js#L13)

## Dependency Analysis
- Express handles HTTP routing and middleware.
- jsonwebtoken signs and verifies tokens.
- bcryptjs hashes and compares passwords.
- dotenv loads environment variables.
- cors enables cross-origin requests.

```mermaid
graph TB
EX["express"] --> SRV["server.js"]
JWT["jsonwebtoken"] --> CTRL["authController.js"]
JWT --> MW["middleware/auth.js"]
BC["bcryptjs"] --> UM["models/User.js"]
DOT["dotenv"] --> SRV
DOT --> CTRL
DOT --> MW
CR["cors"] --> SRV
```

**Diagram sources**
- [package.json:11-19](file://server/package.json#L11-L19)
- [server.js:14-16](file://server/server.js#L14-L16)
- [authController.js:1](file://server/controllers/authController.js#L1)
- [auth.js:1](file://server/middleware/auth.js#L1)
- [User.js:2](file://server/models/User.js#L2)

**Section sources**
- [package.json:11-19](file://server/package.json#L11-L19)
- [server.js:14-16](file://server/server.js#L14-L16)

## Performance Considerations
- Token verification overhead is minimal; ensure JWT_SECRET is strong and long-lived tokens are avoided.
- bcrypt cost can be tuned to balance security and performance.
- Avoid excessive role checks in deeply nested middleware chains.

## Troubleshooting Guide
Common issues and resolutions:
- 401 Not authorized, no token: Ensure Authorization header is set with Bearer token.
- 401 token failed: Verify JWT_SECRET matches server configuration and token is unexpired.
- 403 Role not authorized: Confirm user role matches required roles for the endpoint.
- 500 errors: Check server logs for controller exceptions and database connectivity.

**Section sources**
- [auth.js:10-18](file://server/middleware/auth.js#L10-L18)
- [auth.js:23-25](file://server/middleware/auth.js#L23-L25)
- [authController.js:26-28](file://server/controllers/authController.js#L26-L28)

## Conclusion
The system implements robust authentication and authorization using bcrypt for password hashing and JWT for sessionless authentication. Middleware enforces token validation and role-based access control. Client-side token management ensures seamless user experiences while maintaining security boundaries. To further strengthen the system, consider input validation and sanitization, explicit CORS policy configuration, and comprehensive logging and monitoring for authentication events.