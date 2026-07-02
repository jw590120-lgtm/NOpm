import { create } from 'zustand'
import type { Product, ProductPhase, LifecycleStage } from '../types'
import * as api from '../api/client'

interface ProductStore {
  products: Product[]
  stages: LifecycleStage[]
  productLines: string[]
  selectedProductLine: string | null
  loading: boolean
  error: string | null

  // Initialization
  fetchInitialData: () => Promise<void>

  // Filter
  setSelectedProductLine: (line: string | null) => void

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Phase CRUD
  addPhase: (productId: string, phase: Omit<ProductPhase, 'id'>) => Promise<void>
  updatePhase: (productId: string, phaseId: string, patch: Partial<Omit<ProductPhase, 'id'>>) => Promise<void>
  deletePhase: (productId: string, phaseId: string) => Promise<void>
}

function deriveProductLines(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.productLine))]
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  stages: [],
  productLines: [],
  selectedProductLine: null,
  loading: true,
  error: null,

  fetchInitialData: async () => {
    set({ loading: true, error: null })
    try {
      const [products, stages] = await Promise.all([
        api.fetchProducts(),
        api.fetchStages(),
      ])
      set({
        products,
        stages,
        productLines: deriveProductLines(products),
        loading: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      set({ loading: false, error: `无法加载数据 (${message})，请确认后端服务已启动` })
    }
  },

  setSelectedProductLine: (line) => set({ selectedProductLine: line }),

  addProduct: async (partial) => {
    const product = await api.createProduct(partial)
    set((s) => ({
      products: [...s.products, product],
      productLines: deriveProductLines([...s.products, product]),
    }))
    return product
  },

  updateProduct: async (id, patch) => {
    const updated = await api.updateProduct(id, patch)
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? updated : p)),
      productLines: deriveProductLines(s.products.map((p) => (p.id === id ? updated : p))),
    }))
  },

  deleteProduct: async (id) => {
    await api.deleteProduct(id)
    set((s) => {
      const remaining = s.products.filter((p) => p.id !== id)
      return {
        products: remaining,
        productLines: deriveProductLines(remaining),
      }
    })
  },

  addPhase: async (productId, partial) => {
    const updated = await api.addPhase(productId, partial)
    set((s) => ({
      products: s.products.map((p) => (p.id === productId ? updated : p)),
    }))
  },

  updatePhase: async (productId, phaseId, patch) => {
    const updated = await api.updatePhase(productId, phaseId, patch)
    set((s) => ({
      products: s.products.map((p) => (p.id === productId ? updated : p)),
    }))
  },

  deletePhase: async (productId, phaseId) => {
    const updated = await api.deletePhase(productId, phaseId)
    set((s) => ({
      products: s.products.map((p) => (p.id === productId ? updated : p)),
    }))
  },
}))
