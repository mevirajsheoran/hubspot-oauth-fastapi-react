# Contributing to Pipeline AI Integration Manager
# ===============================================

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- Redis server running on port 6379
- Git

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/mevirajsheoran/hubspot-oauth-fastapi-react.git
   cd hubspot-oauth-fastapi-react
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Copy example environment file
   cp .env.example .env
   # Edit .env with your credentials
   ```

## 📝 Development Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `docs/documentation-updates` - Documentation changes

### Commit Messages
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
- `feat(auth): Add OAuth2 flow for HubSpot integration`
- `fix(api): Handle timeout errors in Redis operations`
- `docs(readme): Update installation instructions`

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Lint Python code
cd backend
flake8 integrations/
black main.py

# Lint JavaScript code
cd frontend
npm run lint
```

## 🎯 Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints for all functions
- Write comprehensive docstrings
- Maximum line length: 88 characters

### JavaScript (Frontend)
- Use ES6+ features
- Implement proper error boundaries
- Add JSDoc comments for components
- Follow Material-UI best practices

## 📁 Project Structure

```
├── backend/                 # FastAPI application
│   ├── integrations/        # Platform-specific integrations
│   ├── main.py            # FastAPI app entry point
│   └── redis_client.py     # Redis utilities
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── integrations/  # Platform-specific UI
│   │   └── utils/         # Helper utilities
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## 🤝 Contribution Types

We welcome contributions in the following areas:

1. **New Integrations** - Add support for new platforms
2. **Bug Fixes** - Fix reported issues
3. **Documentation** - Improve README and code docs
4. **UI/UX** - Enhance user interface
5. **Performance** - Optimize application performance
6. **Testing** - Add or improve test coverage

## 📋 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the style guidelines
3. **Test thoroughly** - Ensure all tests pass
4. **Update documentation** - If needed
5. **Submit a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

## 🏷️ Issue Reporting

When reporting bugs, please include:
- Environment details (OS, Node.js version, Python version)
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Screenshots if applicable

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Acknowledgments

Thank you for contributing to making Pipeline AI Integration Manager better!
