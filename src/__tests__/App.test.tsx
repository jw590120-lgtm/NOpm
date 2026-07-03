import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
  runRuleCheck: vi.fn(),
}))

import * as api from '../api/client'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
  })

  it('renders the app title', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('产品生命周期管理')).toBeInTheDocument()
    })
  })

  it('renders the footer', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/Phase 4/)).toBeInTheDocument()
    })
  })

  it('renders product names after loading', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getAllByText('N系列').length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getByText('Nplus')).toBeInTheDocument()
    expect(screen.getByText('N三代')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    // Don't resolve the API calls, so state stays loading
    vi.mocked(api.fetchProducts).mockReturnValue(new Promise(() => {}))
    render(<App />)
    expect(screen.getByText('加载数据中...')).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    vi.mocked(api.fetchProducts).mockRejectedValue(new Error('Network Error'))
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('数据加载失败')).toBeInTheDocument()
    })
  })
})
