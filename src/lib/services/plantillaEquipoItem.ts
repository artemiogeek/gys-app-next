import { PlantillaEquipoItem } from '@/types'
import { PlantillaEquipoItemPayload, PlantillaEquipoItemUpdatePayload } from '@/types/payloads'

// ===================================================
// 📁 Archivo: src/lib/services/plantillaEquipoItem.ts
// 📌 Descripción: Servicios para gestionar items de plantilla de equipo
// 🧠 Uso: CRUD completo para items de plantilla de equipo
// ✍️ Autor: Jesús Artemio (Master Experto 🧙‍♂️)
// 📅 Última actualización: 2025-05-25
// ===================================================

// ✅ Crear nuevo item de plantilla de equipo
export async function createPlantillaEquipoItem(data: {
  plantillaEquipoId: string
  catalogoEquipoId: string
  cantidad: number
  observaciones?: string
}): Promise<PlantillaEquipoItem> {
  try {
    // 📡 Primero obtenemos los datos del equipo del catálogo
    const equipoRes = await fetch(`/api/catalogo-equipo/${data.catalogoEquipoId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Incluir cookies de sesión
    })
    
    if (!equipoRes.ok) {
      const errorText = await equipoRes.text()
      console.error('❌ Error al obtener equipo:', equipoRes.status, errorText)
      throw new Error(`Error al obtener datos del equipo del catálogo: ${equipoRes.status}`)
    }
    
    const equipo = await equipoRes.json()
    console.log('📦 Equipo obtenido:', equipo)
    
    // 🔄 Construir payload completo con todos los campos requeridos
    const payload: PlantillaEquipoItemPayload = {
      plantillaEquipoId: data.plantillaEquipoId,
      catalogoEquipoId: data.catalogoEquipoId,
      codigo: equipo.codigo,
      descripcion: equipo.descripcion,
      categoria: equipo.categoria?.nombre || 'Sin categoría',
      unidad: equipo.unidad?.nombre || 'Sin unidad',
      marca: equipo.marca,
      precioInterno: equipo.precioInterno,
      precioCliente: equipo.precioVenta,
      cantidad: data.cantidad,
      costoInterno: data.cantidad * equipo.precioInterno,
      costoCliente: data.cantidad * equipo.precioVenta
    }
    
    console.log('📡 Payload a enviar:', payload)
    
    const res = await fetch('/api/plantilla-equipo-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Incluir cookies de sesión
      body: JSON.stringify(payload),
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al crear item de plantilla de equipo')
    }
    
    return await res.json()
  } catch (error) {
    console.error('Error en createPlantillaEquipoItem:', error)
    throw error
  }
}

// ✅ Actualizar ítem
export async function updatePlantillaEquipoItem(
  id: string,
  data: Partial<PlantillaEquipoItemPayload>
): Promise<PlantillaEquipoItem> {
  try {
    const res = await fetch(`/api/plantilla-equipo-item/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    if (!res.ok) throw new Error('Error al actualizar ítem')
    return await res.json()
  } catch (error) {
    console.error('❌ updatePlantillaEquipoItem:', error)
    throw error
  }
}

// ✅ Eliminar ítem
export async function deletePlantillaEquipoItem(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/plantilla-equipo-item/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (!res.ok) throw new Error('Error al eliminar ítem')
  } catch (error) {
    console.error('❌ deletePlantillaEquipoItem:', error)
    throw error
  }
}
