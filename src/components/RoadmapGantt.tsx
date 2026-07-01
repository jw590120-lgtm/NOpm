import { useState, useMemo, useRef } from 'react'
import type { Product, ProductPhase } from '../types'
import { useProductStore } from '../stores/productStore'
import { StageDetailDrawer } from './StageDetailDrawer'

const START_YEAR = 2018
const END_YEAR = 2045
const YEAR_WIDTH = 64
const ROW_HEIGHT = 64
const LABEL_WIDTH = 180
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

  const products = useProductStore((s) => s.products)
  const stages = useProductStore((s) => s.stages)
  const productLines = useProductStore((s) => s.productLines)
  const selectedLine = useProductStore((s) => s.selectedProductLine)
  const setSelectedLine = useProductStore((s) => s.setSelectedProductLine)

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
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Left: Product Labels */}
      <div className="flex-shrink-0 border-r border-slate-200 bg-slate-50/80" style={{ width: LABEL_WIDTH }}>
        {/* Header placeholder */}
        <div
          className="flex items-end px-5 pb-2 border-b border-slate-200"
          style={{ height: HEADER_HEIGHT }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            产品线
          </span>
        </div>

        {/* Product line filter chips */}
        <div className="px-3 py-2 border-b border-slate-200 space-y-1">
          <button
            onClick={() => setSelectedLine(null)}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedLine === line
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: '#3B82F6' }}
              />
              {line}
            </button>
          ))}
        </div>

        {/* Product rows */}
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-center px-5 border-b border-slate-100 hover:bg-slate-100/50 transition-colors"
            style={{ height: ROW_HEIGHT }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{product.name}</span>
              <span
                className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  STATUS_LABELS[product.type]?.className ?? ''
                }`}
              >
                {STATUS_LABELS[product.type]?.text}
              </span>
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
        ))}
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
    </div>
  )
}
