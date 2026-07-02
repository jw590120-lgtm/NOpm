import { Router, type Request, type Response } from 'express'
import type { Product } from '../types.js'
import { readCollection, writeCollection, seedIfEmpty } from '../storage.js'
import { products as seedProducts } from '../seed.js'

const COLLECTION = 'products'
const router = Router()

function getProducts(): Product[] {
  return seedIfEmpty<Product>(COLLECTION, seedProducts)
}

function saveProducts(data: Product[]): void {
  writeCollection(COLLECTION, data)
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// GET /api/products
router.get('/', (_req: Request, res: Response) => {
  const products = getProducts()
  res.json(products)
})

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  const products = getProducts()
  const product = products.find((p) => p.id === req.params.id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(product)
})

// POST /api/products
router.post('/', (req: Request, res: Response) => {
  const products = getProducts()
  const { name, productLine, type, phases } = req.body

  if (!name || !productLine || !type) {
    res.status(400).json({ error: 'Missing required fields: name, productLine, type' })
    return
  }

  const product: Product = {
    id: generateId('prod'),
    name: String(name),
    productLine: String(productLine),
    type,
    phases: Array.isArray(phases) ? phases : [],
  }

  products.push(product)
  saveProducts(products)
  res.status(201).json(product)
})

// PUT /api/products/:id
router.put('/:id', (req: Request, res: Response) => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const existing = products[index]
  const { name, productLine, type, phases } = req.body

  products[index] = {
    ...existing,
    name: name !== undefined ? String(name) : existing.name,
    productLine: productLine !== undefined ? String(productLine) : existing.productLine,
    type: type !== undefined ? type : existing.type,
    phases: phases !== undefined ? phases : existing.phases,
  }

  saveProducts(products)
  res.json(products[index])
})

// DELETE /api/products/:id
router.delete('/:id', (req: Request, res: Response) => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const [deleted] = products.splice(index, 1)
  saveProducts(products)
  res.json(deleted)
})

// PATCH /api/products/:id/phases
router.patch('/:id/phases', (req: Request, res: Response) => {
  const products = getProducts()
  const product = products.find((p) => p.id === req.params.id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const { phaseId, action } = req.body
  const phaseIndex = product.phases.findIndex((p) => p.id === phaseId)

  if (action === 'add' || phaseIndex === -1) {
    const { stageId, startYear, endYear, status } = req.body
    product.phases.push({
      id: generateId('ph'),
      stageId: stageId ?? 'concept',
      startYear: startYear ?? 2027,
      endYear: endYear ?? 2028,
      status: status ?? 'upcoming',
    })
  } else if (action === 'update') {
    const phase = product.phases[phaseIndex]
    if (req.body.startYear !== undefined) phase.startYear = req.body.startYear
    if (req.body.endYear !== undefined) phase.endYear = req.body.endYear
    if (req.body.status !== undefined) phase.status = req.body.status
    if (req.body.stageId !== undefined) phase.stageId = req.body.stageId
  } else if (action === 'delete') {
    product.phases.splice(phaseIndex, 1)
  }

  saveProducts(products)
  res.json(product)
})

export { router as productRouter }
