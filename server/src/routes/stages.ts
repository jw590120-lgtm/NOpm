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

function generateStageId(stages: LifecycleStage[]): string {
  let maxNum = 0
  for (const s of stages) {
    const match = s.id.match(/^stage-(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }
  if (maxNum > 0) {
    return `stage-${maxNum + 1}`
  }
  return `stage-${stages.length + 1}`
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

// PUT /api/stages/:id — update all editable fields
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
  if (req.body.order !== undefined) existing.order = Number(req.body.order)
  if (req.body.subStages !== undefined) existing.subStages = req.body.subStages
  saveStages(stages)
  res.json(existing)
})

// POST /api/stages — create a new stage
router.post('/', (req: Request, res: Response) => {
  const stages = getStages()
  const { name, color, order, subStages } = req.body

  if (!name || !color) {
    res.status(400).json({ error: 'name and color are required' })
    return
  }

  const newStage: LifecycleStage = {
    id: generateStageId(stages),
    name: String(name),
    color: String(color),
    order: order !== undefined ? Number(order) : stages.length + 1,
    subStages: subStages ?? [],
  }

  stages.push(newStage)
  saveStages(stages)
  res.status(201).json(newStage)
})

// DELETE /api/stages/:id
router.delete('/:id', (req: Request, res: Response) => {
  const stages = getStages()
  const index = stages.findIndex((s) => s.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Stage not found' })
    return
  }
  const deleted = stages.splice(index, 1)[0]
  saveStages(stages)
  res.json(deleted)
})

export { router as stageRouter }
