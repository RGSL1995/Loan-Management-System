-- Create table to store user's MCA email credentials
BEGIN;

CREATE TABLE IF NOT EXISTS mca_credentials (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mca_email VARCHAR(255) NOT NULL,
  mca_password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE mca_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see/update their own credentials
CREATE POLICY "Users can view their own MCA credentials" ON mca_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MCA credentials" ON mca_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCA credentials" ON mca_credentials
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;
