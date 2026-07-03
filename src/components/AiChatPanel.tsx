import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { aiChat, resumeSession } from '../api/client'
import { showToast } from './Toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onClose: () => void
}

const SESSION_STORAGE_KEY = 'plm-ai-session-id'

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const QUICK_PROMPTS = [
  { label: '产品概况', text: '请列出系统中所有产品及其当前所处的生命周期阶段。' },
  { label: 'N系列分析', text: '请详细分析N系列产品各阶段的时间线是否合理，有什么风险？' },
  { label: '新产品建议', text: '基于当前产品组合，我应该启动什么新产品？大概什么时间？' },
  { label: '退市评估', text: '哪些产品当前处于衰退期或面临退市？请给出处理优先级建议。' },
]

/** Custom markdown components styled with Tailwind */
const mdComponents: Components = {
  table({ children }) {
    return (
      <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
        <table className="min-w-full text-xs">{children}</table>
      </div>
    )
  },
  thead({ children }) {
    return <thead className="bg-slate-200/60">{children}</thead>
  },
  th({ children }) {
    return (
      <th className="px-2.5 py-1.5 text-left font-semibold text-slate-600 border-b border-slate-200 whitespace-nowrap">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="px-2.5 py-1.5 text-slate-600 border-b border-slate-100">
        {children}
      </td>
    )
  },
  tr({ children }) {
    return <tr className="even:bg-slate-50/50">{children}</tr>
  },
  strong({ children }) {
    return <strong className="font-semibold text-slate-800">{children}</strong>
  },
  ul({ children }) {
    return <ul className="list-disc pl-4 my-1.5 space-y-0.5">{children}</ul>
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 my-1.5 space-y-0.5">{children}</ol>
  },
  li({ children }) {
    return <li className="text-slate-600">{children}</li>
  },
  p({ children }) {
    return <p className="mb-1.5 last:mb-0">{children}</p>
  },
  code({ className, children, ...props }) {
    const isInline = !className
    if (isInline) {
      return (
        <code className="px-1 py-0.5 bg-slate-200 rounded text-[11px] text-amber-700 font-mono" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="block bg-slate-200 rounded-lg px-3 py-2 my-2 text-[11px] text-slate-700 font-mono overflow-x-auto" {...props}>
        {children}
      </code>
    )
  },
  h2({ children }) {
    return <h2 className="text-sm font-bold text-slate-800 mt-3 mb-1.5">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="text-xs font-semibold text-slate-700 mt-2 mb-1">{children}</h3>
  },
  hr() {
    return <hr className="my-2 border-slate-200" />
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-3 border-blue-300 pl-3 my-2 text-slate-500 italic">
        {children}
      </blockquote>
    )
  },
}

export function AiChatPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string>('')

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const conversation = [...messages, userMsg]
      const result = await aiChat(
        conversation.map((m) => ({ role: m.role, content: m.content })),
        undefined,
        sessionIdRef.current,
      )
      sessionIdRef.current = result.sessionId
      localStorage.setItem(SESSION_STORAGE_KEY, result.sessionId)
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI request failed'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return
    sendMessage(trimmed)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY)

      if (storedId) {
        // Try to resume existing session
        try {
          const session = await resumeSession(storedId)
          if (session.messages && session.messages.length > 0) {
            setMessages(
              session.messages.map((m) => ({ role: m.role, content: m.content })),
            )
            sessionIdRef.current = session.sessionId
            setInitialized(true)
            return
          }
        } catch {
          // Session expired or server restarted — clear and start fresh
          localStorage.removeItem(SESSION_STORAGE_KEY)
        }
      }

      // No valid session to resume — start a new one
      const newId = generateSessionId()
      sessionIdRef.current = newId
      localStorage.setItem(SESSION_STORAGE_KEY, newId)

      try {
        const result = await aiChat(
          [
            {
              role: 'user',
              content: '你好，请简单介绍一下你能帮我做什么，并告诉我系统当前管理了哪些产品。',
            },
          ],
          undefined,
          newId,
        )
        sessionIdRef.current = result.sessionId
        localStorage.setItem(SESSION_STORAGE_KEY, result.sessionId)
        setMessages([{ role: 'assistant', content: result.reply }])
      } catch {
        setMessages([{ role: 'assistant', content: '欢迎使用 AI 助手。请问有什么可以帮助您的？' }])
      }
      setInitialized(true)
    }
    init()
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">AI 对话助手</h2>
          <p className="text-[10px] text-slate-400">DeepSeek · PLM 智能分析 · Phase 4</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {initialized && messages.every((m) => m.role === 'assistant') && (
        <div className="flex-shrink-0 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 mb-2">快捷提问</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.text)}
                disabled={loading}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {!initialized && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {initialized && messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                m.role === 'user'
                  ? 'max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-br-md'
                  : 'max-w-[88%] bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm'
              } px-4 py-3 text-sm leading-relaxed`}
            >
              {m.role === 'user' ? (
                <span>{m.content}</span>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-red-50 text-red-500 text-xs px-3 py-2 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
              <button
                onClick={() => {
                  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
                  if (lastUser) {
                    setMessages((prev) => prev.slice(0, -1))
                    sendMessage(lastUser.content)
                  }
                }}
                className="underline ml-1"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题，例如：N系列目前的风险点是什么？"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9 22,2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
