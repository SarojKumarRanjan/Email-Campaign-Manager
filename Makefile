.PHONY: backend frontend dev install install-backend install-frontend

# Default target
all: dev

# Start the backend server
backend:
	cd backend && go run cmd/api/main.go

# Start the frontend development server
frontend:
	cd frontend && pnpm dev

# Install dependencies for both
install: install-backend install-frontend

# Install backend dependencies
install-backend:
	cd backend && go mod download

# Install frontend dependencies
install-frontend:
	cd frontend && pnpm install

# Start both in parallel
# Note: use -j2 to run in parallel, e.g., make -j2 dev
dev:
	@make -j 2 backend frontend
