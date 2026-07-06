import { useState } from 'react'
import type { Product, ProductPhase, LifecycleStage } from '../types'
import { useProductStore } from '../stores/productStore'

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
  const updatePhase = useProductStore((s) => s.updatePhase)
  const deletePhase = useProductStore((s) => s.deletePhase)
  const addPhase = useProductStore((s) => s.addPhase)
  const stages = useProductStore((s) => s.stages)

  const [editingPhase, setEditingPhase] = useState(false)
  const [editPhaseData, setEditPhaseData] = useState({
    startYear: 0,
    endYear: 0,
    status: 'upcoming' as ProductPhase['status'],
  })

  const startEditing = () => {
    if (!phase) return
    setEditPhaseData({
      startYear: phase.startYear,
      endYear: phase.endYear,
      status: phase.status,
    })
    setEditingPhase(true)
  }

  const savePhaseEdit = () => {
    if (!product || !phase) return
    updatePhase(product.id, phase.id, editPhaseData)
    setEditingPhase(false)
  }

  const handleDeletePhase = () => {
    if (!product || !phase) return
    deletePhase(product.id, phase.id)
    onClose()
  }

  const handleAddPhase = () => {
    if (!product) return
    const firstStage = stages[0]
    addPhase(product.id, {
      stageId: firstStage?.id ?? 'concept',
      startYear: 2027,
      endYear: 2028,
      status: 'upcoming',
    })
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 480 }}
      >
        {product && phase && stage ? (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: stage.color }} />
                  <h2 className="text-lg font-bold text-slate-800">{stage.name}</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {editingPhase ? (
                <div className="flex items-center gap-2 text-xs">
                  <input type="number" value={editPhaseData.startYear} onChange={(e) => setEditPhaseData((d) => ({ ...d, startYear: Number(e.target.value) }))} className="w-20 px-2 py-1 border border-slate-200 rounded text-center" /> ~
                  <input type="number" value={editPhaseData.endYear} onChange={(e) => setEditPhaseData((d) => ({ ...d, endYear: Number(e.target.value) }))} className="w-20 px-2 py-1 border border-slate-200 rounded text-center" />
                  <select value={editPhaseData.status} onChange={(e) => setEditPhaseData((d) => ({ ...d, status: e.target.value as ProductPhase['status'] }))} className="px-2 py-1 border border-slate-200 rounded text-xs">
                    <option value="upcoming">待开始</option>
                    <option value="active">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                  <button onClick={savePhaseEdit} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">保存</button>
                  <button onClick={() => setEditingPhase(false)} className="px-3 py-1 bg-slate-100 rounded text-xs">取消</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{product.name}</span>
                    <span className="text-slate-300">·</span>
                    <span>{phase.startYear} - {phase.endYear}</span>
                    <span className="text-slate-300">·</span>
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
                  <div className="flex items-center gap-1">
                    <button onClick={startEditing} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="编辑阶段">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button onClick={handleDeletePhase} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="删除阶段">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-slate-200 mx-6" />

            {/* Sub-stages list */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  子阶段工作项 ({stage.subStages.length})
                </h3>
                <button onClick={handleAddPhase} className="text-[10px] text-blue-500 font-medium hover:text-blue-600 transition-colors">
                  + 新增阶段
                </button>
              </div>

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
                        <h4 className="text-sm font-semibold text-slate-800 truncate">{sub.name}</h4>
                      </div>
                      <span className={`flex-shrink-0 inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[sub.category] ?? 'bg-slate-100 text-slate-500'}`}>
                        {sub.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{sub.description}</p>
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
