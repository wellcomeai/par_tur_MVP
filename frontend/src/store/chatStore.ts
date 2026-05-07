import { create } from 'zustand'
import { ChatMessage } from '../types'

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (message: ChatMessage) => void
  appendToLastMessage: (content: string) => void
  setLastMessageToolUse: (tool: string, input: Record<string, unknown>) => void
  setLastMessageToolResult: (data: unknown) => void
  setLastMessageStreaming: (isStreaming: boolean) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content: last.content + content }
      }
      return { messages }
    }),

  setLastMessageToolUse: (tool, input) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, toolUse: { tool, input } }
      }
      return { messages }
    }),

  setLastMessageToolResult: (data) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, toolResult: data }
      }
      return { messages }
    }),

  setLastMessageStreaming: (isStreaming) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, isStreaming }
      }
      return { messages }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}))
