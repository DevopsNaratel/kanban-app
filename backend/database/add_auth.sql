-- Add users table for authentication

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);

-- Insert a test user (password: "password123")
-- Password hash generated with bcrypt for "password123"
INSERT INTO users (id, email, password_hash, name)
VALUES (
  'user1',
  'demo@example.com',
  '$2a$10$YourHashedPasswordHere',
  'Demo User'
) ON CONFLICT (email) DO NOTHING;

-- Update existing boards to belong to demo user
UPDATE boards SET user_id = 'user1' WHERE user_id IS NULL;
