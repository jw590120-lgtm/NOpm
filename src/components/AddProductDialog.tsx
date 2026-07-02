import { useState } from 'react'
import { useProductStore } from '../stores/productStore'
import { showToast } from './Toast'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddProductDialog({ open, onClose }: Props) {
  const productLines = useProductStore((s) => s.productLines)
  const stages = useProductStore((s) => s.stages)
  const addProduct = useProductStore((s) => s.addProduct)

  const [name, setName] = useState('')
  const [productLine, setProductLine] = useState(productLines[0] ?? '')
  const [customLine, setCustomLine] = useState('')
  const [useCustomLine, setUseCustomLine] = useState(false)
  const [type, setType] = useState<'existing' | 'in_development' | 'planned'>('planned')
  const [startYear, setStartYear] = useState(2028)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入产品名称'
    const line = useCustomLine ? customLine.trim() : productLine
    if (!line) next.productLine = '请选择或输入产品线'
    if (!startYear || startYear < 2018 || startYear > 2050) next.startYear = '请输入合理年份 (2018-2050)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const line = useCustomLine ? customLine.trim() : productLine

    // Auto-generate phases from lifecycle template
    let currentYear = startYear
    const phases = stages.map((stage) => {
      const duration = stage.subStages.reduce(
        (sum, s) => sum + (s.durationMonths[1] ?? s.durationMonths[0]),
        0,
      )
      const durationYears = Math.max(Math.round(duration / 12), 1)
      const phase = {
        id: `ph_${Date.now()}_${i}`,
        stageId: stage.id,
        startYear: currentYear,
        endYear: currentYear + durationYears,
        status: 'upcoming' as const,
      }
      currentYear += durationYears
      return phase
    })

    addProduct({ name: name.trim(), productLine: line, type, phases })
    showToast(`已创建产品「${name.trim()}」`)
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setCustomLine('')
    setUseCustomLine(false)
    setType('planned')
    setStartYear(2028)
    setErrors({})
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50 animate-[fadeIn_0.2s_ease-out]" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">新建产品</h2>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                产品名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：N四代"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Product Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                产品线 <span className="text-red-400">*</span>
              </label>
              {!useCustomLine ? (
                <div className="flex gap-2">
                  <select
                    value={productLine}
                    onChange={(e) => setProductLine(e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.productLine ? 'border-red-300' : 'border-slate-200'
                    }`}
                  >
                    {productLines.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomLine(true)}
                    className="px-3 py-2 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    + 新建
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customLine}
                    onChange={(e) => setCustomLine(e.target.value)}
                    placeholder="输入新产品线名称"
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                      errors.productLine ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomLine(false)}
                    className="px-3 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    选择已有
                  </button>
                </div>
              )}
              {errors.productLine && <p className="text-[11px] text-red-500 mt-1">{errors.productLine}</p>}
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                产品类型
              </label>
              <div className="flex gap-2">
                {([
                  { value: 'existing' as const, label: '已有产品', desc: '已上市' },
                  { value: 'in_development' as const, label: '在研产品', desc: '开发中' },
                  { value: 'planned' as const, label: '规划中', desc: '未来计划' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg border text-center transition-colors ${
                      type === opt.value
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] opacity-60">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                立项年份 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                min={2018}
                max={2050}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.startYear ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
              {errors.startYear && <p className="text-[11px] text-red-500 mt-1">{errors.startYear}</p>}
            </div>

            {/* Preview of generated timeline */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                自动生成时间线预览
              </p>
              <div className="space-y-1">
                {stages.map((stage, i) => {
                  const duration = stage.subStages.reduce(
                    (sum, s) => sum + (s.durationMonths[1] ?? s.durationMonths[0]),
                    0,
                  )
                  const durationYears = Math.max(Math.round(duration / 12), 1)
                  const phaseStart = startYear + stages.slice(0, i).reduce(
                    (sum, s) =>
                      sum + Math.max(Math.round(s.subStages.reduce((a, b) => a + (b.durationMonths[1] ?? b.durationMonths[0]), 0) / 12), 1),
                    0,
                  )
                  return (
                    <div key={stage.id} className="flex items-center gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="text-slate-600">{stage.name}</span>
                      <span className="text-slate-400">
                        {phaseStart} - {phaseStart + durationYears}
                      </span>
                      <span className="text-[10px] text-slate-300">约{durationYears}年</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建产品
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
