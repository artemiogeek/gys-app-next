// ===================================================
// 📁 Archivo: ProveedorForm.tsx
// 📌 Ubicación: src/components/logistica/ProveedorForm.tsx
// 🔧 Descripción: Formulario moderno para crear proveedores con validación
// 🧠 Uso: Formulario con React Hook Form, Zod validation y UX/UI mejorada
// ✍️ Autor: Senior Fullstack Developer
// 📅 Última actualización: 2025-01-15
// ===================================================

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Plus, Loader2, Building2, Hash, CheckCircle, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ProveedorPayload, Proveedor } from '@/types'

// Validation schema with Zod
const proveedorSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/, 'El nombre solo puede contener letras, espacios, guiones y puntos'),
  ruc: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^\d{11}$/.test(val),
      'El RUC debe tener exactamente 11 dígitos'
    ),
  direccion: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 5,
      'La dirección debe tener al menos 5 caracteres'
    ),
  telefono: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^[+]?[0-9\s\-()]{7,15}$/.test(val),
      'El teléfono debe tener un formato válido'
    ),
  correo: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'El correo debe tener un formato válido'
    )
})

type FormData = z.infer<typeof proveedorSchema>

interface Props {
  onSaved?: (proveedor: Proveedor) => void
  initial?: Proveedor | null
  onCancel?: () => void
}

export default function ProveedorForm({ onSaved, initial, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: initial?.nombre || '',
      ruc: initial?.ruc || '',
      direccion: initial?.direccion || '',
      telefono: initial?.telefono || '',
      correo: initial?.correo || ''
    },
    mode: 'onChange' // Real-time validation
  })

  // Watch form values for real-time feedback
  const watchedNombre = watch('nombre')
  const watchedRuc = watch('ruc')
  const watchedDireccion = watch('direccion')
  const watchedTelefono = watch('telefono')
  const watchedCorreo = watch('correo')

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        nombre: data.nombre.trim(),
        ruc: data.ruc?.trim() || undefined,
        direccion: data.direccion?.trim() || undefined,
        telefono: data.telefono?.trim() || undefined,
        correo: data.correo?.trim() || undefined
      }
      
      let result: Proveedor
      
      if (initial) {
        // Update existing provider (not implemented yet)
        result = {
          id: initial.id,
          createdAt: initial.createdAt,
          updatedAt: new Date().toISOString(),
          ...payload
        }
      } else {
        // Create new provider
        const response = await fetch('/api/proveedor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear proveedor')
        }
        
        result = await response.json()
        reset() // Clear form only when creating new
        toast.success('Proveedor creado exitosamente')
      }
      
      onSaved?.(result)
    } catch (error) {
      console.error('Error al procesar proveedor:', error)
      toast.error('Error al procesar proveedor', {
        description: error instanceof Error ? error.message : 'Por favor, intenta nuevamente'
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-blue-600" />
          {initial ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completa los datos para {initial ? 'actualizar el' : 'registrar un nuevo'} proveedor
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Field */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Nombre del Proveedor
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nombre"
                    {...register('nombre')}
                    placeholder="Ej: Constructora ABC S.A.C."
                    className={`transition-all duration-200 ${
                      errors.nombre 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : watchedNombre && watchedNombre.length > 1
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedNombre && watchedNombre.length > 1 && !errors.nombre && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.nombre && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.nombre.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Nombre completo de la empresa o persona
                </p>
              </div>

              {/* RUC Field */}
              <div className="space-y-2">
                <Label htmlFor="ruc" className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4 text-purple-600" />
                  RUC
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="ruc"
                    {...register('ruc')}
                    placeholder="12345678901"
                    maxLength={11}
                    className={`transition-all duration-200 ${
                      errors.ruc 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : watchedRuc && watchedRuc.length === 11
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedRuc && watchedRuc.length === 11 && !errors.ruc && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.ruc && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.ruc.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Registro Único de Contribuyentes (11 dígitos)
                </p>
              </div>

            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Información de Contacto
            </h3>
            <div className="space-y-6">
              {/* Dirección Field */}
              <div className="space-y-2">
                <Label htmlFor="direccion" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Dirección
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="direccion"
                    {...register('direccion')}
                    placeholder="Ej: Av. Los Constructores 123, San Isidro"
                    className={`transition-all duration-200 ${
                      errors.direccion 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : watchedDireccion && watchedDireccion.length >= 5
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedDireccion && watchedDireccion.length >= 5 && !errors.direccion && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.direccion && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.direccion.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Dirección completa de la empresa
                </p>
              </div>

              {/* Teléfono Field */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Teléfono
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="telefono"
                    {...register('telefono')}
                    placeholder="Ej: +51 1 234-5678 o 987654321"
                    className={`transition-all duration-200 ${
                      errors.telefono 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : watchedTelefono && watchedTelefono.length >= 7
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedTelefono && watchedTelefono.length >= 7 && !errors.telefono && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.telefono && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.telefono.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Número de contacto principal
                </p>
              </div>

              {/* Correo Field */}
              <div className="space-y-2">
                <Label htmlFor="correo" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Correo Electrónico
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="correo"
                    type="email"
                    {...register('correo')}
                    placeholder="Ej: contacto@empresa.com"
                    className={`transition-all duration-200 ${
                      errors.correo 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : watchedCorreo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedCorreo)
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    disabled={isSubmitting}
                  />
                  {watchedCorreo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedCorreo) && !errors.correo && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.correo && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.correo.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Email de contacto principal
                </p>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            {initial && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {initial ? 'Actualizar' : 'Crear'} Proveedor
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
