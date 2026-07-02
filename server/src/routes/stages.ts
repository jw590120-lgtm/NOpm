import { Router, type Request, type Response } from 'express'
import type { LifecycleStage } from '../types.js'
import { readCollection, writeCollection, seedIfEmpty } from '../storage.js'
import { stages as seedStages } from '../seed.js'

const COLLECTION = 'stages'
const router = Router()

function getStages(): LifecycleStage[] {
  return seedIfEmpty<LifecycleStage>(COLLECTION, seedStages)
}

function saveStages(data: LifecycleStage[]): void {
  writeCollection(COLLECTION, data)
}

// GET /api/stages
router.get('/', (_req: Request, res: Response) => {
  const stages = getStages()
  res.json(stages)
})

// GET /api/stages/:id
router.get('/:id', (req: Request, res: Response) => {
  const stages = getStages()
  const stage = stages.find((s) => s.id === req.params.id)
  if (!stage) {
    res.status(404).json({ error: 'Stage not found' })
    return
  }
  res.json(stage)
})

// PUT /api/stages/:id (only name and color are editable)
router.put('/:id', (req: Request, res: Response) => {
  const stages = getStages()
  const index = stages.findIndex((s) => s.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Stage not found' })
    return
  }
  const existing = stages[index]
  if (req.body.name !== undefined) existing.name = String(req.body.name)
  if (req.body.color !== undefined) existing.color = String(req.body.color)
  saveStages(stages)
  res.json(existing)
})

export { router as stageRouter }
