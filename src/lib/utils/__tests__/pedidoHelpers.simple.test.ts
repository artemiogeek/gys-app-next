/**
 * @fileoverview Tests simplificados para las funciones helper de pedidos
 * @author GYS Team
 * @date 2025-01-15
 */

import {
  calcularResumenPedidos,
  getBadgeVariantPorEstado,
  getTextoPorEstado,
  getClasesFilaPorEstado,
  tienePedidosActivos,
  estaDisponible
} from '../pedidoHelpers'
import type { ListaEquipoItem, PedidoEquipoItem, EstadoPedidoItem, OrigenListaItem, EstadoListaEquipo } from '@/types/modelos'

// 🧪 Mock data for testing
const mockPedidoCompleto: PedidoEquipoItem = {
  id: 'pedido-1',
  pedidoId: 'ped-1',
  listaId: 'lista-1',
  listaEquipoItemId: 'item-1',
  cantidadPedida: 10,
  cantidadAtendida: 10,
  estado: 'atendido' as EstadoPedidoItem,
  comentarioLogistica: '',
  codigo: 'EQ001',
  descripcion: 'Equipo de prueba',
  unidad: 'und',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockPedidoParcial: PedidoEquipoItem = {
  ...mockPedidoCompleto,
  id: 'pedido-2',
  cantidadPedida: 10,
  cantidadAtendida: 5,
  estado: 'parcial' as EstadoPedidoItem
}

const mockPedidoPendiente: PedidoEquipoItem = {
  ...mockPedidoCompleto,
  id: 'pedido-3',
  cantidadPedida: 8,
  cantidadAtendida: 0,
  estado: 'pendiente' as EstadoPedidoItem
}

// 🧪 Mock ListaEquipoItem data
const mockItemSinPedidos: ListaEquipoItem = {
  id: 'item-1',
  listaId: 'lista-1',
  codigo: 'EQ001',
  descripcion: 'Equipo de prueba',
  unidad: 'und',
  cantidad: 10,
  verificado: true,
  estado: 'aprobado' as EstadoListaItem,
  origen: 'cotizado' as OrigenListaItem,
  lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador', numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  cotizaciones: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pedidos: []
}

const mockItemConPedidos: ListaEquipoItem = {
  ...mockItemSinPedidos,
  pedidos: [mockPedidoCompleto, mockPedidoParcial]
}

describe('pedidoHelpers - Core Functions', () => {
  describe('calcularResumenPedidos', () => {
    test('should return disponible for empty pedidos array', () => {
      const result = calcularResumenPedidos(mockItemSinPedidos)
      
      expect(result.estado).toBe('disponible')
      expect(result.totalPedidos).toBe(0)
      expect(result.cantidadTotalPedida).toBe(0)
      expect(result.cantidadTotalAtendida).toBe(0)
    })

    test('should calculate correct summary for single complete pedido', () => {
      const mockItemCompleto: ListaEquipoItem = {
        ...mockItemSinPedidos,
        pedidos: [mockPedidoCompleto]
      }
      const result = calcularResumenPedidos(mockItemCompleto)
      
      expect(result.estado).toBe('completo')
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(10)
      expect(result.cantidadTotalAtendida).toBe(10)
      // expect(result.pedidosCompletos).toBe(1) // Property doesn't exist in PedidoItemResumen
    })

    test('should calculate correct summary for partial pedido', () => {
      const mockItemParcial: ListaEquipoItem = {
        ...mockItemSinPedidos,
        pedidos: [mockPedidoParcial]
      }
      const result = calcularResumenPedidos(mockItemParcial)
      
      expect(result.estado).toBe('parcial')
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(10)
      expect(result.cantidadTotalAtendida).toBe(5)
      // expect(result.pedidosParciales).toBe(1) // Property doesn't exist in PedidoItemResumen
    })

    test('should calculate correct summary for pending pedido', () => {
      const mockItemPendiente: ListaEquipoItem = {
        ...mockItemSinPedidos,
        pedidos: [mockPedidoPendiente]
      }
      const result = calcularResumenPedidos(mockItemPendiente)
      
      expect(result.estado).toBe('en_pedido')
      expect(result.totalPedidos).toBe(1)
      expect(result.cantidadTotalPedida).toBe(8)
      expect(result.cantidadTotalAtendida).toBe(0)
    })
  })

  describe('getBadgeVariantPorEstado', () => {
    test('should return correct badge variants', () => {
      expect(getBadgeVariantPorEstado('sin_pedidos')).toBe('outline')
      expect(getBadgeVariantPorEstado('pendiente')).toBe('secondary')
      expect(getBadgeVariantPorEstado('parcial')).toBe('default')
      expect(getBadgeVariantPorEstado('atendido')).toBe('default')
      expect(getBadgeVariantPorEstado('entregado')).toBe('secondary')
    })
  })

  describe('getTextoPorEstado', () => {
    test('should return correct text for each estado', () => {
      expect(getTextoPorEstado('sin_pedidos')).toBe('Sin pedidos')
      expect(getTextoPorEstado('pendiente')).toBe('Pendiente')
      expect(getTextoPorEstado('parcial')).toBe('Parcial')
      expect(getTextoPorEstado('atendido')).toBe('Atendido')
      expect(getTextoPorEstado('entregado')).toBe('Entregado')
    })
  })

  describe('getClasesFilaPorEstado', () => {
    test('should return correct CSS classes for each estado', () => {
      expect(getClasesFilaPorEstado('sin_pedidos')).toBe('')
      expect(getClasesFilaPorEstado('pendiente')).toBe('border-l-4 border-l-yellow-400 bg-yellow-50/50')
      expect(getClasesFilaPorEstado('parcial')).toBe('border-l-4 border-l-blue-400 bg-blue-50/50')
      expect(getClasesFilaPorEstado('atendido')).toBe('border-l-4 border-l-green-400 bg-green-50/50')
      expect(getClasesFilaPorEstado('entregado')).toBe('border-l-4 border-l-gray-400 bg-gray-50/50')
    })
  })

  describe('tienePedidosActivos', () => {
    test('should return false for empty pedidos', () => {
      const mockItemSinPedidos: ListaEquipoItem = {
        id: 'item-1',
        listaId: 'lista-1',
        codigo: 'EQ001',
        descripcion: 'Equipo sin pedidos',
        unidad: 'pza',
        cantidad: 10,
        cantidadPedida: 0,
        costoReal: 1000,
        estado: 'aprobado',
        verificado: true,
        origen: 'cotizado',
        lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador', numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        cotizaciones: [],
        tiempoEntrega: '15 días',
        tiempoEntregaDias: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pedidos: []
      }
      expect(tienePedidosActivos(mockItemSinPedidos)).toBe(false)
    })

    test('should return true for items with active pedidos', () => {
      const mockItemConPedidos: ListaEquipoItem = {
        id: 'item-2',
        listaId: 'lista-1',
        codigo: 'EQ002',
        descripcion: 'Equipo con pedidos',
        unidad: 'pza',
        cantidad: 10,
        cantidadPedida: 5,
        costoReal: 1000,
        estado: 'aprobado',
        verificado: true,
        origen: 'nuevo',
        lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador', numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        cotizaciones: [],
        tiempoEntrega: '15 días',
        tiempoEntregaDias: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pedidos: [mockPedidoCompleto]
      }
      expect(tienePedidosActivos(mockItemConPedidos)).toBe(true)
    })
  })

  describe('estaDisponible', () => {
    test('should return true for empty pedidos', () => {
      const mockItemSinPedidos: ListaEquipoItem = {
        id: 'item-1',
        listaId: 'lista-1',
        codigo: 'EQ001',
        descripcion: 'Equipo sin pedidos',
        unidad: 'pza',
        cantidad: 10,
        cantidadPedida: 0,
        costoReal: 1000,
        estado: 'aprobado',
        verificado: true,
        origen: 'cotizado' as OrigenListaItem,
        lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador' as EstadoListaEquipo, numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        cotizaciones: [],
        tiempoEntrega: '15 días',
        tiempoEntregaDias: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pedidos: []
      }
      expect(estaDisponible(mockItemSinPedidos)).toBe(true)
    })

    test('should return false for items with active pedidos', () => {
      const mockItemConPedidos: ListaEquipoItem = {
        id: 'item-2',
        listaId: 'lista-1',
        codigo: 'EQ002',
        descripcion: 'Equipo con pedidos',
        unidad: 'pza',
        cantidad: 10,
        cantidadPedida: 5,
        costoReal: 1000,
        estado: 'aprobado',
        verificado: true,
        origen: 'nuevo' as OrigenListaItem,
        lista: { id: 'lista-1', nombre: 'Lista Test', codigo: 'LST-001', estado: 'borrador' as EstadoListaEquipo, numeroSecuencia: 1, proyectoId: 'proyecto-1', responsableId: 'user-1', items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        cotizaciones: [],
        tiempoEntrega: '15 días',
        tiempoEntregaDias: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pedidos: [mockPedidoCompleto]
      }
      expect(estaDisponible(mockItemConPedidos)).toBe(false)
    })
  })
})