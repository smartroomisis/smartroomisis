-- =============================================
-- TABELA: staff_audits (Auditorias de Limpeza)
-- =============================================
CREATE TABLE public.staff_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_id TEXT NOT NULL DEFAULT 'smart-room-office-01',
  
  -- Checklists (stored as JSONB for flexibility)
  cleaning_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  organization_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Coffee audit
  coffee_capsules_used INTEGER DEFAULT 0,
  coffee_capsules_remaining INTEGER DEFAULT 0,
  
  -- Damage report
  has_damage BOOLEAN DEFAULT false,
  damage_description TEXT,
  
  -- Photos (URLs from storage)
  photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status and notes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.staff_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can create audits"
  ON public.staff_audits FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'staff') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view their own audits"
  ON public.staff_audits FOR SELECT
  USING (staff_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update their own pending audits"
  ON public.staff_audits FOR UPDATE
  USING (staff_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all audits"
  ON public.staff_audits FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- TABELA: staff_payments (Pagamentos de Staff)
-- =============================================
CREATE TABLE public.staff_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.staff_audits(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  
  -- Payment details
  amount NUMERIC(10,2) NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('cleaning', 'extra_service', 'bonus', 'other')),
  description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  
  -- Payment proof
  payment_proof_url TEXT,
  payment_date DATE,
  payment_method TEXT,
  
  -- Admin tracking
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  paid_by UUID REFERENCES public.profiles(id),
  paid_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view their own payments"
  ON public.staff_payments FOR SELECT
  USING (staff_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all payments"
  ON public.staff_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_staff_payments_updated_at
  BEFORE UPDATE ON public.staff_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: expenses (Despesas/Fluxo Financeiro)
-- =============================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Expense details
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('utilities', 'maintenance', 'supplies', 'cleaning', 'staff', 'marketing', 'taxes', 'rent', 'other')),
  
  -- Date and reference
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_month TEXT, -- Format: 'YYYY-MM'
  
  -- Receipt/Invoice
  receipt_url TEXT,
  invoice_number TEXT,
  
  -- Vendor info
  vendor_name TEXT,
  vendor_document TEXT, -- CNPJ/CPF
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_date DATE,
  payment_proof_url TEXT,
  
  -- Tracking
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage expenses"
  ON public.expenses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view expenses"
  ON public.expenses FOR SELECT
  USING (has_role(auth.uid(), 'staff'));

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Bucket for audit photos (cleaning photos, damage photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audit-photos',
  'audit-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Bucket for invoices and fiscal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Audit photos: Staff and admins can upload, public can view
CREATE POLICY "Anyone can view audit photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audit-photos');

CREATE POLICY "Staff can upload audit photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audit-photos' 
    AND (has_role(auth.uid(), 'staff') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Staff can update their audit photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audit-photos'
    AND (has_role(auth.uid(), 'staff') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can delete audit photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'audit-photos' AND has_role(auth.uid(), 'admin'));

-- Payment proofs: Only admins can manage
CREATE POLICY "Admins can view payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payment proofs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'));

-- Invoices: Only admins can manage
CREATE POLICY "Admins can view invoices"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoices"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_staff_audits_staff_id ON public.staff_audits(staff_id);
CREATE INDEX idx_staff_audits_reservation_id ON public.staff_audits(reservation_id);
CREATE INDEX idx_staff_audits_status ON public.staff_audits(status);
CREATE INDEX idx_staff_audits_created_at ON public.staff_audits(created_at DESC);

CREATE INDEX idx_staff_payments_staff_id ON public.staff_payments(staff_id);
CREATE INDEX idx_staff_payments_status ON public.staff_payments(status);
CREATE INDEX idx_staff_payments_created_at ON public.staff_payments(created_at DESC);

CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_status ON public.expenses(status);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date DESC);
CREATE INDEX idx_expenses_reference_month ON public.expenses(reference_month);