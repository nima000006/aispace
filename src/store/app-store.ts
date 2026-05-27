import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { AIProvider, Message, Prompt, Task, Workspace } from "@/types";

// ─── Settings Slice ───────────────────────────────────────────
interface SettingsState {
  theme: "light" | "dark" | "system";
  locale: "en" | "fa";
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  apiKeys: Partial<Record<AIProvider, string>>;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLocale: (locale: "en" | "fa") => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setApiKey: (provider: AIProvider, key: string) => void;
  removeApiKey: (provider: AIProvider) => void;
}

// ─── Playground Slice ─────────────────────────────────────────
interface PlaygroundState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  selectedModel: string;
  selectedProvider: AIProvider;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  isStreaming: boolean;
  createSession: () => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setModel: (model: string, provider: AIProvider) => void;
  setTemperature: (t: number) => void;
  setMaxTokens: (t: number) => void;
  setSystemPrompt: (p: string) => void;
  clearSession: (id: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: AIProvider;
  createdAt: Date;
}

// ─── Prompts Slice ────────────────────────────────────────────
interface PromptsState {
  prompts: Prompt[];
  searchQuery: string;
  selectedTags: string[];
  addPrompt: (prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt" | "version">) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedTags: (tags: string[]) => void;
}

// ─── Tasks Slice ──────────────────────────────────────────────
interface TasksState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: Task["status"]) => void;
}

// ─── Workspace Slice ──────────────────────────────────────────
interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
}

// ─── Combined Store ───────────────────────────────────────────
type AppStore = SettingsState &
  PlaygroundState &
  PromptsState &
  TasksState &
  WorkspaceState;

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ─── Settings ─────────────────────────────────────────
      theme: "system",
      locale: "en",
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      apiKeys: {},

      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setApiKey: (provider, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } })),
      removeApiKey: (provider) =>
        set((s) => {
          const keys = { ...s.apiKeys };
          delete keys[provider];
          return { apiKeys: keys };
        }),

      // ─── Playground ───────────────────────────────────────
      sessions: [],
      activeSessionId: null,
      selectedModel: "llama-3.3-70b-versatile",
      selectedProvider: "groq",
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: "",
      isStreaming: false,

      createSession: () => {
        const { selectedModel, selectedProvider } = get();
        const session: ChatSession = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          model: selectedModel,
          provider: selectedProvider,
          createdAt: new Date(),
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeSessionId: session.id,
        }));
      },

      deleteSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((sess) => sess.id !== id),
          activeSessionId:
            s.activeSessionId === id
              ? (s.sessions[0]?.id ?? null)
              : s.activeSessionId,
        })),

      setActiveSession: (id) => set({ activeSessionId: id }),

      addMessage: (sessionId, message) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  messages: [...sess.messages, message],
                  title:
                    sess.messages.length === 0 && message.role === "user"
                      ? message.content.slice(0, 40)
                      : sess.title,
                }
              : sess
          ),
        })),

      updateLastMessage: (sessionId, content) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  messages: sess.messages.map((m, i) =>
                    i === sess.messages.length - 1
                      ? { ...m, content }
                      : m
                  ),
                }
              : sess
          ),
        })),

      setStreaming: (isStreaming) => set({ isStreaming }),
      setModel: (selectedModel, selectedProvider) =>
        set({ selectedModel, selectedProvider }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),

      clearSession: (id) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, messages: [] } : sess
          ),
        })),

      // ─── Prompts ──────────────────────────────────────────
      prompts: [],
      searchQuery: "",
      selectedTags: [],

      addPrompt: (data) => {
        const prompt: Prompt = {
          ...data,
          id: generateId(),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ prompts: [prompt, ...s.prompts] }));
      },

      updatePrompt: (id, updates) =>
        set((s) => ({
          prompts: s.prompts.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date(), version: p.version + 1 }
              : p
          ),
        })),

      deletePrompt: (id) =>
        set((s) => ({ prompts: s.prompts.filter((p) => p.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          prompts: s.prompts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        })),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedTags: (selectedTags) => set({ selectedTags }),

      // ─── Tasks ────────────────────────────────────────────
      tasks: [],

      addTask: (data) => {
        const task: Task = {
          ...data,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTask: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date() } : t
          ),
        })),

      // ─── Workspace ────────────────────────────────────────
      workspaces: [
        {
          id: "default",
          name: "Personal Workspace",
          slug: "personal",
          plan: "free",
          ownerId: "user-1",
        },
      ],
      activeWorkspaceId: "default",
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
    }),
    {
      name: "aispace-store",
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed,
        apiKeys: state.apiKeys,
        sessions: state.sessions,
        prompts: state.prompts,
        tasks: state.tasks,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        selectedModel: state.selectedModel,
        selectedProvider: state.selectedProvider,
      }),
    }
  )
);

// ─── Selector Hooks ───────────────────────────────────────────
// useShallow prevents new object references on every render, which would
// cause useSyncExternalStore's getServerSnapshot to loop during SSR.
export const useSettings = () =>
  useAppStore(
    useShallow((s) => ({
      theme: s.theme,
      locale: s.locale,
      sidebarCollapsed: s.sidebarCollapsed,
      mobileSidebarOpen: s.mobileSidebarOpen,
      apiKeys: s.apiKeys,
      setTheme: s.setTheme,
      setLocale: s.setLocale,
      toggleSidebar: s.toggleSidebar,
      setMobileSidebarOpen: s.setMobileSidebarOpen,
      setApiKey: s.setApiKey,
      removeApiKey: s.removeApiKey,
    }))
  );

export const usePlayground = () =>
  useAppStore(
    useShallow((s) => ({
      sessions: s.sessions,
      activeSessionId: s.activeSessionId,
      activeSession: s.sessions.find((sess) => sess.id === s.activeSessionId),
      selectedModel: s.selectedModel,
      selectedProvider: s.selectedProvider,
      temperature: s.temperature,
      maxTokens: s.maxTokens,
      systemPrompt: s.systemPrompt,
      isStreaming: s.isStreaming,
      createSession: s.createSession,
      deleteSession: s.deleteSession,
      setActiveSession: s.setActiveSession,
      addMessage: s.addMessage,
      updateLastMessage: s.updateLastMessage,
      setStreaming: s.setStreaming,
      setModel: s.setModel,
      setTemperature: s.setTemperature,
      setMaxTokens: s.setMaxTokens,
      setSystemPrompt: s.setSystemPrompt,
      clearSession: s.clearSession,
    }))
  );

export const usePrompts = () =>
  useAppStore(
    useShallow((s) => ({
      prompts: s.prompts,
      searchQuery: s.searchQuery,
      selectedTags: s.selectedTags,
      addPrompt: s.addPrompt,
      updatePrompt: s.updatePrompt,
      deletePrompt: s.deletePrompt,
      toggleFavorite: s.toggleFavorite,
      setSearchQuery: s.setSearchQuery,
      setSelectedTags: s.setSelectedTags,
    }))
  );

export const useTasks = () =>
  useAppStore(
    useShallow((s) => ({
      tasks: s.tasks,
      addTask: s.addTask,
      updateTask: s.updateTask,
      deleteTask: s.deleteTask,
      moveTask: s.moveTask,
    }))
  );
