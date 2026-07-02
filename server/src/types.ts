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
