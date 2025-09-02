// ===================================================
// 📁 Archivo: /api/lista-equipo/master/route.ts
// 🔧 Descripción: API optimizada para vista Master - datos resumidos de listas de equipos
// 🧠 Uso: GET para obtener listas con información mínima para rendimiento óptimo
// ✍️ Autor: Asistente IA GYS (Fase 4 Master-Detail)
// 📅 Última actualización: 2025-01-27
// ===================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 🎯 GET - Obtener listas con datos resumidos para vista Master
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const proyectoId = searchParams.get('proyectoId')
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // 📊 Build where clause
    const whereClause: any = {
      ...(proyectoId && { proyectoId }),
      ...(estado && estado !== 'todos' && { estado }),
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { proyecto: { nombre: { contains: search, mode: 'insensitive' } } }
        ]
      })
    }

    // 📈 Get total count for pagination
    const totalCount = await prisma.listaEquipo.count({ where: whereClause })

    // 🎯 Optimized query - only essential fields for Master view
    const listas = await prisma.listaEquipo.findMany({
      where: whereClause,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
        numeroSecuencia: true,
        // 🏢 Project info (minimal)
        proyecto: {
          select: {
            id: true,
            nombre: true,
            codigo: true
          }
        },
        // 👤 Responsible info (minimal)
        responsable: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        // 📊 Aggregated item statistics
        _count: {
          select: {
            items: true
          }
        },
        // 💰 Essential item data for calculations
        items: {
          select: {
            id: true,
            cantidad: true,
            presupuesto: true,
            precioElegido: true,
            // 💵 Best cotización price
            cotizaciones: {
              select: {
                precioUnitario: true
              },
              orderBy: {
                precioUnitario: 'asc'
              },
              take: 1
            },
            // 📦 Pedidos count
            _count: {
              select: {
                pedidos: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // 🧮 Calculate summary statistics for each lista
    const listasWithStats = listas.map(lista => {
      const totalItems = lista._count.items
      
      // 💰 Calculate costs and statistics
      let costoTotal = 0
      let costoAprobado = 0
      let itemsVerificados = 0
      let itemsAprobados = 0
      let itemsRechazados = 0
      
      lista.items.forEach(item => {
        const mejorCotizacion = item.cotizaciones[0]?.precioUnitario || 0
        const precioUnitario = mejorCotizacion > 0 
          ? mejorCotizacion 
          : (item.precioElegido || item.presupuesto || 0)
        
        const costoItem = precioUnitario * (item.cantidad || 0)
        costoTotal += costoItem
        
        // Note: We would need item status to calculate these properly
        // For now, using basic logic based on available data
        if (item.cotizaciones.length > 0) {
          itemsVerificados++
          costoAprobado += costoItem
        }
      })

      return {
        id: lista.id,
        codigo: lista.codigo,
        nombre: lista.nombre,
        numeroSecuencia: lista.numeroSecuencia,
        estado: lista.estado,
        createdAt: lista.createdAt.toISOString(),
        updatedAt: lista.updatedAt.toISOString(),
        
        // 📊 Estadísticas calculadas para la vista Master
        stats: {
          totalItems,
          itemsVerificados,
          itemsAprobados,
          itemsRechazados,
          costoTotal,
          costoAprobado
        },
        
        // 🏗️ Información mínima del proyecto
        proyecto: {
          id: lista.proyecto.id,
          nombre: lista.proyecto.nombre,
          codigo: lista.proyecto.codigo
        },
        
        // 👤 Responsable (opcional)
        ...(lista.responsable && {
          responsable: {
            id: lista.responsable.id,
            name: lista.responsable.name
          }
        })
      }
    })

    // 📄 Pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      data: listasWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('❌ Error en GET /lista-equipo/master:', error)
    return NextResponse.json(
      { error: 'Error al obtener listas resumidas: ' + String(error) },
      { status: 500 }
    )
  }
}