import { useProductStore } from '../stores/productStore'
import { lifecycleStages, products } from '../data/mockData'
import type { Product, LifecycleStage } from '../types'

export function seedStore(options?: {
  products?: Product[]
  stages?: LifecycleStage[]
  selectedProductLine?: string | null
}) {
  const data = {
    products: options?.products ?? products,
    stages: options?.stages ?? lifecycleStages,
    productLines: [
      ...new Set((options?.products ?? products).map((p) => p.productLine)),
    ],
    selectedProductLine: options?.selectedProductLine ?? null,
    loading: false,
    error: null,
  }
  useProductStore.setState(data)
}
