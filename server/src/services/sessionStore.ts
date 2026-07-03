import { randomUUID } from 'crypto'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Session {
  messages: Message[]
  lastActivity: number
}

const SESSION_TTL_MS = 60 * 60 * 1000 // 1 hour

const sessions = new Map<string, Session>()

function cleanupExpiredSessions(): void {
  const now = Date.now()
  for (const [sessionId, session] of sessions) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(sessionId)
    }
  }
}

setInterval(cleanupExpiredSessions, 10 * 60 * 1000) // every 10 minutes

export function createSession(customId?: string): string {
  const id = customId ?? randomUUID()
  if (!sessions.has(id)) {
    sessions.set(id, { messages: [], lastActivity: Date.now() })
  }
  return id
}

export function getSession(sessionId: string): Message[] | null {
  const session = sessions.get(sessionId)
  if (!session) return null
  session.lastActivity = Date.now()
  return session.messages
}

export function addMessages(sessionId: string, msgs: Message[]): void {
  const session = sessions.get(sessionId)
  if (!session) return
  session.messages.push(...msgs)
  session.lastActivity = Date.now()
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}
