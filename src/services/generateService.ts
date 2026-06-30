import { supabase } from '../lib/supabase';
import type { GeneratedAssistant, Session, SystemPrompt, KnowledgeFile } from '../types';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-assistant`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function generateAssistant(description: string): Promise<GeneratedAssistant> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `Request failed (${response.status})`);
  }

  const data = await response.json();
  if (!data.session || !data.systemPrompt || !data.knowledgeFiles) {
    throw new Error('Unexpected response from generation service');
  }

  return data as GeneratedAssistant;
}

export async function loadSession(sessionId: string): Promise<GeneratedAssistant> {
  const [sessionResult, promptResult, filesResult] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle(),
    supabase.from('system_prompts').select('*').eq('session_id', sessionId).maybeSingle(),
    supabase
      .from('knowledge_files')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order', { ascending: true }),
  ]);

  if (sessionResult.error) throw new Error(sessionResult.error.message);
  if (promptResult.error) throw new Error(promptResult.error.message);
  if (filesResult.error) throw new Error(filesResult.error.message);

  if (!sessionResult.data || !promptResult.data) {
    throw new Error('Session not found');
  }

  return {
    session: sessionResult.data as Session,
    systemPrompt: promptResult.data as SystemPrompt,
    knowledgeFiles: (filesResult.data ?? []) as KnowledgeFile[],
  };
}

export async function fetchHistory(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Session[];
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
  if (error) throw new Error(error.message);
}
