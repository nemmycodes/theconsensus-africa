import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller is super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (!roles?.some((r: any) => r.role === "super_admin")) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: events }, { data: fails }, { data: sessions }] = await Promise.all([
      supabase.from("analytics_events")
        .select("path,referrer,utm_source,utm_medium,utm_campaign,country,city,device_type,browser,created_at")
        .gte("created_at", since).limit(2000),
      supabase.from("failed_signups").select("error_message,country,created_at").gte("created_at", since).limit(500),
      supabase.from("visitor_sessions").select("visit_count,last_country,last_device_type,first_utm_source").limit(1000),
    ]);

    const agg = {
      total_events: events?.length || 0,
      total_failed_signups: fails?.length || 0,
      total_visitors: sessions?.length || 0,
      top_paths: countTop(events || [], "path", 10),
      top_countries: countTop(events || [], "country", 10),
      top_cities: countTop(events || [], "city", 10),
      top_referrers: countTop(events || [], "referrer", 10),
      top_utm_sources: countTop(events || [], "utm_source", 10),
      device_breakdown: countTop(events || [], "device_type", 10),
      browser_breakdown: countTop(events || [], "browser", 10),
      failed_signup_reasons: countTop(fails || [], "error_message", 10),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ summary: "LOVABLE_API_KEY missing", agg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are an analytics advisor for a civic engagement platform in Plateau State, Nigeria. Analyze the last 7 days of website traffic and produce a concise executive brief.

Data:
${JSON.stringify(agg, null, 2)}

Write:
1. **Traffic Summary** (2 sentences)
2. **Who's visiting** — top locations & devices
3. **How they got here** — top referrers / UTM sources
4. **Signup issues** — patterns in failed signups
5. **3 Actionable Recommendations**

Keep under 400 words. Use markdown.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI: ${aiRes.status}`, details: err, agg }), {
        status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const aiData = await aiRes.json();
    const summary = aiData.choices?.[0]?.message?.content || "No insights generated.";

    return new Response(JSON.stringify({ summary, agg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function countTop(arr: any[], key: string, n: number) {
  const c: Record<string, number> = {};
  for (const item of arr) {
    const v = item?.[key];
    if (!v) continue;
    c[v] = (c[v] || 0) + 1;
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ name: k, count: v }));
}
