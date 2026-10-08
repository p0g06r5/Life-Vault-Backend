-- All private records are owned by a user. Do not expose rows without authentication.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS collections (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 place TEXT NOT NULL DEFAULT '',
 happened_on TEXT,
 story TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id,updated_at);
CREATE TABLE IF NOT EXISTS memories (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 content TEXT NOT NULL DEFAULT '',
 happened_on TEXT,
 kind TEXT NOT NULL DEFAULT 'Moment',
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id,updated_at);
CREATE TABLE IF NOT EXISTS media (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 storage_key TEXT NOT NULL UNIQUE,
 content_type TEXT NOT NULL,
 size_bytes INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS collection_media (
 collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
 media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
 caption TEXT NOT NULL DEFAULT '',
 position INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY (collection_id,media_id)
);
CREATE TABLE IF NOT EXISTS portfolios (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL DEFAULT '',
 headline TEXT NOT NULL DEFAULT '',
 about TEXT NOT NULL DEFAULT '',
 location TEXT NOT NULL DEFAULT '',
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS portfolio_entries (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 section TEXT NOT NULL CHECK(section IN ('experience','projects','education','certifications')),
 title TEXT NOT NULL,
 organization TEXT NOT NULL DEFAULT '',
 period TEXT NOT NULL DEFAULT '',
 description TEXT NOT NULL DEFAULT '',
 link TEXT NOT NULL DEFAULT '',
 position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_portfolio_entries_user ON portfolio_entries(user_id,section);
CREATE TABLE IF NOT EXISTS portfolio_skills (
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 PRIMARY KEY(user_id,name)
);
CREATE TABLE IF NOT EXISTS share_links (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TEXT,
 revoked_at TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_share_links_user ON share_links(user_id);
