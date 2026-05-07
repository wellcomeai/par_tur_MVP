import { SSEEvent } from '../types'

const API_URL = import.meta.env.VITE_API_URL || ''

export async function streamChat(
  messages: { role: string; content: string }[],
  onEvent: (event: SSEEvent) => void,
  onError: (error: Error) => void
): Promise<void> {
  let response: Response

  try {
    response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
  } catch (e) {
    onError(new Error('Не удалось подключиться к серверу'))
    return
  }

  if (!response.ok) {
    onError(new Error(`Ошибка сервера: ${response.status}`))
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError(new Error('Не удалось читать ответ сервера'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim()
          if (!raw) continue
          try {
            const event: SSEEvent = JSON.parse(raw)
            onEvent(event)
          } catch {
            // skip malformed lines
          }
        }
      }
    }
  } catch (e) {
    onError(new Error('Ошибка при чтении потока данных'))
  } finally {
    reader.releaseLock()
  }
}
