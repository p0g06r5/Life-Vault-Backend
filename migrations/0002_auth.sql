CREATE TABLE IF NOT EXISTS auth_credentials (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,salt TEXT NOT NULL,hash TEXT NOT NULL,iterations INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiration ON auth_sessions(expires_at);
CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY,attempts INTEGER NOT NULL DEFAULT 0,window_start INTEGER NOT NULL);
