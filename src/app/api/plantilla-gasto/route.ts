// ===================================================
// 📁 Archivo: route.ts
// 📌 Ubicación: src/app/api/plantilla-gasto/
// 🔧 Descripción: Maneja GET (todos) y POST de PlantillaGasto
// ===================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlantillaGastoPayload } from '@/types/payloads'

export async function GET() {
  try {
    const data = await prisma.plantillaGasto.findMany({
      include: {
        items: true,
        plantilla: true,
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload: PlantillaGastoPayload = await req.json()

    const data = await prisma.plantillaGasto.create({
      data: {
        plantillaId: payload.plantillaId,
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        subtotalInterno: payload.subtotalInterno,
        subtotalCliente: payload.subtotalCliente,
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error en POST /api/plantilla-gasto:', error)
    return NextResponse.json({ error: 'Error al crear gasto', detalle: String(error) }, { status: 500 })
  }
}
