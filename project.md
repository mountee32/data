# Technical Software Architecture Specification

This document describes the architecture and design of a proof-of-concept (PoC) system that enables users (e.g., lawyers, paralegals) to manage and analyze legal documents, leveraging an AI summarization feature. The stack includes:

- **Frontend**: React + Material UI  
- **Backend**: FastAPI (Python)  
- **Database**: SQLite  
- **AI Integration**: Simple summarization endpoint (e.g., via OpenAI API or a local model)

The goal is to provide a functional PoC with user authentication, document management, AI-based summarization, and basic search functionality.

---

## 1. Overview

**Purpose**  
- Showcase a prototype that handles legal documents, from uploading and storing to generating AI-based summaries.

**Key Functionalities**  
1. **User Authentication** (login/logout)  
2. **Case/Document CRUD** (create, read, update, delete records)  
3. **File Upload** (storing documents)  
4. **AI Summarization** (send document text to AI model, store/display the summary)  
5. **Search** (basic keyword search within documents)

---

## 2. System Architecture Diagram

scss
Copy code
    ┌────────────────────┐          ┌─────────────────────────────┐
    │    React Client    │          │        AI Model or         │
    │ (Material UI SPA)  │          │ External AI Service (e.g., │
    │                    │          │     OpenAI, HuggingFace)    │
    └─────────▲──────────┘          └──────────────▲─────────────┘
              │                                     │
        (HTTPS)│                               (HTTPS or local)
              │                                     │
    ┌─────────▼──────────────────────────────────────▼───────────┐
    │                           FastAPI                           │
    │  - User Auth, CRUD, File Upload, Summarization Endpoints    │
    │  - Orchestration, AI Service Calls, DB Access               │
    └─────────▲────────────────────────────────────────────────────┘
              │
        (SQLite DB)
              ▼
    ┌────────────────┐
    │    SQLite DB   │
    └────────────────┘
markdown
Copy code

1. **React Client**: Renders the user interface, communicates with FastAPI endpoints.  
2. **FastAPI**: Hosts the REST (or GraphQL) endpoints, handles business logic, integrates with AI services, and reads/writes to SQLite.  
3. **SQLite**: Stores user data, case metadata, references to uploaded files, and AI summaries.  
4. **AI Model / External API**: Summarization can be done via an external service (e.g., OpenAI) or a self-hosted model.

---

## 3. System Components

### 3.1 Front-End (React + Material UI)

**Project Structure** (example):
frontend/ ├── public/ ├── src/ │ ├── components/ │ │ ├── Layout/ │ │ ├── Forms/ │ │ ├── ... │ ├── pages/ │ │ ├── LoginPage.jsx │ │ ├── DashboardPage.jsx │ │ └── ... │ ├── services/ │ │ └── api.js │ ├── App.jsx │ ├── index.js │ └── ... └── package.json

markdown
Copy code

**Key Libraries**  
- **React** (latest LTS)  
- **Material UI** (MUI) for design components (AppBar, Table, Dialogs, etc.)  
- **React Router** for client-side routing (optional but recommended)  
- **Axios** or `fetch` for network requests

**Core UI Features**  
- **Login Page**: Collects username/password, retrieves JWT/Session from the server.  
- **Dashboard** (cases/documents list): Displays a table or list with “create,” “edit,” “delete,” and “view details” actions.  
- **Case/Document Form**: Allows creation or editing of metadata (title, description, etc.).  
- **Upload Button**: Lets users upload files for AI summarization.  
- **AI Summaries**: Displays AI-generated summaries in a card or modal.  
- **Search Bar**: Filters documents by keywords.

### 3.2 Back-End (FastAPI)


markdown
Copy code

**Core Modules**  
- **Authentication** (`auth.py`):  
  - Endpoints: `/login`, `/logout`, `/register` (if needed).  
  - Uses JSON Web Tokens (JWT) or session-based auth with OAuth2 in FastAPI.  

- **Documents CRUD** (`documents.py`):  
  - Endpoints:  
    - `GET /documents`  
    - `POST /documents`  
    - `PATCH /documents/{id}`  
    - `DELETE /documents/{id}`  
    - `POST /documents/upload`  

- **AI Summarization** (`ai.py`):  
  - Endpoint: `POST /documents/{id}/summarize`.  
  - Calls external AI API or local model, processes text.  
  - Stores result in `summaries` table or as a field in `documents` table.  

- **Search** (could be part of `documents.py` or separate `search.py`):  
  - Endpoint: `GET /documents/search?query=...` for a keyword-based search (SQLite `LIKE` queries, or more advanced indexing if needed).

**Data Access Layer**  
- **SQLite**:  
  - Use **SQLAlchemy** for schema definitions, migrations if needed.  
  - Potential Tables:
    - `users` (id, username, password hash, roles)  
    - `documents` (id, title, filename, content, created_at, user_id)  
    - `summaries` (id, document_id, summary_text, created_at)

  Example `Document` model:
  ```python
  from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
  from datetime import datetime
  from .database import Base

  class Document(Base):
      __tablename__ = 'documents'
      id = Column(Integer, primary_key=True, index=True)
      title = Column(String, nullable=False)
      filename = Column(String, nullable=True)
      content = Column(Text, nullable=True)
      created_at = Column(DateTime, default=datetime.utcnow)
      user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
Security

JWT: Generate tokens on login, store them client-side in React (in memory or HttpOnly cookie).
CORS: Enable CORS in FastAPI for your React domain.
Role-based Access Control (RBAC) if needed (e.g., admin vs. standard user).
4. Data Flow
User Logs In

React calls POST /auth/login with credentials.
FastAPI validates user, returns a JWT.
React stores the token (in memory or HttpOnly cookie).
User Creates or Views Documents

React calls GET /documents with an Authorization header.
FastAPI queries SQLite, returns a list of documents in JSON.
React renders the data in a Material UI table.
User Uploads a File

React sends a multipart/form-data request to POST /documents/upload.
FastAPI saves the file to disk or the database, updates the documents table.
Returns newly created record with metadata.
AI Summarization

React calls POST /documents/{id}/summarize.
FastAPI fetches the document’s text from content (or file), sends it to an AI service (e.g., OpenAI) or local model.
Summarized text is returned, stored in the DB, and displayed to the user.
Search

React calls GET /documents/search?query=....
FastAPI searches the documents table using a basic LIKE query or more advanced indexing.
Returns matching documents in JSON.
5. Deployment & Environment
5.1 Local Development
Frontend:

Run npm install (or yarn) in frontend/.
npm start to launch the dev server on http://localhost:3000.
Backend:

Create a Python virtual environment:
bash
Copy code
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Run FastAPI with Uvicorn:
bash
Copy code
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
5.2 Production
Frontend Build:

npm run build to produce a static production bundle.
Serve via NGINX or a cloud host (e.g., AWS S3 + CloudFront).
Backend:

Containerize with Docker (create a Dockerfile that sets up Python, installs FastAPI & requirements).
Run Uvicorn or Gunicorn behind an NGINX reverse proxy.
For persistent storage, ensure SQLite is on a persistent volume; for larger deployments, use PostgreSQL.
5.3 Configuration
Environment variables (e.g., .env or system variables) for:
makefile
Copy code
SECRET_KEY="some-random-key"
AI_API_KEY="openai-key-or-similar"
Load with Python’s os.getenv or a library like python-dotenv.
6. Security & Compliance
Data Protection

Encrypt user passwords with bcrypt or argon2.
Consider storing files securely (encrypt at rest) if they contain sensitive data.
Authentication

Enforce JWT token expiry (e.g., 15–60 minutes).
Optionally implement refresh tokens or session rolling for extended sessions.
Access Control

Restrict edit/delete to the document’s owner or an admin.
Consider multi-tenancy constraints if multiple organizations use the system.
Logging & Auditing

Log critical actions (file uploads, document edits) for traceability.
Avoid storing sensitive content in logs.
7. Testing & Quality
Unit Tests

Backend: Use Pytest for each endpoint (auth, CRUD, AI).
Frontend: Use Jest/React Testing Library for component tests.
Integration Tests

Automated or manual tests simulating user flows (login → create document → upload file → summarize → search).
Performance Considerations

For PoC, performance is less critical, but caching AI calls or limiting file size helps.
SQLite is fine for a small pilot; switch to PostgreSQL if concurrency or data volume grows.
Continuous Integration

Use GitHub Actions or another CI to run tests on pull requests.
8. Project Deliverables
Working React Frontend

Material UI layout, CRUD interfaces, file upload, AI summarization, search.
Functional FastAPI Backend

Auth, data persistence in SQLite, AI integration endpoint(s).
Documentation

README for local installation and running.
High-level user guide for login, upload, summarizing documents, etc.
Basic Automated Tests

Coverage for critical paths (auth, CRUD, AI).