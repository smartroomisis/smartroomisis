-- 1. checked_in_at on reservations
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;

-- Allow staff to update reservations (e.g. register arrival)
CREATE POLICY "Staff can update reservations"
ON public.reservations
FOR UPDATE
USING (has_role(auth.uid(), 'staff'::app_role));

-- 2. staff_problems table
CREATE TABLE public.staff_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL,
  room_id TEXT NOT NULL DEFAULT 'smart-room-office-01',
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_problems TO authenticated;
GRANT ALL ON public.staff_problems TO service_role;

ALTER TABLE public.staff_problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all problems"
ON public.staff_problems FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can create problems"
ON public.staff_problems FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view problems"
ON public.staff_problems FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_staff_problems_updated_at
BEFORE UPDATE ON public.staff_problems
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. room_status table
CREATE TABLE public.room_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE DEFAULT 'smart-room-office-01',
  status TEXT NOT NULL DEFAULT 'free',
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_status TO authenticated;
GRANT ALL ON public.room_status TO service_role;

ALTER TABLE public.room_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage room status"
ON public.room_status FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view room status"
ON public.room_status FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can update room status"
ON public.room_status FOR UPDATE
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_room_status_updated_at
BEFORE UPDATE ON public.room_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.room_status (room_id, status, is_occupied)
VALUES ('smart-room-office-01', 'free', false)
ON CONFLICT (room_id) DO NOTHING;