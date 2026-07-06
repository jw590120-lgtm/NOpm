import { useState, useEffect, useCallback } from 'react'
import type { Product, ProductPhase, SimulationResult, LifecycleStage } from '../types'
import { showToast } from './Toast'
import * as api from '../api/client'
import { useProductStore } from '../stores/productStore'

const STAGE_NAMES: Record<string, string> = {
  concept: '概念与立项', design: '设计开发', register: '递交注册',
  launch: '产品上市', growth: '销售成长期', mature: '销售成熟期',
  decline: '衰退期', retire: '正式退市',
}

const STAGE_COLORS: Record<string, string> = {
  concept: '#3B82F6', design: '#6366F1', register: '#8B5CF6',
  launch: '#10B981', growth: '#06B6D4', mature: '#F59E0B',
  decline: '#EF4444', retire: '#6B7280',
}

interface Props {
  onBack: () => void
}

export function TimelineSimulatorPanel({ onBack }: Props) {
  const storeProducts = useProductStore((s) => s.products)
  const storeStages = useProductStore((s) => s.stages)
  const addProduct = useProductStore((s) => s.addProduct)

  const [products, setProducts] = useState<Product[]>([])
  const [stages, setStages] = useState<LifecycleStage[]>([])

  // Form state
  const [referenceProductId, setReferenceProductId] = useState('')
  const [triggerStageId, setTriggerStageId] = useState('')
  const [triggerOffset, setTriggerOffset] = useState<'start' | 'end'>('start')
  const [offsetYears, setOffsetYears] = useState(2)
  const [productName, setProductName] = useState('')
  const [productLine, setProductLine] = useState('')

  // Result state
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedPhases, setEditedPhases] = useState<ProductPhase[]>([])
  const [explaining, setExplaining] = useState(false)
  const [explanations, setExplanations] = useState<api.PhaseExplanation[] | null>(null)
  const [explanationError, setExplanationError] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [prods, stgs] = await Promise.all([api.fetchProducts(), api.fetchStages()])
        setProducts(prods)
        setStages(stgs)
        if (prods.length > 0) {
          setReferenceProductId(prods[0].id)
          setProductLine(prods[0].productLine)
        }
      } catch {
        showToast('加载产品数据失败', 'error')
      }
    }
    load()
  }, [])

  // When reference product changes, reset trigger stage
  useEffect(() => {
    const ref = products.find((p) => p.id === referenceProductId)
    if (ref) {
      setProductLine(ref.productLine)
      // Default trigger to the first "active" phase, or first phase
      const activePhase = ref.phases.find((p) => p.status === 'active')
      setTriggerStageId(activePhase?.stageId ?? ref.phases[0]?.stageId ?? '')
    }
  }, [referenceProductId, products])

  const referenceProduct = products.find((p) => p.id === referenceProductId)

  const handleSimulate = async () => {
    if (!referenceProductId || !triggerStageId || !productName.trim()) {
      showToast('请填写完整信息', 'error')
      return
    }
    setSimulating(true)
    setResult(null)
    try {
      const res = await api.simulateTimeline({
        referenceProductId,
        triggerStageId,
        triggerOffset,
        offsetYears,
        productName: productName.trim(),
        productLine: productLine || '默认产品线',
      })
      setResult(res)
      setEditedPhases(res.phases.map((p) => ({ ...p })))
      setExplanations(null)
      setExplanationError(null)
      showToast('时间线生成成功')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '模拟失败', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const updatePhase = (phaseId: string, field: 'startYear' | 'endYear', value: number) => {
    setEditedPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, [field]: value } : p)),
    )
  }

  const handleSaveAsProduct = async () => {
    if (!result) return
    setSaving(true)
    try {
      await addProduct({
        name: result.productName,
        productLine: result.productLine,
        type: 'planned',
        phases: editedPhases,
      })
      showToast(`已创建产品「${result.productName}」`)
      onBack()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExplain = async () => {
    if (!result || !referenceProductId) return
    setExplaining(true)
    setExplanations(null)
    setExplanationError(null)
    try {
      const res = await api.explainTimeline({
        simulation: result,
        referenceProductId,
      })
      setExplanations(res.phaseExplanations)
      if (res.phaseExplanations.length === 0) {
        showToast('AI 未返回有效解释，请重试', 'error')
      } else {
        showToast('AI 解释已生成')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 解释失败'
      setExplanationError(message)
      showToast(message, 'error')
    } finally {
      setExplaining(false)
    }
  }

  const explainMap = new Map<string, api.PhaseExplanation>()
  if (explanations) {
    for (const e of explanations) {
      explainMap.set(e.stageId, e)
    }
  }

  // Calculate timeline range for the chart
  const allYears = result
    ? result.phases.flatMap((p) => [p.startYear, p.endYear])
    : []
  const minYear = allYears.length > 0 ? Math.min(...allYears) : 2028
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 2045
  const totalSpan = Math.max(maxYear - minYear, 1)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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
            <h2 className="text-sm font-bold text-slate-800">新产品时间线模拟</h2>
            <p className="text-[10px] text-slate-400">选择参考产品生成新产品的预估时间线 · Phase 2.5</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* Config Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">模拟参数</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Reference Product */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">参考产品</label>
              <select
                value={referenceProductId}
                onChange={(e) => setReferenceProductId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.productLine})</option>
                ))}
              </select>
            </div>

            {/* Trigger Stage */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">触发阶段</label>
              <select
                value={triggerStageId}
                onChange={(e) => setTriggerStageId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                {referenceProduct?.phases.map((p) => (
                  <option key={p.id} value={p.stageId}>
                    {STAGE_NAMES[p.stageId] ?? p.stageId} ({p.startYear}-{p.endYear})
                  </option>
                ))}
              </select>
            </div>

            {/* Offset */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">偏移年份</label>
              <div className="flex gap-2">
                <select
                  value={triggerOffset}
                  onChange={(e) => setTriggerOffset(e.target.value as 'start' | 'end')}
                  className="w-20 px-2 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="start">起点</option>
                  <option value="end">终点</option>
                </select>
                <span className="flex items-center text-xs text-slate-400">+</span>
                <input
                  type="number"
                  value={offsetYears}
                  onChange={(e) => setOffsetYears(Math.max(0, Number(e.target.value)))}
                  min={0}
                  className="w-16 px-3 py-2 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <span className="flex items-center text-xs text-slate-400">年</span>
              </div>
            </div>
          </div>

          {/* New product info */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">新产品名称 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="如：N四代"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">产品线</label>
              <input
                type="text"
                value={productLine}
                onChange={(e) => setProductLine(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {simulating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    计算中...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></svg>
                    生成时间线
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trigger preview */}
          {referenceProduct && triggerStageId && (
            <div className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
              当「{referenceProduct.name}」的「{STAGE_NAMES[triggerStageId] ?? triggerStageId}」阶段
              {triggerOffset === 'start' ? '开始' : '结束'}
              {offsetYears > 0 ? ` ${offsetYears} 年后` : '时'}，
              启动「{productName || '新'}」产品立项投模
            </div>
          )}
        </div>

        {/* Result Timeline */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  模拟结果 · {result.productName}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  参考「{result.referenceProductName}」· 触发点 {result.triggerPoint}年 · 共 {result.phases.length} 个阶段
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExplain}
                  disabled={explaining}
                  className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {explaining ? (
                    <>
                      <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      AI 解释中...
                    </>
                  ) : explanations ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                      刷新解释
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                      AI 智能解释
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveAsProduct}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存为新产品'}
                </button>
              </div>
            </div>

            {/* Gantt-style timeline */}
            <div className="flex-1 overflow-auto min-h-0">
              <div className="space-y-1">
                {editedPhases.map((phase) => {
                  const stageName = STAGE_NAMES[phase.stageId] ?? phase.stageId
                  const color = STAGE_COLORS[phase.stageId] ?? '#94a3b8'
                  const leftPercent = ((phase.startYear - minYear) / totalSpan) * 100
                  const widthPercent = ((phase.endYear - phase.startYear + 1) / totalSpan) * 100
                  const exp = explainMap.get(phase.stageId)

                  return (
                    <div key={phase.id}>
                      {/* Phase row: label + bar + inputs */}
                      <div className="flex items-center gap-3 group">
                        <div className="w-24 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium text-slate-700">{stageName}</span>
                          </div>
                        </div>

                        <div className="flex-1 h-8 bg-slate-100 rounded-lg relative overflow-hidden">
                          <div
                            className="absolute top-0 h-full rounded-lg opacity-80"
                            style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, backgroundColor: color }}
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="number"
                            value={phase.startYear}
                            onChange={(e) => updatePhase(phase.id, 'startYear', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300"
                          />
                          <span className="text-[10px] text-slate-400">-</span>
                          <input
                            type="number"
                            value={phase.endYear}
                            onChange={(e) => updatePhase(phase.id, 'endYear', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs text-center border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300"
                          />
                        </div>
                      </div>

                      {/* Explanation row */}
                      {exp && (
                        <div className="flex items-start gap-3 ml-24 mr-[140px] -mt-0.5 pb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                              AI: {exp.explanation}
                            </p>
                            {exp.deviation && (
                              <span className={`inline-block text-[9px] mt-0.5 px-1.5 py-0.5 rounded ${
                                exp.deviation.includes('一致') || exp.deviation.includes('相同')
                                  ? 'text-emerald-600 bg-emerald-50'
                                  : 'text-amber-600 bg-amber-50'
                              }`}>
                                {exp.deviation}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Year axis */}
            <div className="flex-shrink-0 mt-3 ml-24 flex items-center">
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => (
                <div key={year} className="flex-1 text-center">
                  <span className="text-[9px] text-slate-400">{year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !simulating && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                  <polyline points="17,6 23,6 23,12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">设置参数后生成时间线</p>
              <p className="text-xs text-slate-400">选择参考产品与触发条件，系统自动计算新产品的各阶段时间</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
