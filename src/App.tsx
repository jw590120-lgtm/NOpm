import { RoadmapGantt } from './components/RoadmapGantt'
import { useProductStore } from './stores/productStore'

function App() {
  const products = useProductStore((s) => s.products)
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
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

        <div className="flex items-center gap-3">
          {/* Product line filter indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-600">N 系列</span>
          </div>

          {/* AI Weekly Report button (Phase 4 placeholder) */}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 opacity-60 cursor-not-allowed select-none"
            title="Phase 4: AI 健康检查周报"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="text-[10px] font-medium text-violet-500">AI 周报</span>
            <span className="text-[9px] text-violet-300 bg-violet-100 px-1 py-px rounded">P4</span>
          </button>

          {/* AI Notification Bell (Phase 4 placeholder) */}
          <button
            disabled
            className="relative w-8 h-8 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 flex items-center justify-center opacity-60 cursor-not-allowed select-none"
            title="Phase 4: AI 智能触发通知"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-violet-300 text-[7px] text-white font-bold flex items-center justify-center border border-white">0</span>
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
        {[
          { label: '概念与立项', color: '#3B82F6' },
          { label: '设计开发', color: '#6366F1' },
          { label: '递交注册', color: '#8B5CF6' },
          { label: '产品上市', color: '#10B981' },
          { label: '销售成长期', color: '#06B6D4' },
          { label: '销售成熟期', color: '#F59E0B' },
          { label: '衰退期', color: '#EF4444' },
          { label: '正式退市', color: '#6B7280' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[11px] text-slate-500 whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 min-h-0">
        <RoadmapGantt products={products} />
      </main>

      {/* Floating AI Chat Button (Phase 5 placeholder) */}
      <button
        disabled
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full border-2 border-dashed border-violet-300 bg-violet-50 flex items-center justify-center opacity-50 cursor-not-allowed select-none shadow-lg z-50 group"
        title="Phase 5: AI 对话助手"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-violet-600 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          AI 对话助手 · Phase 5
          <div className="absolute top-full right-4 w-2 h-2 bg-violet-600 rotate-45" />
        </div>
      </button>

      {/* Footer */}
      <footer className="flex-shrink-0 h-7 bg-white border-t border-slate-100 flex items-center justify-between px-6">
        <span className="text-[10px] text-slate-400">
          预览版本 · Phase 0
        </span>
        <span className="text-[10px] text-slate-400">
          点击阶段色块查看工作详情
        </span>
      </footer>
    </div>
  )
}

export default App
