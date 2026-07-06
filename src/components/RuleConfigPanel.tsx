import { useState, useEffect } from 'react'
import type { TriggerRule, RuleCondition, LifecycleStage } from '../types'
import { showToast } from './Toast'
import * as api from '../api/client'
import { ConditionEditor, describeCondition } from './ConditionEditor'

const CATEGORY_MAP: Record<TriggerRule['category'], { label: string; color: string }> = {
  '法规': { label: '法规', color: 'bg-purple-100 text-purple-700' },
  '临床': { label: '临床', color: 'bg-red-100 text-red-700' },
  '市场': { label: '市场', color: 'bg-blue-100 text-blue-700' },
  '技术': { label: '技术', color: 'bg-cyan-100 text-cyan-700' },
  '商业': { label: '商业', color: 'bg-amber-100 text-amber-700' },
  '供应链': { label: '供应链', color: 'bg-emerald-100 text-emerald-700' },
}

const ACTION_LABELS: Record<TriggerRule['action'], string> = {
  alert: '预警通知',
  recommend_new_product: '推荐新产品',
  recommend_retire: '推荐退市',
}

const PRIORITY_LABELS: Record<TriggerRule['priority'], { label: string; color: string }> = {
  high: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: '中', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: '低', color: 'bg-slate-100 text-slate-600 border-slate-200' },
}

interface RuleDialogProps {
  open: boolean
  rule: TriggerRule | null
  onClose: () => void
  onSave: () => void
  stages: LifecycleStage[]
}

function RuleDialog({ open, rule, onClose, onSave, stages }: RuleDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TriggerRule['category']>('市场')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState<RuleCondition>(
    { type: 'time_since', stageId: 'growth', yearsMin: 1, yearsMax: 4 }
  )
  const [action, setAction] = useState<TriggerRule['action']>('alert')
  const [priority, setPriority] = useState<TriggerRule['priority']>('medium')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (rule) {
        setName(rule.name)
        setCategory(rule.category)
        setDescription(rule.description)
        setCondition(rule.condition)
        setAction(rule.action)
        setPriority(rule.priority)
      } else {
        setName('')
        setCategory('市场')
        setDescription('')
        setCondition({ type: 'time_since', stageId: 'growth', yearsMin: 1, yearsMax: 4 })
        setAction('alert')
        setPriority('medium')
      }
      setErrors({})
    }
  }, [open, rule])

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = '请输入规则名称'
    if (!condition) next.condition = '请输入触发条件'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data: Omit<TriggerRule, 'id'> = {
        name: name.trim(),
        category,
        description: description.trim(),
        condition,
        action,
        priority,
        enabled: rule?.enabled ?? true,
      }
      if (rule) {
        await api.updateRule(rule.id, data)
        showToast('规则已更新')
      } else {
        await api.createRule(data)
        showToast('规则已创建')
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
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              {rule ? '编辑规则' : '新建规则'}
            </h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">规则名称 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：一代产品进入成熟期 → 推荐立项二代"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Category + Action + Priority */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TriggerRule['category'])}
                  className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  {(Object.keys(CATEGORY_MAP) as TriggerRule['category'][]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_MAP[c].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">动作</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as TriggerRule['action'])}
                  className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  {(Object.keys(ACTION_LABELS) as TriggerRule['action'][]).map((a) => (
                    <option key={a} value={a}>{ACTION_LABELS[a]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">优先级</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TriggerRule['priority'])}
                  className="w-full px-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="规则说明..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                触发条件  <span className="text-red-400">*</span>
              </label>
              <div className={errors.condition ? 'border border-red-300 rounded-xl' : ''}>
                <ConditionEditor
                  value={condition}
                  onChange={setCondition}
                  stages={stages}
                />
              </div>
              {errors.condition && <p className="text-[11px] text-red-500 mt-1">{errors.condition}</p>}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : (rule ? '保存修改' : '创建规则')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main Panel ──

interface Props {
  onBack: () => void
  stages?: LifecycleStage[]
}

export function RuleConfigPanel({ onBack, stages = [] }: Props) {
  const [rules, setRules] = useState<TriggerRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<TriggerRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TriggerRule | null>(null)

  const loadRules = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchRules()
      setRules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const handleToggle = async (rule: TriggerRule) => {
    try {
      await api.updateRule(rule.id, { enabled: !rule.enabled })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))
      showToast(`规则已${rule.enabled ? '禁用' : '启用'}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.deleteRule(deleteTarget.id)
      setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      showToast('规则已删除')
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

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
            <h2 className="text-sm font-bold text-slate-800">触发规则配置</h2>
            <p className="text-[10px] text-slate-400">
              管理产品生命周期智能触发规则 · Phase 2.4
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingRule(null); setDialogOpen(true) }}
          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          新建规则
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">加载规则中...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={loadRules} className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
                重新加载
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const cat = CATEGORY_MAP[rule.category]
              const pri = PRIORITY_LABELS[rule.priority]
              return (
                <div
                  key={rule.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-800">{rule.name}</h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${pri.color}`}>
                          {pri.label}优先级
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ACTION_LABELS[rule.action]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{rule.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded max-w-[300px] truncate">
                          {describeCondition(rule.condition, stages)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Enable/Disable toggle */}
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                        title={rule.enabled ? '禁用' : '启用'}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <button
                        onClick={() => { setEditingRule(rule); setDialogOpen(true) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-colors"
                        title="编辑规则"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(rule)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                        title="删除规则"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {rules.length === 0 && (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">暂无触发规则</p>
                <p className="text-xs text-slate-400 mb-4">点击"新建规则"创建第一条智能触发规则</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <RuleDialog
        open={dialogOpen}
        rule={editingRule}
        onClose={() => { setDialogOpen(false); setEditingRule(null) }}
        onSave={loadRules}
        stages={stages}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 w-full max-w-sm animate-[scaleIn_0.15s_ease-out]">
              <h3 className="text-sm font-bold text-slate-800 mb-2">确认删除</h3>
              <p className="text-xs text-slate-500 mb-4">
                确定要删除规则「{deleteTarget.name}」吗？此操作不可撤销。
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  取消
                </button>
                <button onClick={handleDelete} className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
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
