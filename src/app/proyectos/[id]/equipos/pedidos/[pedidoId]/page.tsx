/**
 * 📄 Página de Detalle de Pedido de Equipos
 * 
 * Permite gestionar un pedido específico y sus items asociados.
 * Incluye funcionalidades para agregar, editar y eliminar items del pedido.
 * 
 * @author GYS Team
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// 🎨 UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// 🎯 Icons
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  User, 
  MapPin,
  Plus,
  Edit,
  Trash2,
  FileText
} from 'lucide-react'

// 📡 Services & Types
import { 
  getPedidoEquipoById,
  updatePedidoEquipo,
  deletePedidoEquipo
} from '@/lib/services/pedidoEquipo'
import {
  createPedidoEquipoItem,
  updatePedidoEquipoItem,
  deletePedidoEquipoItem
} from '@/lib/services/pedidoEquipoItem'
import { getListaEquiposPorProyecto } from '@/lib/services/listaEquipo'
import { getProyecto } from '@/lib/services/proyectos'

import type { 
  PedidoEquipo, 
  ListaEquipo,
  Proyecto
} from '@/types/modelos'
import type {
  PedidoEquipoUpdatePayload,
  PedidoEquipoItemPayload,
  PedidoEquipoItemUpdatePayload
} from '@/types/payloads'

// 🧩 Components
import PedidoEquipoForm from '@/components/proyectos/PedidoEquipoForm'
import PedidoEquipoItemForm from '@/components/proyectos/PedidoEquipoItemForm'
import PedidoEquipoItemList from '@/components/proyectos/PedidoEquipoItemList'

// 🎨 Helper functions
const getEstadoVariant = (estado: string) => {
  switch (estado) {
    case 'pendiente': return 'secondary'
    case 'aprobado': return 'default'
    case 'rechazado': return 'destructive'
    case 'completado': return 'outline'
    default: return 'secondary'
  }
}

const formatCurrency = (amount: number, currency: string = 'PEN') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'No especificada'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Fecha inválida'
  
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

// 🎯 Main Component
export default function PedidoEquipoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const proyectoId = params.id as string
  const pedidoId = params.pedidoId as string

  // 🎯 States
  const [pedido, setPedido] = useState<PedidoEquipo | null>(null)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [listas, setListas] = useState<ListaEquipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)

  // 📡 Data loading
  useEffect(() => {
    cargarDatos()
  }, [pedidoId, proyectoId])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [pedidoData, proyectoData, listasData] = await Promise.all([
        getPedidoEquipoById(pedidoId),
        getProyecto(proyectoId),
        getListaEquiposPorProyecto(proyectoId)
      ])
      
      setPedido(pedidoData)
      setProyecto(proyectoData)
      setListas(listasData || [])
    } catch (err) {
      setError('Error al cargar los datos del pedido')
      toast.error('Error al cargar los datos del pedido')
    } finally {
      setLoading(false)
    }
  }

  const cargarPedido = async () => {
    try {
      const data = await getPedidoEquipoById(pedidoId)
      setPedido(data)
    } catch {
      toast.error('Error al cargar pedido')
    }
  }

  // 🎯 Event handlers
  const handleUpdatePedido = async (payload: PedidoEquipoUpdatePayload) => {
    const actualizado = await updatePedidoEquipo(pedidoId, payload)
    if (actualizado) {
      toast.success('Pedido actualizado')
      setShowEditForm(false)
      await cargarPedido()
    } else {
      toast.error('Error al actualizar pedido')
    }
  }

  const handleDeletePedido = async () => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return
    
    const ok = await deletePedidoEquipo(pedidoId)
    if (ok) {
      toast.success('Pedido eliminado')
      router.push(`/proyectos/${proyectoId}/equipos/pedidos`)
    } else {
      toast.error('Error al eliminar pedido')
    }
  }

  const handleCreateItem = async (payload: PedidoEquipoItemPayload) => {
    const nuevo = await createPedidoEquipoItem(payload)
    if (nuevo) {
      toast.success('Ítem agregado al pedido')
      setShowItemForm(false)
      await cargarPedido()
    } else {
      toast.error('Error al agregar ítem')
    }
  }

  const handleUpdateItem = async (id: string, payload: PedidoEquipoItemUpdatePayload) => {
    const actualizado = await updatePedidoEquipoItem(id, payload)
    if (actualizado) {
      toast.success('Ítem actualizado')
      await cargarPedido()
    } else {
      toast.error('Error al actualizar ítem')
    }
  }

  const handleDeleteItem = async (id: string) => {
    const ok = await deletePedidoEquipoItem(id)
    if (ok) {
      toast.success('Ítem eliminado')
      await cargarPedido()
    } else {
      toast.error('Error al eliminar ítem')
    }
  }

  // 🎯 Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // 🎯 Error state
  if (error || !pedido || !proyecto) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {error || 'Pedido no encontrado'}
            </h3>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 📊 Calculate stats
  const totalItems = pedido.items?.length || 0
  const montoTotal = pedido.items?.reduce((sum, item) => {
    return sum + ((item.precioUnitario || 0) * item.cantidadPedida)
  }, 0) || 0

  return (
    <motion.div 
      className="container mx-auto p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🧭 Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/proyectos/${proyectoId}`}>
              {proyecto.nombre}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/proyectos/${proyectoId}/equipos`}>
              Equipos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/proyectos/${proyectoId}/equipos/pedidos`}>
              Pedidos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pedido #{pedido.numeroSecuencia}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 📋 Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pedido #{pedido.numeroSecuencia}
            </h1>
            <p className="text-sm text-muted-foreground">
              {proyecto.nombre}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getEstadoVariant(pedido.estado)}>
            {pedido.estado}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeletePedido}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* ✏️ Edit Form */}
      {showEditForm && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <PedidoEquipoForm
              proyectoId={proyectoId}
              listas={listas}
              pedido={pedido}
              onSubmit={handleUpdatePedido}
              onCancel={() => setShowEditForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* 📊 Pedido Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📋 Main Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número</label>
                  <p className="font-semibold">#{pedido.numeroSecuencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <Badge variant={getEstadoVariant(pedido.estado)}>
                      {pedido.estado}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Pedido</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(pedido.fechaPedido)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha Requerida</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(pedido.fechaNecesaria)}
                  </p>
                </div>
              </div>
              
              {pedido.observacion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                    {pedido.observacion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 📊 Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(montoTotal)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* 📦 Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items del Pedido
          </h2>
          <Button
            onClick={() => setShowItemForm(!showItemForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Item
          </Button>
        </div>

        {/* ➕ Add Item Form */}
        {showItemForm && (
          <Card>
            <CardHeader>
              <CardTitle>Agregar Item al Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <PedidoEquipoItemForm
                pedidoId={pedidoId}
                listas={listas}
                onSubmit={handleCreateItem}
                onCancel={() => setShowItemForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* 📋 Items List */}
        <PedidoEquipoItemList
          items={pedido.items || []}
          listas={listas}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
        />
      </div>
    </motion.div>
  )
}