// ─── AI Providers ────────────────────────────────────────────
export type AIProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "groq"
  | "openrouter"
  | "mistral"
  | "ollama";

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  isEnabled: boolean;
  models: AIModel[];
  color: string;
  icon: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  isFree: boolean;
}

// ─── Messages ─────────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  model?: string;
  provider?: AIProvider;
  tokens?: number;
  cost?: number;
  createdAt: Date;
}

// ─── Prompts ──────────────────────────────────────────────────
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  folderId?: string;
  isPublic: boolean;
  isFavorite: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptFolder {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  promptCount: number;
}

// ─── Tasks ────────────────────────────────────────────────────
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  dueDate?: Date;
  aiSummary?: string;
  subtasks: SubTask[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Usage Analytics ──────────────────────────────────────────
export interface UsageRecord {
  id: string;
  provider: AIProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  createdAt: Date;
}

export interface DailyUsage {
  date: string;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<AIProvider, number>;
}

// ─── Workspace ────────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
  ownerId: string;
}

// ─── User ─────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  locale: "en" | "fa";
  theme: "light" | "dark" | "system";
  activeWorkspaceId: string;
}

// ─── Workflow ─────────────────────────────────────────────────
export type WorkflowNodeType = "prompt" | "ai" | "condition" | "output" | "input";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  config: Record<string, unknown>;
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
