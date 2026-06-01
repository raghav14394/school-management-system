# Authentication System

<cite>
**Referenced Files in This Document**
- [AuthContext.jsx](file://client/src/context/AuthContext.jsx)
- [Login.jsx](file://client/src/pages/auth/Login.jsx)
- [api.js](file://client/src/api.js)
- [App.jsx](file://client/src/App.jsx)
- [authController.js](file://server/controllers/authController.js)
- [auth.js](file://server/middleware/auth.js)
- [auth.js](file://server/routes/auth.js)
- [User.js](file://server/models/User.js)
- [server.js](file://server/server.js)
- [db.js](file://server/config/db.js)
- [package.json](file://server/package.json)
- [package.json](file://client/package.json)
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
This document explains the authentication system for the School Management System. It covers the end-to-end login/logout flow, password hashing, JWT token generation and validation, frontend state management with React’s Context API, and backend middleware protection. It also documents error handling, security measures, and provides examples of successful authentication flows and common errors.

## Project Structure
The authentication system spans two applications:
- Frontend (React): Handles user input, form submission, local storage persistence, and API communication.
- Backend (Express + MongoDB): Validates credentials, manages tokens, protects routes, and persists hashed passwords.

```mermaid
graph TB
subgraph "Client (React)"
C_Login["Login.jsx"]
C_API["api.js"]
C_AuthCtx["AuthContext.jsx"]
C_App["App.jsx"]
end
subgraph "Server (Express)"
S_Server["server.js"]
S_Routes["routes/auth.js"]
S_MW["middleware/auth.js"]
S_Ctrl["controllers/authController.js"]
S_Model["models/User.js"]
S_DB["config/db.js"]
end
C_Login --> C_AuthCtx
C_AuthCtx --> C_API
C_API --> S_Server
S_Server --> S_Routes
S_Routes --> S_MW
S_MW --> S_Ctrl
S_Ctrl --> S_Model
S_Server --> S_DB
```

**Diagram sources**
- [server.js:19-27](file://server/server.js#L19-L27)
- [routes/auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [middleware/auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [controllers/authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [models/User.js:1-27](file://server/models/User.js#L1-L27)
- [config/db.js:1-14](file://server/config/db.js#L1-L14)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)

**Section sources**
- [server.js:19-27](file://server/server.js#L19-L27)
- [routes/auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [middleware/auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [controllers/authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [models/User.js:1-27](file://server/models/User.js#L1-L27)
- [config/db.js:1-14](file://server/config/db.js#L1-L14)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)

## Core Components
- Frontend authentication state and HTTP client:
  - AuthContext manages user session, login, register, logout, and profile updates with localStorage persistence.
  - API client injects Authorization header automatically and handles 401 responses.
  - Login page captures credentials, submits via AuthContext, and navigates on success.
  - ProtectedRoute enforces authentication and role checks.
- Backend authentication pipeline:
  - Routes expose /auth/register, /auth/login, /auth/me, /auth/profile, and /auth/change-password.
  - Middleware verifies JWT and attaches user to request.
  - Controller validates credentials, generates tokens, and returns protected data.
  - User model hashes passwords and compares entered passwords.

Security highlights:
- Passwords are hashed with bcrypt before storage.
- JWT secret and expiry are configured via environment variables.
- Token is sent in Authorization header as Bearer token.
- Protected routes enforce role-based authorization.

**Section sources**
- [AuthContext.jsx:8-52](file://client/src/context/AuthContext.jsx#L8-L52)
- [api.js:8-25](file://client/src/api.js#L8-L25)
- [Login.jsx:15-27](file://client/src/pages/auth/Login.jsx#L15-L27)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [authController.js:10-59](file://server/controllers/authController.js#L10-L59)
- [User.js:15-24](file://server/models/User.js#L15-L24)

## Architecture Overview
The authentication flow connects the React frontend to Express backend with JWT-based stateless sessions.

```mermaid
sequenceDiagram
participant U as "User"
participant L as "Login.jsx"
participant C as "AuthContext.login()"
participant A as "API client"
participant R as "routes/auth.js"
participant M as "middleware/auth.js"
participant T as "controllers/authController.js"
participant D as "models/User.js"
U->>L : "Submit email/password"
L->>C : "login(email, password)"
C->>A : "POST /api/auth/login"
A->>R : "HTTP request"
R->>T : "login handler"
T->>D : "find user by email"
T->>D : "matchPassword(entered)"
D-->>T : "match result"
T-->>A : "{_id,name,email,role,token}"
A-->>C : "response data"
C->>C : "persist to localStorage"
C-->>L : "user data"
L->>L : "navigate to /{role}"
```

**Diagram sources**
- [Login.jsx:15-27](file://client/src/pages/auth/Login.jsx#L15-L27)
- [AuthContext.jsx:20-25](file://client/src/context/AuthContext.jsx#L20-L25)
- [api.js:3-6](file://client/src/api.js#L3-L6)
- [routes/auth.js:6-7](file://server/routes/auth.js#L6-L7)
- [authController.js:31-59](file://server/controllers/authController.js#L31-L59)
- [User.js:22-24](file://server/models/User.js#L22-L24)

## Detailed Component Analysis

### Frontend: AuthContext and API Client
- AuthContext:
  - Provides login, register, logout, updateProfile, and loading state.
  - Persists user object to localStorage after successful requests.
  - Reads initial user state from localStorage on mount.
- API client:
  - Injects Authorization: Bearer token from localStorage into outgoing requests.
  - On 401 response, clears localStorage and redirects to /login.

```mermaid
flowchart TD
Start(["AuthContext.login"]) --> PostReq["POST /api/auth/login"]
PostReq --> SetUser["Set user state"]
SetUser --> Persist["localStorage.setItem('user')"]
Persist --> Done(["Return data"])
```

**Diagram sources**
- [AuthContext.jsx:20-25](file://client/src/context/AuthContext.jsx#L20-L25)

**Section sources**
- [AuthContext.jsx:8-52](file://client/src/context/AuthContext.jsx#L8-L52)
- [api.js:8-25](file://client/src/api.js#L8-L25)

### Frontend: Login Page and Protected Routes
- Login page:
  - Captures email and password, toggles password visibility.
  - Submits via AuthContext.login, sets error messages, disables button during load.
  - On success, navigates to role-specific dashboard.
- ProtectedRoute:
  - Blocks unauthenticated users and enforces role-based access.

```mermaid
flowchart TD
Enter(["Login Form Submit"]) --> Validate["Validate inputs"]
Validate --> CallLogin["AuthContext.login()"]
CallLogin --> Resp{"Response OK?"}
Resp --> |Yes| Store["Persist user in localStorage"]
Store --> Navigate["Redirect to /{role}"]
Resp --> |No| ShowErr["Show error message"]
ShowErr --> End(["Idle"])
Navigate --> End
```

**Diagram sources**
- [Login.jsx:15-27](file://client/src/pages/auth/Login.jsx#L15-L27)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)

**Section sources**
- [Login.jsx:15-27](file://client/src/pages/auth/Login.jsx#L15-L27)
- [App.jsx:18-24](file://client/src/App.jsx#L18-L24)

### Backend: Authentication Controller
- Registration:
  - Checks for existing user by email.
  - Creates user record and returns token.
- Login:
  - Finds user by email, checks isActive, compares password.
  - Generates JWT token and returns user profile plus token.
- Profile endpoints:
  - getMe merges role-specific profiles for student/teacher.
  - updateProfile and changePassword operate on authenticated user.

```mermaid
flowchart TD
RC(["POST /auth/register"]) --> Exists{"Email exists?"}
Exists --> |Yes| Err400["Return 400: already exists"]
Exists --> |No| CreateUser["Create User record"]
CreateUser --> GenToken["Generate JWT"]
GenToken --> Ok201["Return user + token"]
LC(["POST /auth/login"]) --> FindUser["Find by email"]
FindUser --> Found{"User found?"}
Found --> |No| Err401a["Return 401: invalid credentials"]
Found --> |Yes| Active{"isActive?"}
Active --> |No| Err401b["Return 401: deactivated"]
Active --> |Yes| Match["matchPassword()"]
Match --> MatchOk{"Password matches?"}
MatchOk --> |No| Err401c["Return 401: invalid credentials"]
MatchOk --> |Yes| GenToken2["Generate JWT"]
GenToken2 --> Ok200["Return user + token"]
```

**Diagram sources**
- [authController.js:10-29](file://server/controllers/authController.js#L10-L29)
- [authController.js:31-59](file://server/controllers/authController.js#L31-L59)

**Section sources**
- [authController.js:10-29](file://server/controllers/authController.js#L10-L29)
- [authController.js:31-59](file://server/controllers/authController.js#L31-L59)
- [authController.js:61-90](file://server/controllers/authController.js#L61-L90)

### Backend: JWT Middleware and Authorization
- auth middleware:
  - Extracts Bearer token from Authorization header.
  - Verifies token against JWT_SECRET and decodes user id.
  - Attaches user object (without password) to request.
- authorize higher-order function:
  - Enforces role-based access control by checking allowed roles.

```mermaid
sequenceDiagram
participant C as "Client"
participant MW as "auth middleware"
participant V as "jwt.verify"
participant DB as "User.findById"
C->>MW : "Request with Authorization : Bearer ..."
MW->>MW : "Extract token"
MW->>V : "Verify token"
V-->>MW : "decoded {id}"
MW->>DB : "Find user by id (select -password)"
DB-->>MW : "user"
MW-->>C : "Next() to protected route"
```

**Diagram sources**
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)

**Section sources**
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [auth.js:21-28](file://server/middleware/auth.js#L21-L28)

### Backend: User Model and Password Hashing
- Pre-save hook:
  - Hashes password using bcrypt with salt rounds.
- Instance method:
  - Compares entered password with stored hash.

```mermaid
classDiagram
class User {
+string name
+string email
+string password
+string role
+string phone
+string address
+string profileImage
+boolean isActive
+matchPassword(enteredPassword) boolean
}
```

**Diagram sources**
- [User.js:4-24](file://server/models/User.js#L4-L24)

**Section sources**
- [User.js:15-24](file://server/models/User.js#L15-L24)

### Backend: Server Bootstrap and Environment
- Server initializes CORS and JSON middleware, mounts auth routes, and listens on configured port.
- Database connection is established via config module.
- Dependencies include bcryptjs, jsonwebtoken, mongoose, dotenv.

```mermaid
graph LR
S["server.js"] --> R["routes/auth.js"]
S --> DB["config/db.js"]
R --> MW["middleware/auth.js"]
MW --> CTRL["controllers/authController.js"]
CTRL --> MODEL["models/User.js"]
```

**Diagram sources**
- [server.js:14-27](file://server/server.js#L14-L27)
- [config/db.js:3-11](file://server/config/db.js#L3-L11)

**Section sources**
- [server.js:14-27](file://server/server.js#L14-L27)
- [config/db.js:3-11](file://server/config/db.js#L3-L11)
- [package.json:11-19](file://server/package.json#L11-L19)

## Dependency Analysis
- Client depends on axios for HTTP, react-router-dom for routing, and lucide-react for icons.
- Server depends on express, jsonwebtoken, bcryptjs, mongoose, dotenv, and cors.
- Frontend AuthContext depends on API client; API client depends on localStorage for token retrieval.
- Backend routes depend on auth middleware; controller depends on User model.

```mermaid
graph TB
subgraph "Client"
AX["axios"]
RR["react-router-dom"]
AC["AuthContext.jsx"]
AP["api.js"]
LG["Login.jsx"]
end
subgraph "Server"
EX["express"]
JM["jsonwebtoken"]
BC["bcryptjs"]
MG["mongoose"]
DN["dotenv"]
CR["cors"]
RT["routes/auth.js"]
MW["middleware/auth.js"]
CT["controllers/authController.js"]
UM["models/User.js"]
end
AC --> AP
LG --> AC
AP --> AX
RT --> MW
MW --> JM
CT --> UM
UM --> BC
CT --> MG
RT --> EX
EX --> CR
EX --> DN
```

**Diagram sources**
- [package.json:12-19](file://client/package.json#L12-L19)
- [package.json:11-19](file://server/package.json#L11-L19)
- [AuthContext.jsx:1-2](file://client/src/context/AuthContext.jsx#L1-L2)
- [api.js:1](file://client/src/api.js#L1)
- [routes/auth.js:1](file://server/routes/auth.js#L1)
- [middleware/auth.js:1](file://server/middleware/auth.js#L1)
- [controllers/authController.js:1](file://server/controllers/authController.js#L1)
- [models/User.js](file://server/models/User.js)

**Section sources**
- [package.json:12-19](file://client/package.json#L12-L19)
- [package.json:11-19](file://server/package.json#L11-L19)

## Performance Considerations
- Token verification occurs on every protected request; keep JWT_SECRET strong and rotate periodically.
- bcrypt cost can be tuned; current salt rounds are standard but may impact login latency under load.
- Avoid sending sensitive fields in responses; the controller already excludes password.
- Consider adding rate limiting on /auth/login to mitigate brute-force attempts.
- Use HTTPS in production to protect tokens in transit.

## Troubleshooting Guide
Common authentication errors and causes:
- 401 Not authorized, no token:
  - Cause: Missing or malformed Authorization header.
  - Fix: Ensure API client injects Bearer token from localStorage.
- 401 Not authorized, token failed:
  - Cause: Invalid/expired JWT or wrong JWT_SECRET.
  - Fix: Verify environment variables and token validity.
- 401 Invalid credentials:
  - Cause: Wrong email/password combination.
  - Fix: Prompt user to re-enter credentials.
- 401 Account is deactivated:
  - Cause: User marked inactive.
  - Fix: Contact administrator to activate account.
- 403 Role is not authorized:
  - Cause: Insufficient privileges for requested route.
  - Fix: Ensure user has correct role.

Frontend error handling:
- Login page displays error messages returned by backend.
- API interceptor clears localStorage and redirects to /login on 401.

**Section sources**
- [auth.js:10-18](file://server/middleware/auth.js#L10-L18)
- [authController.js:35-44](file://server/controllers/authController.js#L35-L44)
- [api.js:18-24](file://client/src/api.js#L18-L24)
- [Login.jsx:22-23](file://client/src/pages/auth/Login.jsx#L22-L23)

## Conclusion
The authentication system combines secure password hashing, JWT-based session tokens, and robust middleware protection. The React frontend centralizes authentication state and integrates seamlessly with the backend via a clean API client. By enforcing role-based access and handling errors gracefully, the system provides a reliable foundation for the School Management System.