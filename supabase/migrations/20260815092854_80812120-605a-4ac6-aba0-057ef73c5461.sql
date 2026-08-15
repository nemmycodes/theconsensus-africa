CREATE TABLE public.situation_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel text NOT NULL DEFAULT 'general',
  author_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url text,
  is_broadcast boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_situation_chat_channel_created ON public.situation_chat_messages (channel, created_at DESC);
CREATE INDEX idx_situation_chat_broadcast ON public.situation_chat_messages (is_broadcast, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.situation_chat_messages TO authenticated;
GRANT ALL ON public.situation_chat_messages TO service_role;

ALTER TABLE public.situation_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat"
  ON public.situation_chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can post their own chat messages"
  ON public.situation_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id AND channel IN ('general','report','share','monitor','accountability'));

CREATE POLICY "Users can delete their own chat messages"
  ON public.situation_chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete any chat message"
  ON public.situation_chat_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.situation_chat_messages;