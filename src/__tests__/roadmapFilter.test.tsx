import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoadmapGantt } from '../components/RoadmapGantt'
import { useProductStore } from '../stores/productStore'

describe('RoadmapGantt filter', () => {
  beforeEach(() => {
    useProductStore.setState({
      ...useProductStore.getInitialState(),
      selectedProductLine: null,
      products: [
        {
          id: 'test1',
          name: '产品A',
          productLine: 'A系列',
          type: 'existing' as const,
          phases: [],
        },
        {
          id: 'test2',
          name: '产品B',
          productLine: 'A系列',
          type: 'existing' as const,
          phases: [],
        },
        {
          id: 'test3',
          name: '产品C',
          productLine: 'B系列',
          type: 'existing' as const,
          phases: [],
        },
      ],
      productLines: ['A系列', 'B系列'],
    })
  })

  it('shows all products when no filter selected', () => {
    render(<RoadmapGantt />)
    expect(screen.getByText('产品A')).toBeInTheDocument()
    expect(screen.getByText('产品B')).toBeInTheDocument()
    expect(screen.getByText('产品C')).toBeInTheDocument()
  })

  it('filters products when a product line is selected', () => {
    render(<RoadmapGantt />)
    fireEvent.click(screen.getByText('A系列'))
    expect(screen.getByText('产品A')).toBeInTheDocument()
    expect(screen.getByText('产品B')).toBeInTheDocument()
    expect(screen.queryByText('产品C')).not.toBeInTheDocument()
  })

  it('shows all products again when clicking 全部产品线', () => {
    render(<RoadmapGantt />)
    fireEvent.click(screen.getByText('B系列'))
    fireEvent.click(screen.getByText('📋 全部产品线'))
    expect(screen.getByText('产品A')).toBeInTheDocument()
    expect(screen.getByText('产品C')).toBeInTheDocument()
  })
})
