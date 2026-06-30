import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_INSTRUCTION = `You are an expert AI assistant architect and domain knowledge specialist. Your job is to analyze a user's plain-English description and generate:
1. A comprehensive, expert-level system prompt that transforms any AI language model into a master specialist for that exact topic
2. A set of 3-5 detailed knowledge files containing rich, specific information the AI assistant should reference

The system prompt should:
- Open with a clear persona statement (e.g. "You are an expert master mechanic specializing in...")
- Specify the communication style: technical and precise, but approachable and patient
- List 5-8 key principles the expert follows (safety first, step-by-step diagnostics, etc.)
- Describe how the AI handles uncertainty (acknowledge limits, recommend professional consultation when safety is at risk)
- Instruct the AI to always ask clarifying questions before diagnosing
- Be 400-700 words of dense, actionable guidance

Each knowledge file should:
- Contain real, accurate, highly specific information about the exact topic described
- Be written in clean markdown with headers (##), bullet lists, and tables where appropriate
- Be 500-900 words of substantive, reference-quality content
- Cover a distinct aspect of the topic so files complement rather than repeat each other
- Include specific numbers, names, measurements, part numbers, or procedures where relevant

Return ONLY a valid JSON object — no markdown fences, no preamble, no trailing text. Raw JSON:
{
  "domain": "1-3 word domain label (e.g. 'Automotive', 'Home Plumbing', 'Electronics Repair')",
  "systemPrompt": "Full system prompt text here...",
  "knowledgeFiles": [
    {
      "filename": "descriptive_snake_case_name.md",
      "title": "Human-Readable File Title",
      "content": "Full markdown content...",
      "fileType": "reference"
    }
  ]
}

Valid fileType values: reference, troubleshooting, procedures, terminology, tips
Always generate between 3 and 5 knowledge files. Never generate fewer than 3.`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string };
}

interface KnowledgeFileInput {
  filename: string;
  title: string;
  content: string;
  fileType: string;
}

interface GenerationOutput {
  domain: string;
  systemPrompt: string;
  knowledgeFiles: KnowledgeFileInput[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "A description of at least 5 characters is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY secret is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: "user",
            parts: [{ text: `Generate a specialized AI assistant for: ${description.trim()}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini API error:", errBody);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData: GeminiResponse = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("No text in Gemini response:", JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: "AI returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: GenerationOutput;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI response was malformed. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!parsed.domain || !parsed.systemPrompt || !Array.isArray(parsed.knowledgeFiles)) {
      return new Response(
        JSON.stringify({ error: "AI response missing required fields. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Persist to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .insert({ description: description.trim(), domain: parsed.domain })
      .select()
      .single();

    if (sessionErr || !session) {
      console.error("Session insert error:", sessionErr);
      throw new Error("Failed to save session");
    }

    const { data: systemPrompt, error: promptErr } = await supabase
      .from("system_prompts")
      .insert({ session_id: session.id, content: parsed.systemPrompt })
      .select()
      .single();

    if (promptErr || !systemPrompt) {
      console.error("System prompt insert error:", promptErr);
      throw new Error("Failed to save system prompt");
    }

    const validFileTypes = ["reference", "troubleshooting", "procedures", "terminology", "tips"];
    const filesPayload = parsed.knowledgeFiles.map((f, idx) => ({
      session_id: session.id,
      filename: f.filename || `file_${idx + 1}.md`,
      title: f.title || `File ${idx + 1}`,
      content: f.content || "",
      file_type: validFileTypes.includes(f.fileType) ? f.fileType : "reference",
      sort_order: idx,
    }));

    const { data: knowledgeFiles, error: filesErr } = await supabase
      .from("knowledge_files")
      .insert(filesPayload)
      .select();

    if (filesErr) {
      console.error("Knowledge files insert error:", filesErr);
      throw new Error("Failed to save knowledge files");
    }

    return new Response(
      JSON.stringify({ session, systemPrompt, knowledgeFiles: knowledgeFiles ?? [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Edge function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
