// ===================================================
// 📁 Archivo: [id]/route.ts
// 📌 Ubicación: src/app/api/lista-equipo/[id]/route.ts
// 🔧 Descripción: API para obtener, actualizar y eliminar una ListaEquipo por ID
//
// 🧠 Uso: Usado por la vista de detalle de lista de equipos
// ✍️ Autor: Jesús Artemio (Master Experto 🧙‍♂️)
// 📅 Última actualización: 2025-05-18
// ===================================================

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { ListaEquipoUpdatePayload } from '@/types/payloads'

// ✅ Obtener ListaEquipo por ID (GET)
export async function GET(context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    const data = await prisma.listaEquipo.findUnique({
      where: { id },
      include: {
        proyecto: true,
        items: {
          include: {
            proveedor: true,
            cotizaciones: true,
            pedidos: true,
            proyectoEquipoItem: {
              include: {
                proyectoEquipo: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la lista de equipos: ' + String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params
    const body: ListaEquipoUpdatePayload = await req.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido o no proporcionado' },
        { status: 400 }
      )
    }

    const existe = await prisma.listaEquipo.findUnique({ where: { id } })
    if (!existe) {
      return NextResponse.json(
        { error: 'Lista no encontrada con el ID proporcionado' },
        { status: 404 }
      )
    }

    const data = await prisma.listaEquipo.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('⛔ Error al actualizar lista:', error)

    return NextResponse.json(
      { error: 'Error al actualizar lista: ' + (error instanceof Error ? error.message : JSON.stringify(error)) },
      { status: 500 }
    )
  }
}



// ✅ Eliminar ListaEquipo (DELETE)
export async function DELETE(context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    await prisma.listaEquipo.delete({ where: { id } })

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la lista de equipos: ' + String(error) },
      { status: 500 }
    )
  }
}
