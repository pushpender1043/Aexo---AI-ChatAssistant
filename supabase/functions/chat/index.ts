import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();

    const systemPrompt = mode === "image"
      ? "You are a creative AI image description assistant. When asked to create images, describe them in vivid detail. Be creative and artistic."
      : mode === "idea"
      ? "You are a creative idea generator. Generate innovative, actionable ideas. Be enthusiastic and detailed."
      : "You are Aexo, a friendly and smart AI assistant. Be concise, helpful, and use markdown formatting when appropriate.";

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let content = "";
    let images: string[] = [];

    // Image generation mode - use Lovable AI Gateway
    if (mode === "image" && LOVABLE_API_KEY) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [
            { role: "system", content: "Generate an image based on the user's description. Be creative." },
            ...messages,
          ],
          modalities: ["image", "text"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        content = data.choices?.[0]?.message?.content || "Here's the generated image:";
        const msgImages = data.choices?.[0]?.message?.images;
        if (msgImages && Array.isArray(msgImages)) {
          images = msgImages.map((img: any) => img.image_url?.url || img).filter(Boolean);
        }
      }
    }

    // Text chat - try Gemini first, then Lovable
    if (!content && !images.length) {
      if (GEMINI_API_KEY) {
        const geminiMessages = [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood!" }] },
          ...messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: geminiMessages,
              generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      }

      if (!content && LOVABLE_API_KEY) {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error("AI gateway error");
        }

        const data = await response.json();
        content = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
      }
    }

    if (!content && !images.length) throw new Error("No AI service available");

    return new Response(JSON.stringify({ content, images: images.length ? images : undefined }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
