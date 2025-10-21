-- Create job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  posted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  years_of_experience INTEGER,
  current_position TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on job_postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on job_applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
CREATE POLICY "Anyone can view active job postings"
  ON public.job_postings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage job postings"
  ON public.job_postings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for job_applications
CREATE POLICY "Users can create job applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
  ON public.job_applications
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
  ON public.job_applications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.job_applications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Indexes for better performance
CREATE INDEX idx_job_postings_active ON public.job_postings(is_active);
CREATE INDEX idx_job_postings_department ON public.job_postings(department);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

-- Trigger for updated_at on job_postings
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample job postings
INSERT INTO public.job_postings (title, department, location, employment_type, description, requirements, responsibilities, salary_range, is_active) VALUES
('Delivery Driver', 'Operations', 'Casablanca, Morocco', 'full-time', 'Join our growing team of delivery drivers and be part of Morocco''s leading food delivery platform. Flexible hours and competitive pay.', 
'- Valid driver''s license\n- Own motorcycle or scooter\n- Smartphone with GPS\n- Good knowledge of local area\n- Excellent customer service skills', 
'- Pick up and deliver food orders promptly\n- Maintain vehicle in good condition\n- Provide excellent customer service\n- Follow safety protocols\n- Communicate order status updates', 
'3,000 - 5,000 MAD/month + tips', true),

('Restaurant Partnership Manager', 'Business Development', 'Rabat, Morocco', 'full-time', 'We are looking for a dynamic individual to grow our restaurant partner network. You will be the face of ATLAAS GO to potential restaurant partners.', 
'- 2+ years in business development or sales\n- Strong negotiation skills\n- Fluent in Arabic, French, and English\n- Knowledge of restaurant industry\n- Excellent communication skills', 
'- Identify and onboard new restaurant partners\n- Negotiate partnership agreements\n- Maintain relationships with existing partners\n- Achieve monthly partnership targets\n- Provide market insights', 
'8,000 - 12,000 MAD/month + commission', true),

('Customer Support Representative', 'Customer Service', 'Remote', 'full-time', 'Help our customers have the best experience possible. Join our customer support team and make a difference every day.', 
'- Excellent communication skills in Arabic and French\n- Problem-solving abilities\n- Patient and empathetic\n- Computer proficiency\n- Available for shift work', 
'- Respond to customer inquiries via chat and phone\n- Resolve order issues efficiently\n- Document customer interactions\n- Escalate complex issues when needed\n- Maintain high satisfaction ratings', 
'4,000 - 6,000 MAD/month', true),

('Software Engineer - Full Stack', 'Engineering', 'Casablanca, Morocco', 'full-time', 'Build the future of food delivery in Morocco. Work with modern technologies and solve interesting challenges at scale.', 
'- 3+ years experience with React and Node.js\n- Experience with PostgreSQL\n- Knowledge of REST APIs and real-time systems\n- Git proficiency\n- Strong problem-solving skills', 
'- Develop and maintain web applications\n- Write clean, maintainable code\n- Collaborate with product and design teams\n- Optimize application performance\n- Participate in code reviews', 
'15,000 - 25,000 MAD/month', true);

-- Create notification function for new applications
CREATE OR REPLACE FUNCTION public.notify_new_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title TEXT;
BEGIN
  -- Get job title
  SELECT title INTO v_job_title
  FROM public.job_postings
  WHERE id = NEW.job_id;

  -- Notify the applicant
  PERFORM create_notification(
    NEW.user_id,
    'Application Submitted',
    'Your application for ' || v_job_title || ' has been received. We''ll review it and get back to you soon.',
    'application_submitted'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new applications
CREATE TRIGGER notify_on_new_job_application
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_job_application();

-- Create function to update application status
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_job_title TEXT;
  v_notification_message TEXT;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update application status';
  END IF;

  -- Get user_id and job title
  SELECT ja.user_id, jp.title
  INTO v_user_id, v_job_title
  FROM public.job_applications ja
  JOIN public.job_postings jp ON jp.id = ja.job_id
  WHERE ja.id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Update application
  UPDATE public.job_applications
  SET 
    status = p_status,
    notes = COALESCE(p_notes, notes),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_application_id;

  -- Create appropriate notification
  IF p_status = 'accepted' THEN
    v_notification_message := 'Congratulations! Your application for ' || v_job_title || ' has been accepted. We will contact you soon with next steps.';
  ELSIF p_status = 'rejected' THEN
    v_notification_message := 'Thank you for your interest in ' || v_job_title || '. Unfortunately, we have decided to move forward with other candidates.';
  ELSIF p_status = 'interview' THEN
    v_notification_message := 'Great news! We would like to schedule an interview for the ' || v_job_title || ' position. Please check your email for details.';
  ELSE
    v_notification_message := 'Your application status for ' || v_job_title || ' has been updated to: ' || p_status;
  END IF;

  -- Send notification
  PERFORM create_notification(
    v_user_id,
    'Application Status Update',
    v_notification_message,
    'application_status_change'
  );
END;
$$;