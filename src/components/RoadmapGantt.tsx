import { useState, useMemo, useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
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

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [yearRange, setYearRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null })
  const [exporting, setExporting] = useState(false)

  const products = useProductStore((s) => s.products)
  const stages = useProductStore((s) => s.stages)
  const productLines = useProductStore((s) => s.productLines)
  const deleteProduct = useProductStore((s) => s.deleteProduct)

  // Multi-select product line filter (local state, no longer uses store)
  const [selectedLines, setSelectedLines] = useState<string[]>([])

  // Tooltip state for phase block hover
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    productName: string
    stageName: string
    startYear: number
    endYear: number
  } | null>(null)

  const filteredProducts = useMemo(() => {
    let result = products
    // 1. Product line filter (multi-select)
    if (selectedLines.length > 0) result = result.filter((p) => selectedLines.includes(p.productLine))
    // 2. Stage filter: product matches if any of its phases has the selected stageId
    if (selectedStageId) result = result.filter((p) => p.phases.some((ph) => ph.stageId === selectedStageId))
    // 3. Year range filter: product matches if any phase overlaps with the selected range
    if (yearRange.start !== null || yearRange.end !== null) {
      const rangeStart = yearRange.start ?? -Infinity
      const rangeEnd = yearRange.end ?? Infinity
      result = result.filter((p) =>
        p.phases.some((ph) => ph.startYear <= rangeEnd && ph.endYear >= rangeStart),
      )
    }
    return result
  }, [products, selectedLines, selectedStageId, yearRange])

  const hasActiveFilters =
    selectedLines.length > 0 || selectedStageId !== null || yearRange.start !== null || yearRange.end !== null

  const clearAllFilters = () => {
    setSelectedLines([])
    setSelectedStageId(null)
    setYearRange({ start: null, end: null })
  }

  const yearOptions = useMemo(
    () => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
    [],
  )

  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages])
  const totalYears = END_YEAR - START_YEAR + 1
  const chartWidth = totalYears * YEAR_WIDTH
  const todayX = (TODAY_YEAR - START_YEAR) * YEAR_WIDTH + YEAR_WIDTH * 0.5

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)

  const scrollToToday = () => {
    scrollContainerRef.current?.scrollTo({ left: todayX - 300, behavior: 'smooth' })
  }

  const captureGantt = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const el = captureRef.current
    const scrollEl = scrollContainerRef.current
    if (!el || !scrollEl) return null

    // Save original styles
    const origOverflow = scrollEl.style.overflow
    const origWidth = scrollEl.style.width
    const origMinWidth = scrollEl.style.minWidth

    // Expand right gantt area so html2canvas captures the full chart
    scrollEl.style.overflow = 'visible'
    scrollEl.style.width = `${chartWidth}px`
    scrollEl.style.minWidth = '0px'

    return new Promise((resolve) => {
      // Small delay to let the browser reflow before capture
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(el, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          })
          resolve(canvas)
        } catch {
          resolve(null)
        } finally {
          // Restore original styles
          scrollEl.style.overflow = origOverflow
          scrollEl.style.width = origWidth
          scrollEl.style.minWidth = origMinWidth
        }
      }, 50)
    })
  }, [chartWidth])

  const handleCopy = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = await captureGantt()
      if (!canvas) {
        showToast('截图失败，请重试', 'error')
        return
      }
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      )
      if (!blob) {
        showToast('生成图片失败', 'error')
        return
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      showToast('已复制到剪贴板')
    } catch {
      showToast('复制失败，请重试', 'error')
    } finally {
      setExporting(false)
    }
  }, [captureGantt])

  const handleExportImage = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = await captureGantt()
      if (!canvas) {
        showToast('截图失败，请重试', 'error')
        return
      }
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      )
      if (!blob) {
        showToast('生成图片失败', 'error')
        return
      }
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`
      const filename = `路线图_${dateStr}_${timeStr}.png`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('图片已下载')
    } catch {
      showToast('导出失败，请重试', 'error')
    } finally {
      setExporting(false)
    }
  }, [captureGantt])

  const handleExportPdf = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = await captureGantt()
      if (!canvas) {
        showToast('截图失败，请重试', 'error')
        return
      }
      const dataUrl = canvas.toDataURL('image/png')

      const w = window.open('', '_blank', 'width=900,height=700')
      if (!w) {
        showToast('请允许浏览器弹窗以导出 PDF', 'error')
        return
      }
      w.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>路线图导出</title>
  <style>
    @page { margin: 0.5cm; size: landscape; }
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <img src="${dataUrl}" />
</body>
</html>`)
      w.document.close()
      w.focus()
      // Wait for content to render, then trigger print
      w.onload = () => {
        setTimeout(() => {
          w.print()
        }, 300)
      }
      if (w.document.readyState === 'complete') {
        setTimeout(() => {
          w.print()
        }, 300)
      }
    } catch {
      showToast('导出失败，请重试', 'error')
    } finally {
      setExporting(false)
    }
  }, [captureGantt])

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
    <>
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top: Filter & Controls Bar */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-slate-50/80">
        {/* Row 1: Product line filter */}
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">产品线</span>
          <button
            onClick={() => setSelectedLines([])}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedLines.length === 0
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            全部产品线
          </button>
          {productLines.map((line) => (
            <button
              key={line}
              onClick={() =>
                setSelectedLines((prev) =>
                  prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line],
                )
              }
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedLines.includes(line)
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
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 rounded-md text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors"
            >
              清除全部筛选
            </button>
          )}
          {/* Export buttons */}
          <button
            onClick={handleCopy}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {exporting ? '导出中...' : '复制'}
          </button>
          <button
            onClick={handleExportImage}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            {exporting ? '导出中...' : '导出图片'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <polyline points="9,15 12,18 15,15" />
            </svg>
            {exporting ? '导出中...' : '导出PDF'}
          </button>
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

        {/* Row 2: Stage filter + Year range filter */}
        <div className="flex items-center gap-3 px-4 pt-0 pb-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">阶段</span>
          <button
            onClick={() => setSelectedStageId(null)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedStageId === null
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            全部阶段
          </button>
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStageId(selectedStageId === stage.id ? null : stage.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedStageId === stage.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: stage.color }}
              />
              {stage.name}
            </button>
          ))}
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider ml-4 mr-1">时间</span>
          <select
            value={yearRange.start ?? ''}
            onChange={(e) =>
              setYearRange((prev) => ({ ...prev, start: e.target.value ? Number(e.target.value) : null }))
            }
            className="px-2 py-1 rounded-md text-xs border border-slate-200 bg-white text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          >
            <option value="">起始年</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400">至</span>
          <select
            value={yearRange.end ?? ''}
            onChange={(e) =>
              setYearRange((prev) => ({ ...prev, end: e.target.value ? Number(e.target.value) : null }))
            }
            className="px-2 py-1 rounded-md text-xs border border-slate-200 bg-white text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
          >
            <option value="">结束年</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {(yearRange.start !== null || yearRange.end !== null) && (
            <button
              onClick={() => setYearRange({ start: null, end: null })}
              className="px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              清除时间
            </button>
          )}
        </div>
      </div>

      {/* Main: synced Left Labels + Right Gantt */}
      <div ref={captureRef} className="flex flex-1 min-h-0">
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
              {hasActiveFilters ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">没有产品匹配当前筛选条件</p>
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
                  >
                    清除全部筛选
                  </button>
                </div>
              ) : (
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
                  <p className="text-xs text-slate-400">暂无产品数据</p>
                  <button
                    onClick={() => setShowAddDialog(true)}
                    className="text-[11px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
                  >
                    + 新建第一个产品
                  </button>
                </div>
              )}
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
                  const isStageHighlighted = selectedStageId !== null && phase.stageId === selectedStageId

                  return (
                    <div
                      key={phase.id}
                      className={`absolute rounded-lg cursor-pointer group transition-all duration-200 hover:brightness-110 hover:scale-[1.02] hover:z-10 ${
                        isStageHighlighted ? 'z-10 scale-105' : ''
                      }`}
                      style={{
                        left,
                        width: Math.max(width, 8),
                        height: product.type === 'planned' ? ROW_HEIGHT * 0.55 : ROW_HEIGHT * 0.65,
                        backgroundColor: stage.color,
                        opacity,
                        boxShadow: isStageHighlighted
                          ? `0 0 14px ${stage.color}80, 0 0 0 3px ${stage.color}`
                          : isActive
                            ? `0 2px 8px ${stage.color}40, 0 0 0 2px ${stage.color}30`
                            : `0 1px 3px ${stage.color}20`,
                        border: isStageHighlighted
                          ? `2.5px solid ${stage.color}`
                          : product.type === 'planned'
                            ? '1.5px dashed #94a3b8'
                            : 'none',
                      }}
                      onClick={() => setSelectedStage({ product, phase })}
                      onMouseEnter={(e) =>
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          productName: product.name,
                          stageName: stage.name,
                          startYear: phase.startYear,
                          endYear: phase.endYear,
                        })
                      }
                      onMouseMove={(e) =>
                        setTooltip((prev) =>
                          prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
                        )
                      }
                      onMouseLeave={() => setTooltip(null)}
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
      {tooltip && (
        <div
          className="fixed pointer-events-none z-[100] px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800" />
          <div className="font-semibold text-white">{tooltip.productName}</div>
          <div className="text-slate-300">{tooltip.stageName}</div>
          <div className="text-slate-400">{tooltip.startYear} - {tooltip.endYear}</div>
        </div>
      )}
    </>
  )
}
