import { Router, type Request, type Response } from 'express'
import type { TriggerRule } from '../types.js'
import { readCollection, writeCollection, seedIfEmpty } from '../storage.js'
import { rules as seedRules } from '../seed.js'

const COLLECTION = 'rules'
const router = Router()

function getRules(): TriggerRule[] {
  return seedIfEmpty<TriggerRule>(COLLECTION, seedRules)
}

function saveRules(data: TriggerRule[]): void {
  writeCollection(COLLECTION, data)
}

function generateId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// GET /api/rules
router.get('/', (_req: Request, res: Response) => {
  const rules = getRules()
  res.json(rules)
})

// GET /api/rules/:id
router.get('/:id', (req: Request, res: Response) => {
  const rules = getRules()
  const rule = rules.find((r) => r.id === req.params.id)
  if (!rule) {
    res.status(404).json({ error: 'Rule not found' })
    return
  }
  res.json(rule)
})

// POST /api/rules
router.post('/', (req: Request, res: Response) => {
  const rules = getRules()
  const { name, category, description, condition, action, priority, enabled } = req.body

  if (!name || !category || !condition || !action) {
    res.status(400).json({ error: 'Missing required fields: name, category, condition, action' })
    return
  }

  const rule: TriggerRule = {
    id: generateId(),
    name: String(name),
    category,
    description: description ?? '',
    condition,
    action,
    priority: priority ?? 'medium',
    enabled: enabled ?? true,
  }

  rules.push(rule)
  saveRules(rules)
  res.status(201).json(rule)
})

// PUT /api/rules/:id
router.put('/:id', (req: Request, res: Response) => {
  const rules = getRules()
  const index = rules.findIndex((r) => r.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Rule not found' })
    return
  }

  const existing = rules[index]
  const { name, category, description, condition, action, priority, enabled } = req.body

  rules[index] = {
    ...existing,
    name: name !== undefined ? String(name) : existing.name,
    category: category !== undefined ? category : existing.category,
    description: description !== undefined ? String(description) : existing.description,
    condition: condition !== undefined ? condition : existing.condition,
    action: action !== undefined ? action : existing.action,
    priority: priority !== undefined ? priority : existing.priority,
    enabled: enabled !== undefined ? Boolean(enabled) : existing.enabled,
  }

  saveRules(rules)
  res.json(rules[index])
})

// DELETE /api/rules/:id
router.delete('/:id', (req: Request, res: Response) => {
  const rules = getRules()
  const index = rules.findIndex((r) => r.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Rule not found' })
    return
  }

  const [deleted] = rules.splice(index, 1)
  saveRules(rules)
  res.json(deleted)
})

export { router as ruleRouter }
