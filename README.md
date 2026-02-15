
# TMUA Prep Platform

A comprehensive preparation platform for the Test of Mathematics for University Admission (TMUA), featuring practice tests, analytics, and membership management.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (Ensure your database is running)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project root.

2.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```

4.  **Environment Setup**:
    -   Ensure you have a `.env` file in the `server` directory with the following (example):
        ```env
        PORT=5000
        DATABASE_URL="postgresql://username:password@localhost:5432/tmua_db?schema=public"
        JWT_SECRET="your_super_secret_key"
        STRIPE_SECRET_KEY="sk_test_..."
        CLIENT_URL="http://localhost:5173"
        ```

---

## 🏃‍♂️ Running the Project

### Option 1: Quick Start (Windows)

Simply run the startup script in the root directory:

```powershell
.\start_project.ps1
```
*or*
```cmd
.\start_project.bat
```

### Option 2: Manual Start

You need to run the backend and frontend in separate terminals.

**Backend**:
```bash
cd server
npm run dev
```
*The server will start on `http://localhost:5000`*

**Frontend**:
```bash
cd client
npm run dev
```
*The client will start on `http://localhost:5173`*

---

## 📚 API Documentation

The backend provides a full Swagger UI documentation for testing and exploring the API.

**Access Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Key Endpoints Overview

#### 🔐 Authentication
*   `POST /api/auth/signup` - Register a new user.
*   `POST /api/auth/login` - Login and receive a JWT token.
*   `GET /api/auth/me` - Get current user profile (Protected).

#### 💳 Memberships
*   `GET /api/memberships/plans` - List available subscription plans.
*   `POST /api/memberships/checkout` - Create a Stripe checkout session.
*   `POST /api/memberships/verify` - Verify payment success.

#### 📝 Practice Sessions
*   `POST /api/sessions/start` - Generic start session endpoint.
*   `POST /api/sessions/submit` - Submit quiz results.
*   `GET /api/sessions/history` - Get user's past attempts.

#### 🛡️ Admin
*   `GET /api/admin/users` - List all users.
*   `GET /api/admin/stats` - System-wide statistics.

### Authentication Headers

Most endpoints are protected. You must include the JWT token received from login in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
-   **Backend**: Node.js, Express
-   **Database**: PostgreSQL, Prisma ORM
-   **Payments**: Stripe
-   **Docs**: Swagger (OpenAPI 3.0)
