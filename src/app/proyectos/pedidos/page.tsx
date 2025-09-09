/**
 * Página de Equipos de Todos los Proyectos
 * 
 * Vista principal para gestionar los equipos de todos los proyectos:
 * - Tabla avanzada con seguimiento de estados
 * - Filtros por proyecto, proveedor, estado y fechas
 * - Indicadores de coherencia y alertas
 * - Gestión de equipos y tracking
 * 
 * @author GYS Team
 * @version 2.0.0
 */

import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { 
  Package, 
  ArrowLeft, 
  Plus, 
  Download, 
  Upload,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Users,
  Home,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { EstadoPedido } from '@prisma/client'

// ✅ Components
import { PedidoEquipoTableWrapper } from '@/components/finanzas/aprovisionamiento/PedidoEquipoTableWrapper'
import { PedidoEquipoFiltersWrapper } from '@/components/proyectos/PedidoEquipoFiltersWrapper'

// 📡 Services
import { getPedidosEquipo } from '@/lib/services/aprovisionamiento'

export const metadata: Metadata = {
  title: 'Pedidos de Equipos - Proyectos | GYS',
  description: 'Gestión de pedidos de equipos de proyectos'
}

interface PageProps {
  searchParams: Promise<{
    proyecto?: string
    proveedor?: string
    estado?: string
    fechaInicio?: string
    fechaFin?: string
    montoMin?: string
    montoMax?: string
    coherencia?: string
    lista?: string
    page?: string
    limit?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>
}

export default async function PedidosEquipoPage({ searchParams }: PageProps) {
  // 📡 Await search params
  const params = await searchParams
  
  // 📡 Parse search params
  const page = parseInt(params.page || '1')
  const limit = parseInt(params.limit || '10')
  
  // 📡 Fetch pedidos data - obtener todos los pedidos de todos los proyectos
  const pedidosResponse = await getPedidosEquipo({
    proyectoId: params.proyecto, // Si no se especifica, obtiene de todos los proyectos
    proveedorId: params.proveedor,
    estado: params.estado,
    fechaInicio: params.fechaInicio,
    fechaFin: params.fechaFin,
    montoMin: params.montoMin ? parseFloat(params.montoMin) : undefined,
    montoMax: params.montoMax ? parseFloat(params.montoMax) : undefined,
    coherencia: params.coherencia,
    lista: params.lista,
    page,
    limit,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  })

  // 🔁 Extract data from response
  const pedidosData = {
    items: pedidosResponse.data?.pedidos || [],
    total: pedidosResponse.data?.pagination?.total || 0,
    pagination: {
      page: pedidosResponse.data?.pagination?.page || 1,
      limit: pedidosResponse.data?.pagination?.limit || 10,
      total: pedidosResponse.data?.pagination?.total || 0,
      totalPages: pedidosResponse.data?.pagination?.pages || 0
    }
  }

  // 🔁 Prepare filters for components
  const filtros = {
    proyectoId: params.proyecto,
    proveedorId: params.proveedor,
    estado: params.estado as EstadoPedido | undefined,
    fechaCreacion: params.fechaInicio && params.fechaFin ? {
      from: new Date(params.fechaInicio),
      to: new Date(params.fechaFin)
    } : undefined,
    montoMinimo: params.montoMin ? parseFloat(params.montoMin) : undefined,
    montoMaximo: params.montoMax ? parseFloat(params.montoMax) : undefined,
    coherenciaMinima: params.coherencia ? parseFloat(params.coherencia) : undefined,
    busqueda: ''
  }

  // 📊 Calculate statistics
  const stats = {
    totalPedidos: pedidosData.total,
    pendientes: pedidosData.items.filter(p => p.estado === 'PENDIENTE').length,
    aprobados: pedidosData.items.filter(p => p.estado === 'APROBADO').length,
    rechazados: pedidosData.items.filter(p => p.estado === 'RECHAZADO').length,
    montoTotal: pedidosData.items.reduce((sum, p) => sum + (p.montoTotal || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* 🧭 Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/proyectos" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Proyectos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos de Equipos
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 📋 Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Pedidos de Equipos
                </h1>
                <p className="text-sm text-gray-600 md:text-base">
                  Gestión de pedidos de equipos de todos los proyectos
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>
        </div>

        {/* 📊 Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPedidos}</div>
              <p className="text-xs text-muted-foreground">
                Todos los proyectos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
              <p className="text-xs text-muted-foreground">
                Esperando aprobación
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.aprobados}</div>
              <p className="text-xs text-muted-foreground">
                Listos para compra
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rechazados}</div>
              <p className="text-xs text-muted-foreground">
                Requieren revisión
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.montoTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Valor total equipos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🔍 Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Filtra los equipos por proyecto, estado, fechas y otros criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-20 animate-pulse bg-gray-100 rounded" />}>
              <PedidoEquipoFiltersWrapper filtros={filtros} />
            </Suspense>
          </CardContent>
        </Card>

        {/* 📋 Table Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Equipos
            </CardTitle>
            <CardDescription>
              {pedidosData.total} equipos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loading />}>
              <PedidoEquipoTableWrapper 
                data={pedidosData.items}
                pagination={pedidosData.pagination}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 🔄 Loading Component
function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse bg-gray-200 rounded" />
        <div className="h-8 w-32 animate-pulse bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  )
}

// ❌ Error Component
function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Error al cargar equipos
        </CardTitle>
        <CardDescription>
          {error.message || 'Ha ocurrido un error inesperado'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={reset} variant="outline">
          Intentar nuevamente
        </Button>
      </CardContent>
    </Card>
  )
}