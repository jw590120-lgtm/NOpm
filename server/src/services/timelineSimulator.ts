import type { Product, ProductPhase, LifecycleStage } from '../types.js'
import { seedIfEmpty } from '../storage.js'
import { stages as seedStages } from '../seed.js'

export interface SimulationRequest {
  referenceProductId: string
  triggerStageId: string        // e.g. 'growth' — which phase of reference to base on
  triggerOffset: 'start' | 'end' // offset from phase start or end
  offsetYears: number           // e.g. 2 = 2 years after trigger point
  productName: string
  productLine: string
}

export interface SimulationResult {
  productName: string
  productLine: string
  triggerPoint: number           // the calculated year
  referenceProductName: string
  phases: ProductPhase[]
}

export function simulateTimeline(
  reference: Product,
  request: SimulationRequest,
  allStages?: LifecycleStage[],
): SimulationResult {
  const stages = allStages ?? seedIfEmpty<LifecycleStage>('stages', seedStages)

  // Find the reference product's phase matching the trigger stage
  const triggerPhase = reference.phases.find((p) => p.stageId === request.triggerStageId)
  if (!triggerPhase) {
    throw new Error(`参考产品「${reference.name}」没有阶段「${request.triggerStageId}」`)
  }

  // Calculate the trigger year
  const baseYear = request.triggerOffset === 'start' ? triggerPhase.startYear : triggerPhase.endYear
  const triggerPoint = baseYear + request.offsetYears

  // Generate phases from lifecycle stages
  // Each phase starts where the previous one ends
  let currentYear = triggerPoint
  const phases: ProductPhase[] = stages.map((stage) => {
    // Calculate duration from subStages (use max duration)
    const totalMonths = stage.subStages.reduce(
      (sum, s) => sum + (s.durationMonths[1] ?? s.durationMonths[0]),
      0,
    )
    const durationYears = Math.max(Math.round(totalMonths / 12), 1)

    const phase: ProductPhase = {
      id: `sim_${Date.now()}_${stage.id}`,
      stageId: stage.id,
      startYear: currentYear,
      endYear: currentYear + durationYears,
      status: 'upcoming',
    }
    currentYear += durationYears
    return phase
  })

  return {
    productName: request.productName,
    productLine: request.productLine,
    triggerPoint,
    referenceProductName: reference.name,
    phases,
  }
}
