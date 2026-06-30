/*
# PromptForge Schema

## Summary
Creates the full schema for the PromptForge AI assistant generator application.

## New Tables

### sessions
Stores each generation request made by a user.
- `id` (uuid, primary key)
- `description` (text) - the plain-English user input
- `domain` (text) - AI-detected domain (e.g. "Automotive", "Legal")
- `created_at` (timestamp)

### system_prompts
Stores the generated expert system prompt for each session.
- `id` (uuid, primary key)
- `session_id` (uuid, FK → sessions.id, CASCADE DELETE)
- `content` (text) - full system prompt text

### knowledge_files
Stores each generated knowledge file linked to a session.
- `id` (uuid, primary key)
- `session_id` (uuid, FK → sessions.id, CASCADE DELETE)
- `filename` (text) - snake_case .md filename
- `title` (text) - human-readable title
- `content` (text) - full markdown content
- `file_type` (text) - one of: reference, troubleshooting, procedures, terminology, tips
- `sort_order` (int) - display order within a session

## Security
- RLS enabled on all tables.
- All tables use open anon + authenticated policies since this is a single-tenant app with no sign-in.

## Notes
1. CASCADE DELETE on session_id ensures deleting a session removes all related prompts and files.
2. Indexes added on session_id columns for fast lookups when loading history.
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  domain text NOT NULL DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  filename text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  file_type text NOT NULL DEFAULT 'reference',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_prompts_session_id ON system_prompts(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_session_id ON knowledge_files(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;

-- sessions policies
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON sessions;
CREATE POLICY "anon_delete_sessions" ON sessions FOR DELETE
TO anon, authenticated USING (true);

-- system_prompts policies
DROP POLICY IF EXISTS "anon_select_system_prompts" ON system_prompts;
CREATE POLICY "anon_select_system_prompts" ON system_prompts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_system_prompts" ON system_prompts;
CREATE POLICY "anon_insert_system_prompts" ON system_prompts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_system_prompts" ON system_prompts;
CREATE POLICY "anon_delete_system_prompts" ON system_prompts FOR DELETE
TO anon, authenticated USING (true);

-- knowledge_files policies
DROP POLICY IF EXISTS "anon_select_knowledge_files" ON knowledge_files;
CREATE POLICY "anon_select_knowledge_files" ON knowledge_files FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_knowledge_files" ON knowledge_files;
CREATE POLICY "anon_insert_knowledge_files" ON knowledge_files FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_knowledge_files" ON knowledge_files;
CREATE POLICY "anon_delete_knowledge_files" ON knowledge_files FOR DELETE
TO anon, authenticated USING (true);
