import { create } from 'zustand'
import type { Product, ProductPhase, LifecycleStage } from '../types'
import { products as initialProducts, lifecycleStages as initialStages } from '../data/mockData'

interface ProductStore {
  products: Product[]
  stages: LifecycleStage[]

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Product
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void
  deleteProduct: (id: string) => void

  // Phase CRUD
  addPhase: (productId: string, phase: Omit<ProductPhase, 'id'>) => void
  updatePhase: (productId: string, phaseId: string, patch: Partial<Omit<ProductPhase, 'id'>>) => void
  deletePhase: (productId: string, phaseId: string) => void
}

let idCounter = 100

function nextId(prefix: string): string {
  return `${prefix}_${++idCounter}`
}

export const useProductStore = create<ProductStore>((set) => ({
  products: initialProducts,
  stages: initialStages,

  addProduct: (partial) => {
    const product: Product = { ...partial, id: nextId('prod') }
    set((s) => ({ products: [...s.products, product] }))
    return product
  },

  updateProduct: (id, patch) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  deleteProduct: (id) =>
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
    })),

  addPhase: (productId, partial) => {
    const phase: ProductPhase = { ...partial, id: nextId('ph') }
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId ? { ...p, phases: [...p.phases, phase] } : p,
      ),
    }))
  },

  updatePhase: (productId, phaseId, patch) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              phases: p.phases.map((ph) => (ph.id === phaseId ? { ...ph, ...patch } : ph)),
            }
          : p,
      ),
    })),

  deletePhase: (productId, phaseId) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId
          ? { ...p, phases: p.phases.filter((ph) => ph.id !== phaseId) }
          : p,
      ),
    })),
}))
