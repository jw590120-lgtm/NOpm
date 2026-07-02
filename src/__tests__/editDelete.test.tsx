import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoadmapGantt } from '../components/RoadmapGantt'
import { useProductStore } from '../stores/productStore'
import { seedStore } from './helpers'

vi.mock('../api/client', () => ({
  fetchProducts: vi.fn(),
  fetchStages: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  addPhase: vi.fn(),
  updatePhase: vi.fn(),
  deletePhase: vi.fn(),
}))

import * as api from '../api/client'

const testProduct = {
  id: 'test-prod-1',
  name: '测试产品',
  productLine: 'N系列',
  type: 'planned' as const,
  phases: [
    { id: 'ph1', stageId: 'concept', startYear: 2025, endYear: 2026, status: 'completed' as const },
    { id: 'ph2', stageId: 'design', startYear: 2026, endYear: 2029, status: 'active' as const },
  ],
}

describe('RoadmapGantt edit/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    seedStore({
      products: [testProduct],
      selectedProductLine: null,
    })
    vi.mocked(api.fetchProducts).mockResolvedValue([testProduct])
    vi.mocked(api.fetchStages).mockResolvedValue([])
  })

  it('shows edit and delete icons on product row', () => {
    render(<RoadmapGantt />)
    const productRow = screen.getByText('测试产品').closest('.group')
    expect(productRow).toBeInTheDocument()
  })

  it('opens edit dialog when clicking edit icon', async () => {
    render(<RoadmapGantt />)
    const editBtn = screen.getByTitle('编辑产品')
    await userEvent.setup().click(editBtn)
    expect(screen.getByText('编辑产品')).toBeInTheDocument()
    expect(screen.getByText('保存修改')).toBeInTheDocument()
  })

  it('saves product edits', async () => {
    const user = userEvent.setup()
    render(<RoadmapGantt />)

    vi.mocked(api.updateProduct).mockResolvedValue({ ...testProduct, name: '改名产品' })

    await user.click(screen.getByTitle('编辑产品'))
    const nameInput = screen.getByDisplayValue('测试产品')
    await user.clear(nameInput)
    await user.type(nameInput, '改名产品')
    await user.click(screen.getByText('保存修改'))

    await waitFor(() => {
      expect(api.updateProduct).toHaveBeenCalledWith(
        'test-prod-1',
        expect.objectContaining({ name: '改名产品' }),
      )
    })
  })

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<RoadmapGantt />)

    await user.click(screen.getByTitle('删除产品'))
    expect(screen.getByText(/确定要删除产品/)).toBeInTheDocument()
    const confirmBtns = screen.getAllByText('确认删除')
    expect(confirmBtns.length).toBe(2)
  })

  it('deletes product on confirm', async () => {
    const user = userEvent.setup()
    vi.mocked(api.deleteProduct).mockResolvedValue(testProduct)
    render(<RoadmapGantt />)

    await user.click(screen.getByTitle('删除产品'))
    const confirmButtons = screen.getAllByText('确认删除')
    const buttonVariant = confirmButtons.find((el) => el.tagName === 'BUTTON')
    expect(buttonVariant).toBeTruthy()
    await user.click(buttonVariant!)

    await waitFor(() => {
      expect(api.deleteProduct).toHaveBeenCalledWith('test-prod-1')
    })
  })

  it('cancels delete', async () => {
    const user = userEvent.setup()
    render(<RoadmapGantt />)

    await user.click(screen.getByTitle('删除产品'))
    await user.click(screen.getByText('取消'))

    expect(useProductStore.getState().products).toHaveLength(1)
    expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
  })
})
