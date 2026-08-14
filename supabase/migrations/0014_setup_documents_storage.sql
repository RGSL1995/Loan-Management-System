-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/zip', 'application/x-rar-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Users can view documents for their company's applications
CREATE POLICY "users_can_view_own_documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      -- Extract application ID from path: applications/{applicationId}/...
      (string_to_array(name, '/'))[2] IN (
        SELECT id::text FROM public.loan_applications
        WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- Users can upload documents for their company's applications
CREATE POLICY "users_can_upload_own_documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      -- Extract application ID from path: applications/{applicationId}/...
      (string_to_array(name, '/'))[2] IN (
        SELECT id::text FROM public.loan_applications
        WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- Users can delete their own documents
CREATE POLICY "users_can_delete_own_documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (
      -- Extract application ID from path: applications/{applicationId}/...
      (string_to_array(name, '/'))[2] IN (
        SELECT id::text FROM public.loan_applications
        WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
      )
    )
  );
