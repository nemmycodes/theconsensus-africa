import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the AI assistant for The Plateau Consensus — a civic movement focused on economic freedom, political consciousness, and shared prosperity across Plateau State, Nigeria.

You help visitors with FAQs and general questions about the organization. Here is key information:

ABOUT THE ORGANIZATION:
- The Plateau Consensus is a civic movement dedicated to empowering the people of Plateau State through economic freedom, political awareness, and community solidarity.
- It operates through grassroots engagement, election monitoring, community reporting, and empowerment programmes.

KEY FEATURES:
- Situation Room: Real-time monitoring platform for political developments, electoral activities, and community issues. Members and agents submit verified reports.
- KEF-CARES Foundation: An initiative focused on economic empowerment, skills training, entrepreneurship support, agriculture, and community development in the Central Zone and beyond.
- Election Collation: Agents on the ground report election results using EC8-A forms for transparent monitoring.
- Discussion/Podcast: Community forum and podcast platform for civic dialogue.

HOW TO JOIN:
- Click "Join Us" on the website and complete the registration form with your name, LGA, ward, and interests.
- You'll get access to the member dashboard, community discussions, and event notifications.

BECOMING AN AGENT:
- Apply through the platform. Agents handle on-ground reporting, election monitoring, and community engagement.

KEF-CARES REGISTRATION:
- Visit the KEF-CARES page and create an account to register for economic empowerment programmes.
- Registration collects personal, educational, economic, and skills data to tailor support programmes.

DONATIONS:
- Donations support the movement's initiatives. Visit the Donate page for one-time or monthly contributions.

DATA PRIVACY:
- All personal information is encrypted and stored securely. Data is never shared without consent.

GUIDELINES:
- Be friendly, concise, and helpful.
- If you don't know something specific, suggest the user contact the team via the Contact Us page.
- Keep answers brief (2-4 sentences) unless the user asks for detail.
- Always be respectful and professional.
- Do not make up information not provided above.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
