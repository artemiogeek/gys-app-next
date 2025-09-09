/**
 * @fileoverview Tests para las funciones helper de pedidos
 * @author GYS Team
 * @date 2025-01-15
 */

import {
  calcularResumenPedidos,
  getBadgeVariantPorEstado,
  getTextoPorEstado,
  getClasesFilaPorEstado,
  getInfoPedidosParaTooltip,
  tienePedidosActivos,
  estaDisponible,
  type EstadoPedidoItemResumen
} from '../pedidoHelpers'
import type { PedidoEquipoItem, ListaEquipoItem, EstadoListaItem, OrigenListaItem, EstadoListaEquipo } from '@/types'

// 🧪 Mock data for testing
const mockPedidoCompleto: PedidoEquipoItem = {
  id: 'pedido-1',
  pedidoId: 'ped-1',
  listaId: 'lista-1',
  listaEquipoItemId: 'item-1',
  cantidadPedida: 10,
  cantidadAtendida: 10,


  estado: 'atendido',
  comentarioLogistica: 'Pedido completo',
  codigo: 'EQ001',
  descripcion: 'Equipo de prueba',
  unidad: 'pza',
  tiempoEntrega: '15 días',
  tiempoEntregaDias: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockPedidoParcial: PedidoEquipoItem = {
  ...mockPedidoCompleto,
  id: 'pedido-2',
  cantidadPedida: 10,
  cantidadAtendida: 5,
  estado: 'parcial'
}

const mockPedidoPendiente: PedidoEquipoItem = {
  ...mockPedidoCompleto,
  id: 'pedido-3',
  cantidadAtendida: 0,
  estado: 'pendiente'
}

// 🧪 Mock ListaEquipoItem for tienePedidosActivos tests
const mockListaEquipoItemConPedidos: ListaEquipoItem = {
  id: 'item-1',
  listaId: 'lista-1',
  codigo: 'EQ001',
  descripcion: 'Equipo con pedidos',
  unidad: 'pza',
  cantidad: 10,
  cantidadPedida: 20,




  costoReal: 1000,
  estado: 'aprobado' as EstadoListaItem,
  verificado: true,
  origen: 'cotizado' as OrigenListaItem,
  lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador' as EstadoListaEquipo, numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  cotizaciones: [],

  tiempoEntrega: '15 días',
  tiempoEntregaDias: 15,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pedidos: [mockPedidoCompleto, mockPedidoParcial]
}

const mockListaEquipoItemSinPedidos: ListaEquipoItem = {
  ...mockListaEquipoItemConPedidos,
  id: 'item-2',
  descripcion: 'Equipo sin pedidos',
  cantidadPedida: 0,

  pedidos: []
}

const mockListaEquipoItemPedidosCancelados: ListaEquipoItem = {
  ...mockListaEquipoItemConPedidos,
  id: 'item-3',
  descripcion: 'Equipo con pedidos cancelados',
  cantidadPedida: 10,
  pedidos: [{ ...mockPedidoCompleto, estado: 'atendido' }]
}

// Remove duplicate - using the one defined above

describe('pedidoHelpers', () => {
  describe('calcularResumenPedidos', () => {
    it('should return sin_pedidos for item without pedidos', () => {
      const result = calcularResumenPedidos(mockListaEquipoItemSinPedidos)
      
      expect(result.estado).toBe('sin_pedidos')
      expect(result.totalPedidos).toBe(0)
      expect(result.cantidadTotalPedida).toBe(0)
      expect(result.cantidadTotalAtendida).toBe(0)
    })

    it('should calculate correct summary for item with complete pedidos', () => {
      const result = calcularResumenPedidos(mockListaEquipoItemConPedidos)
      
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(10)
      expect(result.cantidadTotalAtendida).toBe(10)
    })

    it('should calculate correct summary for item with partial pedidos', () => {
      const mockItemParcial: ListaEquipoItem = {
        ...mockListaEquipoItemConPedidos,
        pedidos: [mockPedidoParcial]
      }
      const result = calcularResumenPedidos(mockItemParcial)
      
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(10)
      expect(result.cantidadTotalAtendida).toBe(5)
    })

    it('should calculate correct summary for item with pending pedidos', () => {
      const mockItemPendiente: ListaEquipoItem = {
        ...mockListaEquipoItemConPedidos,
        pedidos: [mockPedidoPendiente]
      }
      const result = calcularResumenPedidos(mockItemPendiente)
      
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(10)
      expect(result.cantidadTotalAtendida).toBe(0)
    })

    it('should calculate correct summary for item with mixed pedidos', () => {
      const mockItemMixto: ListaEquipoItem = {
        ...mockListaEquipoItemConPedidos,
        pedidos: [mockPedidoCompleto, mockPedidoParcial, mockPedidoPendiente]
      }
      const result = calcularResumenPedidos(mockItemMixto)
      
      expect(result.totalPedidos).toBe(3)
      expect(result.cantidadTotalPedida).toBe(30) // 10 + 10 + 10
      expect(result.cantidadTotalAtendida).toBe(15) // 10 + 5 + 0
    })
  })

  describe('getBadgeVariantPorEstado', () => {
    it('should return correct badge variants', () => {
      expect(getBadgeVariantPorEstado('sin_pedidos')).toBe('outline')
      expect(getBadgeVariantPorEstado('pendiente')).toBe('secondary')
      expect(getBadgeVariantPorEstado('parcial')).toBe('default')
      expect(getBadgeVariantPorEstado('atendido')).toBe('default')
      expect(getBadgeVariantPorEstado('entregado')).toBe('secondary')
      expect(getBadgeVariantPorEstado('unknown' as any)).toBe('outline')
    })
  })

  describe('getTextoPorEstado', () => {
    it('should return correct text for each estado', () => {
      expect(getTextoPorEstado('sin_pedidos')).toBe('Sin pedidos')
      expect(getTextoPorEstado('pendiente')).toBe('Pendiente')
      expect(getTextoPorEstado('parcial')).toBe('Parcial')
      expect(getTextoPorEstado('atendido')).toBe('Atendido')
      expect(getTextoPorEstado('entregado')).toBe('Entregado')
      expect(getTextoPorEstado('unknown' as any)).toBe('Desconocido')
    })
  })

  describe('getClasesFilaPorEstado', () => {
    it('should return correct CSS classes for each estado', () => {
      expect(getClasesFilaPorEstado('sin_pedidos')).toBe('')
      expect(getClasesFilaPorEstado('pendiente')).toBe('border-l-4 border-l-blue-400 bg-blue-50/30')
      expect(getClasesFilaPorEstado('parcial')).toBe('border-l-4 border-l-yellow-400 bg-yellow-50/30')
      expect(getClasesFilaPorEstado('atendido')).toBe('border-l-4 border-l-green-400 bg-green-50/30')
      expect(getClasesFilaPorEstado('unknown' as any)).toBe('')
    })
  })

  describe('getInfoPedidosParaTooltip', () => {
    it('should return tooltip info for item without pedidos', () => {
      const result = getInfoPedidosParaTooltip(mockListaEquipoItemSinPedidos)
      expect(result).toContain('Cantidad disponible: 5')
    })

    it('should return tooltip info for item with pedidos', () => {
      const result = getInfoPedidosParaTooltip(mockListaEquipoItemConPedidos)
      expect(result).toContain('Total pedidos:')
      expect(result).toContain('Cantidad pedida:')
      expect(result).toContain('Cantidad atendida:')
      expect(result).toContain('Disponible:')
    })
  })

  describe('tienePedidosActivos', () => {
    it('should return false for item without pedidos', () => {
      expect(tienePedidosActivos(mockListaEquipoItemSinPedidos)).toBe(false)
    })

    it('should return true for item with active pedidos', () => {
      expect(tienePedidosActivos(mockListaEquipoItemConPedidos)).toBe(true)
    })

    it('should return false for item with only cancelled pedidos', () => {
      const mockItemCancelado: ListaEquipoItem = {
        ...mockListaEquipoItemSinPedidos,
        pedidos: [{ ...mockPedidoCompleto, estado: 'atendido' }]
      }
      expect(tienePedidosActivos(mockItemCancelado)).toBe(true)
    })
  })

  describe('estaDisponible', () => {
    it('should return true for item without pedidos', () => {
      expect(estaDisponible(mockListaEquipoItemSinPedidos)).toBe(true)
    })

    it('should return false for item with active pedidos', () => {
      expect(estaDisponible(mockListaEquipoItemConPedidos)).toBe(false)
    })

    it('should return true for item with only cancelled pedidos', () => {
      expect(estaDisponible(mockListaEquipoItemPedidosCancelados)).toBe(true)
    })
  })

  // 🧪 Edge cases and error handling
  describe('Edge Cases', () => {
    it('should handle null/undefined pedidos gracefully', () => {
      expect(() => calcularResumenPedidos(null as any)).not.toThrow()
      expect(() => calcularResumenPedidos(undefined as any)).not.toThrow()
    })

    it('should handle pedidos with missing properties', () => {
      const incompletePedido = {
        id: 'incomplete',
        cantidadPedida: 5
      } as PedidoEquipoItem
      
      const mockItemIncompleto: ListaEquipoItem = {
        ...mockListaEquipoItemSinPedidos,
        pedidos: [incompletePedido]
      }
      
      expect(() => calcularResumenPedidos(mockItemIncompleto)).not.toThrow()
    })

    it('should handle negative quantities', () => {
      const negativePedido = {
        ...mockPedidoCompleto,
        cantidadPedida: -5,
        cantidadAtendida: -2
      }
      
      const mockItemNegativo: ListaEquipoItem = {
        ...mockListaEquipoItemSinPedidos,
        pedidos: [negativePedido]
      }
      
      const result = calcularResumenPedidos(mockItemNegativo)
      expect(result.cantidadTotalPedida).toBe(-5)
      expect(result.cantidadTotalAtendida).toBe(-2)
    })
  })
})