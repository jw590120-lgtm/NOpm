import { describe, it, expect, beforeEach } from 'vitest'
import { useProductStore } from '../stores/productStore'

function resetStore() {
  useProductStore.setState(useProductStore.getInitialState())
}

describe('productStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('products', () => {
    it('initializes with 3 products from mockData', () => {
      const { products } = useProductStore.getState()
      expect(products).toHaveLength(3)
      expect(products[0].name).toBe('N系列')
      expect(products[1].name).toBe('Nplus')
      expect(products[2].name).toBe('N三代')
    })

    it('stages have 8 lifecycle stages', () => {
      const { stages } = useProductStore.getState()
      expect(stages).toHaveLength(8)
      expect(stages[0].name).toBe('概念与立项')
    })
  })

  describe('addProduct', () => {
    it('adds a new product with auto-generated id', () => {
      const { addProduct, products } = useProductStore.getState()
      const created = addProduct({
        name: 'N四代',
        productLine: 'N系列',
        type: 'planned' as const,
        phases: [],
      })
      const updated = useProductStore.getState().products
      expect(updated).toHaveLength(4)
      expect(updated[3].name).toBe('N四代')
      expect(created.id).toBeDefined()
    })
  })

  describe('updateProduct', () => {
    it('updates product name', () => {
      const { products, updateProduct } = useProductStore.getState()
      const targetId = products[0].id
      updateProduct(targetId, { name: 'N系列改' })
      const updated = useProductStore.getState().products[0]
      expect(updated.name).toBe('N系列改')
    })
  })

  describe('deleteProduct', () => {
    it('removes a product by id', () => {
      const { products, deleteProduct } = useProductStore.getState()
      const targetId = products[2].id
      deleteProduct(targetId)
      const updated = useProductStore.getState().products
      expect(updated).toHaveLength(2)
      expect(updated.find((p) => p.id === targetId)).toBeUndefined()
    })
  })

  describe('phase CRUD', () => {
    it('adds a phase to a product', () => {
      const { products, addPhase } = useProductStore.getState()
      const productId = products[0].id
      addPhase(productId, {
        stageId: 'mature',
        startYear: 2023,
        endYear: 2028,
        status: 'completed',
      })
      const updated = useProductStore.getState().products[0]
      expect(updated.phases).toHaveLength(9) // 8 original + 1 new
    })

    it('updates a phase on a product', () => {
      const { products, updatePhase } = useProductStore.getState()
      const productId = products[0].id
      const phaseId = products[0].phases[0].id
      updatePhase(productId, phaseId, { startYear: 2020 })
      const updated = useProductStore.getState().products[0]
      expect(updated.phases[0].startYear).toBe(2020)
    })

    it('deletes a phase from a product', () => {
      const { products, deletePhase } = useProductStore.getState()
      const productId = products[0].id
      const phaseId = products[0].phases[0].id
      deletePhase(productId, phaseId)
      const updated = useProductStore.getState().products[0]
      expect(updated.phases).toHaveLength(7) // 8 original - 1
    })
  })
})
