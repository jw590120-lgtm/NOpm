import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoadmapGantt } from '../components/RoadmapGantt'
import { seedStore } from './helpers'

describe('RoadmapGantt filter', () => {
  describe('product line filter', () => {
    beforeEach(() => {
      seedStore({
        products: [
          { id: 'test1', name: '产品A', productLine: 'A系列', type: 'existing', phases: [] },
          { id: 'test2', name: '产品B', productLine: 'A系列', type: 'existing', phases: [] },
          { id: 'test3', name: '产品C', productLine: 'B系列', type: 'existing', phases: [] },
        ],
        selectedProductLine: null,
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
      fireEvent.click(screen.getByText('全部产品线'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品C')).toBeInTheDocument()
    })

    it('supports multi-select: shows products from both selected lines', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('A系列'))
      fireEvent.click(screen.getByText('B系列'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
      expect(screen.getByText('产品C')).toBeInTheDocument()
    })

    it('supports multi-select: toggling a line off removes its products', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('A系列'))
      fireEvent.click(screen.getByText('B系列'))
      fireEvent.click(screen.getByText('B系列'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
      expect(screen.queryByText('产品C')).not.toBeInTheDocument()
    })

    it('selecting all lines individually shows all products', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('A系列'))
      fireEvent.click(screen.getByText('B系列'))
      // Both lines selected → all products visible
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
      expect(screen.getByText('产品C')).toBeInTheDocument()
    })
  })

  describe('stage filter', () => {
    beforeEach(() => {
      seedStore({
        products: [
          {
            id: 'p1',
            name: '产品A',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph1', stageId: 'concept', startYear: 2020, endYear: 2022, status: 'completed' },
            ],
          },
          {
            id: 'p2',
            name: '产品B',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph2', stageId: 'growth', startYear: 2022, endYear: 2025, status: 'active' },
            ],
          },
        ],
        selectedProductLine: null,
      })
    })

    it('filters products by stage', () => {
      render(<RoadmapGantt />)
      // Stage name appears both on the filter button and in the Gantt bar label
      const stageButtons = screen.getAllByText('概念与立项')
      fireEvent.click(stageButtons[0])
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.queryByText('产品B')).not.toBeInTheDocument()
    })

    it('clears stage filter when clicking the active stage again', () => {
      render(<RoadmapGantt />)
      const stageButtons = screen.getAllByText('概念与立项')
      fireEvent.click(stageButtons[0])
      fireEvent.click(stageButtons[0])
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
    })

    it('shows all products when clicking 全部阶段', () => {
      render(<RoadmapGantt />)
      const stageButtons = screen.getAllByText('概念与立项')
      fireEvent.click(stageButtons[0])
      fireEvent.click(screen.getByText('全部阶段'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
    })
  })

  describe('combined filters', () => {
    beforeEach(() => {
      seedStore({
        products: [
          {
            id: 'p1',
            name: '产品A',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph1', stageId: 'concept', startYear: 2020, endYear: 2022, status: 'completed' },
            ],
          },
          {
            id: 'p2',
            name: '产品B',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph2', stageId: 'growth', startYear: 2024, endYear: 2028, status: 'active' },
            ],
          },
          {
            id: 'p3',
            name: '产品C',
            productLine: 'Y系列',
            type: 'existing',
            phases: [
              { id: 'ph3', stageId: 'concept', startYear: 2023, endYear: 2025, status: 'completed' },
            ],
          },
        ],
        selectedProductLine: null,
      })
    })

    it('combines product line and stage filters (AND logic)', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('X系列'))
      const stageButtons = screen.getAllByText('概念与立项')
      fireEvent.click(stageButtons[0])
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.queryByText('产品B')).not.toBeInTheDocument()
      expect(screen.queryByText('产品C')).not.toBeInTheDocument()
    })

    it('shows clear all button when filters are active', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('X系列'))
      expect(screen.getByText('清除全部筛选')).toBeInTheDocument()
    })

    it('clears all filters when clicking 清除全部筛选', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('X系列'))
      const stageButtons = screen.getAllByText('概念与立项')
      fireEvent.click(stageButtons[0])
      fireEvent.click(screen.getByText('清除全部筛选'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
      expect(screen.getByText('产品C')).toBeInTheDocument()
    })

    it('shows empty state message when combined filters yield no results', () => {
      render(<RoadmapGantt />)
      fireEvent.click(screen.getByText('X系列'))
      fireEvent.click(screen.getByText('衰退期'))
      expect(screen.getByText('没有产品匹配当前筛选条件')).toBeInTheDocument()
      // Both the filter bar button and empty state button say 清除全部筛选
      const clearButtons = screen.getAllByText('清除全部筛选')
      expect(clearButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('year range filter', () => {
    beforeEach(() => {
      seedStore({
        products: [
          {
            id: 'p1',
            name: '产品A',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph1', stageId: 'concept', startYear: 2020, endYear: 2022, status: 'completed' },
            ],
          },
          {
            id: 'p2',
            name: '产品B',
            productLine: 'X系列',
            type: 'existing',
            phases: [
              { id: 'ph2', stageId: 'growth', startYear: 2026, endYear: 2030, status: 'active' },
            ],
          },
        ],
        selectedProductLine: null,
      })
    })

    it('filters products by year range', () => {
      render(<RoadmapGantt />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: '2025' } })
      fireEvent.change(selects[1], { target: { value: '2035' } })
      expect(screen.queryByText('产品A')).not.toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
    })

    it('shows clear time button when year range is set', () => {
      render(<RoadmapGantt />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: '2020' } })
      expect(screen.getByText('清除时间')).toBeInTheDocument()
    })

    it('clears year range when clicking 清除时间', () => {
      render(<RoadmapGantt />)
      const selects = screen.getAllByRole('combobox')
      fireEvent.change(selects[0], { target: { value: '2020' } })
      fireEvent.click(screen.getByText('清除时间'))
      expect(screen.getByText('产品A')).toBeInTheDocument()
      expect(screen.getByText('产品B')).toBeInTheDocument()
    })
  })
})
