import { useState } from 'react'
import type { Product, ProductPhase } from '../types'
import { lifecycleStages } from '../data/mockData'
import { StageDetailDrawer } from './StageDetailDrawer'

interface Props {
  products: Product[]
}

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

export function RoadmapGantt({ products }: Props) {
  const [selectedStage, setSelectedStage] = useState<{
    product: Product
    phase: ProductPhase
  } | null>(null)

  const stageMap = new Map(lifecycleStages.map((s) => [s.id, s]))
  const totalYears = END_YEAR - START_YEAR + 1
  const chartWidth = totalYears * YEAR_WIDTH

  const todayX = (TODAY_YEAR - START_YEAR) * YEAR_WIDTH + YEAR_WIDTH * 0.5

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

        {products.map((product) => (
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
              <span className="text-[10px] text-slate-400 mt-0.5">
                Nplus上市后1~2年启动
              </span>
            )}
            {product.type === 'planned' && (
              <span className="text-[9px] text-violet-400 mt-px flex items-center gap-1">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                </svg>
                AI 推算时间线
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right: Gantt Canvas */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ width: chartWidth, minWidth: '100%' }}>
          {/* Year Header */}
          <div
            className="flex border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10"
            style={{ height: HEADER_HEIGHT }}
          >
            {Array.from({ length: totalYears }, (_, i) => {
              const year = START_YEAR + i
              const isToday = year === TODAY_YEAR
              return (
                <div
                  key={year}
                  className={`flex-shrink-0 flex items-end justify-center pb-2 border-r border-slate-100 text-xs font-medium ${
                    isToday ? 'text-blue-600 font-bold' : 'text-slate-400'
                  }`}
                  style={{ width: YEAR_WIDTH }}
                >
                  {year}
                </div>
              )
            })}
          </div>

          {/* Product Rows */}
          {products.map((product) => (
            <div
              key={product.id}
              className="relative border-b border-slate-100"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Background grid lines */}
              {Array.from({ length: totalYears }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-slate-50"
                  style={{ left: i * YEAR_WIDTH, width: YEAR_WIDTH }}
                />
              ))}

              {/* Today line for this row */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500 z-20"
                style={{ left: todayX }}
              />

              {/* Phase blocks */}
              <div className="absolute inset-y-0 flex items-center px-1">
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
                      {/* Stage name label */}
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

                      {/* Active pulse indicator */}
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

              {/* Today label */}
              <div
                className="absolute top-0 z-30 -translate-x-1/2"
                style={{ left: todayX }}
              >
                <div className="w-1 h-1.5 bg-blue-500 rounded-full" />
              </div>
            </div>
          ))}

          {/* Today line vertical (full height) */}
          <div
            className="absolute top-0 bottom-0 w-px bg-blue-400/40 z-30 pointer-events-none"
            style={{ left: todayX }}
          />
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
    </div>
  )
}
