import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { showToast } from './Toast'
import * as api from '../api/client'

const mdComponents = {
  h1({ children }: { children: React.ReactNode }) {
    return <h1 className="text-xl font-bold text-slate-800 mb-3 mt-4 first:mt-0">{children}</h1>
  },
  h2({ children }: { children: React.ReactNode }) {
    return <h2 className="text-base font-bold text-slate-700 mb-2 mt-4 border-b border-slate-200 pb-1">{children}</h2>
  },
  h3({ children }: { children: React.ReactNode }) {
    return <h3 className="text-sm font-semibold text-slate-700 mb-1.5 mt-3">{children}</h3>
  },
  p({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-slate-600 leading-relaxed mb-2 last:mb-0">{children}</p>
  },
  ul({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-slate-600">{children}</ul>
  },
  ol({ children }: { children: React.ReactNode }) {
    return <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-slate-600">{children}</ol>
  },
  strong({ children }: { children: React.ReactNode }) {
    return <strong className="font-semibold text-slate-800">{children}</strong>
  },
  blockquote({ children }: { children: React.ReactNode }) {
    return <blockquote className="border-l-3 border-blue-300 pl-3 py-0.5 my-2 text-sm text-slate-500 italic">{children}</blockquote>
  },
  code({ children }: { children: React.ReactNode }) {
    return <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-indigo-600 font-mono">{children}</code>
  },
}

interface Props {
  onClose: () => void
}

export function WeeklyReport({ onClose }: Props) {
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.generateWeeklyReport()
      setReport(result.report)
      setGeneratedAt(new Date().toLocaleString('zh-CN'))
      showToast('周报生成成功')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成周报失败'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report)
      showToast('周报已复制到剪贴板')
    } catch {
      showToast('复制失败，请手动复制', 'error')
    }
  }, [report])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">AI 健康检查周报</h2>
          <p className="text-[10px] text-slate-400">
            {generatedAt ? `生成时间：${generatedAt}` : '基于规则引擎检查结果，由 AI 自动生成'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              复制
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : report ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23,4 23,10 17,10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                重新生成
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                </svg>
                生成周报
              </>
            )}
          </button>
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={handleGenerate} className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">
              重试
            </button>
          </div>
        ) : report ? (
          <div className="max-w-3xl mx-auto print:max-w-none print:p-0">
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {report}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 mb-1">AI 健康检查周报</p>
              <p className="text-xs text-slate-400 max-w-xs">
                点击上方"生成周报"按钮，AI 将基于规则引擎检查结果自动生成一份结构化的中文周报
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
