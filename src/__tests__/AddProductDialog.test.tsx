import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddProductDialog } from '../components/AddProductDialog'
import { useProductStore } from '../stores/productStore'

describe('AddProductDialog', () => {
  beforeEach(() => {
    useProductStore.setState(useProductStore.getInitialState())
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

  it('adds a product to the store and closes on valid submit', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddProductDialog open={true} onClose={onClose} />)

    await user.clear(screen.getByPlaceholderText('如：N四代'))
    await user.type(screen.getByPlaceholderText('如：N四代'), 'N四代')
    await user.click(screen.getByText('创建产品'))

    const { products } = useProductStore.getState()
    const created = products.find((p) => p.name === 'N四代')
    expect(created).toBeDefined()
    expect(created!.type).toBe('planned')
    expect(created!.phases.length).toBe(8)
    expect(created!.phases[0].stageId).toBe('concept')
    expect(created!.phases[created!.phases.length - 1].stageId).toBe('retire')
    expect(onClose).toHaveBeenCalled()
  })

  it('adds a product with custom product line', async () => {
    const user = userEvent.setup()
    render(<AddProductDialog open={true} onClose={vi.fn()} />)

    await user.clear(screen.getByPlaceholderText('如：N四代'))
    await user.type(screen.getByPlaceholderText('如：N四代'), 'Q1')
    await user.click(screen.getByText('+ 新建'))
    const customInput = screen.getByPlaceholderText('输入新产品线名称')
    await user.type(customInput, 'Q系列')
    await user.click(screen.getByText('创建产品'))

    const created = useProductStore.getState().products.find((p) => p.name === 'Q1')
    expect(created).toBeDefined()
    expect(created!.productLine).toBe('Q系列')

    // Product lines should now include Q系列
    const { productLines } = useProductStore.getState()
    expect(productLines).toContain('Q系列')
  })

  it('switches product type on click', async () => {
    render(<AddProductDialog open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('在研产品'))
    // The button should now be visually active
    const activeBtn = screen.getByText('在研产品').closest('button')
    expect(activeBtn?.className).toContain('border-blue-400')
  })

  it('calls onClose when pressing cancel', () => {
    const onClose = vi.fn()
    render(<AddProductDialog open={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('取消'))
    expect(onClose).toHaveBeenCalled()
  })
})
