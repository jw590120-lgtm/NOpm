import { useEffect, useState, useCallback, useMemo } from 'react'
import { RoadmapGantt } from './components/RoadmapGantt'
import { RuleConfigPanel } from './components/RuleConfigPanel'
import { TimelineSimulatorPanel } from './components/TimelineSimulator'
import { StageTemplatePanel } from './components/StageTemplatePanel'
import { NotificationCenter } from './components/NotificationCenter'
import { AiChatPanel } from './components/AiChatPanel'
import { ToastContainer } from './components/Toast'
import { DashboardBar } from './components/DashboardBar'
import { useProductStore } from './stores/productStore'
import * as api from './api/client'

type Page = 'roadmap' | 'rules' | 'simulate' | 'templates'

function App() {
  const [page, setPage] = useState<Page>('roadmap')
  const fetchInitialData = useProductStore((s) => s.fetchInitialData)
  const loading = useProductStore((s) => s.loading)
  const error = useProductStore((s) => s.error)
  const productCount = useProductStore((s) => s.products.length)
  const selectedLine = useProductStore((s) => s.selectedProductLine)
  const stages = useProductStore((s) => s.stages)

  // Sort stages by order for legend display
  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages])

  // Notification drawer
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  // AI chat floating window
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Fetch notification count on mount (for bell badge)
  const refreshNotificationCount = useCallback(async () => {
    try {
      const result = await api.runRuleCheck()
      setNotificationCount(result.totalMatches)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    refreshNotificationCount()
  }, [refreshNotificationCount])

  const handleOpenNotifications = useCallback(() => {
    setNotificationOpen(true)
  }, [])

  const handleCloseNotifications = useCallback(() => {
    setNotificationOpen(false)
    refreshNotificationCount()
  }, [refreshNotificationCount])

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                产品生命周期管理
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">
                Product Lifecycle Manager
              </p>
            </div>
          </div>

          {/* Tab Navigation — only core workflows */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-4">
            <button
              onClick={() => setPage('roadmap')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page === 'roadmap' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              路线图
            </button>
            <button
              onClick={() => setPage('rules')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page === 'rules' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              触发规则
            </button>
            <button
              onClick={() => setPage('simulate')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page === 'simulate' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              时间线模拟
            </button>
            <button
              onClick={() => setPage('templates')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page === 'templates' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              生命周期模板
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Product line filter indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-600">
              {selectedLine ?? '全部产品线'}
            </span>
            <span className="text-[10px] text-slate-400 tabular-nums">
              {productCount} 产品
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={handleOpenNotifications}
            className="relative w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="通知中心"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full bg-red-500 text-[8px] text-white font-bold flex items-center justify-center px-1 border border-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Current date indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span>当前: 2026年</span>
          </div>
        </div>
      </header>

      {/* Legend Bar */}
      <div className="flex-shrink-0 h-10 bg-white border-b border-slate-100 flex items-center gap-4 px-6 overflow-x-auto">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          阶段:
        </span>
        {sortedStages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[11px] text-slate-500 whitespace-nowrap">
              {stage.name}
            </span>
          </div>
        ))}
      </div>

      {/* Dashboard Stats Bar — only on roadmap page */}
      {page === 'roadmap' && <DashboardBar />}

      {/* Main Content */}
      <main className="flex-1 p-4 min-h-0">
        {page === 'rules' ? (
          <RuleConfigPanel onBack={() => setPage('roadmap')} />
        ) : page === 'simulate' ? (
          <TimelineSimulatorPanel onBack={() => setPage('roadmap')} />
        ) : page === 'templates' ? (
          <StageTemplatePanel />
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">加载数据中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">数据加载失败</h3>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <button
                  onClick={() => fetchInitialData()}
                  className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        ) : (
          <RoadmapGantt />
        )}
      </main>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40 group ${chatOpen ? 'hidden' : ''}`}
        title="AI 对话助手"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          AI 对话助手
          <div className="absolute top-full right-4 w-2 h-2 bg-slate-800 rotate-45" />
        </div>
      </button>

      {/* Notification Drawer Overlay */}
      {notificationOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCloseNotifications}
          />
          {/* Drawer */}
          <div className="relative w-[440px] bg-white shadow-2xl h-full overflow-hidden animate-slide-in-right z-10">
            <NotificationCenter onClose={handleCloseNotifications} />
          </div>
        </div>
      )}

      {/* AI Chat Floating Window Overlay */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setChatOpen(false)}
          />
          {/* Chat window */}
          <div className="relative w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-scale-in z-10">
            <AiChatPanel onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="flex-shrink-0 h-7 bg-white border-t border-slate-100 flex items-center justify-between px-6">
        <span className="text-[10px] text-slate-400">
          Phase 4 · AI 智能分析已就绪
        </span>
        <span className="text-[10px] text-slate-400">
          点击阶段色块查看工作详情
        </span>
      </footer>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}

export default App
