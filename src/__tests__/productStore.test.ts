import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProductStore } from '../stores/productStore'
import { lifecycleStages, products } from '../data/mockData'

vi.mock('../api/client', () => ({
  fetchProducts: vi.fn(),
  fetchStages: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  addPhase: vi.fn(),
  updatePhase: vi.fn(),
  deletePhase: vi.fn(),
  createStage: vi.fn(),
  updateStage: vi.fn(),
  deleteStage: vi.fn(),
}))

import * as api from '../api/client'

describe('productStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useProductStore.setState({
      products: [],
      stages: [],
      productLines: [],
      selectedProductLine: null,
      loading: true,
      error: null,
    })
  })

  describe('fetchInitialData', () => {
    it('loads products and stages from API', async () => {
      vi.mocked(api.fetchProducts).mockResolvedValue(products)
      vi.mocked(api.fetchStages).mockResolvedValue(lifecycleStages)

      await useProductStore.getState().fetchInitialData()

      const state = useProductStore.getState()
      expect(state.products).toHaveLength(3)
      expect(state.stages).toHaveLength(8)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('sets error when API fails', async () => {
      vi.mocked(api.fetchProducts).mockRejectedValue(new Error('Network Error'))

      await useProductStore.getState().fetchInitialData()

      const state = useProductStore.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toContain('无法加载数据')
    })
  })

  describe('addProduct', () => {
    it('adds a new product via API', async () => {
      const newProduct = {
        id: 'prod_api',
        name: 'N四代',
        productLine: 'N系列',
        type: 'planned' as const,
        phases: [],
      }
      vi.mocked(api.createProduct).mockResolvedValue(newProduct)

      // First seed some data
      useProductStore.setState({ products: [products[0]], productLines: ['N系列'] })

      await useProductStore.getState().addProduct({
        name: 'N四代',
        productLine: 'N系列',
        type: 'planned',
        phases: [],
      })

      const state = useProductStore.getState()
      expect(state.products).toHaveLength(2)
      expect(state.products[1].name).toBe('N四代')
    })
  })

  describe('updateProduct', () => {
    it('updates a product via API', async () => {
      const updated = { ...products[0], name: 'N系列改' }
      vi.mocked(api.updateProduct).mockResolvedValue(updated)

      useProductStore.setState({ products: [products[0]] })

      await useProductStore.getState().updateProduct(products[0].id, { name: 'N系列改' })

      const state = useProductStore.getState()
      expect(state.products[0].name).toBe('N系列改')
    })
  })

  describe('deleteProduct', () => {
    it('deletes a product via API', async () => {
      vi.mocked(api.deleteProduct).mockResolvedValue(products[0])

      useProductStore.setState({ products: [...products] })

      await useProductStore.getState().deleteProduct(products[2].id)

      const state = useProductStore.getState()
      expect(state.products).toHaveLength(2)
    })
  })
})
