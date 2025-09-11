// ===================================================
// 📁 Archivo: route.ts
// 📌 Ubicación: src/app/api/pedido-equipo/desde-lista/
// 🔧 Descripción: API específica para crear pedidos desde lista contextual
// 🧠 Uso: Maneja la creación de pedidos con items seleccionados desde una lista técnica
// ✍️ Autor: Asistente IA GYS
// 📅 Última actualización: 2025-01-27
// ===================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'
import { PedidoEquipoPayload } from '@/types'

// ✅ POST - Crear pedido desde lista contextual
export async function POST(request: NextRequest) {
  try {
    const payload: PedidoEquipoPayload = await request.json()
    logger.info('📡 Creando pedido desde lista contextual:', payload)

    // 🔍 Validar datos requeridos
    if (!payload.proyectoId || !payload.responsableId || !payload.listaId) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos: proyectoId, responsableId, listaId' },
        { status: 400 }
      )
    }

    if (!payload.itemsSeleccionados || payload.itemsSeleccionados.length === 0) {
      return NextResponse.json(
        { message: 'Debe seleccionar al menos un item para el pedido' },
        { status: 400 }
      )
    }

    // 🔍 Verificar que la lista existe y obtener sus items
    const lista = await prisma.listaEquipo.findUnique({
      where: { id: payload.listaId },
      include: {
        items: {
          include: {
            cotizacionSeleccionada: {
              include: {
                cotizacion: {
                  select: {
                    id: true,
                    codigo: true,
                    proveedor: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
            proyectoEquipo: true,
            proyectoEquipoItem: true,
            proveedor: true,
            responsable: true
          }
        }
      }
    })

    if (!lista) {
      return NextResponse.json(
        { message: 'Lista técnica no encontrada' },
        { status: 404 }
      )
    }

    // 🔍 Validar que todos los items seleccionados existen en la lista
    const itemsSeleccionadosIds = payload.itemsSeleccionados.map(item => item.listaEquipoItemId)
    const itemsEncontrados = lista.items.filter(item => itemsSeleccionadosIds.includes(item.id))
    
    if (itemsEncontrados.length !== payload.itemsSeleccionados.length) {
      return NextResponse.json(
        { message: 'Algunos items seleccionados no pertenecen a la lista' },
        { status: 400 }
      )
    }

    // 🔍 Validar cantidades disponibles
    for (const itemSeleccionado of payload.itemsSeleccionados) {
      const itemLista = itemsEncontrados.find(item => item.id === itemSeleccionado.listaEquipoItemId)
      if (itemLista && itemSeleccionado.cantidadPedida > (itemLista.cantidad || 0)) {
        return NextResponse.json(
          { message: `Cantidad solicitada (${itemSeleccionado.cantidadPedida}) excede la disponible (${itemLista.cantidad}) para el item: ${itemLista.descripcion}` },
          { status: 400 }
        )
      }
    }

    // 📊 Calcular totales
    let costoTotal = 0
    const itemsParaPedido = payload.itemsSeleccionados.map(itemSeleccionado => {
      const itemLista = itemsEncontrados.find(item => item.id === itemSeleccionado.listaEquipoItemId)!
      
      // 🔍 Obtener precio unitario con prioridad: precioElegido > cotizacionSeleccionada.precioUnitario > presupuesto > 0
      let precioUnitario = 0
      if (itemLista.precioElegido !== null && itemLista.precioElegido !== undefined) {
        precioUnitario = itemLista.precioElegido / (itemLista.cantidad || 1) // Dividir por cantidad para obtener precio unitario
      } else if (itemLista.cotizacionSeleccionada?.precioUnitario) {
        precioUnitario = itemLista.cotizacionSeleccionada.precioUnitario
      } else if (itemLista.presupuesto !== null && itemLista.presupuesto !== undefined) {
        precioUnitario = itemLista.presupuesto / (itemLista.cantidad || 1) // Dividir por cantidad para obtener precio unitario
      }
      
      const costoTotalItem = precioUnitario * itemSeleccionado.cantidadPedida
      costoTotal += costoTotalItem

      return {
        listaEquipoItemId: itemSeleccionado.listaEquipoItemId,
        cantidad: itemSeleccionado.cantidadPedida,
        costoUnitario: precioUnitario,
        costoTotal: costoTotalItem,
        // 📅 Calcular fecha esperada basada en tiempo de entrega
        fechaEsperada: itemLista.tiempoEntregaDias 
          ? new Date(Date.now() + (itemLista.tiempoEntregaDias * 24 * 60 * 60 * 1000))
          : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 días por defecto
      }
    })

    // 🔢 Generar código secuencial siguiendo el patrón del proyecto
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: payload.proyectoId },
      select: { codigo: true }
    })
    
    if (!proyecto) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    const ultimoPedido = await prisma.pedidoEquipo.findFirst({
      where: { proyectoId: payload.proyectoId },
      orderBy: { numeroSecuencia: 'desc' },
    })
    const nuevoNumero = ultimoPedido ? ultimoPedido.numeroSecuencia + 1 : 1
    const codigoGenerado = `${proyecto.codigo}-PED-${String(nuevoNumero).padStart(3, '0')}`

    // 🔄 Transacción para crear pedido e items
    const resultado = await prisma.$transaction(async (tx) => {
      // 1️⃣ Crear el pedido
      const nuevoPedido = await tx.pedidoEquipo.create({
        data: {
          proyectoId: payload.proyectoId,
          responsableId: payload.responsableId,
          listaId: payload.listaId,
          codigo: codigoGenerado,
          numeroSecuencia: nuevoNumero,
          observacion: payload.observacion || '',
          fechaNecesaria: payload.fechaNecesaria ? new Date(payload.fechaNecesaria) : new Date(),
          prioridad: payload.prioridad || 'media',
          esUrgente: payload.esUrgente || false,
          presupuestoTotal: costoTotal,
          costoRealTotal: 0
        }
      })

      // 2️⃣ Crear los items del pedido y actualizar cantidadPedida en ListaEquipoItem
      const itemsCreados = await Promise.all(
        itemsParaPedido.map(async item => {
          const itemOriginal = itemsEncontrados.find(i => i.id === item.listaEquipoItemId)
          
          // Crear el item del pedido
          const pedidoItem = await tx.pedidoEquipoItem.create({
            data: {
              pedidoId: nuevoPedido.id,
              listaId: payload.listaId,
              listaEquipoItemId: item.listaEquipoItemId,
              responsableId: payload.responsableId,
              codigo: itemOriginal?.codigo || 'SIN-CODIGO',
              descripcion: itemOriginal?.descripcion || 'Sin descripción',
              unidad: itemOriginal?.unidad || 'UND',
              cantidadPedida: item.cantidad,
              precioUnitario: itemOriginal?.precioElegido || 0,
              costoTotal: (itemOriginal?.precioElegido || 0) * item.cantidad,
              tiempoEntrega: itemOriginal?.tiempoEntrega,
              tiempoEntregaDias: itemOriginal?.tiempoEntregaDias
            }
          })

          // 🔄 Actualizar cantidadPedida en ListaEquipoItem
          await tx.listaEquipoItem.update({
            where: { id: item.listaEquipoItemId },
            data: {
              cantidadPedida: { increment: item.cantidad }
            }
          })

          return pedidoItem
        })
      )

      return { pedido: nuevoPedido, items: itemsCreados }
    })

    // 📡 Obtener el pedido completo con relaciones
    const pedidoCompleto = await prisma.pedidoEquipo.findUnique({
      where: { id: resultado.pedido.id },
      include: {
        proyecto: true,
        responsable: true,
        lista: true,
        items: {
          include: {
            listaEquipoItem: true,
            responsable: true
          }
        }
      }
    })

    logger.info(`✅ Pedido creado desde lista: ${resultado.pedido.id} con ${resultado.items.length} items`)
    
    return NextResponse.json(pedidoCompleto, { status: 201 })

  } catch (error) {
    logger.error('❌ Error al crear pedido desde lista:', error)
    logger.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available')
    logger.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}
