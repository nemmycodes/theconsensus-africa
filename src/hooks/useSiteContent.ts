import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = (sectionKey: string) => {
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (data) setContent(data.content as any);
      setLoading(false);
    };
    fetch();
  }, [sectionKey]);

  return { content, loading };
};
