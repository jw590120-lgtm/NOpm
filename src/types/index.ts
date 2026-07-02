export interface SubStage {
  id: string
  name: string
  description: string
  durationMonths: [number, number]
  category: '研发' | '注册' | '市场' | '临床' | '其他'
}

export interface LifecycleStage {
  id: string
  name: string
  color: string
  order: number
  subStages: SubStage[]
}

export interface ProductPhase {
  id: string
  stageId: string
  startYear: number
  endYear: number
  status: 'completed' | 'active' | 'upcoming'
}

export interface Product {
  id: string
  name: string
  productLine: string
  type: 'existing' | 'in_development' | 'planned'
  phases: ProductPhase[]
}

export const STAGE_COLORS: Record<string, string> = {
  'concept': '#3B82F6',
  'design': '#6366F1',
  'register': '#8B5CF6',
  'launch': '#10B981',
  'growth': '#06B6D4',
  'mature': '#F59E0B',
  'decline': '#EF4444',
  'retire': '#6B7280',
}

// ── Trigger Rule ──

export type RuleCondition =
  | { type: 'stage_match'; productIdPattern: string; stageId: string }
  | { type: 'time_since'; stageId: string; yearsMin: number; yearsMax: number }
  | { type: 'metric_threshold'; metric: string; operator: 'gt' | 'lt'; value: number }
  | { type: 'and'; conditions: RuleCondition[] }
  | { type: 'or'; conditions: RuleCondition[] }

export interface TriggerRule {
  id: string
  name: string
  category: '法规' | '临床' | '市场' | '技术' | '商业' | '供应链'
  description: string
  condition: RuleCondition
  action: 'alert' | 'recommend_new_product' | 'recommend_retire'
  priority: 'high' | 'medium' | 'low'
  enabled: boolean
}
