// ===================================================
// 📁 Archivo: route.ts
// 📌 Ubicación: /api/plantilla/[id]/recalcular/route.ts
// 🔧 Descripción: Endpoint para recalcular subtotales y totales de una plantilla
// 🧠 Uso: POST desde el frontend al finalizar una edición o inserción de ítems
// ✍️ Autor: Jesús Artemio + Asistente IA GYS
// 🗓️ Última actualización: 2025-04-23
// ===================================================

import { NextResponse } from 'next/server'
import { recalcularTotalesPlantilla } from '@/lib/utils/recalculoPlantilla'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'ID de plantilla inválido' }, { status: 400 })
    }

    const resultado = await recalcularTotalesPlantilla(params.id)

    return NextResponse.json({
      mensaje: 'Recalculado correctamente ✅',
      ...resultado
    })
  } catch (error) {
    console.error(`❌ Error al recalcular plantilla ${params.id}:`, error)
    return NextResponse.json(
      { error: 'No se pudo recalcular la plantilla' },
      { status: 500 }
    )
  }
}
