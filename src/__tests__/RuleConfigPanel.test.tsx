import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RuleConfigPanel } from '../components/RuleConfigPanel'
import * as api from '../api/client'

vi.mock('../api/client', () => ({
  fetchRules: vi.fn(),
  createRule: vi.fn(),
  updateRule: vi.fn(),
  deleteRule: vi.fn(),
  fetchProducts: vi.fn(),
  fetchStages: vi.fn(),
  addPhase: vi.fn(),
  updatePhase: vi.fn(),
  deletePhase: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

const mockRules = [
  {
    id: 'r1',
    name: '测试规则一',
    category: '市场' as const,
    description: '描述一',
    condition: { type: 'time_since' as const, stageId: 'mature', yearsMin: 1, yearsMax: 3 },
    action: 'alert' as const,
    priority: 'high' as const,
    enabled: true,
  },
  {
    id: 'r2',
    name: '测试规则二',
    category: '法规' as const,
    description: '描述二',
    condition: { type: 'metric_threshold' as const, metric: 'risk', operator: 'gt' as const, value: 50 },
    action: 'recommend_new_product' as const,
    priority: 'medium' as const,
    enabled: false,
  },
]

describe('RuleConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchRules).mockResolvedValue(mockRules)
  })

  it('renders loading state initially', () => {
    vi.mocked(api.fetchRules).mockReturnValue(new Promise(() => {}))
    render(<RuleConfigPanel onBack={vi.fn()} />)
    expect(screen.getByText('加载规则中...')).toBeInTheDocument()
  })

  it('renders rules after load', async () => {
    render(<RuleConfigPanel onBack={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('测试规则一')).toBeInTheDocument()
    })
    expect(screen.getByText('测试规则二')).toBeInTheDocument()
  })

  it('toggles rule enabled state', async () => {
    const user = userEvent.setup()
    vi.mocked(api.updateRule).mockResolvedValue({ ...mockRules[0], enabled: false })
    render(<RuleConfigPanel onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('测试规则一')).toBeInTheDocument()
    })

    // Click the toggle for rule 1 (first toggle button in the list)
    const toggles = screen.getAllByTitle('禁用')
    await user.click(toggles[0])

    await waitFor(() => {
      expect(api.updateRule).toHaveBeenCalledWith('r1', { enabled: false })
    })
  })

  it('opens create dialog when clicking new rule button', async () => {
    const user = userEvent.setup()
    render(<RuleConfigPanel onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('测试规则一')).toBeInTheDocument()
    })

    await user.click(screen.getByText('新建规则'))
    // "新建规则" appears in both the header button and dialog title - use "创建规则" which is unique to the dialog
    expect(screen.getByText('创建规则')).toBeInTheDocument()
  })

  it('shows empty state when no rules', async () => {
    vi.mocked(api.fetchRules).mockResolvedValue([])
    render(<RuleConfigPanel onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('暂无触发规则')).toBeInTheDocument()
    })
  })

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<RuleConfigPanel onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('测试规则一')).toBeInTheDocument()
    })

    // The back button is the left-chevron button in the header, before "触发规则配置"
    const header = screen.getByText('触发规则配置').closest('.flex.items-center.gap-3')
    const backBtn = header?.querySelector('button')
    expect(backBtn).toBeTruthy()
    await user.click(backBtn!)
    expect(onBack).toHaveBeenCalled()
  })

  it('shows delete confirmation', async () => {
    const user = userEvent.setup()
    render(<RuleConfigPanel onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('测试规则一')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('删除规则')
    await user.click(deleteButtons[0])

    expect(screen.getByText(/确定要删除规则/)).toBeInTheDocument()
  })
})
