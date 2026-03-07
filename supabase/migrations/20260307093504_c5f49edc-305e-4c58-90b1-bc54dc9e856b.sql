
-- Agent locations for live tracking
CREATE TABLE public.agent_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  status text NOT NULL DEFAULT 'active',
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_locations ENABLE ROW LEVEL SECURITY;

-- Admins can view all agent locations
CREATE POLICY "Admins can view agent locations"
ON public.agent_locations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Agents can insert their own location
CREATE POLICY "Agents can insert own location"
ON public.agent_locations FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'agent') AND auth.uid() = agent_id);

-- Agents can update their own location
CREATE POLICY "Agents can update own location"
ON public.agent_locations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'agent') AND auth.uid() = agent_id);

-- Enable realtime for agent locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_locations;

-- Events table for tracking live events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  event_date timestamp with time zone NOT NULL,
  event_type text NOT NULL DEFAULT 'rally',
  status text NOT NULL DEFAULT 'upcoming',
  attendee_count integer DEFAULT 0,
  max_attendees integer,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view events
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- Admins can manage events
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
