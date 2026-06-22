-- Make the user-files bucket private so storage paths are not directly
-- accessible without a signed URL. The application now uses signed URLs
-- everywhere (scan page shared files via service client, inbox via browser client).
UPDATE storage.buckets
SET public = false
WHERE name = 'user-files';
