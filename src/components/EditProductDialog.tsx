import { useState, useEffect } from 'react'
import type { Product } from '../types'
import { useProductStore } from '../stores/productStore'
import { showToast } from './Toast'

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
}

export function EditProductDialog({ open, product, onClose }: Props) {
  const productLines = useProductStore((s) => s.productLines)
  const updateProduct = useProductStore((s) => s.updateProduct)

  const [name, setName] = useState('')
  const [productLine, setProductLine] = useState('')
  const [type, setType] = useState<'existing' | 'in_development' | 'planned'>('planned')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setName(product.name)
      setProductLine(product.productLine)
      setType(product.type)
      setErrors({})
    }
  }, [product, open])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入产品名称'
    if (!productLine.trim()) next.productLine = '请选择产品线'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !product) return
    updateProduct(product.id, { name: name.trim(), productLine, type })
    showToast('产品信息已更新')
    onClose()
  }

  if (!open || !product) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">编辑产品</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                产品名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                产品线 <span className="text-red-400">*</span>
              </label>
              <select
                value={productLine}
                onChange={(e) => setProductLine(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  errors.productLine ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                {productLines.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.productLine && <p className="text-[11px] text-red-500 mt-1">{errors.productLine}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">产品类型</label>
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
          </div>

          <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              取消
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              保存修改
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
