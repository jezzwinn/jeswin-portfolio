CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'graphic',
  description TEXT DEFAULT '',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  drive_id TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  tags TEXT DEFAULT '',
  client TEXT DEFAULT '',
  project_date TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_public_order ON projects(published, sort_order, id);
