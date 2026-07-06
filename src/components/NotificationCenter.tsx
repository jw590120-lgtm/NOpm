import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { CheckResult } from '../types'
import { showToast } from './Toast'
import { WeeklyReport } from './WeeklyReport'
import * as api from '../api/client'

const mdComponents = {
  strong({ children }: { children: React.ReactNode }) {
    return <strong className="font-semibold text-slate-800">{children}</strong>
  },
  ul({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc pl-4 my-1 space-y-0.5 text-xs">{children}</ul>
  },
  ol({ children }: { children: React.ReactNode }) {
    return <ol className="list-decimal pl-4 my-1 space-y-0.5 text-xs">{children}</ol>
  },
  p({ children }: { children: React.ReactNode }) {
    return <p className="mb-1 last:mb-0">{children}</p>
  },
  code({ children }: { children: React.ReactNode }) {
    return <code className="px-1 py-0.5 bg-indigo-100 rounded text-[11px] text-indigo-700 font-mono">{children}</code>
  },
  table({ children }: { children: React.ReactNode }) {
    return <div className="overflow-x-auto my-1.5 rounded border border-indigo-200"><table className="min-w-full text-[11px]">{children}</table></div>
  },
  thead({ children }: { children: React.ReactNode }) {
    return <thead className="bg-indigo-100/50">{children}</thead>
  },
  th({ children }: { children: React.ReactNode }) {
    return <th className="px-2 py-1 text-left font-semibold text-indigo-700 border-b border-indigo-200 whitespace-nowrap">{children}</th>
  },
  td({ children }: { children: React.ReactNode }) {
    return <td className="px-2 py-1 text-slate-600 border-b border-indigo-100">{children}</td>
  },
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
}

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }

const ACTION_LABELS: Record<string, string> = {
  alert: '预警',
  recommend_new_product: '推荐新产品',
  recommend_retire: '推荐退市',
}

interface Props {
  onClose: () => void
}

export function NotificationCenter({ onClose }: Props) {
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<Record<string, string>>({})
  const [reportOpen, setReportOpen] = useState(false)

  const loadPersisted = useCallback(async () => {
    setError(null)
    try {
      const data = await api.fetchNotifications()
      setResult(data.checkedAt ? data : null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载通知失败'
      setError(msg)
    }
  }, [])

  useEffect(() => {
    loadPersisted()
  }, [loadPersisted])

  const runCheck = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.runRuleCheck()
      setResult(data)
      if (data.totalMatches === 0) {
        showToast('检查完成，所有产品状态正常', 'info')
      } else {
        showToast(`发现 ${data.totalMatches} 条匹配规则`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '检查失败'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAiAnalyze = useCallback(async (notification: Record<string, unknown>) => {
    const n = notification as { match: { ruleId: string; productId: string } }
    const key = `${n.match.ruleId}-${n.match.productId}`
    setAnalyzingId(key)
    try {
      const res = await api.aiAnalyzeNotification(notification)
      setAnalyses((prev) => ({ ...prev, [key]: res.analysis }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI analysis failed'
      showToast(msg, 'error')
    } finally {
      setAnalyzingId(null)
    }
  }, [])

  const healthyCount = result ? result.totalProducts - result.totalMatches : 0

  return (
    <>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">通知中心</h2>
          <p className="text-[10px] text-slate-400">规则引擎全量检查 · 模板通知 · Phase 3</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runCheck}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23,4 23,10 17,10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            )}
            {loading ? '检查中...' : '重新检查'}
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
            title="AI 周报"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
            </svg>
            生成周报
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
            <button onClick={loadPersisted} className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">
              重试
            </button>
          </div>
        ) : !result ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">暂无通知数据</p>
            <p className="text-xs text-slate-400">点击「重新检查」运行规则引擎</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-2xl font-bold text-slate-800">{result.totalProducts}</div>
                <div className="text-[10px] text-slate-400 mt-1">产品总数</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.activeRules}</div>
                <div className="text-[10px] text-slate-400 mt-1">活跃规则</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{healthyCount}</div>
                <div className="text-[10px] text-slate-400 mt-1">正常</div>
              </div>
              <div className={`bg-white rounded-xl border p-4 text-center ${result.totalMatches > 0 ? 'border-amber-300' : 'border-slate-200'}`}>
                <div className={`text-2xl font-bold ${result.totalMatches > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {result.totalMatches}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">需关注</div>
              </div>
            </div>

            {/* Check timestamp */}
            <div className="text-[10px] text-slate-400 px-1">
              上次检查时间：{result.checkedAt ? new Date(result.checkedAt).toLocaleString('zh-CN') : '—'}
            </div>

            {/* Notifications */}
            {result.notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">所有产品状态正常</p>
                <p className="text-xs text-slate-400">当前没有规则被触发</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.notifications.map((n) => (
                  <div
                    key={`${n.match.ruleId}-${n.match.productId}`}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority indicator */}
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                        n.match.priority === 'high' ? 'bg-red-500' :
                        n.match.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-sm font-semibold text-slate-800">{n.title}</h3>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[n.match.priority]}`}>
                            {PRIORITY_LABELS[n.match.priority]}优先级
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {ACTION_LABELS[n.match.action] ?? n.match.action}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-2">{n.message}</p>
                        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 mb-2">
                          建议：{n.suggestion}
                        </p>

                        {/* AI Analysis */}
                        <div className="border-t border-slate-100 pt-2">
                          {analyses[`${n.match.ruleId}-${n.match.productId}`] ? (
                            <div className="bg-indigo-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                                </svg>
                                <span className="text-[10px] font-semibold text-indigo-600">AI 深度分析</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                  {analyses[`${n.match.ruleId}-${n.match.productId}`]}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAiAnalyze(n)}
                              disabled={analyzingId === `${n.match.ruleId}-${n.match.productId}`}
                              className="flex items-center gap-1.5 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors disabled:opacity-50"
                            >
                              {analyzingId === `${n.match.ruleId}-${n.match.productId}` ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                  AI 分析中...
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                                  </svg>
                                  AI 深度分析
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Weekly Report Overlay */}
    {reportOpen && (
      <div className="fixed inset-0 z-[60] flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setReportOpen(false)}
        />
        {/* Panel */}
        <div className="relative w-[540px] bg-white shadow-2xl h-full overflow-hidden animate-slide-in-right z-10">
          <WeeklyReport onClose={() => setReportOpen(false)} />
        </div>
      </div>
    )}
    </>
  )
}
