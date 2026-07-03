import { Router, type Request, type Response } from 'express'
import type { Product, LifecycleStage } from '../types.js'
import { seedIfEmpty } from '../storage.js'
import { products as seedProducts, stages as seedStages } from '../seed.js'

const COLLECTION_PRODUCTS = 'products'
const COLLECTION_STAGES = 'stages'
const CURRENT_YEAR = 2026
const LOOKAHEAD_YEARS = 2

const router = Router()

function getProducts(): Product[] {
  return seedIfEmpty<Product>(COLLECTION_PRODUCTS, seedProducts)
}

function getStages(): LifecycleStage[] {
  return seedIfEmpty<LifecycleStage>(COLLECTION_STAGES, seedStages)
}

function getStageName(stageId: string, stages: LifecycleStage[]): string {
  return stages.find((s) => s.id === stageId)?.name ?? stageId
}

// GET /api/dashboard/stats
router.get('/stats', (_req: Request, res: Response) => {
  const products = getProducts()
  const stages = getStages()

  const totalProducts = products.length

  // Products with at least one 'active' phase
  const activeProducts = products.filter((p) =>
    p.phases.some((ph) => ph.status === 'active')
  ).length

  const plannedProducts = products.filter((p) => p.type === 'planned').length
  const inDevelopment = products.filter((p) => p.type === 'in_development').length

  // Phases with stageId='launch', status='upcoming', startYear <= CURRENT_YEAR + 2
  const upcomingLaunches = products.reduce((count, p) => {
    return count + p.phases.filter(
      (ph) =>
        ph.stageId === 'launch' &&
        ph.status === 'upcoming' &&
        ph.startYear <= CURRENT_YEAR + LOOKAHEAD_YEARS
    ).length
  }, 0)

  // Phases with stageId='register' and endYear <= CURRENT_YEAR + 2
  const expiringRegistrations = products.reduce((count, p) => {
    return count + p.phases.filter(
      (ph) =>
        ph.stageId === 'register' &&
        ph.endYear <= CURRENT_YEAR + LOOKAHEAD_YEARS
    ).length
  }, 0)

  // Products with stageId='decline' that are active or upcoming
  const productsInDecline = products.filter((p) =>
    p.phases.some(
      (ph) =>
        ph.stageId === 'decline' &&
        (ph.status === 'active' || ph.status === 'upcoming')
    )
  ).length

  // Key milestones in next 4 quarters (years 2026-2027)
  const milestoneYears = [CURRENT_YEAR, CURRENT_YEAR + 1]
  const quarterMilestones: { label: string; productName: string; stageName: string; year: number }[] = []

  for (const product of products) {
    for (const phase of product.phases) {
      if (phase.status === 'completed') continue

      const stageName = getStageName(phase.stageId, stages)

      if (milestoneYears.includes(phase.startYear)) {
        const quarter = phase.startYear === CURRENT_YEAR ? 'Q3-Q4' : 'Q1-Q2'
        quarterMilestones.push({
          label: `${phase.startYear} ${quarter}-${stageName}开始`,
          productName: product.name,
          stageName,
          year: phase.startYear,
        })
      }

      if (milestoneYears.includes(phase.endYear) && phase.endYear !== phase.startYear) {
        const quarter = phase.endYear === CURRENT_YEAR ? 'Q3-Q4' : 'Q1-Q2'
        quarterMilestones.push({
          label: `${phase.endYear} ${quarter}-${stageName}结束`,
          productName: product.name,
          stageName,
          year: phase.endYear,
        })
      }
    }
  }

  // Phase distribution: how many products are in each stage currently (based on active phase)
  const phaseDistribution: { stageId: string; count: number }[] = []
  const stageCountMap: Record<string, number> = {}

  for (const product of products) {
    for (const phase of product.phases) {
      if (phase.status === 'active') {
        stageCountMap[phase.stageId] = (stageCountMap[phase.stageId] ?? 0) + 1
      }
    }
  }

  for (const stage of stages) {
    phaseDistribution.push({
      stageId: stage.id,
      count: stageCountMap[stage.id] ?? 0,
    })
  }

  res.json({
    totalProducts,
    activeProducts,
    plannedProducts,
    inDevelopment,
    upcomingLaunches,
    expiringRegistrations,
    productsInDecline,
    quarterMilestones,
    phaseDistribution,
  })
})

export { router as dashboardRouter }
