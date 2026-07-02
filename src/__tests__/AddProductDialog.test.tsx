import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddProductDialog } from '../components/AddProductDialog'
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
import { lifecycleStages } from '../data/mockData'

describe('AddProductDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    seedStore()
  })

  it('renders nothing when closed', () => {
    const { container } = render(<AddProductDialog open={false} onClose={vi.fn()} />)
    expect(container.innerHTML).toBeFalsy()
  })

  it('renders the form when open', () => {
    render(<AddProductDialog open={true} onClose={vi.fn()} />)
    expect(screen.getByText('新建产品')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('如：N四代')).toBeInTheDocument()
    expect(screen.getByText('创建产品')).toBeInTheDocument()
  })

  it('shows errors when submitting with empty name', async () => {
    render(<AddProductDialog open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('创建产品'))
    expect(await screen.findByText('请输入产品名称')).toBeInTheDocument()
  })

  it('adds a product via API and closes on valid submit', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    const createdProduct = {
      id: 'prod_api_123',
      name: 'N四代',
      productLine: 'N系列',
      type: 'planned' as const,
      phases: lifecycleStages.map((s, i) => ({
        id: `ph_${i}`,
        stageId: s.id,
        startYear: 2026 + i,
        endYear: 2027 + i,
        status: 'upcoming' as const,
      })),
    }
    vi.mocked(api.createProduct).mockResolvedValue(createdProduct)

    render(<AddProductDialog open={true} onClose={onClose} />)

    await user.clear(screen.getByPlaceholderText('如：N四代'))
    await user.type(screen.getByPlaceholderText('如：N四代'), 'N四代')
    await user.click(screen.getByText('创建产品'))

    expect(api.createProduct).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when pressing cancel', () => {
    const onClose = vi.fn()
    render(<AddProductDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('取消'))
    expect(onClose).toHaveBeenCalled()
  })
})
