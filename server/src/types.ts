export interface SubStage {
  id: string
  name: string
  description: string
  category: string
  durationMonths: [number, number]
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
