import type { CotizacionEquipoItem } from '@/types'
import type { CotizacionEquipoItemUpdatePayload } from '@/types/payloads'
import { buildApiUrl } from '@/lib/utils'

// ===================================================
// 📁 Archivo: src/lib/services/cotizacionEquipoItem.ts
// 📌 Descripción: Servicios para gestionar items de cotización de equipo
// 🧠 Uso: CRUD completo para items de cotización de equipo
// ✍️ Autor: Jesús Artemio (Master Experto 🧙‍♂️)
// 📅 Última actualización: 2025-05-25
// ===================================================

// ✅ Crear nuevo item de cotización de equipo
export async function createCotizacionEquipoItem(data: {
  cotizacionEquipoId: string
  catalogoEquipoId: string
  cantidad: number
  precioUnitario: number
  observaciones?: string
}): Promise<CotizacionEquipoItem> {
  try {
    // 🔍 Primero obtenemos los datos del equipo del catálogo
    const equipoRes = await fetch(buildApiUrl(`/api/catalogo-equipo/${data.catalogoEquipoId}`))
    if (!equipoRes.ok) throw new Error('Error al obtener datos del equipo')
    const equipo = await equipoRes.json()

    // 📋 Construir el payload completo que espera la API
    const payload = {
      cotizacionEquipoId: data.cotizacionEquipoId,
      catalogoEquipoId: data.catalogoEquipoId,
      codigo: equipo.codigo,
      descripcion: equipo.descripcion,
      categoria: equipo.categoria?.nombre || 'Sin categoría',
      unidad: equipo.unidad?.nombre || 'pza',
      marca: equipo.marca,
      precioInterno: equipo.precioInterno,
      precioCliente: data.precioUnitario,
      cantidad: data.cantidad,
      costoInterno: equipo.precioInterno * data.cantidad,
      costoCliente: data.precioUnitario * data.cantidad
    }

    const res = await fetch(buildApiUrl('/api/cotizacion-equipo-item'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Error al crear item de cotización de equipo')
    }
    return await res.json()
  } catch (error) {
    console.error('Error en createCotizacionEquipoItem:', error)
    throw error
  }
}

// ✅ Actualizar ítem de equipo
export async function updateCotizacionEquipoItem(
  id: string,
  data: CotizacionEquipoItemUpdatePayload
): Promise<CotizacionEquipoItem> {
  try {
    const res = await fetch(`/api/cotizacion-equipo-item/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al actualizar ítem de equipo')
    return await res.json()
  } catch (error) {
    console.error('❌ updateCotizacionEquipoItem:', error)
    throw error
  }
}

// ✅ Eliminar ítem de equipo
export async function deleteCotizacionEquipoItem(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/cotizacion-equipo-item/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Error al eliminar ítem de equipo')
  } catch (error) {
    console.error('❌ deleteCotizacionEquipoItem:', error)
    throw error
  }
}
