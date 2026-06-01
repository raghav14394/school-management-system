# Core Models

<cite>
**Referenced Files in This Document**
- [User.js](file://server/models/User.js)
- [Student.js](file://server/models/Student.js)
- [Teacher.js](file://server/models/Teacher.js)
- [authController.js](file://server/controllers/authController.js)
- [auth.js](file://server/middleware/auth.js)
- [auth.js](file://server/routes/auth.js)
- [AuthContext.jsx](file://client/src/context/AuthContext.jsx)
- [api.js](file://client/src/api.js)
- [Login.jsx](file://client/src/pages/auth/Login.jsx)
- [db.js](file://server/config/db.js)
- [server.js](file://server/server.js)
- [adminController.js](file://server/controllers/adminController.js)
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
This document provides comprehensive data model documentation for the core User, Student, and Teacher models in the school management system. It explains the User base model with authentication fields, how Student and Teacher inherit from User, field definitions, validation rules, password hashing mechanisms, and role-based access patterns. It also documents the polymorphic relationship structure and demonstrates user creation, authentication workflows, and role-specific data access patterns.

## Project Structure
The system follows a layered architecture with clear separation between client-side React components and server-side Node.js/Express backend. Authentication is handled via JWT tokens, and user roles drive access control across routes.

```mermaid
graph TB
subgraph "Client"
AC["AuthContext.jsx"]
API["api.js"]
LG["Login.jsx"]
end
subgraph "Server"
SRV["server.js"]
DB["db.js"]
AUTH_ROUTE["routes/auth.js"]
AUTH_CTRL["controllers/authController.js"]
AUTH_MW["middleware/auth.js"]
MODEL_USER["models/User.js"]
MODEL_STUDENT["models/Student.js"]
MODEL_TEACHER["models/Teacher.js"]
end
AC --> API
LG --> AC
API --> AUTH_ROUTE
AUTH_ROUTE --> AUTH_CTRL
AUTH_CTRL --> MODEL_USER
AUTH_CTRL --> MODEL_STUDENT
AUTH_CTRL --> MODEL_TEACHER
AUTH_CTRL --> AUTH_MW
SRV --> AUTH_ROUTE
SRV --> DB
```

**Diagram sources**
- [server.js:1-38](file://server/server.js#L1-L38)
- [db.js:1-14](file://server/config/db.js#L1-L14)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)

**Section sources**
- [server.js:1-38](file://server/server.js#L1-L38)
- [db.js:1-14](file://server/config/db.js#L1-L14)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)

## Core Components
This section documents the three core models and their relationships.

- User Model
  - Purpose: Base model for all users with authentication fields and shared attributes.
  - Fields:
    - name: String, required, trimmed
    - email: String, required, unique, lowercase
    - password: String, required, minimum length 6
    - role: Enum ['admin', 'teacher', 'student', 'parent'], required
    - phone: String, default empty
    - address: String, default empty
    - profileImage: String, default empty
    - isActive: Boolean, default true
  - Validation:
    - Unique email constraint enforced at the database level.
    - Password minimum length enforced at the model level.
    - Role enum enforced at the model level.
  - Security:
    - Password hashing via bcrypt before save using a pre-save hook.
    - Password comparison method exposed via matchPassword.
  - Timestamps: createdAt, updatedAt managed automatically.

- Student Model
  - Purpose: Extends User with student-specific attributes and relationships.
  - Relationship: One-to-one with User via userId (ObjectId referencing User).
  - Fields:
    - userId: ObjectId, required, references User
    - classId: ObjectId, required, references Class
    - parentId: ObjectId, optional, references User (parent)
    - rollNumber: String, required, unique
    - admissionDate: Date, default current date
    - dateOfBirth: Date
    - gender: Enum ['Male', 'Female', 'Other']
    - bloodGroup: String, default empty
    - emergencyContact: String, default empty
  - Validation:
    - Unique rollNumber enforced at the database level.
    - Required fields enforced at the model level.
  - Timestamps: createdAt, updatedAt managed automatically.

- Teacher Model
  - Purpose: Extends User with teacher-specific attributes and relationships.
  - Relationship: One-to-one with User via userId (ObjectId referencing User).
  - Fields:
    - userId: ObjectId, required, references User
    - subject: String, required
    - qualification: String, default empty
    - experience: Number, default 0
    - joinDate: Date, default current date
    - salary: Number, default 0
  - Validation:
    - Required fields enforced at the model level.
  - Timestamps: createdAt, updatedAt managed automatically.

Key Implementation Notes:
- Polymorphic-like structure: Student and Teacher both reference the User model via userId, enabling role-specific profiles while sharing base authentication and personal data.
- Role-based access control: The role field determines access to routes and features in the backend and UI.
- Password handling: Hashing occurs automatically during User creation/update, and password verification uses bcrypt compare.

**Section sources**
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)

## Architecture Overview
The authentication and role-based access architecture integrates client-side React components with server-side controllers and middleware.

```mermaid
sequenceDiagram
participant C as "Client App"
participant AC as "AuthContext.jsx"
participant API as "api.js"
participant R as "routes/auth.js"
participant CTRL as "authController.js"
participant MW as "middleware/auth.js"
participant U as "User Model"
participant S as "Student Model"
participant T as "Teacher Model"
C->>AC : "login(email, password)"
AC->>API : "POST /api/auth/login"
API->>R : "Route /auth/login"
R->>CTRL : "login()"
CTRL->>U : "findOne({ email })"
U-->>CTRL : "User"
CTRL->>U : "matchPassword(password)"
U-->>CTRL : "Boolean"
CTRL->>CTRL : "generateToken(userId)"
CTRL-->>API : "{ token, user }"
API-->>AC : "{ token, user }"
AC->>AC : "store user in localStorage"
AC-->>C : "navigate to /{role}"
Note over C,MW : "Subsequent requests include Authorization : Bearer token"
C->>AC : "fetch protected data"
AC->>API : "GET /api/auth/me"
API->>R : "Route /auth/me"
R->>MW : "auth()"
MW->>U : "verify token and load user (without password)"
MW-->>R : "req.user"
R->>CTRL : "getMe()"
CTRL->>U : "findById(userId)"
CTRL->>S : "find student profile (if role == student)"
CTRL->>T : "find teacher profile (if role == teacher)"
CTRL-->>API : "combined user + role-specific profile"
API-->>AC : "profile data"
AC-->>C : "render dashboard"
```

**Diagram sources**
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)

## Detailed Component Analysis

### User Model
- Data Schema
  - name: String, required, trimmed
  - email: String, required, unique, lowercase
  - password: String, required, minimum length 6
  - role: Enum ['admin', 'teacher', 'student', 'parent'], required
  - phone: String, default empty
  - address: String, default empty
  - profileImage: String, default empty
  - isActive: Boolean, default true
- Validation Rules
  - Unique email enforced at the database level.
  - Minimum password length enforced at the model level.
  - Role enum enforced at the model level.
- Password Hashing
  - Pre-save hook generates salt and hashes password before saving.
  - matchPassword method compares entered password with stored hash.
- Access Patterns
  - Used as the base for role-specific profiles (Student, Teacher).
  - Role field drives middleware authorization checks.

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
+pre("save") hashPassword()
+matchPassword(enteredPassword) boolean
}
```

**Diagram sources**
- [User.js:1-27](file://server/models/User.js#L1-L27)

**Section sources**
- [User.js:1-27](file://server/models/User.js#L1-L27)

### Student Model
- Relationship to User
  - One-to-one via userId referencing User.
- Additional Fields
  - classId: ObjectId, required, references Class
  - parentId: ObjectId, optional, references User (parent)
  - rollNumber: String, required, unique
  - admissionDate: Date, default current date
  - dateOfBirth: Date
  - gender: Enum ['Male', 'Female', 'Other']
  - bloodGroup: String, default empty
  - emergencyContact: String, default empty
- Validation Rules
  - Unique rollNumber enforced at the database level.
  - Required fields enforced at the model level.
- Role-Specific Access
  - Students can access dashboards and views relevant to their class and parent/guardian information.

```mermaid
classDiagram
class Student {
+ObjectId userId
+ObjectId classId
+ObjectId parentId
+string rollNumber
+date admissionDate
+date dateOfBirth
+string gender
+string bloodGroup
+string emergencyContact
}
class User {
+string name
+string email
+string password
+string role
}
Student --> User : "userId references"
```

**Diagram sources**
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [User.js:1-27](file://server/models/User.js#L1-L27)

**Section sources**
- [Student.js:1-16](file://server/models/Student.js#L1-L16)

### Teacher Model
- Relationship to User
  - One-to-one via userId referencing User.
- Additional Fields
  - subject: String, required
  - qualification: String, default empty
  - experience: Number, default 0
  - joinDate: Date, default current date
  - salary: Number, default 0
- Validation Rules
  - Required fields enforced at the model level.
- Role-Specific Access
  - Teachers can manage attendance, exams, and class-related activities.

```mermaid
classDiagram
class Teacher {
+ObjectId userId
+string subject
+string qualification
+number experience
+date joinDate
+number salary
}
class User {
+string name
+string email
+string password
+string role
}
Teacher --> User : "userId references"
```

**Diagram sources**
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)
- [User.js:1-27](file://server/models/User.js#L1-L27)

**Section sources**
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)

### Authentication Workflow
- Registration
  - Client sends name, email, password, role, phone, address.
  - Backend checks for existing email, creates User, generates JWT token, returns user and token.
- Login
  - Client sends email and password.
  - Backend verifies credentials, checks isActive flag, generates JWT token, returns user and token.
- Profile Retrieval
  - Client sends Bearer token.
  - Backend decodes token, loads user without password, enriches with role-specific profile (student or teacher), returns combined profile.
- Password Change
  - Client sends currentPassword and newPassword.
  - Backend verifies current password, updates User.password, saves, returns success message.

```mermaid
sequenceDiagram
participant UI as "Login.jsx"
participant CTX as "AuthContext.jsx"
participant AX as "api.js"
participant RT as "routes/auth.js"
participant CTRL as "authController.js"
participant MDL as "User Model"
UI->>CTX : "login(email, password)"
CTX->>AX : "POST /api/auth/login"
AX->>RT : "Route /auth/login"
RT->>CTRL : "login()"
CTRL->>MDL : "findOne({ email })"
MDL-->>CTRL : "User"
CTRL->>MDL : "matchPassword(password)"
MDL-->>CTRL : "Boolean"
CTRL-->>AX : "{ token, user }"
AX-->>CTX : "{ token, user }"
CTX-->>UI : "navigate to /{role}"
```

**Diagram sources**
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [api.js:1-28](file://client/src/api.js#L1-L28)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [User.js:1-27](file://server/models/User.js#L1-L27)

**Section sources**
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [Login.jsx:1-100](file://client/src/pages/auth/Login.jsx#L1-L100)
- [AuthContext.jsx:1-53](file://client/src/context/AuthContext.jsx#L1-L53)
- [api.js:1-28](file://client/src/api.js#L1-L28)

### Role-Based Access Patterns
- Middleware Authorization
  - authorize(...roles): Checks if req.user.role is included in allowed roles.
  - Used to protect admin, teacher, and student routes.
- Route Protection Example
  - GET /api/admin/classes requires admin role.
  - GET /api/teacher/classes requires teacher role.
  - GET /api/student/dashboard requires student role.
- Client Navigation
  - After login, client navigates to /{role} based on user role.

```mermaid
flowchart TD
Start(["Request Received"]) --> CheckAuth["Verify Bearer Token"]
CheckAuth --> TokenValid{"Token Valid?"}
TokenValid --> |No| Deny401["Return 401 Unauthorized"]
TokenValid --> |Yes| LoadUser["Load User (no password)"]
LoadUser --> CheckRole["Check Role Against Allowed Roles"]
CheckRole --> RoleAllowed{"Role Authorized?"}
RoleAllowed --> |No| Deny403["Return 403 Forbidden"]
RoleAllowed --> |Yes| Next["Proceed to Controller"]
Deny401 --> End(["End"])
Deny403 --> End
Next --> End
```

**Diagram sources**
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)

**Section sources**
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)

### User Creation and Role-Specific Profiles
- Admin Controller Integration
  - On user creation, admin controller creates either a Student or Teacher profile depending on role.
  - Updates user fields and returns success response.
- Data Flow
  - Admin registers a new user (role, classId, rollNumber, subject, etc.).
  - Backend creates User and corresponding Student or Teacher profile.
  - Subsequent getMe returns combined user + role-specific profile.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant AdminCtrl as "adminController.js"
participant UserModel as "User Model"
participant StudentModel as "Student Model"
participant TeacherModel as "Teacher Model"
Admin->>AdminCtrl : "POST /api/admin/users (role, classId, rollNumber, subject, ...)"
AdminCtrl->>UserModel : "create({ role, ... })"
UserModel-->>AdminCtrl : "User"
alt role == 'student'
AdminCtrl->>StudentModel : "create({ userId, classId, rollNumber, ... })"
else role == 'teacher'
AdminCtrl->>TeacherModel : "create({ userId, subject, ... })"
end
AdminCtrl-->>Admin : "{ message, user }"
```

**Diagram sources**
- [adminController.js:62-86](file://server/controllers/adminController.js#L62-L86)
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)

**Section sources**
- [adminController.js:62-86](file://server/controllers/adminController.js#L62-L86)

## Dependency Analysis
The core models and controllers depend on Mongoose for schema definitions and MongoDB for persistence. Authentication relies on JWT and bcrypt for secure token generation and password hashing.

```mermaid
graph LR
U["User.js"] --> M["Mongoose"]
S["Student.js"] --> M
T["Teacher.js"] --> M
AC["authController.js"] --> U
AC --> S
AC --> T
AMW["auth.js (middleware)"] --> U
AR["routes/auth.js"] --> AC
AR --> AMW
SRV["server.js"] --> AR
SRV --> DB["db.js"]
```

**Diagram sources**
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [server.js:1-38](file://server/server.js#L1-L38)
- [db.js:1-14](file://server/config/db.js#L1-L14)

**Section sources**
- [User.js:1-27](file://server/models/User.js#L1-L27)
- [Student.js:1-16](file://server/models/Student.js#L1-L16)
- [Teacher.js:1-13](file://server/models/Teacher.js#L1-L13)
- [authController.js:1-107](file://server/controllers/authController.js#L1-L107)
- [auth.js:1-31](file://server/middleware/auth.js#L1-L31)
- [auth.js:1-13](file://server/routes/auth.js#L1-L13)
- [server.js:1-38](file://server/server.js#L1-L38)
- [db.js:1-14](file://server/config/db.js#L1-L14)

## Performance Considerations
- Password Hashing Cost: The bcrypt salt rounds are set to a moderate value suitable for development. For production, consider tuning based on hardware capabilities and security requirements.
- Indexing: Ensure unique indexes exist for email and rollNumber to optimize lookups.
- Token Expiration: Configure JWT expiration appropriately to balance security and user experience.
- Population: When retrieving user profiles, limit populated fields to reduce payload size.

## Troubleshooting Guide
- Authentication Failures
  - Invalid credentials: Occurs when email not found or password mismatch.
  - Account deactivated: isActive flag prevents login.
  - Missing or invalid Bearer token: Authorization middleware returns 401.
- Role Access Issues
  - 403 Forbidden indicates the user's role is not authorized for the requested route.
- Client-Side
  - API interceptor clears local storage on 401, redirecting to login page.
  - Demo accounts are available for testing different roles.

**Section sources**
- [authController.js:31-59](file://server/controllers/authController.js#L31-L59)
- [auth.js:4-19](file://server/middleware/auth.js#L4-L19)
- [api.js:16-25](file://client/src/api.js#L16-L25)

## Conclusion
The User, Student, and Teacher models form a robust foundation for the school management system. The User model encapsulates shared authentication and personal data, while Student and Teacher extend it with role-specific attributes. The system enforces strong validation, secure password handling, and role-based access control. The authentication workflow integrates seamlessly across client and server, enabling secure and efficient role-specific data access patterns.