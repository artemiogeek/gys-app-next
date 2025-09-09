/**
 * @fileoverview Tests para pedidoDisplayHelpers
 * Prueba las funciones de utilidad para mostrar información de pedidos
 * 
 * @author TRAE AI - GYS System
 * @version 1.0.0
 */

import {
  obtenerTodosLosPedidos,
  obtenerPedidosPorEstado,
  calcularDisponibilidad,
  generarResumenPedidos,
  obtenerColorDisponibilidad
} from '@/lib/utils/pedidoDisplayHelpers';
import { ListaEquipoItem, PedidoEquipoItem } from '@/types/modelos';
import { EstadoListaItem, OrigenListaItem, EstadoListaEquipo, EstadoPedido, EstadoPedidoItem } from '@prisma/client';

// 📊 Mock data para tests
const mockItemSinPedidos: ListaEquipoItem = {
  id: '1',
  listaId: 'lista1',
  codigo: 'TEST-001',
  descripcion: 'Item de prueba sin pedidos',
  unidad: 'pieza',
  cantidad: 10,
  verificado: true,
  estado: 'aprobado' as EstadoListaItem,
  origen: 'nuevo' as OrigenListaItem,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lista: {
    id: 'lista1',
    proyectoId: 'proyecto-1',
    responsableId: 'user1',
    codigo: 'LST-001',
    nombre: 'Lista Test',
    numeroSecuencia: 1,
    estado: 'borrador' as EstadoListaEquipo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  cotizaciones: [],
  pedidos: []
};

const mockItemConMultiplesPedidos: ListaEquipoItem = {
  id: '2',
  listaId: 'lista1',
  codigo: 'TEST-002',
  descripcion: 'Item con múltiples pedidos',
  unidad: 'pieza',
  cantidad: 10,
  verificado: true,
  estado: 'aprobado' as EstadoListaItem,
  origen: 'nuevo' as OrigenListaItem,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lista: {
    id: 'lista1',
    proyectoId: 'proyecto-1',
    responsableId: 'user1',
    codigo: 'LST-001',
    nombre: 'Lista Test',
    numeroSecuencia: 1,
    estado: 'borrador' as EstadoListaEquipo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  cotizaciones: [],
  pedidos: [
    {
      id: 'pedido1',
      pedidoId: 'ped-1',
      cantidadPedida: 3,
      cantidadAtendida: 0,
      codigo: 'TEST-002',
      descripcion: 'Item con múltiples pedidos',
      unidad: 'pieza',
      estado: 'pendiente' as EstadoPedidoItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedido: {
        id: 'ped-1',
        proyectoId: 'proyecto-1',
        responsableId: 'user1',
        codigo: 'PED-001',
        numeroSecuencia: 1,
        estado: 'enviado' as EstadoPedido,
        fechaPedido: new Date('2024-01-15').toISOString(),
        fechaNecesaria: new Date('2024-01-30').toISOString(),
        costoRealTotal: 0,
        esUrgente: false,
        presupuestoTotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      }
    },
    {
      id: 'pedido2',
      pedidoId: 'ped-2',
      cantidadPedida: 5,
      cantidadAtendida: 3,
      codigo: 'TEST-002',
      descripcion: 'Item con múltiples pedidos',
      unidad: 'pieza',
      estado: 'atendido' as EstadoPedidoItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedido: {
        id: 'ped-2',
        proyectoId: 'proyecto-1',
        responsableId: 'user1',
        codigo: 'PED-002',
        numeroSecuencia: 2,
        estado: 'atendido' as EstadoPedido,
        fechaPedido: new Date('2024-01-20').toISOString(),
        fechaNecesaria: new Date('2024-02-05').toISOString(),
        costoRealTotal: 0,
        esUrgente: false,
        presupuestoTotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      }
    }
  ]
};

const mockItemConUnPedido: ListaEquipoItem = {
  id: '3',
  listaId: 'lista1',
  codigo: 'TEST-003',
  descripcion: 'Item con un pedido',
  unidad: 'pieza',
  cantidad: 5,
  verificado: true,
  estado: 'aprobado' as EstadoListaItem,
  origen: 'nuevo' as OrigenListaItem,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lista: {
    id: 'lista1',
    proyectoId: 'proyecto-1',
    responsableId: 'user1',
    codigo: 'LST-001',
    nombre: 'Lista Test',
    numeroSecuencia: 1,
    estado: 'borrador' as EstadoListaEquipo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: []
  },
  cotizaciones: [],
  pedidos: [
    {
      id: 'pedido3',
      pedidoId: 'ped-3',
      cantidadPedida: 2,
      cantidadAtendida: 2,
      codigo: 'TEST-003',
      descripcion: 'Item con un pedido',
      unidad: 'metro',
      estado: 'atendido' as EstadoPedidoItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pedido: {
        id: 'ped-3',
        proyectoId: 'proyecto-1',
        responsableId: 'user2',
        codigo: 'PED-003',
        numeroSecuencia: 3,
        estado: 'atendido' as EstadoPedido,
        fechaPedido: new Date('2024-01-10').toISOString(),
        fechaNecesaria: new Date('2024-01-25').toISOString(),
        costoRealTotal: 0,
        esUrgente: false,
        presupuestoTotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      }
    }
  ]
};

// 🧪 Tests
describe('pedidoDisplayHelpers', () => {
  describe('obtenerTodosLosPedidos', () => {
    it('✅ should return all pedido codes from items', () => {
      const items = [mockItemSinPedidos, mockItemConMultiplesPedidos, mockItemConUnPedido];
      const result = obtenerTodosLosPedidos(items);
      
      expect(result).toEqual(['PED-001', 'PED-002', 'PED-003']);
    });

    it('✅ should return empty array when no items', () => {
      const result = obtenerTodosLosPedidos([]);
      expect(result).toEqual([]);
    });
  });

  describe('obtenerPedidosPorEstado', () => {
    it('✅ should group pedidos by estado', () => {
      const items = [mockItemConMultiplesPedidos, mockItemConUnPedido];
      const result = obtenerPedidosPorEstado(items);
      
      expect(result).toEqual({
        enviado: ['PED-001'],
        atendido: ['PED-002', 'PED-003']
      });
    });

    it('✅ should return empty object when no items', () => {
      const result = obtenerPedidosPorEstado([]);
      expect(result).toEqual({});
    });
  });

  describe('calcularDisponibilidad', () => {
    it('✅ should calculate availability correctly', () => {
      const result = calcularDisponibilidad(mockItemConMultiplesPedidos);
      
      expect(result).toEqual({
        disponible: 2, // 10 - 8 pedidos
        cantidadTotal: 10,
        cantidadPedida: 8 // 3 + 5
      });
    });

    it('✅ should handle item without pedidos', () => {
      const result = calcularDisponibilidad(mockItemSinPedidos);
      
      expect(result).toEqual({
        disponible: 10,
        cantidadTotal: 10,
        cantidadPedida: 0
      });
    });
  });

  describe('generarResumenPedidos', () => {
    it('✅ should generate summary for item with multiple pedidos', () => {
      const result = generarResumenPedidos(mockItemConMultiplesPedidos);
      
      expect(result).toEqual({
        textoPrincipal: '2 pedidos activos',
        textoSecundario: '8 unidades pedidas de 10',
        tieneMultiplesPedidos: true
      });
    });

    it('✅ should generate summary for item with one pedido', () => {
      const result = generarResumenPedidos(mockItemConUnPedido);
      
      expect(result).toEqual({
        textoPrincipal: '1 pedido activo',
        textoSecundario: '2 unidades pedidas de 5',
        tieneMultiplesPedidos: false
      });
    });
  });

  describe('obtenerColorDisponibilidad', () => {
    it('✅ should return correct color classes', () => {
      expect(obtenerColorDisponibilidad('disponible')).toBe('bg-green-100 text-green-800 border-green-200');
      expect(obtenerColorDisponibilidad('parcial')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200');
      expect(obtenerColorDisponibilidad('agotado')).toBe('bg-red-100 text-red-800 border-red-200');
    });
  });

  // 🔄 Integration tests
  describe('Integration - Full workflow', () => {
    it('✅ should handle multiple codes correctly', () => {
      const items = [mockItemConMultiplesPedidos, mockItemConUnPedido];
      const allCodes = obtenerTodosLosPedidos(items);
      
      expect(allCodes).toEqual(['PED-001', 'PED-002', 'PED-003']);
    });

    it('✅ should group pedidos by estado correctly', () => {
      const items = [mockItemConMultiplesPedidos, mockItemConUnPedido];
      const grouped = obtenerPedidosPorEstado(items);
      
      expect(grouped.enviado).toEqual(['PED-001']);
      expect(grouped.atendido).toEqual(['PED-002']);
      expect(grouped.borrador).toEqual(['PED-003']);
    });

    it('✅ should generate summary for multiple pedidos', () => {
      const summary = generarResumenPedidos(mockItemConMultiplesPedidos);
      
      expect(summary.tieneMultiplesPedidos).toBe(true);
      expect(summary.textoPrincipal).toContain('2 pedidos');
    });
  });
});