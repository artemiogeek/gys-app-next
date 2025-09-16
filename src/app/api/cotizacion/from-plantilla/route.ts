// ===================================================
// 📁 Archivo: route.ts
// 📌 Crea una cotización nueva basada en una plantilla
// ===================================================

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateNextCotizacionCode } from '@/lib/utils/cotizacionCodeGenerator'

// ✅ Type for PlantillaServicio with proper fields
type PlantillaServicioWithItems = {
  id: string
  nombre: string
  categoria: string
  descripcion?: string | null
  subtotalInterno: number
  subtotalCliente: number
  items: any[]
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plantillaId, clienteId } = body
    console.log('🔍 [DEBUG] Iniciando creación de cotización desde plantilla')
    console.log('📋 [DEBUG] Datos recibidos:', { plantillaId, clienteId })
    console.log('🔍 [DEBUG] Sesión del usuario:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name
    })

    if (!plantillaId || typeof plantillaId !== 'string') {
      console.log('❌ [DEBUG] Faltan datos requeridos - plantillaId')
      return NextResponse.json({ error: 'ID de plantilla requerido' }, { status: 400 })
    }
    if (!clienteId || typeof clienteId !== 'string') {
      console.log('❌ [DEBUG] Faltan datos requeridos - clienteId')
      return NextResponse.json({ error: 'Debe seleccionar un cliente' }, { status: 400 })
    }

    // ✅ Verificar que el cliente existe antes de continuar
    console.log('🔍 [DEBUG] Verificando cliente...')
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    })

    if (!cliente) {
      console.log('❌ [DEBUG] Cliente no encontrado:', clienteId)
      return NextResponse.json({ error: 'Cliente no válido' }, { status: 400 })
    }
    console.log('✅ [DEBUG] Cliente encontrado:', cliente.nombre)

    // ✅ Obtener plantilla con validación de foreign keys
    const plantilla = await prisma.plantilla.findUnique({
      where: { id: plantillaId },
      include: {
        equipos: { include: { items: true } },
        servicios: { 
          include: { 
            items: {
              include: {
                recurso: true, // ✅ Validar que el recurso existe
                unidadServicio: true, // ✅ Validar que la unidad de servicio existe
              }
            } 
          } 
        },
        gastos: { include: { items: true } },
      },
    })

    if (!plantilla) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    // ✅ Validar que todos los servicios tienen recursos y unidades válidos
    for (const servicio of plantilla.servicios) {
      for (const item of servicio.items) {
        if (!item.recursoId || !item.unidadServicioId) {
          return NextResponse.json({ 
            error: `El servicio '${item.nombre}' tiene referencias inválidas. Recurso: ${item.recursoId}, Unidad: ${item.unidadServicioId}` 
          }, { status: 400 })
        }
      }
    }

    // ✅ Generar código automático de cotización
    console.log('🔍 [DEBUG] Generando código automático de cotización...')
    const { codigo, numeroSecuencia } = await generateNextCotizacionCode()
    console.log('✅ [DEBUG] Código generado:', { codigo, numeroSecuencia })

    const baseData = {
      codigo, // ✅ Código automático formato GYS-XXXX-YY
      numeroSecuencia, // ✅ Número secuencial
      nombre: `Cotización de ${plantilla.nombre}`,
      clienteId,
      comercialId: session.user.id, // Se actualizará más adelante si es necesario
      plantillaId: plantilla.id,
      totalInterno: plantilla.totalInterno,
      totalCliente: plantilla.totalCliente,
      totalEquiposInterno: plantilla.totalEquiposInterno,
      totalEquiposCliente: plantilla.totalEquiposCliente,
      totalServiciosInterno: plantilla.totalServiciosInterno,
      totalServiciosCliente: plantilla.totalServiciosCliente,
      totalGastosInterno: plantilla.totalGastosInterno,
      totalGastosCliente: plantilla.totalGastosCliente,
      descuento: plantilla.descuento,
      grandTotal: plantilla.grandTotal,
      equipos: {
        create: plantilla.equipos.map(e => ({
          nombre: e.nombre,
          descripcion: e.descripcion,
          subtotalInterno: e.subtotalInterno,
          subtotalCliente: e.subtotalCliente,
          items: {
            create: e.items.map(item => ({
              catalogoEquipoId: item.catalogoEquipoId,
              codigo: item.codigo,
              descripcion: item.descripcion,
              categoria: item.categoria,
              unidad: item.unidad,
              marca: item.marca,
              cantidad: item.cantidad,
              precioInterno: item.precioInterno,
              precioCliente: item.precioCliente,
              costoInterno: item.costoInterno,
              costoCliente: item.costoCliente,
            })),
          },
        })),
      },
      servicios: {
        create: plantilla.servicios.map((s: PlantillaServicioWithItems) => ({
          nombre: s.nombre,
          categoria: s.categoria,
          subtotalInterno: Number(s.subtotalInterno),
          subtotalCliente: Number(s.subtotalCliente),
          items: {
            create: s.items.map(item => ({
              catalogoServicioId: item.catalogoServicioId,
              categoria: item.categoria,
              unidadServicioId: item.unidadServicioId, // ✅ Campo obligatorio
              recursoId: item.recursoId, // ✅ Campo obligatorio
              unidadServicioNombre: item.unidadServicioNombre,
              recursoNombre: item.recursoNombre,
              formula: item.formula,
              horaBase: item.horaBase,
              horaRepetido: item.horaRepetido,
              horaUnidad: item.horaUnidad,
              horaFijo: item.horaFijo,
              costoHora: item.costoHora,
              nombre: item.nombre,
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              horaTotal: item.horaTotal,
              factorSeguridad: item.factorSeguridad || 1.0, // ✅ Valor por defecto
              margen: item.margen,
              costoInterno: item.costoInterno,
              costoCliente: item.costoCliente,
            })),
          },
        })),
      },
      gastos: {
        create: plantilla.gastos.map(g => ({
          nombre: g.nombre,
          subtotalInterno: g.subtotalInterno,
          subtotalCliente: g.subtotalCliente,
          items: {
            create: g.items.map(item => ({
              nombre: item.nombre,
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              factorSeguridad: item.factorSeguridad,
              margen: item.margen,
              costoInterno: item.costoInterno,
              costoCliente: item.costoCliente,
            })),
          },
        })),
      },
    }

    // Crear la cotización base
    console.log('🔍 [DEBUG] Creando cotización base...')
    console.log('📋 [DEBUG] Datos para cotización:', {
      clienteId,
      comercialId: session.user.id,
      plantillaNombre: plantilla.nombre,
      equiposCount: plantilla.equipos.length,
      serviciosCount: plantilla.servicios.length,
      gastosCount: plantilla.gastos.length
    })
    
    // Verificar que los IDs de foreign keys existen
    console.log('🔍 [DEBUG] Verificando foreign keys...')
    
    // Verificar cliente
    const clienteExists = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!clienteExists) {
      console.error('❌ Cliente no encontrado:', clienteId)
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })
    }
    
    // Verificar comercial (usuario) - usar el usuario que existe en la BD
    let comercialId = session.user.id
    let comercialExists = await prisma.user.findUnique({ where: { id: comercialId } })
    
    if (!comercialExists) {
      console.log('⚠️ [DEBUG] Usuario de sesión no encontrado, buscando usuario alternativo...')
      // Buscar cualquier usuario admin disponible
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (adminUser) {
        comercialId = adminUser.id
        comercialExists = adminUser
        console.log('✅ [DEBUG] Usando usuario admin:', { id: adminUser.id, email: adminUser.email })
      } else {
        console.error('❌ No hay usuarios disponibles en la base de datos')
        return NextResponse.json({ error: 'No hay usuarios disponibles' }, { status: 500 })
      }
    }
    
    // Actualizar baseData con el comercialId correcto
    baseData.comercialId = comercialId
    
    console.log('✅ [DEBUG] Foreign keys verificados correctamente')
    console.log('📋 [DEBUG] Usando comercialId:', comercialId)
    
    const cotizacion = await prisma.cotizacion.create({ data: baseData })
    console.log('✅ [DEBUG] Cotización base creada:', cotizacion.id)
    return NextResponse.json(cotizacion)
  } catch (error: any) {
    console.error('❌ Error inesperado:', error)
    return NextResponse.json({ error: error?.message || 'Error inesperado' }, { status: 500 })
  }
}
