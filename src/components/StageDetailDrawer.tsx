import type { Product, ProductPhase, LifecycleStage } from '../types'

interface Props {
  open: boolean
  product: Product | null
  phase: ProductPhase | null
  stage: LifecycleStage | null
  onClose: () => void
}

const PHASE_STATUS_LABELS: Record<string, string> = {
  completed: '已完成',
  active: '进行中',
  upcoming: '待开始',
}

const CATEGORY_COLORS: Record<string, string> = {
  '研发': 'bg-indigo-50 text-indigo-600',
  '注册': 'bg-purple-50 text-purple-600',
  '市场': 'bg-emerald-50 text-emerald-600',
  '临床': 'bg-cyan-50 text-cyan-600',
  '其他': 'bg-slate-100 text-slate-500',
}

export function StageDetailDrawer({ open, product, phase, stage, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 480 }}
      >
        {product && phase && stage ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h2 className="text-lg font-bold text-slate-800">{stage.name}</h2>
                  <span
                    className={`inline-flex text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      phase.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : phase.status === 'completed'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {PHASE_STATUS_LABELS[phase.status]}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Product and time info */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="font-medium text-slate-700">{product.name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>
                  {phase.startYear} ~ {phase.endYear}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>约 {phase.endYear - phase.startYear} 年</span>
              </div>
            </div>

            {/* Sub-stages list */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                阶段工作项 · {stage.subStages.length} 项
              </h3>

              {/* AI Explanation placeholder */}
              <div className="mb-4 p-3 rounded-lg border border-dashed border-violet-200 bg-violet-50/50 opacity-70 select-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                  </svg>
                  <span className="text-[10px] font-semibold text-violet-500">AI 阶段分析 · Phase 4</span>
                </div>
                <p className="text-[10px] text-violet-400 leading-relaxed">
                  AI 将根据历史数据自动生成此阶段的解释说明、预估工期合理性分析、以及与同类产品的对比标注。
                </p>
              </div>
              <div className="space-y-3">
                {stage.subStages.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {sub.name}
                        </h4>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          CATEGORY_COLORS[sub.category] ?? 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sub.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      {sub.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      <span className="text-xs text-slate-500">
                        预估 {sub.durationMonths[0]}~{sub.durationMonths[1]} 个月
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}
