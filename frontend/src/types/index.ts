export interface BanyaInfo {
  id: string
  name: string
  address: string
  rating: number
  reviews_count: number
  lat: number
  lon: number
  phone: string
  website: string
  schedule: string
  description?: string
  photos?: string[]
  rubrics?: string[]
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

export interface ToolStep {
  tool: string
  input: Record<string, unknown>
  result?: unknown
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolSteps?: ToolStep[]
  isStreaming?: boolean
}
