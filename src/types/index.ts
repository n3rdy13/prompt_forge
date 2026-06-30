export type FileType = 'reference' | 'troubleshooting' | 'procedures' | 'terminology' | 'tips';

export interface Session {
  id: string;
  description: string;
  domain: string;
  created_at: string;
}

export interface SystemPrompt {
  id: string;
  session_id: string;
  content: string;
  created_at: string;
}

export interface KnowledgeFile {
  id: string;
  session_id: string;
  filename: string;
  title: string;
  content: string;
  file_type: FileType;
  sort_order: number;
  created_at: string;
}

export interface GeneratedAssistant {
  session: Session;
  systemPrompt: SystemPrompt;
  knowledgeFiles: KnowledgeFile[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
