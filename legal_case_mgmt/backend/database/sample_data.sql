-- Sample Users
INSERT INTO users (username, email, password_hash, role) VALUES
('john.doe', 'john.doe@law.com', 'hashed_password_1', 'attorney'),
('jane.smith', 'jane.smith@law.com', 'hashed_password_2', 'attorney'),
('bob.admin', 'bob.admin@law.com', 'hashed_password_3', 'admin'),
('sara.para', 'sara.para@law.com', 'hashed_password_4', 'paralegal');

-- Sample Attorneys
INSERT INTO attorneys (user_id, bar_number, practice_areas, hourly_rate, status) VALUES
(1, 'BAR123', '["criminal", "family"]', 250.00, 'active'),
(2, 'BAR456', '["corporate", "civil"]', 300.00, 'active');

-- Sample Clients
INSERT INTO clients (client_type, name, email, phone, address, tax_id) VALUES
('individual', 'Alice Johnson', 'alice@email.com', '555-0101', '123 Main St', 'TAX123'),
('corporation', 'Tech Corp Inc', 'legal@techcorp.com', '555-0102', '456 Business Ave', 'CORP789');

-- Sample Cases
INSERT INTO cases (case_number, title, case_type, court, jurisdiction, status, practice_area, assigned_attorney_id, client_id) VALUES
('2024-CR-001', 'State v. Johnson', 'criminal', 'Superior Court', 'State', 'active', 'criminal', 1, 1),
('2024-CV-002', 'Tech Corp v. Innovation Ltd', 'civil', 'District Court', 'Federal', 'active', 'corporate', 2, 2);

-- Sample Documents
INSERT INTO documents (case_id, title, document_type, version, content, created_by) VALUES
(1, 'Initial Complaint', 'pleading', 1, 'Sample complaint content...', 1),
(1, 'Evidence List', 'evidence', 1, 'List of evidence items...', 1),
(2, 'Contract Draft', 'contract', 1, 'Contract terms...', 2);

-- Sample Filings
INSERT INTO filings (case_id, document_id, filing_type, filing_date, court, status, filed_by) VALUES
(1, 1, 'complaint', '2024-01-01', 'Superior Court', 'filed', 1),
(2, 3, 'motion', '2024-01-02', 'District Court', 'draft', 2);

-- Sample Evidence
INSERT INTO evidence (case_id, document_id, title, evidence_type, status) VALUES
(1, 2, 'Security Camera Footage', 'documentary', 'collected'),
(1, NULL, 'Physical Evidence Item #1', 'physical', 'processed');

-- Sample Events
INSERT INTO events (case_id, event_type, title, start_datetime, status) VALUES
(1, 'hearing', 'Initial Hearing', '2024-02-01 10:00:00', 'scheduled'),
(2, 'meeting', 'Client Consultation', '2024-02-02 14:00:00', 'scheduled');

-- Sample Tasks
INSERT INTO tasks (case_id, title, task_type, priority, status, assigned_to, assigned_by) VALUES
(1, 'Review Evidence', 'legal_research', 'high', 'pending', 1, 3),
(1, 'Draft Motion', 'document_preparation', 'medium', 'pending', 1, 3),
(2, 'Contract Review', 'legal_research', 'high', 'in_progress', 2, 3);

-- Sample Task Checklists
INSERT INTO task_checklists (task_id, item_text, order_index) VALUES
(1, 'Review security footage', 1),
(1, 'Document findings', 2),
(2, 'Research similar cases', 1),
(2, 'Outline key points', 2);

-- Sample Task Comments
INSERT INTO task_comments (task_id, user_id, content) VALUES
(1, 1, 'Started reviewing evidence materials'),
(2, 2, 'Found relevant precedent cases');

-- Sample Task Templates
INSERT INTO task_templates (title, task_type, estimated_hours, case_type) VALUES
('Initial Case Review', 'legal_research', 2.5, 'criminal'),
('Contract Draft Review', 'document_preparation', 1.5, 'corporate');

-- Sample Time Entries
INSERT INTO time_entries (case_id, attorney_id, activity_type, description, date, hours, rate) VALUES
(1, 1, 'research', 'Initial case research', '2024-01-03', 2.5, 250.00),
(2, 2, 'drafting', 'Contract review', '2024-01-03', 1.5, 300.00);

-- Sample Contacts
INSERT INTO contacts (case_id, name, role, email, phone) VALUES
(1, 'Dr. Expert', 'expert', 'expert@email.com', '555-0103'),
(2, 'Opposing Counsel', 'opposing counsel', 'opposing@law.com', '555-0104');

-- Sample Expenses
INSERT INTO expenses (case_id, expense_type, amount, date, description) VALUES
(1, 'filing fee', 350.00, '2024-01-01', 'Initial filing fee'),
(2, 'expert fee', 1500.00, '2024-01-02', 'Expert consultation');