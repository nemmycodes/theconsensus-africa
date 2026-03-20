
-- Table for editable website content (hero, about, leader sections)
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content
CREATE POLICY "Anyone can view site content"
ON public.site_content FOR SELECT TO public
USING (true);

-- Super admins can manage site content
CREATE POLICY "Super admins can manage site content"
ON public.site_content FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Seed default content
INSERT INTO public.site_content (section_key, content) VALUES
('hero', '{"badge":"YOUR FUTURE IS TODAY","heading":"EMPOWERING NIGERIA''S YOUTH FOR A NEW ERA OF LEADERSHIP","highlight_word":"YOUTH","paragraph1":"The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennial into a structured community focused on increasing economic freedom, strengthening political consciousness, and building a future defined by competence, integrity, and shared prosperity.","paragraph2":"We believe that when young people are economically empowered, families are stabilized, mothers are strengthened, and communities move forward. The movement begins with the Central Zone of Plateau State, building a verified digital community and scalable infrastructure ready for statewide expansion.","mentor_name":"Chief Kefas Ropshik Wungak","mentor_label":"Lead Mentor","tagline":"Join the movement. Build your economic power. Shape the future."}'),
('about_who_we_are', '{"heading":"Who We Are","paragraph1":"The Consensus is not just an organization; it is a generational awakening. We are a youth-led civic and economic movement dedicated to organizing the energy, creativity, and potential of Gen Z and Millennials in Plateau State.","paragraph2":"We believe that political influence is downstream from economic power. By leveraging technology to organize, educate, and empower, we are building a formidable bloc capable of demanding accountability and driving sustainable development.","paragraph3":"Our movement transcends traditional party lines, focusing instead on a shared vision of prosperity, integrity, and modern governance for our people."}'),
('leader', '{"title_label":"Chief / Consensus Movement Leader","name":"Chief Kefas Ropshik","quote":"If our leadership is not about the next election, it''s about the next generation. We are building roads under whose shade we may not sit, but our children will flourish.","bio":"As the Lead Mentor of The Consensus Movement, Chief Kefas provides the philosophical compass and strategic direction needed to navigate complex political landscapes. His role is centered on mentoring young leaders, building capacity around integrity, and bridging the gap between established leadership and youth-led innovation.","years_in_leadership":"20+","mentees_active":"1000+"}');

-- Table for contact form messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  form_type text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages FOR INSERT TO public
WITH CHECK (true);

-- Super admins can view all contact messages
CREATE POLICY "Super admins can view contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins can update (mark as read) and delete
CREATE POLICY "Super admins can manage contact messages"
ON public.contact_messages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can also view contact messages
CREATE POLICY "Admins can view contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
