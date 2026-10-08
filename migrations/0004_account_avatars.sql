CREATE TABLE IF NOT EXISTS user_avatars (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,image_data TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT (datetime('now')));
