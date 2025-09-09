// ===================================================
// 📁 Archivo: PedidoEquipoMasterList.onCreate.test.tsx
// 📌 Ubicación: src/__tests__/components/proyectos/
// 🔧 Descripción: Test para verificar el tipo correcto de onCreate
//    en PedidoEquipoMasterList después de la corrección de tipos
//
// ✍️ Autor: Sistema GYS
// 📅 Fecha: 2025-01-27
// ===================================================

import type { PedidoEquipo } from '@/types/modelos'
import type { PedidoEquipoPayload } from '@/types/payloads'
import type { PedidoEquipoMasterListProps } from '@/components/proyectos/PedidoEquipoMasterList'

describe('PedidoEquipoMasterList - onCreate Type Correction', () => {
  it('should accept onCreate function that returns Promise<PedidoEquipo | null>', () => {
    // ✅ This function should match the corrected interface type
    const mockOnCreate = async (payload: PedidoEquipoPayload): Promise<PedidoEquipo | null> => {
      return {
        id: 'new-pedido',
        codigo: payload.codigo,
        numeroSecuencia: 2,
        descripcion: payload.descripcion,
        estado: payload.estado,
        prioridad: payload.prioridad,
        esUrgente: payload.esUrgente,
        fechaPedido: new Date(payload.fechaPedido),
        fechaRequerida: new Date(payload.fechaRequerida),
        presupuestoTotal: payload.presupuestoTotal,
        costoRealTotal: 0,
        observaciones: payload.observaciones || '',
        proyectoId: payload.proyectoId,
        listaEquipoId: payload.listaEquipoId,
        responsableId: payload.responsableId,
        creadoPor: payload.responsableId,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    }

    // 🎯 This should compile without TypeScript errors
    const props: PedidoEquipoMasterListProps = {
      pedidos: [],
      listas: [],
      loading: false,
      proyectoId: 'proyecto-1',
      onCreate: mockOnCreate // ✅ Should accept Promise<PedidoEquipo | null>
    }

    expect(props.onCreate).toBeDefined()
    expect(typeof props.onCreate).toBe('function')
  })

  it('should accept onCreate function that returns null', () => {
    // ✅ This function returns null, which should be allowed
    const mockOnCreateNull = async (payload: PedidoEquipoPayload): Promise<PedidoEquipo | null> => {
      return null // Simulating creation failure
    }

    // 🎯 This should compile without TypeScript errors
    const props: PedidoEquipoMasterListProps = {
      pedidos: [],
      listas: [],
      loading: false,
      proyectoId: 'proyecto-1',
      onCreate: mockOnCreateNull // ✅ Should accept Promise<PedidoEquipo | null>
    }

    expect(props.onCreate).toBeDefined()
    expect(typeof props.onCreate).toBe('function')
  })

  it('should work without onCreate prop (optional)', () => {
    // ✅ onCreate is optional, so this should work
    const props: PedidoEquipoMasterListProps = {
      pedidos: [],
      listas: [],
      loading: false,
      proyectoId: 'proyecto-1'
      // onCreate is optional
    }

    expect(props.onCreate).toBeUndefined()
  })
})