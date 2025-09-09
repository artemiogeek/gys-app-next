import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  calculateTotalInternal,
  calculateTotalClient,
  calculateProfitMargin,
  calculateRental,
  getProfitMarginVariant,
  getRentalVariant,
  validateQuantity,
  formatDate,
  truncateText,
  generateTempId,
  debounce,
  groupBy,
  multiSort,
  calculateItemStatistics
} from '../plantilla-utils'
import type { PlantillaEquipoItem } from '@/types'

const mockItems: PlantillaEquipoItem[] = [
  {
    id: '1',
    plantillaEquipoId: '1',
    catalogoEquipoId: '1',
    codigo: 'EQ001',
    descripcion: 'Equipo A',
    categoria: 'Categoría 1',
    unidad: 'und',
    marca: 'Marca A',
    precioInterno: 100,
    precioCliente: 150,
    cantidad: 2,
    costoInterno: 200, // 2 * 100
    costoCliente: 300, // 2 * 150
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    plantillaEquipoId: '1',
    catalogoEquipoId: '2',
    codigo: 'EQ002',
    descripcion: 'Equipo B',
    categoria: 'Categoría 2',
    unidad: 'und',
    marca: 'Marca B',
    precioInterno: 500,
    precioCliente: 750,
    cantidad: 1,
    costoInterno: 500,
    costoCliente: 750,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

describe('plantilla-utils', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-100)).toBe('-$100.00')
    })

    it('handles decimal places correctly', () => {
      expect(formatCurrency(100.1)).toBe('$100.10')
      expect(formatCurrency(100.123)).toBe('$100.12')
    })
  })

  describe('formatNumber', () => {
    it('formats numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1.000')
      expect(formatNumber(1234567)).toBe('1.234.567')
      expect(formatNumber(0)).toBe('0')
    })

    it('handles decimal places', () => {
      expect(formatNumber(1000.5)).toBe('1.000,5')
      expect(formatNumber(1234.567)).toBe('1.234,57')
    })
  })

  describe('calculateTotalInternal', () => {
    it('calculates total internal cost correctly', () => {
      expect(calculateTotalInternal(mockItems)).toBe(700) // 200 + 500
    })

    it('handles empty array', () => {
      expect(calculateTotalInternal([])).toBe(0)
    })

    it('handles undefined items', () => {
      expect(calculateTotalInternal(undefined as any)).toBe(0)
    })
  })

  describe('calculateTotalClient', () => {
    it('calculates total client cost correctly', () => {
      expect(calculateTotalClient(mockItems)).toBe(1050) // 300 + 750
    })

    it('handles empty array', () => {
      expect(calculateTotalClient([])).toBe(0)
    })

    it('handles undefined items', () => {
      expect(calculateTotalClient(undefined as any)).toBe(0)
    })
  })

  describe('calculateProfitMargin', () => {
    it('calculates profit margin correctly', () => {
      // (1050 - 700) / 700 * 100 = 50%
      expect(calculateProfitMargin(mockItems)).toBe(50)
    })

    it('handles zero internal cost', () => {
      const itemsWithZeroInternal = mockItems.map(item => ({ ...item, costoInterno: 0 }))
      expect(calculateProfitMargin(itemsWithZeroInternal)).toBe(0)
    })

    it('handles empty array', () => {
      expect(calculateProfitMargin([])).toBe(0)
    })
  })

  describe('calculateRental', () => {
    it('calculates rental correctly', () => {
      expect(calculateRental(1000)).toBe(150) // 1000 * 0.15
    })

    it('handles zero total', () => {
      expect(calculateRental(0)).toBe(0)
    })

    it('handles negative total', () => {
      expect(calculateRental(-100)).toBe(-15)
    })
  })

  describe('getProfitMarginVariant', () => {
    it('returns correct variants for different margins', () => {
      expect(getProfitMarginVariant(35)).toBe('default') // >= 30
      expect(getProfitMarginVariant(20)).toBe('secondary') // >= 15
      expect(getProfitMarginVariant(10)).toBe('outline') // >= 5
      expect(getProfitMarginVariant(2)).toBe('destructive') // < 5
    })

    it('handles edge cases', () => {
      expect(getProfitMarginVariant(30)).toBe('default')
      expect(getProfitMarginVariant(15)).toBe('secondary')
      expect(getProfitMarginVariant(5)).toBe('outline')
    })
  })

  describe('getRentalVariant', () => {
    it('returns correct variants for different rental amounts', () => {
      expect(getRentalVariant(1000)).toBe('default') // >= 500
      expect(getRentalVariant(300)).toBe('secondary') // >= 200
      expect(getRentalVariant(150)).toBe('outline') // >= 100
      expect(getRentalVariant(50)).toBe('destructive') // < 100
    })

    it('handles edge cases', () => {
      expect(getRentalVariant(500)).toBe('default')
      expect(getRentalVariant(200)).toBe('secondary')
      expect(getRentalVariant(100)).toBe('outline')
    })
  })

  describe('validateQuantity', () => {
    it('validates quantity correctly', () => {
      expect(validateQuantity(1)).toBe(true)
      expect(validateQuantity(100)).toBe(true)
      expect(validateQuantity(1000)).toBe(true)
    })

    it('rejects invalid quantities', () => {
      expect(validateQuantity(0)).toBe(false)
      expect(validateQuantity(-1)).toBe(false)
      expect(validateQuantity(1001)).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateQuantity(0.5)).toBe(false) // Not integer
      expect(validateQuantity(NaN)).toBe(false)
      expect(validateQuantity(Infinity)).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/15\/01\/2024/) // DD/MM/YYYY format
    })

    it('handles string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toMatch(/15\/01\/2024/)
    })
  })

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
      expect(truncateText('Short', 10)).toBe('Short')
      expect(truncateText('', 5)).toBe('')
    })

    it('handles edge cases', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
      expect(truncateText('Hello', 0)).toBe('...')
    })
  })

  describe('generateTempId', () => {
    it('generates unique IDs', () => {
      const id1 = generateTempId()
      const id2 = generateTempId()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^temp_/)
      expect(id2).toMatch(/^temp_/)
    })

    it('generates IDs with correct format', () => {
      const id = generateTempId()
      expect(id).toMatch(/^temp_[a-z0-9]+$/)
    })
  })

  describe('debounce', () => {
    it('debounces function calls', async () => {
      let callCount = 0
      const fn = () => { callCount++ }
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      // Should not be called immediately
      expect(callCount).toBe(0)

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(callCount).toBe(1)
    })
  })

  describe('groupBy', () => {
    it('groups items correctly', () => {
      const items = [
        { category: 'A', name: 'Item 1' },
        { category: 'B', name: 'Item 2' },
        { category: 'A', name: 'Item 3' }
      ]

      const grouped = groupBy(items, 'category')
      expect(grouped.A).toHaveLength(2)
      expect(grouped.B).toHaveLength(1)
      expect(grouped.A[0].name).toBe('Item 1')
      expect(grouped.A[1].name).toBe('Item 3')
    })

    it('handles empty array', () => {
      const grouped = groupBy([], 'category')
      expect(Object.keys(grouped)).toHaveLength(0)
    })
  })

  describe('multiSort', () => {
    it('sorts by multiple criteria', () => {
      const items = [
        { category: 'B', price: 100 },
        { category: 'A', price: 200 },
        { category: 'A', price: 100 },
        { category: 'B', price: 200 }
      ]

      const sorted = multiSort(items, [
        { key: 'category', direction: 'asc' },
        { key: 'price', direction: 'desc' }
      ])

      expect(sorted[0]).toEqual({ category: 'A', price: 200 })
      expect(sorted[1]).toEqual({ category: 'A', price: 100 })
      expect(sorted[2]).toEqual({ category: 'B', price: 200 })
      expect(sorted[3]).toEqual({ category: 'B', price: 100 })
    })

    it('handles single sort criteria', () => {
      const items = [{ name: 'C' }, { name: 'A' }, { name: 'B' }]
      const sorted = multiSort(items, [{ key: 'name', direction: 'asc' }])
      
      expect(sorted[0].name).toBe('A')
      expect(sorted[1].name).toBe('B')
      expect(sorted[2].name).toBe('C')
    })
  })

  describe('calculateItemStatistics', () => {
    it('calculates statistics correctly', () => {
      const stats = calculateItemStatistics(mockItems)
      
      expect(stats.totalItems).toBe(2)
      expect(stats.totalQuantity).toBe(3) // 2 + 1
      expect(stats.totalInternal).toBe(700) // 200 + 500
      expect(stats.totalClient).toBe(1050) // 300 + 750
      expect(stats.profitMargin).toBe(50) // (1050 - 700) / 700 * 100
      expect(stats.rental).toBe(157.5) // 1050 * 0.15
      expect(stats.averageUnitPrice).toBe(350) // 1050 / 3
      expect(stats.averageItemCost).toBe(525) // 1050 / 2
    })

    it('handles empty array', () => {
      const stats = calculateItemStatistics([])
      
      expect(stats.totalItems).toBe(0)
      expect(stats.totalQuantity).toBe(0)
      expect(stats.totalInternal).toBe(0)
      expect(stats.totalClient).toBe(0)
      expect(stats.profitMargin).toBe(0)
      expect(stats.rental).toBe(0)
      expect(stats.averageUnitPrice).toBe(0)
      expect(stats.averageItemCost).toBe(0)
    })

    it('handles items with zero internal cost', () => {
      const itemsWithZero = [
        {
          ...mockItems[0],
          costoInterno: 0
        }
      ]
      
      const stats = calculateItemStatistics(itemsWithZero)
      expect(stats.profitMargin).toBe(0)
    })
  })
})