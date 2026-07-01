import type { GeneratedAssistant, Session, SystemPrompt, KnowledgeFile } from '../types';

const SESSIONS_KEY = 'promptforge_sessions';
const PROMPTS_KEY = 'promptforge_system_prompts';
const FILES_KEY = 'promptforge_knowledge_files';
const API_KEY_KEY = 'promptforge_gemini_api_key';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

// Helper functions for LocalStorage DB
function getSessions(): Session[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading sessions from localStorage', e);
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function getPrompts(): SystemPrompt[] {
  try {
    const data = localStorage.getItem(PROMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading prompts from localStorage', e);
    return [];
  }
}

function savePrompts(prompts: SystemPrompt[]) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
}

function getFiles(): KnowledgeFile[] {
  try {
    const data = localStorage.getItem(FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading files from localStorage', e);
    return [];
  }
}

function saveFiles(files: KnowledgeFile[]) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function getGeminiApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

export function setGeminiApiKey(key: string) {
  localStorage.setItem(API_KEY_KEY, key);
}

export async function generateAssistant(description: string): Promise<GeneratedAssistant> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set your API key in settings.');
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Generate a specialized AI assistant for: ${description.trim()}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'Unknown error');
    console.error('Gemini API error:', errBody);
    throw new Error('AI generation failed. Please check your Gemini API key and connection.');
  }

  const geminiData = await res.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    console.error('No text in Gemini response:', JSON.stringify(geminiData));
    throw new Error('AI returned an empty response. Please try again.');
  }

  let parsed: { domain: string; systemPrompt: string; knowledgeFiles: any[] };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.error('Failed to parse Gemini JSON:', rawText.slice(0, 500));
    throw new Error('AI response was malformed. Please try again.');
  }

  if (!parsed.domain || !parsed.systemPrompt || !Array.isArray(parsed.knowledgeFiles)) {
    throw new Error('AI response is missing required fields. Please try again.');
  }

  const sessionId = crypto.randomUUID();
  const session: Session = {
    id: sessionId,
    description: description.trim(),
    domain: parsed.domain,
    created_at: new Date().toISOString(),
  };

  const promptId = crypto.randomUUID();
  const systemPrompt: SystemPrompt = {
    id: promptId,
    session_id: sessionId,
    content: parsed.systemPrompt,
    created_at: new Date().toISOString(),
  };

  const validFileTypes = ['reference', 'troubleshooting', 'procedures', 'terminology', 'tips'];
  const knowledgeFiles: KnowledgeFile[] = parsed.knowledgeFiles.map((f: any, idx: number) => ({
    id: crypto.randomUUID(),
    session_id: sessionId,
    filename: f.filename || `file_${idx + 1}.md`,
    title: f.title || `File ${idx + 1}`,
    content: f.content || '',
    file_type: validFileTypes.includes(f.fileType) ? f.fileType : 'reference',
    sort_order: idx,
    created_at: new Date().toISOString(),
  }));

  // Save to LocalStorage
  const sessions = getSessions();
  sessions.unshift(session);
  saveSessions(sessions);

  const prompts = getPrompts();
  prompts.push(systemPrompt);
  savePrompts(prompts);

  const files = getFiles();
  files.push(...knowledgeFiles);
  saveFiles(files);

  return {
    session,
    systemPrompt,
    knowledgeFiles,
  };
}

export async function loadSession(sessionId: string): Promise<GeneratedAssistant> {
  const session = getSessions().find((s) => s.id === sessionId);
  const prompt = getPrompts().find((p) => p.session_id === sessionId);
  const files = getFiles()
    .filter((f) => f.session_id === sessionId)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (!session || !prompt) {
    throw new Error('Session not found in local storage.');
  }

  return {
    session,
    systemPrompt: prompt,
    knowledgeFiles: files,
  };
}

export async function fetchHistory(): Promise<Session[]> {
  return getSessions();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = getSessions().filter((s) => s.id !== sessionId);
  saveSessions(sessions);

  const prompts = getPrompts().filter((p) => p.session_id !== sessionId);
  savePrompts(prompts);

  const files = getFiles().filter((f) => f.session_id !== sessionId);
  saveFiles(files);
}
