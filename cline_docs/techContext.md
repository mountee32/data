# Technical Context

## Technology Stack

### Frontend
- React (Latest LTS)
- Material UI (MUI) for components
- React Router for navigation
- Axios/fetch for API calls

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- JWT Authentication
- Uvicorn/Gunicorn server

### Database
- SQLite (initial PoC)
- Potential upgrade path to PostgreSQL for scaling

### AI Integration
- External AI service (e.g., OpenAI) or local model
- REST API integration

## Development Setup

### Frontend Requirements
- Node.js environment
- npm/yarn package manager
- Development server on port 3000

### Backend Requirements
- Python virtual environment
- FastAPI and dependencies
- Running on port 8000
- Environment variables for configuration

## Technical Constraints

### Security
- JWT token-based authentication
- Password encryption (bcrypt/argon2)
- CORS configuration
- Role-based access control

### Data Storage
- SQLite for initial PoC phase
- File storage considerations for documents
- Potential encryption at rest for sensitive data

### Performance
- Limited by SQLite concurrent connections
- AI service response times
- File size limitations for uploads

### Scalability
- Single-server deployment for PoC
- Potential migration path to PostgreSQL
- Containerization support via Docker

## API Structure
- /auth/* - Authentication endpoints
- /documents/* - Document management
- /documents/{id}/summarize - AI integration
- /documents/search - Search functionality