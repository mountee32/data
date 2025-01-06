# System Architecture & Patterns

## Entity Model

### Case (Primary Entity)
```sql
CREATE TABLE cases (
    case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    case_type TEXT NOT NULL, -- civil, criminal, corporate, etc.
    court TEXT,
    jurisdiction TEXT,
    filing_date DATE,
    status TEXT NOT NULL, -- active, closed, pending, etc.
    description TEXT,
    practice_area TEXT, -- family law, criminal defense, etc.
    statute_of_limitations DATE,
    opposing_counsel TEXT,
    judge TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_attorney_id INTEGER,
    client_id INTEGER,
    FOREIGN KEY (assigned_attorney_id) REFERENCES attorneys(attorney_id),
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);
```

### Client
```sql
CREATE TABLE clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_type TEXT NOT NULL, -- individual, corporation
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_id TEXT,
    date_of_birth DATE,
    occupation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Document
```sql
CREATE TABLE documents (
    document_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- contract, pleading, evidence, correspondence
    version INTEGER DEFAULT 1,
    content TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
```

### Filing
```sql
CREATE TABLE filings (
    filing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    document_id INTEGER,
    filing_type TEXT NOT NULL, -- complaint, motion, brief, etc.
    filing_date DATE NOT NULL,
    filing_number TEXT,
    court TEXT NOT NULL,
    status TEXT NOT NULL, -- draft, filed, accepted, rejected
    deadline_date DATE,
    response_due_date DATE,
    filing_fee DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filed_by INTEGER,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (document_id) REFERENCES documents(document_id),
    FOREIGN KEY (filed_by) REFERENCES users(user_id)
);
```

### Attorney
```sql
CREATE TABLE attorneys (
    attorney_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    bar_number TEXT UNIQUE,
    practice_areas TEXT, -- JSON array of practice areas
    hourly_rate DECIMAL(10,2),
    status TEXT NOT NULL, -- active, inactive, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Event
```sql
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- hearing, deposition, meeting, deadline
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    location TEXT,
    status TEXT NOT NULL, -- scheduled, completed, cancelled
    reminder_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);
```

### Evidence
```sql
CREATE TABLE evidence (
    evidence_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    document_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    evidence_type TEXT NOT NULL, -- physical, documentary, testimonial
    custody_chain TEXT,
    status TEXT NOT NULL, -- collected, processed, submitted
    collection_date DATE,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (document_id) REFERENCES documents(document_id)
);
```

### TimeEntry
```sql
CREATE TABLE time_entries (
    time_entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    attorney_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL, -- research, drafting, court appearance
    description TEXT NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    billable BOOLEAN DEFAULT TRUE,
    rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (attorney_id) REFERENCES attorneys(attorney_id)
);
```

### Contact
```sql
CREATE TABLE contacts (
    contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- witness, expert, opposing counsel
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);
```

### Expense
```sql
CREATE TABLE expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    expense_type TEXT NOT NULL, -- filing fee, travel, expert fee
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    reimbursed BOOLEAN DEFAULT FALSE,
    receipt_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);
```

### Task
```sql
CREATE TABLE tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL, -- legal_research, document_preparation, client_communication, court_filing, etc.
    priority TEXT NOT NULL, -- high, medium, low
    status TEXT NOT NULL, -- pending, in_progress, completed, blocked
    due_date TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    assigned_to INTEGER,
    assigned_by INTEGER,
    completion_date TIMESTAMP,
    parent_task_id INTEGER, -- for subtasks
    dependencies TEXT, -- JSON array of dependent task IDs
    recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- daily, weekly, monthly, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id)
);
```

### TaskCheckList
```sql
CREATE TABLE task_checklists (
    checklist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    item_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    completed_at TIMESTAMP,
    completed_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (completed_by) REFERENCES users(user_id)
);
```

### TaskComment
```sql
CREATE TABLE task_comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### TaskAttachment
```sql
CREATE TABLE task_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (document_id) REFERENCES documents(document_id)
);
```

### TaskTemplate
```sql
CREATE TABLE task_templates (
    template_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,
    estimated_hours DECIMAL(5,2),
    checklist_items TEXT, -- JSON array of default checklist items
    case_type TEXT, -- specific case type this template applies to
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Entity Relationships

1. Case (Primary Entity)
   - Has one Client
   - Has many Documents
   - Has many Filings
   - Has many Events
   - Has many Evidence items
   - Has many Time Entries
   - Has many Contacts
   - Has many Expenses
   - Has one or more assigned Attorneys

2. Client
   - Has many Cases
   - Has many Contacts

3. Document
   - Belongs to one Case
   - May be associated with one Filing
   - May be associated with one Evidence item

4. Filing
   - Belongs to one Case
   - May have one associated Document

5. Attorney
   - Has many Cases
   - Has many Time Entries
   - Associated with one User account

6. Evidence
   - Belongs to one Case
   - May have one associated Document

7. Task
   - Belongs to one Case
   - Has one assigned User
   - Has one assigning User
   - May have one parent Task
   - Has many child Tasks (subtasks)
   - Has many TaskCheckList items
   - Has many TaskComments
   - Has many TaskAttachments
   - May be based on a TaskTemplate

8. TaskTemplate
   - Can be used to create many Tasks
   - Associated with specific case types

The task management system supports:
1. Hierarchical task organization (tasks and subtasks)
2. Task dependencies and relationships
3. Detailed checklists for complex procedures
4. Task templates for common legal workflows
5. Time tracking (estimated vs actual hours)
6. Task comments and document attachments
7. Recurring tasks for regular case activities
8. Priority and status tracking
9. Assignment and delegation
10. Progress monitoring through checklists

This model captures the complex relationships and data requirements of a legal case management system while maintaining data integrity and supporting comprehensive case tracking and management.