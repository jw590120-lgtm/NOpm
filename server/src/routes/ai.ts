import { Router, type Request, type Response } from 'express'
import { chat, analyzeNotification, analyzeProduct } from '../services/aiService.js'
import { buildSystemContext } from '../services/contextBuilder.js'
import { seedIfEmpty } from '../storage.js'
import { products as seedProducts, stages as seedStages } from '../seed.js'
import {
  createSession,
  getSession,
  addMessages,
  type Message,
} from '../services/sessionStore.js'

const router = Router()

function isAiConfigured(): boolean {
  const key = process.env.DEEPSEEK_API_KEY
  return !!(key && key !== 'sk-placeholder')
}

/** POST /api/ai/chat — 通用对话（支持 session） */
router.post('/chat', async (req: Request, res: Response) => {
  if (!isAiConfigured()) {
    res.status(503).json({
      error: 'AI 服务未配置',
      detail: '请在 server/.env 中配置 DEEPSEEK_API_KEY',
    })
    return
  }

  try {
    const { messages, context, sessionId: incomingSessionId } = req.body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages 必须是非空数组' })
      return
    }

    // Determine session id: use incoming if valid, otherwise create new
    const hasExistingSession =
      typeof incomingSessionId === 'string' &&
      incomingSessionId.length > 0 &&
      getSession(incomingSessionId) !== null

    const sessionId = hasExistingSession
      ? incomingSessionId
      : createSession(typeof incomingSessionId === 'string' ? incomingSessionId : undefined)

    // Load existing messages from session, plus the new messages
    const existingMessages = getSession(sessionId) ?? []
    const allMessagesForAi = [
      ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
      ...messages,
    ]

    const products = seedIfEmpty('products', seedProducts)
    const stages = seedIfEmpty('stages', seedStages)
    const systemContext = buildSystemContext(products, stages)
    const mergedContext = context ? `${systemContext}\n\n${context}` : systemContext

    const reply = await chat({ messages: allMessagesForAi, context: mergedContext })

    // Save new messages to session store
    const now = Date.now()
    const newSessionMessages: Message[] = messages.map(
      (m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content,
        timestamp: now,
      }),
    )
    newSessionMessages.push({ role: 'assistant', content: reply, timestamp: now })

    addMessages(sessionId, newSessionMessages)

    res.json({ reply, sessionId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI chat failed'
    res.status(502).json({ error: 'AI 调用失败', detail: message })
  }
})

/** GET /api/ai/session/:sessionId — 恢复会话消息 */
router.get('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params
  const messages = getSession(sessionId)
  if (messages === null) {
    res.status(404).json({ error: '会话不存在或已过期' })
    return
  }
  res.json({ sessionId, messages })
})

/** POST /api/ai/analyze-notification — 深度分析一条通知 */
router.post('/analyze-notification', async (req: Request, res: Response) => {
  if (!isAiConfigured()) {
    res.status(503).json({ error: 'AI 服务未配置' })
    return
  }

  try {
    const { notification } = req.body
    if (!notification) {
      res.status(400).json({ error: '缺少 notification 参数' })
      return
    }

    const products = seedIfEmpty('products', seedProducts)
    const stages = seedIfEmpty('stages', seedStages)
    const systemContext = buildSystemContext(products, stages)

    const analysis = await analyzeNotification(notification, systemContext)
    res.json({ analysis })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI analysis failed'
    res.status(502).json({ error: 'AI 分析失败', detail: message })
  }
})

/** POST /api/ai/analyze-product — 分析产品当前状态 */
router.post('/analyze-product', async (req: Request, res: Response) => {
  if (!isAiConfigured()) {
    res.status(503).json({ error: 'AI 服务未配置' })
    return
  }

  try {
    const { productId } = req.body
    if (!productId) {
      res.status(400).json({ error: '缺少 productId 参数' })
      return
    }

    const products = seedIfEmpty('products', seedProducts)
    const stages = seedIfEmpty('stages', seedStages)

    const product = products.find((p) => p.id === productId)
    if (!product) {
      res.status(404).json({ error: '产品不存在' })
      return
    }

    const analysis = await analyzeProduct(product, stages)
    res.json({ analysis })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI analysis failed'
    res.status(502).json({ error: 'AI 分析失败', detail: message })
  }
})

export { router as aiRouter }
