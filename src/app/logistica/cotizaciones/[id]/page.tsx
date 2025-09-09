/**
 * 📋 Página de Detalle de Cotización de Proveedor
 * 
 * Página que muestra el detalle completo de una cotización específica.
 * Incluye toda la funcionalidad del accordion migrada aquí.
 * 
 * @author GYS Team
 * @version 1.0.0
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Package, 
  Building2, 
  Calendar, 
  FileText, 
  Edit3,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react'

import { CotizacionProveedor } from '@/types'
import {
  getCotizacionProveedorById,
  updateCotizacionProveedor,
  deleteCotizacionProveedor,
} from '@/lib/services/cotizacionProveedor'

import CotizacionProveedorAccordion from '@/components/logistica/CotizacionProveedorAccordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ✅ Función para obtener variante del badge según estado
const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return 'secondary' as const
    case 'cotizado':
      return 'default' as const
    case 'seleccionado':
      return 'outline' as const
    case 'rechazado':
      return 'destructive' as const
    default:
      return 'secondary' as const
  }
}

// ✅ Función para obtener icono según estado
const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return <Clock className="h-4 w-4" />
    case 'cotizado':
      return <FileText className="h-4 w-4" />
    case 'seleccionado':
      return <CheckCircle className="h-4 w-4" />
    case 'rechazado':
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export default function CotizacionDetallePage() {
  const params = useParams()
  const router = useRouter()
  const cotizacionId = params.id as string

  const [cotizacion, setCotizacion] = useState<CotizacionProveedor | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)

  // 📡 Cargar cotización específica
  const cargarCotizacion = async () => {
    try {
      setLoading(true)
      const data = await getCotizacionProveedorById(cotizacionId)
      if (data) {
        setCotizacion(data)
      } else {
        toast.error('Cotización no encontrada')
        router.push('/logistica/cotizaciones')
      }
    } catch (error) {
      console.error('Error al cargar cotización:', error)
      toast.error('Error al cargar cotización')
      router.push('/logistica/cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cotizacionId) {
      cargarCotizacion()
    }
  }, [cotizacionId])

  // 🔁 Función para actualización local más eficiente
  const handleCotizacionUpdated = async (updatedCotizacionId: string) => {
    try {
      if (updatedCotizacionId === cotizacionId) {
        const updatedCotizacion = await getCotizacionProveedorById(cotizacionId)
        if (updatedCotizacion) {
          setCotizacion(updatedCotizacion)
        }
      }
    } catch (error) {
      console.error('Error al actualizar cotización específica:', error)
      await cargarCotizacion()
    }
  }

  // 🔁 Función para actualización local de estado sin refetch
  const handleEstadoUpdated = async (updatedCotizacionId: string, nuevoEstado: CotizacionProveedor['estado']) => {
    try {
      if (updatedCotizacionId === cotizacionId && cotizacion) {
        // Actualizar estado local inmediatamente
        setCotizacion(prev => prev ? { ...prev, estado: nuevoEstado } : null)
        
        // Llamar al servicio para persistir el cambio
        await updateCotizacionProveedor(cotizacionId, { estado: nuevoEstado })
        toast.success('Estado actualizado correctamente')
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      // Revertir cambio local en caso de error
      if (cotizacion) {
        setCotizacion(prev => prev ? { ...prev, estado: cotizacion.estado } : null)
      }
      toast.error('Error al actualizar estado')
    }
  }

  // 📡 Manejar actualización de cotización
  const handleUpdate = async (id: string, payload: any) => {
    try {
      setLoadingAction(true)
      const actualizado = await updateCotizacionProveedor(id, payload)
      if (actualizado) {
        toast.success('✅ Cotización actualizada')
        await cargarCotizacion()
      } else {
        toast.error('❌ Error al actualizar cotización')
      }
    } catch (error) {
      console.error('Error al actualizar:', error)
      toast.error('❌ Error al actualizar cotización')
    } finally {
      setLoadingAction(false)
    }
  }

  // 🗑️ Manejar eliminación de cotización
  const handleDelete = async (id: string) => {
    try {
      setLoadingAction(true)
      const ok = await deleteCotizacionProveedor(id)
      if (ok) {
        toast.success('🗑️ Cotización eliminada')
        router.push('/logistica/cotizaciones')
      } else {
        toast.error('❌ Error al eliminar cotización')
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('❌ Error al eliminar cotización')
    } finally {
      setLoadingAction(false)
    }
  }

  // 🔄 Volver a la lista
  const handleVolver = () => {
    router.push('/logistica/cotizaciones')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
        
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-96 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="p-6 border rounded-lg">
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Cotización no encontrada
              </h3>
              <p className="text-gray-600">
                La cotización que buscas no existe o ha sido eliminada.
              </p>
            </div>
            <Button onClick={handleVolver} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Cotizaciones
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🧭 Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/logistica/cotizaciones"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Package className="h-4 w-4" />
                Cotizaciones
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">
                {cotizacion.codigo}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* 📋 Header Section */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleVolver}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {cotizacion.codigo}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{cotizacion.proveedor?.nombre || 'Proveedor no especificado'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Proyecto:</span>
                <span>{cotizacion.proyecto?.nombre || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Creado: {new Date(cotizacion.createdAt).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={getEstadoBadgeVariant(cotizacion.estado)}
              className="flex items-center gap-1 px-3 py-1"
            >
              {getEstadoIcon(cotizacion.estado)}
              {cotizacion.estado}
            </Badge>
          </div>
        </div>

        <Separator />
      </motion.div>

      {/* 📊 Content Section - Accordion con toda la funcionalidad */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CotizacionProveedorAccordion
          cotizacion={cotizacion}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onUpdatedItem={() => handleCotizacionUpdated(cotizacion.id)}
          onEstadoUpdated={handleEstadoUpdated}
          showActions={true}
          expanded={true} // Siempre expandido en la página de detalle
        />
      </motion.div>
    </motion.div>
  )
}