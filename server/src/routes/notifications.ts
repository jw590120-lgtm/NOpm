import { Router, type Request, type Response } from 'express'
import { readCollection } from '../storage.js'

const router = Router()

const EMPTY_RESULT = {
  checkedAt: null,
  totalProducts: 0,
  activeRules: 0,
  totalMatches: 0,
  matches: [],
  notifications: [],
}

// GET /api/notifications
router.get('/', (_req: Request, res: Response) => {
  try {
    const items = readCollection<Record<string, unknown>>('notifications')
    if (items.length === 0) {
      res.json(EMPTY_RESULT)
      return
    }
    res.json(items[0])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read notifications'
    res.status(500).json({ error: message })
  }
})

export { router as notificationRouter }
