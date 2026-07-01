import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { useProductStore } from '../stores/productStore'

function resetStore() {
  useProductStore.setState(useProductStore.getInitialState())
}

describe('Full CRUD integration', () => {
  beforeEach(() => {
    resetStore()
  })

  it('create → edit → delete full flow', async () => {
    const user = userEvent.setup()
    render(<App />)

    const initialCount = useProductStore.getState().products.length

    // 1. Open add dialog and create a product
    await user.click(screen.getByText('新建产品'))
    const nameInput = screen.getByPlaceholderText('如：N四代')
    await user.type(nameInput, '集成测试产品')
    await user.click(screen.getByText('创建产品'))

    // Verify toast and new product
    expect(screen.getByText(/已创建产品/)).toBeInTheDocument()
    expect(useProductStore.getState().products.length).toBe(initialCount + 1)
    const newProduct = useProductStore.getState().products[initialCount]
    expect(newProduct.name).toBe('集成测试产品')

    // 2. Find and edit the new product
    // Get all edit buttons, the last one corresponds to the new product
    const editButtons = screen.getAllByTitle('编辑产品')
    const lastEditBtn = editButtons[editButtons.length - 1]
    await user.click(lastEditBtn)

    expect(screen.getByText('编辑产品')).toBeInTheDocument()
    const editNameInput = screen.getByDisplayValue('集成测试产品')
    await user.clear(editNameInput)
    await user.type(editNameInput, '已改名产品')
    await user.click(screen.getByText('保存修改'))

    // Verify edit
    const updated = useProductStore.getState().products[initialCount]
    expect(updated.name).toBe('已改名产品')

    // 3. Delete the product
    const deleteButtons = screen.getAllByTitle('删除产品')
    const lastDeleteBtn = deleteButtons[deleteButtons.length - 1]
    await user.click(lastDeleteBtn)

    expect(screen.getByText(/确定要删除产品/)).toBeInTheDocument()
    const confirmButtons = screen.getAllByText('确认删除')
    const buttonVariant = confirmButtons.find((el) => el.tagName === 'BUTTON')
    expect(buttonVariant).toBeTruthy()
    await user.click(buttonVariant!)

    // Verify deleted
    expect(useProductStore.getState().products).toHaveLength(initialCount)
  })
})
