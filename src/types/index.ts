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
