import { useState, useRef, useEffect, useCallback } from 'react'
import { aiChat } from '../api/client'
import { showToast } from './Toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onBack: () => void
}

const QUICK_PROMPTS = [
  { label: '产品概况', text: '请列出系统中所有产品及其当前所处的生命周期阶段。' },
  { label: 'N系列分析', text: '请详细分析N系列产品各阶段的时间线是否合理，有什么风险？' },
  { label: '新产品建议', text: '基于当前产品组合，我应该启动什么新产品？大概什么时间？' },
  { label: '退市评估', text: '哪些产品当前处于衰退期或面临退市？请给出处理优先级建议。' },
]

export function AiChatPanel({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      )
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
      try {
        const result = await aiChat([
          { role: 'user', content: '你好，请简单介绍一下你能帮我做什么，并告诉我系统当前管理了哪些产品。' },
        ])
        setMessages([{ role: 'assistant', content: result.reply }])
      } catch {
        setMessages([{ role: 'assistant', content: '欢迎使用 AI 助手。请问有什么可以帮助您的？' }])
      }
    }
    init()
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800">AI 对话助手</h2>
            <p className="text-[10px] text-slate-400">DeepSeek · PLM 智能分析 · Phase 4</p>
          </div>
        </div>
      </div>

      {messages.every((m) => m.role === 'assistant') && (
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
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
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
