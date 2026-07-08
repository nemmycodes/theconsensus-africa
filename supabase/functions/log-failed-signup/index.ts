import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const b = await req.json();
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0].trim() || "";

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

    await supabase.from("failed_signups").insert({
      email: b.email || null,
      attempted_full_name: b.full_name || null,
      error_code: b.error_code || null,
      error_message: b.error_message || null,
      visitor_id: b.visitor_id || null,
      ip_address: ip || null,
      user_agent: b.user_agent || null,
      device_type: b.device_type || null,
      browser: b.browser || null,
      os: b.os || null,
      country: geo.country || null,
      country_code: geo.country_code || null,
      region: geo.region || null,
      city: geo.city || null,
      latitude: geo.latitude ?? null,
      longitude: geo.longitude ?? null,
      metadata: b.metadata || {},
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
