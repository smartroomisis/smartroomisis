-- Create reservations table for calendar view
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  room_id TEXT NOT NULL DEFAULT 'smart-room-office-01',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours NUMERIC NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_mode TEXT NOT NULL DEFAULT 'credit',
  total_price NUMERIC NOT NULL DEFAULT 0,
  company_id UUID REFERENCES public.enterprise_companies(id) ON DELETE SET NULL,
  access_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reservations"
ON public.reservations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations"
ON public.reservations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all reservations"
ON public.reservations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view all reservations"
ON public.reservations
FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();