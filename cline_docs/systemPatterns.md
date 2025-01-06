# System Architecture & Patterns

## Frontend Architecture
1. Component Structure
   - Atomic design pattern
   - Reusable UI components
   - Container/Presenter pattern
   - Material UI theme customization

2. State Management
   - Redux for global state
   - React Query for server state
   - Local state for component-specific data
   - Redux middleware for side effects

3. Routing Structure
   - Protected routes
   - Role-based access
   - Nested routing for case management
   - Breadcrumb navigation

## Backend Architecture
1. API Layer (FastAPI)
   - RESTful endpoints
   - OpenAPI documentation
   - Rate limiting
   - Authentication middleware
   - CORS configuration

2. Service Layer
   - Business logic separation
   - AI service integration
   - Document processing service
   - Notification service
   - Caching service

3. Data Layer
   - Repository pattern
   - SQLAlchemy models
   - Data validation with Pydantic
   - Migration management
   - Connection pooling

## Database Schema

### Cases
```sql
CREATE TABLE cases (
    case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to INTEGER,
    client_id INTEGER,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);
```

### Clients
```sql
CREATE TABLE clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Documents
```sql
CREATE TABLE documents (
    document_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    version INTEGER DEFAULT 1,
    document_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

### Tasks
```sql
CREATE TABLE tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    status TEXT NOT NULL,
    priority TEXT,
    assigned_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);
```

### Users
```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Case Notes
```sql
CREATE TABLE case_notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    content TEXT NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

## AI Integration Patterns
1. Document Processing
   - Template-based generation
   - Content extraction
   - Summarization pipeline
   - Version comparison

2. Case Analysis
   - Precedent matching
   - Outcome prediction
   - Risk assessment
   - Timeline generation