-- Track files dropped by visitors on a public profile (vs files the owner uploaded themselves)
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_received boolean NOT NULL DEFAULT false;
