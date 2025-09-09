/**
 * @fileoverview Mock data para tests de cotizaciones
 * Proporciona datos de prueba consistentes para validar UX/UI
 */

import { Cotizacion, CotizacionEquipo, CotizacionServicio, CotizacionGasto, TipoFormula } from '@/types/modelos'

// Mock de equipo de cotización
export const mockCotizacionEquipo: CotizacionEquipo = {
  id: 'equipo-1',
  nombre: 'Sección de Equipos de Prueba',
  descripcion: 'Descripción de equipos de prueba',
  subtotalInterno: 2000.00,
  subtotalCliente: 3000.00,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  items: [
    {
      id: 'item-1',
      cotizacionEquipoId: 'equipo-1',
      catalogoEquipoId: 'catalogo-1',
      codigo: 'EQ001',
      descripcion: 'Descripción del equipo test',
      categoria: 'Equipos',
      unidad: 'unidad',
      marca: 'Test Brand',
      precioInterno: 1000.00,
      precioCliente: 1500.00,
      cantidad: 2,
      costoInterno: 2000.00,
      costoCliente: 3000.00,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]
}

// Mock de servicio de cotización
export const mockCotizacionServicio: CotizacionServicio = {
  id: 'servicio-1',
  categoria: 'Instalación',
  subtotalInterno: 1200.00,
  subtotalCliente: 2000.00,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  items: [
    {
      id: 'item-1',
      cotizacionServicioId: 'servicio-1',
      catalogoServicioId: 'catalogo-servicio-1',
      unidadServicioId: 'unidad-1',
      recursoId: 'recurso-1',
      nombre: 'Servicio Test 1',
      descripcion: 'Descripción del servicio test',
      categoria: 'Instalación',
      unidadServicioNombre: 'Horas',
      recursoNombre: 'Técnico Senior',
      formula: 'Fijo',
      horaBase: 8,
      horaRepetido: 0,
      horaUnidad: 0,
      horaFijo: 8,
      costoHora: 150,
      cantidad: 1,
      horaTotal: 8,
      factorSeguridad: 1.1,
      margen: 1.67,
      costoInterno: 1200.00,
      costoCliente: 2000.00,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      unidadServicio: {
        id: 'unidad-1',
        nombre: 'Horas'
      },
      recurso: {
        id: 'recurso-1',
        nombre: 'Técnico Senior',
        costoHora: 150
      }
    }
  ]
}

// Mock de gasto de cotización
export const mockCotizacionGasto: CotizacionGasto = {
  id: 'gasto-1',
  cotizacionId: 'cotizacion-1',
  nombre: 'Sección de Gastos de Prueba',
  descripcion: 'Descripción de gastos de prueba',
  items: [
    {
      id: 'item-1',
      gastoId: 'gasto-1',
      nombre: 'Gasto Test 1',
      descripcion: 'Descripción del gasto test',
      cantidad: 1,
      precioUnitario: 500.00,
      factorSeguridad: 1.1,
      margen: 1.2,
      costoInterno: 500.00,
      costoCliente: 660.00,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ],
  subtotalInterno: 500.00,
  subtotalCliente: 660.00,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}

// Mock de cotización completa
export const mockCotizacion: Cotizacion = {
  id: 'cotizacion-1',
  nombre: 'Cotización de Prueba UX/UI',
  estado: 'borrador',
  etapa: 'inicial',
  prioridad: 'alta',
  probabilidad: 75,
  fechaEnvio: null,
  fechaCierreEstimada: '2024-02-15T00:00:00Z',
  notas: 'Cotización de prueba para validar UX/UI',
  
  totalEquiposInterno: 2000.00,
  totalEquiposCliente: 3000.00,
  totalServiciosInterno: 1200.00,
  totalServiciosCliente: 2000.00,
  totalGastosInterno: 500.00,
  totalGastosCliente: 660.00,
  totalInterno: 3700.00,
  totalCliente: 5660.00,
  descuento: 0,
  grandTotal: 5660.00,
  
  cliente: {
    id: 'cliente-1',
    nombre: 'Cliente Test S.A.C.',
    ruc: '20123456789',
    direccion: 'Av. Test 123, Lima, Perú',
    correo: 'cliente@test.com'
  },
  comercial: {
    id: 'comercial-1',
    nombre: 'María García'
  },
  plantilla: {
    id: 'plantilla-1',
    nombre: 'Plantilla Estándar'
  },
  equipos: [mockCotizacionEquipo],
  servicios: [mockCotizacionServicio],
  gastos: [mockCotizacionGasto],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}

// Mock de cotización vacía (para probar estados vacíos)
export const mockCotizacionVacia: Cotizacion = {
  ...mockCotizacion,
  id: 'cotizacion-vacia',
  nombre: 'Cotización Vacía para Tests',
  equipos: [],
  servicios: [],
  gastos: [],
  totalEquiposInterno: 0,
  totalEquiposCliente: 0,
  totalServiciosInterno: 0,
  totalServiciosCliente: 0,
  totalGastosInterno: 0,
  totalGastosCliente: 0,
  totalInterno: 0,
  totalCliente: 0,
  grandTotal: 0
}

// Mock de cotización con muchos elementos (para probar performance)
export const mockCotizacionCompleja: Cotizacion = {
  ...mockCotizacion,
  id: 'cotizacion-compleja',
  nombre: 'Cotización Compleja para Tests de Performance',
  equipos: Array.from({ length: 5 }, (_, i) => ({
    ...mockCotizacionEquipo,
    id: `equipo-${i + 1}`,
    nombre: `Sección de Equipos ${i + 1}`,
    items: Array.from({ length: 10 }, (_, j) => ({
      ...mockCotizacionEquipo.items[0],
      id: `equipo-${i + 1}-item-${j + 1}`,
      codigo: `EQ${i + 1}${j + 1}`,
      descripcion: `Equipo ${i + 1}-${j + 1}`
    }))
  })),
  servicios: Array.from({ length: 3 }, (_, i) => ({
    ...mockCotizacionServicio,
    id: `servicio-${i + 1}`,
    nombre: `Sección de Servicios ${i + 1}`,
    items: Array.from({ length: 5 }, (_, j) => ({
      ...mockCotizacionServicio.items[0],
      id: `servicio-${i + 1}-item-${j + 1}`,
      nombre: `Servicio ${i + 1}-${j + 1}`
    }))
  })),
  gastos: Array.from({ length: 2 }, (_, i) => ({
    ...mockCotizacionGasto,
    id: `gasto-${i + 1}`,
    nombre: `Sección de Gastos ${i + 1}`,
    items: Array.from({ length: 3 }, (_, j) => ({
      ...mockCotizacionGasto.items[0],
      id: `gasto-${i + 1}-item-${j + 1}`,
      nombre: `Gasto ${i + 1}-${j + 1}`
    }))
  }))
}

// Estados de cotización para tests
export const estadosCotizacion = {
  BORRADOR: 'BORRADOR',
  ENVIADA: 'ENVIADA',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  VENCIDA: 'VENCIDA',
  CERRADA: 'CERRADA'
} as const

// Variantes de estado para badges
export const variantesEstado = {
  BORRADOR: 'secondary',
  ENVIADA: 'default',
  APROBADA: 'default',
  RECHAZADA: 'destructive',
  VENCIDA: 'destructive',
  CERRADA: 'outline'
} as const

// Mock de respuestas de API
export const mockApiResponses = {
  getCotizacion: {
    success: {
      data: mockCotizacion,
      message: 'Cotización obtenida exitosamente'
    },
    error: {
      error: 'Cotización no encontrada',
      message: 'No se pudo encontrar la cotización solicitada'
    },
    loading: {
      loading: true
    }
  },
  updateCotizacion: {
    success: {
      data: { ...mockCotizacion, updatedAt: new Date().toISOString() },
      message: 'Cotización actualizada exitosamente'
    },
    error: {
      error: 'Error al actualizar',
      message: 'No se pudo actualizar la cotización'
    }
  }
}

// Utilidades para tests
export const testUtils = {
  // Crear cotización con estado específico
  createCotizacionWithStatus: (estado: keyof typeof estadosCotizacion) => ({
    ...mockCotizacion,
    estado: estadosCotizacion[estado]
  }),
  
  // Crear cotización con elementos específicos
  createCotizacionWithItems: (equipos = 0, servicios = 0, gastos = 0) => ({
    ...mockCotizacion,
    equipos: equipos > 0 ? Array.from({ length: equipos }, (_, i) => ({
      ...mockCotizacionEquipo,
      id: `equipo-${i + 1}`
    })) : [],
    servicios: servicios > 0 ? Array.from({ length: servicios }, (_, i) => ({
      ...mockCotizacionServicio,
      id: `servicio-${i + 1}`
    })) : [],
    gastos: gastos > 0 ? Array.from({ length: gastos }, (_, i) => ({
      ...mockCotizacionGasto,
      id: `gasto-${i + 1}`
    })) : []
  }),
  
  // Simular delay de red
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generar datos aleatorios para stress testing
  generateRandomCotizacion: () => ({
    ...mockCotizacion,
    id: `cotizacion-${Math.random().toString(36).substr(2, 9)}`,
    nombre: `Cotización ${Math.floor(Math.random() * 1000)}`,
    total: Math.floor(Math.random() * 100000) + 1000
  })
}