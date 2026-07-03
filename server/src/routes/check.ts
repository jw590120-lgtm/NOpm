import { Router, type Request, type Response } from 'express'
import { readCollection, seedIfEmpty } from '../storage.js'
import { products as seedProducts, rules as seedRules } from '../seed.js'
import { checkAllRules } from '../services/ruleEngine.js'
import { generateAllNotifications } from '../services/notifications.js'

const router = Router()

// POST /api/check
router.post('/', (_req: Request, res: Response) => {
  try {
    const products = seedIfEmpty('products', seedProducts)
    const rules = seedIfEmpty('rules', seedRules)

    const matches = checkAllRules(rules, products)
    const notifications = generateAllNotifications(matches)

    res.json({
      checkedAt: new Date().toISOString(),
      totalProducts: products.length,
      activeRules: rules.filter((r) => r.enabled).length,
      totalMatches: matches.length,
      matches,
      notifications,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Check failed'
    res.status(500).json({ error: message })
  }
})

export { router as checkRouter }
