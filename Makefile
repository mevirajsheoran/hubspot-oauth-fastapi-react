# Makefile for Pipeline AI Integration Manager
# =============================================

.PHONY: help install backend frontend test lint format docker clean

# Default target
help:
	@echo "Available targets:"
	@echo "  install      - Install all dependencies"
	@echo "  backend      - Start backend development server"
	@echo "  frontend     - Start frontend development server"
	@echo "  test         - Run all tests"
	@echo "  test-backend - Run backend tests only"
	@echo "  test-frontend - Run frontend tests only"
	@echo "  lint         - Run all linters"
	@echo "  lint-backend - Run backend linters (flake8, black)"
	@echo "  lint-frontend - Run frontend linters (eslint)"
	@echo "  format       - Format all code"
	@echo "  format-backend - Format backend code with black"
	@echo "  format-frontend - Format frontend code"
	@echo "  docker       - Start all services with Docker Compose"
	@echo "  docker-build - Build all Docker images"
	@echo "  clean        - Clean up generated files and caches"
	@echo "  redis        - Start Redis locally"
	@echo "  setup        - Initial project setup"

# Installation
install: install-backend install-frontend

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install-dev:
	cd backend && pip install -r requirements.txt && pip install pytest black flake8
	cd frontend && npm install

# Development servers
backend:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm start

redis:
	docker run -d --name pipeline-redis -p 6379:6379 redis:7-alpine || docker start pipeline-redis

# Testing
test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest -v

test-frontend:
	cd frontend && npm test -- --watchAll=false

# Linting
lint: lint-backend lint-frontend

lint-backend:
	cd backend && flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	cd backend && black --check .

lint-frontend:
	cd frontend && npm run lint

# Formatting
format: format-backend format-frontend

format-backend:
	cd backend && black .

format-frontend:
	cd frontend && npm run format

# Docker
docker:
	docker-compose up -d

docker-build:
	docker-compose build

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Setup
setup:
	cp .env.example .env
	@echo "Please edit .env file with your credentials before starting"
	make install

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name ".DS_Store" -delete 2>/dev/null || true
	cd frontend && rm -rf build node_modules 2>/dev/null || true
	cd backend && rm -rf __pycache__ .pytest_cache htmlcov 2>/dev/null || true

# Git helpers
commit:
	git add -A
	@read -p "Commit message: " msg; \
	git commit -m "$$msg"

push:
	git push

pull:
	git pull --rebase

status:
	git status

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	# Add staging deployment commands here

deploy-production:
	@echo "Deploying to production..."
	# Add production deployment commands here

# Security scan
security-scan:
	trivy fs .

# Documentation
docs:
	@echo "Generating documentation..."
	cd backend && python -m pydoc -w main

# Backup
backup:
	docker exec pipeline-redis redis-cli BGSAVE

# All-in-one commands
dev: redis backend frontend

all: install test lint
