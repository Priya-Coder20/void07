# Campus Connect - Unified Campus Management Platform

Campus Connect is a full-stack application for managing campus activities, users, and resources. It features role-based access for Admins, Staff, and Students.

## Features

- **Authentication**: Secure login with JWT and Role-Based Access Control (RBAC).
- **Admin**:
    - Create and manage Student and Staff accounts.
    - Post announcements.
    - Manage resource bookings.
    - View dashboard statistics.
- **Staff**:
    - Upload schedules and study materials.
    - Manage resource bookings.
    - View dashboard.
- **Student**:
    - View schedules and study materials.
    - Book resources (Library, Lab, etc.).
    - View announcements.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Auth**: JWT, Bcrypt

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally (or update MONGO_URI in backend/.env)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in `backend/` with:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/campus-connect
    JWT_SECRET=your_jwt_secret_key_here
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start Backend**:
    ```bash
    cd backend
    npm run dev
    ```
    Server will run on `http://localhost:5000`.

2.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    App will run on `http://localhost:3000`.

## Seed Data (Optional)

To create an initial Admin account, you can use a tool like Postman or create a seed script.
For now, you can register a user manually via MongoDB or use the provided API endpoints if registration was public (it's not).
**Recommended**: Use a seed script or manually insert an admin user into MongoDB.

Example Admin User Object:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "hashed_password_here",
  "role": "admin"
}
```
(Note: Password must be hashed. You might want to temporarily enable a register route or use a script).

## API Endpoints

- **Auth**: `/api/auth/login`
- **Users**: `/api/users` (Admin only)
- **Content**: `/api/content` (Schedules, Materials, Announcements)
- **Bookings**: `/api/bookings`

