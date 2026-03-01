-- ARCANA Supabase Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- ─── habits 表 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slot        TEXT NOT NULL DEFAULT 'morning',
  exp         INT  NOT NULL DEFAULT 10,
  dimension   TEXT NOT NULL DEFAULT 'pro',
  is_anchor   BOOLEAN DEFAULT FALSE,
  streak      INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 补充缺失字段（如果表已存在）
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_anchor BOOLEAN DEFAULT FALSE;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;

-- RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "habits_owner" ON habits;
CREATE POLICY "habits_owner" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- ─── check_records 表 ────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_records (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id     TEXT NOT NULL,
  date         TEXT NOT NULL,          -- 'YYYY-MM-DD'
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 补充缺失字段
ALTER TABLE check_records ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW();

-- RLS
ALTER TABLE check_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "records_owner" ON check_records;
CREATE POLICY "records_owner" ON check_records
  FOR ALL USING (auth.uid() = user_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS check_records_user_date ON check_records(user_id, date);

-- ─── dimensions 表 ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS dimensions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dim_id      TEXT NOT NULL,
  total_exp   INT  NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dim_id)
);

-- 补充缺失字段（如果原来用 exp 列名）
ALTER TABLE dimensions ADD COLUMN IF NOT EXISTS total_exp INT DEFAULT 0;
-- 若存在旧的 exp 列，迁移数据
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='dimensions' AND column_name='exp'
  ) THEN
    UPDATE dimensions SET total_exp = exp WHERE total_exp = 0;
  END IF;
END $$;

-- RLS
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dims_owner" ON dimensions;
CREATE POLICY "dims_owner" ON dimensions
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dims_updated_at ON dimensions;
CREATE TRIGGER dims_updated_at
  BEFORE UPDATE ON dimensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
