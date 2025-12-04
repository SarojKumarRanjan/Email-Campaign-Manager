# Email Campaign Manager

A comprehensive solution for managing email campaigns, contacts, and subscriptions. This project consists of a Go backend and a frontend (under development).

## Project Structure

- **`backend/`**: The server-side application written in Go. It provides a RESTful API for managing users, contacts, campaigns, and templates.
- **`frontend/`**: The client-side application (Currently in initial setup).

## Backend

The backend is built using Go (Golang) and follows a clean architecture pattern.

### Technology Stack

- **Language**: Go 1.25+
- **Database**: MySQL
- **Router**: Standard library `net/http` with `ServeMux`
- **Authentication**: JWT (JSON Web Tokens) & OAuth2 (Google)
- **Testing**: `testify`, `go-sqlmock`

### Prerequisites

- Go 1.25 or higher
- MySQL Server

### Getting Started

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    go mod download
    ```

3.  **Configuration:**
    Create a `.env` file in the `backend` directory. You can use the following template:

    ```env
    # Server Configuration
    PORT=8080
    ENV=development

    # Database Configuration
    DB_USER=root
    DB_PASSWORD=password
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=email_campaign

    # JWT Configuration
    JWT_SECRET=your_super_secret_key
    JWT_EXPIRATION=24h

    # OAuth2 Configuration (Google)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback

    # SMTP Configuration (For sending emails)
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your_email@example.com
    SMTP_PASSWORD=your_email_password
    ```

4.  **Run the Application:**
    ```bash
    go run cmd/api/main.go
    ```
    The server will start on `http://localhost:8080` (or the port specified in `.env`).

### Running Tests

To run the integration and unit tests:

```bash
go test ./... -v
```

### API Endpoints

The API is versioned (e.g., `/api/v1`). Key resource groups include:

-   **Auth**: `/api/v1/auth` (Register, Login, Google OAuth, Profile)
-   **Users**: `/api/v1/users` (User management)
-   **Contacts**: `/api/v1/contacts` (CRUD for contacts)
-   **Campaigns**: `/api/v1/campaigns` (Create and manage email campaigns)
-   **Templates**: `/api/v1/templates` (Email templates)
-   **Tags**: `/api/v1/tags` (Contact tagging)
-   **Analytics**: `/api/v1/analytics` (Campaign performance stats)
-   **Settings**: `/api/v1/settings` (System and SMTP settings)

## Frontend

*Documentation coming soon.*

The frontend application is located in the `frontend/` directory.
