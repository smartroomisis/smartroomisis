-- Create enum for subscription plan types
CREATE TYPE public.subscription_plan AS ENUM ('basic', 'pro', 'executive', 'enterprise');

-- Create enum for payment mode
CREATE TYPE public.payment_mode AS ENUM ('credit', 'stripe', 'invoice');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  current_plan subscription_plan NOT NULL DEFAULT 'basic',
  credit_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  enterprise_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create enterprise_companies table
CREATE TABLE public.enterprise_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email_domain TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_unlimited BOOLEAN NOT NULL DEFAULT false,
  monthly_hours_limit NUMERIC(10,2),
  billing_email TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_plans table with pricing
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type subscription_plan NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  included_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_booking_hours NUMERIC(10,2) NOT NULL DEFAULT 2,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_transactions table for wallet history
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription_credit', 'manual_credit', 'booking_debit', 'refund', 'adjustment')),
  description TEXT,
  reservation_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enterprise_usage_logs table for corporate billing
CREATE TABLE public.enterprise_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.enterprise_companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_id UUID,
  hours_used NUMERIC(10,2) NOT NULL,
  booking_date DATE NOT NULL,
  description TEXT,
  is_billed BOOLEAN NOT NULL DEFAULT false,
  billed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_usage_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for enterprise_companies (admin only)
CREATE POLICY "Admins can manage enterprise companies"
ON public.enterprise_companies FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active companies"
ON public.enterprise_companies FOR SELECT
USING (is_active = true);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create transactions"
ON public.credit_transactions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for enterprise_usage_logs
CREATE POLICY "Admins can manage usage logs"
ON public.enterprise_usage_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own usage"
ON public.enterprise_usage_logs FOR SELECT
USING (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_domain TEXT;
  company_record RECORD;
BEGIN
  -- Extract domain from email
  user_domain := split_part(NEW.email, '@', 2);
  
  -- Check if user belongs to an enterprise company
  SELECT * INTO company_record
  FROM public.enterprise_companies
  WHERE email_domain = user_domain AND is_active = true
  LIMIT 1;
  
  -- Create profile with appropriate plan
  INSERT INTO public.profiles (id, email, full_name, current_plan, enterprise_company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN company_record.id IS NOT NULL THEN 'enterprise'::subscription_plan ELSE 'basic'::subscription_plan END,
    company_record.id
  );
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_companies_updated_at
  BEFORE UPDATE ON public.enterprise_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_type, name, description, monthly_price, included_hours, min_booking_hours) VALUES
('basic', 'Basic (On-Demand)', 'Pagamento por reserva, sem mensalidade. Ideal para uso ocasional.', 0, 0, 2),
('pro', 'Pro (10h/mês)', '10 horas de crédito mensal. Perfeito para uso regular.', 299, 10, 2),
('executive', 'Executive (20h/mês)', '20 horas de crédito mensal. Para profissionais que precisam de mais tempo.', 499, 20, 2),
('enterprise', 'Enterprise (Corporativo)', 'Plano corporativo com faturamento. Uso ilimitado ou sob demanda.', 0, 0, 1);