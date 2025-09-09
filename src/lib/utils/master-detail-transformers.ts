// ===================================================
// 📁 Archivo: master-detail-transformers.ts
// 📌 Ubicación: src/lib/utils/
// 🔧 Descripción: Funciones utilitarias para transformar datos
//    entre las vistas Master y Detail de Listas de Equipos
// ✍️ Autor: Sistema GYS
// 📅 Fecha: 2025-01-27
// ===================================================

import type {
  ListaEquipo,
  ListaEquipoItem,
  EstadoListaEquipo,
  EstadoListaItem,
  OrigenListaItem
} from '@/types/modelos'

import type {
  ListaEquipoMaster,
  ListaEquipoDetail,
  ListaEquipoItemDetail
} from '@/types/master-detail'

// ==============================================
// 📊 CALCULADORES DE ESTADÍSTICAS
// ==============================================

/**
 * Calcula estadísticas básicas para la vista Master
 */
export function calculateMasterStats(items: ListaEquipoItem[]) {
  const stats = {
    totalItems: items.length,
    itemsVerificados: 0,
    itemsAprobados: 0,
    itemsRechazados: 0,
    costoTotal: 0,
    costoAprobado: 0
  }

  items.forEach(item => {
    // ✅ Contadores por estado
    if (item.verificado) stats.itemsVerificados++
    if (item.estado === 'aprobado') stats.itemsAprobados++
    if (item.estado === 'rechazado') stats.itemsRechazados++

    // 💰 Cálculos de costos
    const costoItem = item.precioElegido || item.presupuesto || 0
    const costoTotal = costoItem * item.cantidad
    
    stats.costoTotal += costoTotal
    if (item.estado === 'aprobado') {
      stats.costoAprobado += costoTotal
    }
  })

  return stats
}

/**
 * Calcula estadísticas extendidas para la vista Detail
 */
export function calculateDetailStats(items: ListaEquipoItem[]) {
  const basicStats = calculateMasterStats(items)
  
  // ✅ Estadísticas extendidas
  const extendedStats = {
    // 📊 Propiedades básicas
    totalItems: basicStats.totalItems,
    itemsVerificados: basicStats.itemsVerificados,
    itemsAprobados: basicStats.itemsAprobados,
    itemsRechazados: basicStats.itemsRechazados,
    costoTotal: basicStats.costoTotal,
    costoAprobado: basicStats.costoAprobado,
    
    // 📊 Propiedades extendidas
    itemsPendientes: 0,
    costoRechazado: 0,
    costoPendiente: 0,
    
    // 📈 Estadísticas por origen
    itemsPorOrigen: {
      cotizado: 0,
      nuevo: 0,
      reemplazo: 0
    },
    
    // 📋 Estadísticas de pedidos
    itemsConPedido: 0,
    itemsSinPedido: 0
  }

  items.forEach(item => {
    const costoItem = item.precioElegido || item.presupuesto || 0
    const costoTotal = costoItem * item.cantidad
    
    // ✅ Estados adicionales
    if (item.estado === 'por_revisar' || item.estado === 'por_cotizar' || 
        item.estado === 'por_validar' || item.estado === 'por_aprobar') {
      extendedStats.itemsPendientes++
      extendedStats.costoPendiente += costoTotal
    }
    
    if (item.estado === 'rechazado') {
      extendedStats.costoRechazado += costoTotal
    }
    
    // 📊 Por origen
    if (item.origen === 'cotizado') extendedStats.itemsPorOrigen.cotizado++
    else if (item.origen === 'nuevo') extendedStats.itemsPorOrigen.nuevo++
    else if (item.origen === 'reemplazo') extendedStats.itemsPorOrigen.reemplazo++
    
    // 📦 Pedidos
    if (item.pedidos && item.pedidos.length > 0) {
      extendedStats.itemsConPedido++
    } else {
      extendedStats.itemsSinPedido++
    }
  })

  return extendedStats
}

// ==============================================
// 🔄 TRANSFORMADORES DE DATOS
// ==============================================

/**
 * Transforma una ListaEquipo completa a formato Master (optimizado)
 */
export function transformToMaster(lista: ListaEquipo): ListaEquipoMaster {
  const stats = calculateMasterStats(lista.items || [])
  
  return {
    id: lista.id,
    codigo: lista.codigo,
    nombre: lista.nombre,
    numeroSecuencia: lista.numeroSecuencia,
    estado: lista.estado,
    createdAt: lista.createdAt,
    updatedAt: lista.updatedAt,
    stats,
    proyecto: {
      id: lista.proyecto?.id || '',
      nombre: lista.proyecto?.nombre || '',
      codigo: lista.proyecto?.codigo || ''
    },
    responsable: lista.proyecto?.gestor ? {
      id: lista.proyecto.gestor.id,
      name: lista.proyecto.gestor.name || 'Sin nombre'
    } : undefined
  }
}

/**
 * Transforma una ListaEquipo a formato Detail (completo)
 */
export function transformToDetail(lista: ListaEquipo): ListaEquipoDetail {
  const stats = calculateDetailStats(lista.items || [])
  const itemsDetail = (lista.items || []).map(transformItemToDetail)
  
  return {
    ...lista,
    stats,
    items: itemsDetail
  } as ListaEquipoDetail
}

/**
 * Transforma un ListaEquipoItem a formato Detail con información calculada
 */
export function transformItemToDetail(item: ListaEquipoItem): ListaEquipoItemDetail {
  const costoUnitario = item.precioElegido || item.presupuesto || 0
  const costoTotal = costoUnitario * item.cantidad
  
  // 📦 Información de pedidos
  const cantidadPedida = item.pedidos?.reduce((sum, pedido) => sum + pedido.cantidadPedida, 0) || 0
  const cantidadPendiente = Math.max(0, item.cantidad - cantidadPedida)
  const tienePedidos = (item.pedidos?.length || 0) > 0
  
  // 📊 Estado de pedido general
  let estadoPedido: string | undefined
  if (cantidadPedida === 0) estadoPedido = 'sin_pedido'
  else if (cantidadPedida >= item.cantidad) estadoPedido = 'completo'
  else estadoPedido = 'parcial'
  
  return {
    ...item,
    calculated: {
      costoTotal,
      tienePedidos,
      cantidadPedida,
      cantidadPendiente,
      estadoPedido
    }
  }
}

// ==============================================
// 🎯 CALCULADORES DE ACCIONES
// ==============================================

/**
 * Calcula las acciones disponibles según el estado de la lista y rol del usuario
 */
export function calculateAvailableActions(
  estado: EstadoListaEquipo,
  userRole: string
): string[] {
  const actions: string[] = []
  
  // 📝 Acciones básicas siempre disponibles
  actions.push('view', 'export')
  
  // 🔧 Acciones según estado y rol
  switch (estado) {
    case 'borrador':
      if (['admin', 'gerente', 'logistica'].includes(userRole)) {
        actions.push('edit', 'delete', 'submit')
      }
      break
      
    case 'por_revisar':
      if (['admin', 'gerente', 'logistica'].includes(userRole)) {
        actions.push('review', 'approve', 'reject')
      }
      break
      
    case 'por_cotizar':
      if (['admin', 'gerente', 'logistica', 'comercial'].includes(userRole)) {
        actions.push('quote', 'update_prices')
      }
      break
      
    case 'por_validar':
      if (['admin', 'gerente', 'proyectos'].includes(userRole)) {
        actions.push('validate', 'approve', 'reject')
      }
      break
      
    case 'por_aprobar':
      if (['admin', 'gerente'].includes(userRole)) {
        actions.push('approve', 'reject', 'request_changes')
      }
      break
      
    case 'aprobado':
      if (['admin', 'gerente', 'logistica'].includes(userRole)) {
        actions.push('create_order', 'modify')
      }
      break
      
    case 'rechazado':
      if (['admin', 'gerente', 'logistica'].includes(userRole)) {
        actions.push('reopen', 'archive')
      }
      break
  }
  
  return actions
}

// ==============================================
// 🎨 HELPERS DE UI
// ==============================================

/**
 * Obtiene la variante del badge según el estado de la lista
 */
export function getEstadoListaBadgeVariant(estado: EstadoListaEquipo): string {
  switch (estado) {
    case 'borrador': return 'secondary'
    case 'por_revisar': return 'outline'
    case 'por_cotizar': return 'outline'
    case 'por_validar': return 'outline'
    case 'por_aprobar': return 'outline'
    case 'aprobado': return 'default'
    case 'rechazado': return 'destructive'
    default: return 'secondary'
  }
}

/**
 * Obtiene la variante del badge según el estado del item
 */
export function getEstadoItemBadgeVariant(estado: EstadoListaItem): string {
  switch (estado) {
    case 'por_revisar': return 'secondary'
    case 'por_cotizar': return 'outline'
    case 'por_validar': return 'outline'
    case 'por_aprobar': return 'outline'
    case 'aprobado': return 'default'
    case 'rechazado': return 'destructive'
    default: return 'secondary'
  }
}

/**
 * Obtiene la variante del badge según el origen del item
 */
export function getOrigenItemBadgeVariant(origen: OrigenListaItem): string {
  switch (origen) {
    case 'cotizado': return 'default'
    case 'nuevo': return 'secondary'
    case 'reemplazo': return 'outline'
    default: return 'secondary'
  }
}

// ==============================================
// 🔧 UTILIDADES DE FORMATO
// ==============================================

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number, currency: string = 'PEN'): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Calcula el progreso como porcentaje
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// ==============================================
// 🔍 UTILIDADES DE FILTRADO Y ORDENAMIENTO
// ==============================================

/**
 * Filtra listas según criterios
 */
export function filterListas(
  listas: ListaEquipoMaster[],
  filters: {
    estado?: EstadoListaEquipo
    proyectoId?: string
    search?: string
  }
): ListaEquipoMaster[] {
  return listas.filter(lista => {
    if (filters.estado && lista.estado !== filters.estado) return false
    if (filters.proyectoId && lista.proyecto.id !== filters.proyectoId) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        lista.nombre.toLowerCase().includes(searchLower) ||
        lista.codigo.toLowerCase().includes(searchLower) ||
        lista.proyecto.nombre.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    return true
  })
}

/**
 * Ordena listas según criterio
 */
export function sortListas(
  listas: ListaEquipoMaster[],
  sortBy: 'nombre' | 'codigo' | 'fecha' | 'estado' = 'fecha',
  sortOrder: 'asc' | 'desc' = 'desc'
): ListaEquipoMaster[] {
  return [...listas].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'nombre':
        comparison = a.nombre.localeCompare(b.nombre)
        break
      case 'codigo':
        comparison = a.codigo.localeCompare(b.codigo)
        break
      case 'fecha':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'estado':
        comparison = a.estado.localeCompare(b.estado)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
}