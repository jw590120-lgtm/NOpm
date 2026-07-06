import type { RuleCondition, LifecycleStage } from '../types'

interface Props {
  value: RuleCondition | null
  onChange: (c: RuleCondition) => void
  stages: LifecycleStage[]
  isNested?: boolean
}

const TYPE_OPTIONS: { value: RuleCondition['type']; label: string }[] = [
  { value: 'time_since', label: '时间判断 (time_since)' },
  { value: 'stage_match', label: '阶段匹配 (stage_match)' },
  { value: 'metric_threshold', label: '指标阈值 (metric_threshold)' },
  { value: 'and', label: '组合条件-且 (and)' },
  { value: 'or', label: '组合条件-或 (or)' },
]

const OPERATOR_OPTIONS: { value: 'gt' | 'lt'; label: string }[] = [
  { value: 'gt', label: '大于 (gt)' },
  { value: 'lt', label: '小于 (lt)' },
]

function defaultCondition(type: RuleCondition['type']): RuleCondition {
  switch (type) {
    case 'time_since':
      return { type: 'time_since', stageId: 'growth', yearsMin: 1, yearsMax: 4 }
    case 'stage_match':
      return { type: 'stage_match', productIdPattern: '', stageId: 'growth' }
    case 'metric_threshold':
      return { type: 'metric_threshold', metric: '', operator: 'gt', value: 0 }
    case 'and':
      return { type: 'and', conditions: [] }
    case 'or':
      return { type: 'or', conditions: [] }
  }
}

export function describeCondition(c: RuleCondition, stages: LifecycleStage[]): string {
  const getName = (id: string) => stages.find((s) => s.id === id)?.name ?? id
  switch (c.type) {
    case 'time_since':
      return `在 ${getName(c.stageId)} 阶段持续 ${c.yearsMin}-${c.yearsMax} 年`
    case 'stage_match':
      return `产品名包含 '${c.productIdPattern}' 且处于 ${getName(c.stageId)} 阶段`
    case 'metric_threshold':
      return `${c.metric} ${c.operator === 'gt' ? '>' : '<'} ${c.value}`
    case 'and':
      return c.conditions.map((child) => describeCondition(child, stages)).join(' 且 ')
    case 'or':
      return c.conditions.map((child) => describeCondition(child, stages)).join(' 或 ')
  }
}

const fieldStyle = 'w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white'
const selectStyle = 'w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white'
const blockStyle = 'border border-slate-200 rounded-xl p-3 bg-white'
const nestedBlockStyle = 'border border-slate-200 rounded-xl p-3 bg-slate-50 ml-5'

export function ConditionEditor({ value, onChange, stages, isNested = false }: Props) {
  const condition = value ?? defaultCondition('time_since')

  const handleTypeChange = (type: RuleCondition['type']) => {
    onChange(defaultCondition(type))
  }

  const updateField = <T extends RuleCondition, K extends keyof T>(key: K, val: T[K]) => {
    onChange({ ...condition, [key]: val } as unknown as RuleCondition)
  }

  const availableTypes = isNested
    ? TYPE_OPTIONS.filter((t) => t.value !== 'and' && t.value !== 'or')
    : TYPE_OPTIONS

  return (
    <div className={isNested ? nestedBlockStyle : blockStyle}>
      {/* Type selector */}
      <div className="mb-3">
        <label className="block text-[11px] font-semibold text-slate-400 mb-1">条件类型</label>
        <select
          value={condition.type}
          onChange={(e) => handleTypeChange(e.target.value as RuleCondition['type'])}
          className={selectStyle}
        >
          {availableTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Type-specific fields */}
      {condition.type === 'time_since' && (
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">阶段</label>
            <select
              value={condition.stageId}
              onChange={(e) => updateField('stageId', e.target.value)}
              className={selectStyle}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">最小年数</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={condition.yearsMin}
                onChange={(e) => updateField('yearsMin', parseFloat(e.target.value) || 0)}
                className={fieldStyle}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">最大年数</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={condition.yearsMax}
                onChange={(e) => updateField('yearsMax', parseFloat(e.target.value) || 0)}
                className={fieldStyle}
              />
            </div>
          </div>
        </div>
      )}

      {condition.type === 'stage_match' && (
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">产品名称关键词</label>
            <input
              type="text"
              value={condition.productIdPattern}
              onChange={(e) => updateField('productIdPattern', e.target.value)}
              placeholder="产品名称关键词，如 nplus"
              className={fieldStyle}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">阶段</label>
            <select
              value={condition.stageId}
              onChange={(e) => updateField('stageId', e.target.value)}
              className={selectStyle}
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {condition.type === 'metric_threshold' && (
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">指标名称</label>
            <input
              type="text"
              value={condition.metric}
              onChange={(e) => updateField('metric', e.target.value)}
              placeholder="指标名称，如 supply_risk"
              className={fieldStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">运算符</label>
              <select
                value={condition.operator}
                onChange={(e) => updateField('operator', e.target.value as 'gt' | 'lt')}
                className={selectStyle}
              >
                {OPERATOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">阈值</label>
              <input
                type="number"
                value={condition.value}
                onChange={(e) => updateField('value', parseFloat(e.target.value) || 0)}
                className={fieldStyle}
              />
            </div>
          </div>
        </div>
      )}

      {(condition.type === 'and' || condition.type === 'or') && (
        <div className="space-y-2.5">
          {condition.conditions.map((child, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {condition.type === 'and' ? '且' : '或'}条件 #{idx + 1}
                </span>
                <button
                  onClick={() => {
                    const next = condition.conditions.filter((_, i) => i !== idx)
                    onChange({ ...condition, conditions: next })
                  }}
                  className="text-[10px] text-slate-400 hover:text-red-500 transition-colors px-1.5 py-0.5 rounded hover:bg-red-50"
                >
                  × 删除
                </button>
              </div>
              <ConditionEditor
                value={child}
                onChange={(updated) => {
                  const next = [...condition.conditions]
                  next[idx] = updated
                  onChange({ ...condition, conditions: next })
                }}
                stages={stages}
                isNested
              />
            </div>
          ))}
          <button
            onClick={() => {
              const child = defaultCondition('time_since')
              onChange({ ...condition, conditions: [...condition.conditions, child] })
            }}
            className="w-full py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            + 添加条件
          </button>
        </div>
      )}
    </div>
  )
}
