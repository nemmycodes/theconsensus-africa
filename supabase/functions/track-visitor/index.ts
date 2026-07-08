import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      visitor_id, user_id, event_type = "pageview", path, referrer,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      device_type, browser, os, screen_size, language, user_agent, metadata,
    } = body;

    if (!visitor_id) {
      return new Response(JSON.stringify({ error: "visitor_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract IP
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";

    // Geolocate via ipwho.is (free, no key, HTTPS)
    let geo: any = {};
    if (ip && !ip.startsWith("127.") && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
        if (r.ok) geo = await r.json();
      } catch (_e) { /* ignore */ }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const eventRow = {
      visitor_id, user_id: user_id || null, event_type, path, referrer,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      device_type, browser, os, screen_size, language, user_agent,
      ip_address: ip || null,
      country: geo.country || null,
      country_code: geo.country_code || null,
      region: geo.region || null,
      city: geo.city || null,
      latitude: geo.latitude ?? null,
      longitude: geo.longitude ?? null,
      timezone: geo.timezone?.id || geo.timezone || null,
      isp: geo.connection?.isp || geo.isp || null,
      metadata: metadata || {},
    };

    await supabase.from("analytics_events").insert(eventRow);

    // Upsert visitor session
    const { data: existing } = await supabase
      .from("visitor_sessions")
      .select("id, visit_count")
      .eq("visitor_id", visitor_id)
      .maybeSingle();

    if (existing) {
      await supabase.from("visitor_sessions")
        .update({
          last_seen_at: new Date().toISOString(),
          visit_count: (existing.visit_count || 1) + 1,
          user_id: user_id || undefined,
          last_country: eventRow.country,
          last_city: eventRow.city,
          last_latitude: eventRow.latitude,
          last_longitude: eventRow.longitude,
          last_device_type: device_type,
          last_browser: browser,
          last_os: os,
          last_ip: ip || null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("visitor_sessions").insert({
        visitor_id, user_id: user_id || null,
        first_referrer: referrer, first_utm_source: utm_source, first_utm_campaign: utm_campaign,
        last_country: eventRow.country, last_city: eventRow.city,
        last_latitude: eventRow.latitude, last_longitude: eventRow.longitude,
        last_device_type: device_type, last_browser: browser, last_os: os,
        last_ip: ip || null,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("track-visitor error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
