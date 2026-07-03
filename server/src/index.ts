import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { productRouter } from './routes/products.js'
import { stageRouter } from './routes/stages.js'
import { ruleRouter } from './routes/rules.js'
import { simulateRouter } from './routes/simulate.js'
import { checkRouter } from './routes/check.js'
import { aiRouter } from './routes/ai.js'
import { dashboardRouter } from './routes/dashboard.js'
import { reportRouter } from './routes/report.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/products', productRouter)
app.use('/api/stages', stageRouter)
app.use('/api/rules', ruleRouter)
app.use('/api/simulate', simulateRouter)
app.use('/api/check', checkRouter)
app.use('/api/ai', aiRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/report', reportRouter)

app.listen(PORT, () => {
  console.log(`PLM Server running on http://localhost:${PORT}`)
})
