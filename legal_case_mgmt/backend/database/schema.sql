-- Users table (needed for attorney and task assignments)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL, -- admin, attorney, paralegal, staff
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Attorneys table
CREATE TABLE IF NOT EXISTS attorneys (
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

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
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

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
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

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
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

-- Filings table
CREATE TABLE IF NOT EXISTS filings (
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

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
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

-- Events table
CREATE TABLE IF NOT EXISTS events (
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

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
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

-- Task Checklists table
CREATE TABLE IF NOT EXISTS task_checklists (
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

-- Task Comments table
CREATE TABLE IF NOT EXISTS task_comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Task Attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (document_id) REFERENCES documents(document_id)
);

-- Task Templates table
CREATE TABLE IF NOT EXISTS task_templates (
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

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
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

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
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

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
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