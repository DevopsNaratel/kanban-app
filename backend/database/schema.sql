-- Kanban App Database Schema

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS columns CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create boards table
CREATE TABLE boards (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) NOT NULL,
  last_updated BIGINT NOT NULL,
  is_starred BOOLEAN DEFAULT false,
  last_viewed BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create columns table
CREATE TABLE columns (
  id VARCHAR(255) PRIMARY KEY,
  board_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  column_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_columns_order ON columns("order");
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_boards_starred ON boards(is_starred);
CREATE INDEX idx_boards_last_updated ON boards(last_updated);

-- Insert sample data (optional - for testing)
-- Sample user
-- Password hash for 'password123'
INSERT INTO users (id, email, password_hash, name)
VALUES (
  'user1',
  'demo@example.com',
  '$2a$10$YourHashedPasswordHere', 
  'Demo User'
);

-- Sample board for user1
INSERT INTO boards (id, user_id, title, description, color, last_updated, is_starred)
VALUES ('board1', 'user1', 'My First Board', 'Getting started with Kanban', '#3b82f6', EXTRACT(EPOCH FROM NOW()) * 1000, true);

-- Sample columns
INSERT INTO columns (id, board_id, title, "order")
VALUES 
  ('col1', 'board1', 'To Do', 0),
  ('col2', 'board1', 'In Progress', 1),
  ('col3', 'board1', 'Done', 2);

-- Sample tasks
INSERT INTO tasks (id, column_id, title, description, priority, due_date)
VALUES 
  ('task1', 'col1', 'Setup project', 'Initialize the project structure', 'high', '2025-01-05'),
  ('task2', 'col1', 'Design database', 'Create database schema', 'medium', '2025-01-10'),
  ('task3', 'col2', 'Build API', 'Implement REST API endpoints', 'high', '2025-01-15'),
  ('task4', 'col3', 'Setup frontend', 'Configure React application', 'low', NULL);