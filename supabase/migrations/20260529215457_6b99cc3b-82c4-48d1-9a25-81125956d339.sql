-- 1. Restrict enterprise_companies SELECT to own company only
DROP POLICY IF EXISTS "Users can view active companies" ON public.enterprise_companies;

CREATE POLICY "Users can view their own company"
ON public.enterprise_companies
FOR SELECT
USING (
  is_active = true
  AND id = (SELECT enterprise_company_id FROM public.profiles WHERE id = auth.uid())
);

-- 2. Make audit-photos bucket private and restrict viewing to staff/admins
UPDATE storage.buckets SET public = false WHERE id = 'audit-photos';

DROP POLICY IF EXISTS "Anyone can view audit photos" ON storage.objects;

CREATE POLICY "Staff and admins can view audit photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'audit-photos'
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- 3. Explicitly block non-admins from inserting/escalating roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));