import { Router, type Request, type Response } from 'express'
import { readCollection, seedIfEmpty } from '../storage.js'
import { products as seedProducts } from '../seed.js'
import { simulateTimeline } from '../services/timelineSimulator.js'

const router = Router()

// POST /api/simulate
router.post('/', (req: Request, res: Response) => {
  try {
    const { referenceProductId, triggerStageId, triggerOffset, offsetYears, productName, productLine } = req.body

    if (!referenceProductId || !triggerStageId || !productName || !productLine) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const products = seedIfEmpty('products', seedProducts)
    const reference = products.find((p) => p.id === referenceProductId)
    if (!reference) {
      res.status(404).json({ error: `Product ${referenceProductId} not found` })
      return
    }

    const result = simulateTimeline(reference, {
      referenceProductId,
      triggerStageId,
      triggerOffset: triggerOffset ?? 'start',
      offsetYears: offsetYears ?? 0,
      productName,
      productLine,
    })

    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Simulation failed'
    res.status(400).json({ error: message })
  }
})

export { router as simulateRouter }
