/*
# Create business-permits storage bucket

1. Storage
- Creates a public storage bucket named `business-permits` for uploading business permit images.
- Public bucket so permit image URLs are accessible without signed URLs.

2. Security
- Public bucket: read access is open. Insert/update/delete via anon+authenticated storage policies.
*/
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-permits', 'business-permits', true)
ON CONFLICT (id) DO NOTHING;