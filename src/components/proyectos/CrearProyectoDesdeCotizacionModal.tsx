'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { FolderPlus } from 'lucide-react'
import { crearProyectoDesdeCotizacion } from '@/lib/services/proyecto'
import type { Cotizacion } from '@/types'

interface Props {
  cotizacion: Cotizacion
  buttonVariant?: 'default' | 'outline' | 'ghost'
  buttonSize?: 'sm' | 'default' | 'lg'
  buttonClassName?: string
  showIcon?: boolean
}

export default function CrearProyectoDesdeCotizacionModal({ 
  cotizacion, 
  buttonVariant = 'default',
  buttonSize = 'default',
  buttonClassName = '',
  showIcon = true
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ Validación: nombre y fechaInicio son requeridos
  const puedeCrear = nombre.trim() && fechaInicio && !loading

  const handleCrear = async () => {
    if (!puedeCrear) return

    // ✅ Validate required fields before sending
    if (!cotizacion.cliente?.id) {
      toast.error('La cotización debe tener un cliente asignado')
      return
    }

    if (!cotizacion.comercial?.id) {
      toast.error('La cotización debe tener un comercial asignado')
      return
    }

    setLoading(true)
    try {
      // 📡 Call service to create project from cotización
      const proyecto = await crearProyectoDesdeCotizacion(cotizacion.id, {
        clienteId: cotizacion.cliente.id,
        comercialId: cotizacion.comercial.id,
        gestorId: cotizacion.comercial.id, // ✅ Use comercial as default gestor
        cotizacionId: cotizacion.id,
        nombre,
        totalEquiposInterno: cotizacion.totalEquiposInterno,
        totalServiciosInterno: cotizacion.totalServiciosInterno,
        totalGastosInterno: cotizacion.totalGastosInterno,
        totalInterno: cotizacion.totalInterno,
        totalCliente: cotizacion.totalCliente,
        descuento: cotizacion.descuento,
        grandTotal: cotizacion.grandTotal,
        estado: 'en_planificacion', // ✅ Use correct enum value
        fechaInicio,
        fechaFin: fechaFin || undefined
      })

      toast.success('Proyecto creado exitosamente')
      setOpen(false)
      
      // Reset form
      setNombre('')
      setFechaInicio('')
      setFechaFin('')
      
      // Navigate to the new project
      router.push(`/proyectos/${proyecto.id}`)
    } catch (error) {
      console.error('Error al crear proyecto:', error)
      // ✅ Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el proyecto'
      toast.error(`Error al crear el proyecto: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant}
          size={buttonSize}
          className={`${buttonVariant === 'default' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''} ${buttonClassName}`}
        >
          {showIcon && <FolderPlus className="h-4 w-4 mr-2" />}
          <span className="hidden sm:inline">Crear Proyecto</span>
          <span className="sm:hidden">Proyecto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Crear Proyecto desde Cotización</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del proyecto *</Label>
            <Input
              id="nombre"
              placeholder="Ingrese el nombre del proyecto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de fin (opcional)</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full"
                min={fechaInicio}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCrear}
            disabled={!puedeCrear || loading}
            className="bg-purple-600 text-white"
          >
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
