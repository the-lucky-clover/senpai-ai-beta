CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE companions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  personality_mix TEXT,
  maturity_toggle INTEGER DEFAULT 0,
  appearance TEXT,
  voice TEXT,
  memory TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  companion_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (companion_id) REFERENCES companions(id) ON DELETE CASCADE
);

CREATE TABLE community_items (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  image_url TEXT,
  video_url TEXT,
  rating REAL DEFAULT 0,
  category TEXT DEFAULT 'general',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_companions_user_id ON companions(user_id);
CREATE INDEX idx_chats_companion_id ON chats(companion_id);
CREATE INDEX idx_community_items_type ON community_items(type);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
