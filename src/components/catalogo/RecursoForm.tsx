// ===================================================
// 📁 Archivo: RecursoForm.tsx
// 📌 Ubicación: src/components/catalogo/
// 🔧 Descripción: Formulario para crear recurso
//
// 🧠 Uso: Usado en la página de gestión de recursos
// ✍️ Autor: Jesús Artemio
// 📅 Última actualización: 2025-04-21
// ===================================================

'use client'

import { useState } from 'react'
import { Recurso, RecursoPayload } from '@/types'
import { createRecurso } from '@/lib/services/recurso'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Props {
  onCreated?: (nuevo: Recurso) => void
}

export default function RecursoForm({ onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [costoHora, setCostoHora] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: RecursoPayload = { nombre, costoHora }
      const nuevo = await createRecurso(payload)
      toast.success('Recurso creado')
      onCreated?.(nuevo)
      setNombre('')
      setCostoHora(0)
    } catch (err) {
      toast.error('Error al crear recurso')
    } finally {
      setLoading(false)
    }
  }

  return (
<form onSubmit={handleSubmit} className="space-y-4">
  <h2 className="text-xl font-semibold">➕ Nuevo Recurso</h2>

  <div className="space-y-1">
    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
      Nombre del recurso
    </label>
    <Input
      id="nombre"
      placeholder="Ej: Ingeniero"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
      required
      disabled={loading}
    />
  </div>

  <div className="space-y-1">
    <label htmlFor="costoHora" className="block text-sm font-medium text-gray-700">
      Costo por hora ( $ )
    </label>
    <Input
      id="costoHora"
      type="number"
      placeholder="Ej: 80"
      value={costoHora}
      onChange={(e) => setCostoHora(parseFloat(e.target.value))}
      required
      disabled={loading}
    />
  </div>

  <Button type="submit" disabled={loading}>
    {loading ? 'Guardando...' : 'Crear'}
  </Button>
</form>

  )
}
