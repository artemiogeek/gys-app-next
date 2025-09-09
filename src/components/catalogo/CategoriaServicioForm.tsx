// ===================================================
// 📁 Archivo: CategoriaServicioForm.tsx
// 📌 Ubicación: src/components/catalogo/
// 🔧 Descripción: Formulario para crear o editar Categoría de Servicio
//
// 🧠 Uso: Usado para agregar nuevas categorías en el sistema GYS
// ✍️ Autor: Jesús Artemio (Master Experto 🧙‍♂️)
// 🗓 Última actualización: 2025-04-20
// ===================================================

'use client'

import { useState } from 'react'
import { CategoriaServicio, CategoriaServicioPayload } from '@/types'
import { createCategoriaServicio } from '@/lib/services/categoriaServicio'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  onCreated?: (nueva: CategoriaServicio) => void
}

export default function CategoriaServicioForm({ onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: CategoriaServicioPayload = { nombre }
      const nueva = await createCategoriaServicio(payload)
      toast.success('Categoría creada correctamente')
      setNombre('')
      onCreated?.(nueva)
    } catch (error) {
      toast.error('Error al crear categoría')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">➕ Nueva Categoría de Servicio</h2>

      <Input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre de la categoría"
        required
        disabled={loading}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Crear'}
      </Button>
    </form>
  )
}
