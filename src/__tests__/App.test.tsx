import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('产品生命周期管理')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByText(/预览版本/)).toBeInTheDocument()
  })

  it('renders product names', () => {
    render(<App />)
    expect(screen.getAllByText('N系列').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Nplus')).toBeInTheDocument()
    expect(screen.getByText('N三代')).toBeInTheDocument()
  })
})
