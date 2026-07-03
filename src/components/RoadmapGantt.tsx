import { useState, useMemo, useRef } from 'react'
import type { Product, ProductPhase } from '../types'
import { useProductStore } from '../stores/productStore'
import { StageDetailDrawer } from './StageDetailDrawer'
import { AddProductDialog } from './AddProductDialog'
import { EditProductDialog } from './EditProductDialog'
import { showToast } from './Toast'

const START_YEAR = 2018
const END_YEAR = 2045
const YEAR_WIDTH = 64
const ROW_HEIGHT = 64
const LABEL_WIDTH = 200
const HEADER_HEIGHT = 48
const TODAY_YEAR = 2026

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  existing: { text: '已有产品', className: 'bg-sky-100 text-sky-700' },
  in_development: { text: '在研', className: 'bg-amber-100 text-amber-700' },
  planned: { text: '规划中', className: 'bg-violet-100 text-violet-700' },
}

export function RoadmapGantt() {
  const [selectedStage, setSelectedStage] = useState<{
    product: Product
    phase: ProductPhase
  } | null>(null)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const products = useProductStore((s) => s.products)
  const stages = useProductStore((s) => s.stages)
  const productLines = useProductStore((s) => s.productLines)
  const selectedLine = useProductStore((s) => s.selectedProductLine)
  const setSelectedLine = useProductStore((s) => s.setSelectedProductLine)
  const deleteProduct = useProductStore((s) => s.deleteProduct)

  const filteredProducts = useMemo(
    () => (selectedLine ? products.filter((p) => p.productLine === selectedLine) : products),
    [products, selectedLine],
  )

  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages])
  const totalYears = END_YEAR - START_YEAR + 1
  const chartWidth = totalYears * YEAR_WIDTH
  const todayX = (TODAY_YEAR - START_YEAR) * YEAR_WIDTH + YEAR_WIDTH * 0.5

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToToday = () => {
    scrollContainerRef.current?.scrollTo({ left: todayX - 300, behavior: 'smooth' })
  }

  const yearHeaders = useMemo(
    () =>
      Array.from({ length: totalYears }, (_, i) => {
        const year = START_YEAR + i
        const isToday = year === TODAY_YEAR
        return { year, isToday }
      }),
    [],
  )

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top: Filter & Controls Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-slate-200 bg-slate-50/80">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">产品线</span>
        <button
          onClick={() => setSelectedLine(null)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedLine === null
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          📋 全部产品线
        </button>
        {productLines.map((line) => (
          <button
            key={line}
            onClick={() => setSelectedLine(line)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedLine === line
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: '#3B82F6' }}
            />
            {line}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border-2 border-dashed border-blue-200 text-xs font-medium text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建产品
        </button>
      </div>

      {/* Main: synced Left Labels + Right Gantt */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Product Labels */}
        <div className="flex-shrink-0 border-r border-slate-200 bg-slate-50/80" style={{ width: LABEL_WIDTH }}>
          {/* Header placeholder */}
          <div
            className="flex items-end px-5 pb-2 border-b border-slate-200"
            style={{ height: HEADER_HEIGHT }}
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              产品名称
            </span>
          </div>

          {/* Product rows */}
          {filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-4 text-center">
              <div className="space-y-2">
                <svg className="mx-auto text-slate-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="16" y1="10" x2="16" y2="14" />
                </svg>
                <p className="text-xs text-slate-400">
                  {selectedLine ? `「${selectedLine}」暂无产品` : '暂无产品数据'}
                </p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="text-[11px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
                >
                  + 新建第一个产品
                </button>
              </div>
            </div>
          ) : (
            filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-center px-4 border-b border-slate-100 hover:bg-slate-100/50 transition-colors group"
              style={{ height: ROW_HEIGHT }}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{product.name}</span>
                  <span
                    className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      STATUS_LABELS[product.type]?.className ?? ''
                    }`}
                  >
                    {STATUS_LABELS[product.type]?.text}
                  </span>
                </div>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title="编辑产品"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除产品"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              {product.type === 'planned' && (
                <>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Nplus上市后1~2年启动
                  </span>
                  <span className="text-[9px] text-violet-400 mt-px flex items-center gap-1">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                    </svg>
                    AI 推算时间线
                  </span>
                </>
              )}
            </div>
          ))
          )}
        </div>

        {/* Right: Gantt Canvas */}
        <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
          <div className="relative" style={{ width: chartWidth, minWidth: '100%' }}>
            {/* Year Header */}
            <div
              className="flex border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10"
              style={{ height: HEADER_HEIGHT }}
            >
              {yearHeaders.map(({ year, isToday }) => (
                <div
                  key={year}
                  className={`flex-shrink-0 flex items-end justify-center pb-2 border-r border-slate-100 text-xs font-medium ${
                    isToday ? 'text-blue-600 font-bold' : 'text-slate-400'
                  }`}
                  style={{ width: YEAR_WIDTH }}
                >
                  {year}
                </div>
              ))}
            </div>

            {/* Product Rows */}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="relative border-b border-slate-100"
                style={{ height: ROW_HEIGHT }}
              >
                {product.phases.map((phase) => {
                  const stage = stageMap.get(phase.stageId)
                  if (!stage) return null

                  const left = (phase.startYear - START_YEAR) * YEAR_WIDTH
                  const width = (phase.endYear - phase.startYear) * YEAR_WIDTH
                  const isActive = phase.status === 'active'
                  const opacity = phase.status === 'upcoming' ? (product.type === 'planned' ? 0.55 : 0.75) : 1

                  return (
                    <div
                      key={phase.id}
                      className="absolute rounded-lg cursor-pointer group transition-all duration-200 hover:brightness-110 hover:scale-[1.02] hover:z-10"
                      style={{
                        left,
                        width: Math.max(width, 8),
                        height: product.type === 'planned' ? ROW_HEIGHT * 0.55 : ROW_HEIGHT * 0.65,
                        backgroundColor: stage.color,
                        opacity,
                        boxShadow: isActive
                          ? `0 2px 8px ${stage.color}40, 0 0 0 2px ${stage.color}30`
                          : `0 1px 3px ${stage.color}20`,
                        border: product.type === 'planned' ? '1.5px dashed #94a3b8' : 'none',
                      }}
                      onClick={() => setSelectedStage({ product, phase })}
                      title={`${stage.name}: ${phase.startYear} - ${phase.endYear}`}
                    >
                      <div className="h-full flex items-center px-2 overflow-hidden">
                        <span
                          className={`text-xs font-semibold whitespace-nowrap truncate ${
                            product.type === 'planned' ? 'text-[10px]' : 'text-xs'
                          }`}
                          style={{ color: '#fff' }}
                        >
                          {stage.name}
                        </span>
                      </div>
                      {isActive && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                          style={{ backgroundColor: stage.color }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Today line vertical (full height) */}
            <div
              className="absolute top-0 bottom-0 w-px bg-blue-400/40 z-30 pointer-events-none"
              style={{ left: todayX }}
            />
          </div>

        {/* Scroll-to-today button */}
        <button
          onClick={scrollToToday}
          className="fixed bottom-28 right-6 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-lg transition-all z-40"
          title="滚动到今日"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </button>
      </div>
      </div>

      {/* Stage Detail Drawer */}
      <StageDetailDrawer
        open={selectedStage !== null}
        product={selectedStage?.product ?? null}
        phase={selectedStage?.phase ?? null}
        stage={
          selectedStage
            ? (stageMap.get(selectedStage.phase.stageId) ?? null)
            : null
        }
        onClose={() => setSelectedStage(null)}
      />

      {/* Add Product Dialog */}
      <AddProductDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />

      {/* Edit Product Dialog */}
      <EditProductDialog open={editingProduct !== null} product={editingProduct} onClose={() => setEditingProduct(null)} />

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 animate-[fadeIn_0.2s_ease-out]" onClick={() => setDeletingProduct(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-[scaleIn_0.2s_ease-out]">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">确认删除</h3>
              <p className="text-xs text-slate-500 mb-5">
                确定要删除产品 <span className="font-semibold text-slate-700">「{deletingProduct.name}」</span> 吗？此操作不可撤销。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="flex-1 px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    deleteProduct(deletingProduct.id)
                    showToast(`已删除产品「${deletingProduct.name}」`, 'info')
                    setDeletingProduct(null)
                  }}
                  className="flex-1 px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
