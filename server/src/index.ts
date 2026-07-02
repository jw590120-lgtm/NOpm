import express from 'express'
import cors from 'cors'
import { productRouter } from './routes/products.js'
import { stageRouter } from './routes/stages.js'
import { ruleRouter } from './routes/rules.js'

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

app.listen(PORT, () => {
  console.log(`PLM Server running on http://localhost:${PORT}`)
})
