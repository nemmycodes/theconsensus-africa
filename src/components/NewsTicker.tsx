import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TickerItem {
  id: string;
  label: string;
  text: string;
  href?: string;
}

const NewsTicker = () => {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [broadcasts, posts, events] = await Promise.all([
        supabase
          .from("broadcasts")
          .select("id,title,body,created_at")
          .eq("active", true)
          .eq("audience", "all")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("blog_posts")
          .select("id,title,category,created_at")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("events")
          .select("id,title,event_date,location")
          .gte("event_date", new Date().toISOString())
          .order("event_date", { ascending: true })
          .limit(3),
      ]);

      if (!active) return;

      const next: TickerItem[] = [
        ...(broadcasts.data ?? []).map((b) => ({
          id: `b-${b.id}`,
          label: "Update",
          text: b.body ? `${b.title} — ${b.body}` : b.title,
        })),
        ...(posts.data ?? []).map((p) => ({
          id: `p-${p.id}`,
          label: "News",
          text: p.title,
          href: `/blog?post=${p.id}`,
        })),
        ...(events.data ?? []).map((e) => ({
          id: `e-${e.id}`,
          label: "Event",
          text: `${e.title} — ${new Date(e.event_date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}${e.location ? `, ${e.location}` : ""}`,
          href: "/events",
        })),
      ];

      setItems(next);
    };

    load();
    const interval = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (items.length === 0) return null;

  // Duplicate the strip so the marquee loops seamlessly.
  const strip = [...items, ...items];
  const duration = Math.max(24, items.length * 12);

  return (
    <div className="relative w-full overflow-hidden border-b border-primary/20 bg-primary/10 backdrop-blur-sm">
      <div className="flex items-stretch">
        <div className="z-10 flex shrink-0 items-center gap-1.5 bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Latest</span>
        </div>

        <div className="group relative flex-1 overflow-hidden py-1.5" aria-live="polite">
          <div
            className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]"
            style={{ animationDuration: `${duration}s` }}
          >
            {strip.map((item, i) => {
              const content = (
                <span className="flex items-center gap-2 text-xs text-foreground/90">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <span className="font-bold uppercase tracking-wide text-primary">{item.label}</span>
                  <span>{item.text}</span>
                </span>
              );
              return item.href ? (
                <Link
                  key={`${item.id}-${i}`}
                  to={item.href}
                  className="transition-opacity hover:opacity-70"
                >
                  {content}
                </Link>
              ) : (
                <span key={`${item.id}-${i}`}>{content}</span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
