import { useState, useEffect } from 'react'
import type { LifecycleStage, SubStage } from '../types'
import { showToast } from './Toast'
import { useProductStore } from '../stores/productStore'

const PRESET_COLORS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#10B981',
  '#06B6D4', '#F59E0B', '#EF4444', '#6B7280',
]

const CATEGORY_OPTIONS: SubStage['category'][] = ['研发', '注册', '市场', '临床', '其他']

function generateSubStageId(parentId: string, index: number): string {
  return `${parentId}-sub-${index + 1}`
}

// ── SubStage Editor (inline mini-dialog) ──

interface SubStageEditorProps {
  subStage: SubStage
  onChange: (updated: SubStage) => void
  onCancel: () => void
  onSave: () => void
}

function SubStageEditor({ subStage, onChange, onCancel, onSave }: SubStageEditorProps) {
  const handleField = <K extends keyof SubStage>(key: K, value: SubStage[K]) => {
    onChange({ ...subStage, [key]: value })
  }

  return (
    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-3 space-y-2.5">
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-1">子阶段名称</label>
        <input
          type="text"
          value={subStage.name}
          onChange={(e) => handleField('name', e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 mb-1">描述</label>
        <textarea
          value={subStage.description}
          onChange={(e) => handleField('description', e.target.value)}
          rows={2}
          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-1">类别</label>
          <select
            value={subStage.category}
            onChange={(e) => handleField('category', e.target.value as SubStage['category'])}
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">最小(月)</label>
            <input
              type="number"
              min={0}
              value={subStage.durationMonths[0]}
              onChange={(e) => handleField('durationMonths', [Math.max(0, Number(e.target.value)), subStage.durationMonths[1]])}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">最大(月)</label>
            <input
              type="number"
              min={0}
              value={subStage.durationMonths[1]}
              onChange={(e) => handleField('durationMonths', [subStage.durationMonths[0], Math.max(0, Number(e.target.value))])}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-[10px] font-medium text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          确认
        </button>
      </div>
    </div>
  )
}

// ── Stage Dialog (create / edit modal) ──

interface StageDialogProps {
  open: boolean
  stage: LifecycleStage | null
  onClose: () => void
  onSave: () => void
}

function StageDialog({ open, stage, onClose, onSave }: StageDialogProps) {
  const isEdit = stage !== null
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [customColor, setCustomColor] = useState('')
  const [order, setOrder] = useState(1)
  const [subStages, setSubStages] = useState<SubStage[]>([])
  const [editingSubIdx, setEditingSubIdx] = useState<number | null>(null)
  const [editingSub, setEditingSub] = useState<SubStage | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createStage = useProductStore((s) => s.createStage)
  const updateStage = useProductStore((s) => s.updateStage)

  useEffect(() => {
    if (open) {
      if (stage) {
        setName(stage.name)
        setColor(stage.color)
        setCustomColor('')
        setOrder(stage.order)
        setSubStages(stage.subStages.map((s) => ({ ...s })))
      } else {
        setName('')
        setColor(PRESET_COLORS[0])
        setCustomColor('')
        setOrder(1)
        setSubStages([])
      }
      setEditingSubIdx(null)
      setEditingSub(null)
      setErrors({})
    }
  }, [open, stage])

  const handleColorSelect = (c: string) => {
    setColor(c)
    setCustomColor('')
  }

  const activeColor = customColor || color

  const handleAddSubStage = () => {
    const newSub: SubStage = {
      id: generateSubStageId(stage?.id ?? 'new', subStages.length),
      name: '',
      description: '',
      category: '研发',
      durationMonths: [1, 3],
    }
    setEditingSub(newSub)
    setEditingSubIdx(-1)
  }

  const handleEditSubStage = (idx: number) => {
    setEditingSub({ ...subStages[idx] })
    setEditingSubIdx(idx)
  }

  const handleSaveSubStage = () => {
    if (!editingSub) return
    if (editingSubIdx === -1) {
      setSubStages((prev) => [...prev, editingSub])
    } else {
      setSubStages((prev) => prev.map((s, i) => (i === editingSubIdx ? editingSub : s)))
    }
    setEditingSub(null)
    setEditingSubIdx(null)
  }

  const handleDeleteSubStage = (idx: number) => {
    setSubStages((prev) => prev.filter((_, i) => i !== idx))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入阶段名称'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        color: activeColor,
        order,
        subStages,
      }
      if (isEdit) {
        await updateStage(stage.id, data)
        showToast('生命周期阶段已更新')
      } else {
        await createStage(data)
        showToast('生命周期阶段已创建')
      }
      onSave()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-[scaleIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              {isEdit ? '编辑生命周期阶段' : '新建生命周期阶段'}
            </h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">阶段名称 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：临床验证"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">展示颜色</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorSelect(c)}
                    className={`w-8 h-8 rounded-lg transition-all ${activeColor === c && !customColor ? 'ring-2 ring-offset-1 ring-blue-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <div className="flex items-center gap-1 ml-1">
                  <span className="text-[10px] text-slate-400">自定义</span>
                  <input
                    type="color"
                    value={customColor || color}
                    onChange={(e) => { setCustomColor(e.target.value); setColor('') }}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">排序序号</label>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Math.max(0, Number(e.target.value)))}
                className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* SubStages */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                子阶段列表
                <span className="text-slate-400 font-normal ml-1">({subStages.length} 个)</span>
              </label>

              <div className="space-y-2 mb-3">
                {subStages.map((sub, idx) => (
                  <div key={`sub-${idx}`}>
                    {editingSub && editingSubIdx === idx ? (
                      <SubStageEditor
                        subStage={editingSub}
                        onChange={setEditingSub}
                        onCancel={() => { setEditingSub(null); setEditingSubIdx(null) }}
                        onSave={handleSaveSubStage}
                      />
                    ) : (
                      <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700 truncate">{sub.name || '(未命名)'}</span>
                            <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {sub.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{sub.description || '暂无描述'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {sub.durationMonths[0]} ~ {sub.durationMonths[1]} 个月
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditSubStage(idx)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-500 transition-colors"
                            title="编辑子阶段"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSubStage(idx)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 transition-colors"
                            title="删除子阶段"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {editingSub && editingSubIdx === -1 && (
                  <SubStageEditor
                    subStage={editingSub}
                    onChange={setEditingSub}
                    onCancel={() => { setEditingSub(null); setEditingSubIdx(null) }}
                    onSave={handleSaveSubStage}
                  />
                )}
              </div>

              {editingSubIdx === null && (
                <button
                  onClick={handleAddSubStage}
                  className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  添加子阶段
                </button>
              )}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : (isEdit ? '保存修改' : '创建阶段')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main Panel ──

export function StageTemplatePanel() {
  const stages = useProductStore((s) => s.stages)
  const refreshStages = useProductStore((s) => s.refreshStages)
  const deleteStage = useProductStore((s) => s.deleteStage)
  const fetchInitialData = useProductStore((s) => s.fetchInitialData)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<LifecycleStage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LifecycleStage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStages = async () => {
    setLoading(true)
    setError(null)
    try {
      await refreshStages()
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try to refresh from API; if no data loaded yet, fetch everything
    if (stages.length === 0) {
      fetchInitialData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStage(deleteTarget.id)
      showToast('生命周期阶段已删除')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">生命周期阶段管理</h2>
          <p className="text-[10px] text-slate-400">
            管理产品生命周期阶段模板 · 共 {sortedStages.length} 个阶段
          </p>
        </div>
        <button
          onClick={() => { setEditingStage(null); setDialogOpen(true) }}
          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建阶段
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">加载模板中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={loadStages} className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
                重新加载
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStages.map((stage) => (
              <div
                key={stage.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  {/* Color indicator */}
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-white text-xs font-bold">{stage.order}</span>
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800">{stage.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400">
                        序号: {stage.order}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        子阶段: {stage.subStages.length} 个
                      </span>
                      {stage.subStages.length > 0 && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[300px]">
                          {stage.subStages.map((s) => s.name).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions — visible on hover */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => { setEditingStage(stage); setDialogOpen(true) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-colors"
                      title="编辑阶段"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(stage)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                      title="删除阶段"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sortedStages.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">暂无生命周期阶段</p>
                <p className="text-xs text-slate-400 mb-4">点击"新建阶段"创建第一个生命周期阶段模板</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <StageDialog
        open={dialogOpen}
        stage={editingStage}
        onClose={() => { setDialogOpen(false); setEditingStage(null) }}
        onSave={loadStages}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-sm animate-[scaleIn_0.15s_ease-out]">
              <h3 className="text-sm font-bold text-slate-800 mb-2">确认删除</h3>
              <p className="text-xs text-slate-500 mb-4">
                确定要删除阶段「{deleteTarget.name}」吗？此操作不可撤销。如果该阶段仍被产品引用，相关阶段数据将丢失。
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
