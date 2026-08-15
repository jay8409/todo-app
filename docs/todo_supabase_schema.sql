-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR TODO MVP WEB APP (WITH KAKAO SSO)
-- ============================================================================

-- 1. Create Todos Table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies for Public & Authenticated Access
DROP POLICY IF EXISTS "Allow public read todos" ON todos;
DROP POLICY IF EXISTS "Allow public insert todos" ON todos;
DROP POLICY IF EXISTS "Allow public update todos" ON todos;
DROP POLICY IF EXISTS "Allow public delete todos" ON todos;

-- Read: Anyone or user can read todos
CREATE POLICY "Allow public read todos" ON todos FOR SELECT USING (true);

-- Insert: Anyone or authenticated user can insert todos
CREATE POLICY "Allow public insert todos" ON todos FOR INSERT WITH CHECK (true);

-- Update: Anyone or authenticated user can update todos
CREATE POLICY "Allow public update todos" ON todos FOR UPDATE USING (true);

-- Delete: Anyone or authenticated user can delete todos
CREATE POLICY "Allow public delete todos" ON todos FOR DELETE USING (true);

-- 4. Sample Seed Data
INSERT INTO todos (id, title, priority, due_date, completed, created_at)
VALUES 
  ('todo-seed-1', '카카오 SSO 로그인 연결 테스트하기 🚀', 'high', CURRENT_DATE, false, NOW() - INTERVAL '2 hours'),
  ('todo-seed-2', 'Supabase 데이터베이스 연동 확인', 'high', CURRENT_DATE + INTERVAL '1 day', true, NOW() - INTERVAL '5 hours'),
  ('todo-seed-3', 'Todo MVP UI 디자인 스타일링 적용', 'medium', CURRENT_DATE + INTERVAL '2 days', false, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
