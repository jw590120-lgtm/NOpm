import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
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
  runRuleCheck: vi.fn(),
  fetchDashboardStats: vi.fn(),
}))

import * as api from '../api/client'

describe('Full CRUD integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create → edit → delete full flow', async () => {
    const user = userEvent.setup()

    // Mock initial data fetch
    vi.mocked(api.fetchProducts).mockResolvedValue([...products])
    vi.mocked(api.fetchStages).mockResolvedValue(lifecycleStages)
    vi.mocked(api.runRuleCheck).mockResolvedValue({
      checkedAt: new Date().toISOString(),
      totalProducts: 3,
      activeRules: 6,
      totalMatches: 0,
      matches: [],
      notifications: [],
    })
    vi.mocked(api.fetchDashboardStats).mockResolvedValue({
      totalProducts: 3,
      activeProducts: 2,
      plannedProducts: 1,
      inDevelopment: 1,
      upcomingLaunches: 0,
      expiringRegistrations: 0,
      productsInDecline: 0,
      quarterMilestones: [],
      phaseDistribution: [],
    })

    const createdProduct = {
      id: 'prod_integration',
      name: '集成测试产品',
      productLine: 'N系列',
      type: 'planned' as const,
      phases: lifecycleStages.map((s, i) => ({
        id: `ph_int_${i}`,
        stageId: s.id,
        startYear: 2026 + i,
        endYear: 2027 + i,
        status: 'upcoming' as const,
      })),
    }
    vi.mocked(api.createProduct).mockResolvedValue(createdProduct)

    const updatedProduct = { ...createdProduct, name: '已改名产品' }
    vi.mocked(api.updateProduct).mockResolvedValue(updatedProduct)

    vi.mocked(api.deleteProduct).mockResolvedValue(updatedProduct)

    render(<App />)

    // Wait for initial data to load (N系列的 filter chip should appear)
    await waitFor(() => {
      const elements = screen.getAllByText('N系列')
      expect(elements.length).toBeGreaterThanOrEqual(2) // filter chip + product name
    })

    // 1. Open add dialog and create a product
    await user.click(screen.getByText('新建产品'))
    const nameInput = screen.getByPlaceholderText('如：N四代')
    await user.type(nameInput, '集成测试产品')
    await user.click(screen.getByText('创建产品'))

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalled()
    })

    // 2. Find and edit the new product
    // Re-fetch to simulate store update after create
    vi.mocked(api.fetchProducts).mockResolvedValue([...products, updatedProduct])
    const allProductLineButtons = screen.getAllByText('全部产品线')
    await user.click(allProductLineButtons[1])

    const editButtons = screen.getAllByTitle('编辑产品')
    const lastEditBtn = editButtons[editButtons.length - 1]
    await user.click(lastEditBtn)

    expect(screen.getByText('编辑产品')).toBeInTheDocument()
    const editNameInput = screen.getByDisplayValue('集成测试产品')
    await user.clear(editNameInput)
    await user.type(editNameInput, '已改名产品')
    await user.click(screen.getByText('保存修改'))

    await waitFor(() => {
      expect(api.updateProduct).toHaveBeenCalled()
    })

    // 3. Delete the product
    vi.mocked(api.fetchProducts).mockResolvedValue([...products])
    // Wait for UI to reflect changes
    const allProductLineButtons2 = screen.getAllByText('全部产品线')
    await user.click(allProductLineButtons2[1])

    const deleteButtons = screen.getAllByTitle('删除产品')
    const lastDeleteBtn = deleteButtons[deleteButtons.length - 1]
    await user.click(lastDeleteBtn)

    expect(screen.getByText(/确定要删除产品/)).toBeInTheDocument()
    const confirmButtons = screen.getAllByText('确认删除')
    const buttonVariant = confirmButtons.find((el) => el.tagName === 'BUTTON')
    expect(buttonVariant).toBeTruthy()
    await user.click(buttonVariant!)

    await waitFor(() => {
      expect(api.deleteProduct).toHaveBeenCalled()
    })
  })
})
