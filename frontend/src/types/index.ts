export interface BanyaInfo {
  id: string
  name: string
  address: string
  rating: number
  lat: number
  lon: number
  phone: string
  schedule: string
  error?: string
}

export interface RouteStop {
  order: number
  name: string
  address: string
  tip: string
}

export interface RouteInfo {
  route: RouteStop[]
  total_banyas: number
  estimated_duration: string
  region: string
}

export interface CompareRow {
  name: string
  address: string
  rating: number
  phone: string
  schedule: string
}

export interface CompareInfo {
  columns: string[]
  rows: CompareRow[]
}

export type SSEEventType = 'text_delta' | 'tool_use' | 'tool_result' | 'done'

export interface SSEEvent {
  type: SSEEventType
  content?: string
  tool?: string
  input?: Record<string, unknown>
  data?: unknown
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolUse?: { tool: string; input: Record<string, unknown> }
  toolResult?: unknown
  isStreaming?: boolean
}
