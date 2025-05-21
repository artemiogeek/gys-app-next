// ===================================================
// 📁 Archivo: PedidoEquipoList.tsx
// 📌 Ubicación: src/components/equipos/
// 🔧 Descripción: Lista de pedidos de equipos realizada por proyectos o visible por logística
//
// 🧠 Uso: Reutilizable en contextos de proyectos (edición) y logística (solo lectura)
// ✍️ Autor: Asistente IA GYS
// 📅 Última actualización: 2025-05-21
// ===================================================

'use client'

import {
  PedidoEquipo,
  PedidoEquipoUpdatePayload,
  PedidoEquipoItemUpdatePayload,
} from '@/types'
import { format } from 'date-fns'
import { Eye, ClipboardList, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  data: PedidoEquipo[]
  onView?: (pedidoId: string) => void
  onUpdate?: (id: string, payload: PedidoEquipoUpdatePayload) => void
  onDelete?: (id: string) => void
  onUpdateItem?: (id: string, payload: PedidoEquipoItemUpdatePayload) => void
  onDeleteItem?: (id: string) => void
}

export default function PedidoEquipoList({
  data,
  onView,
  onUpdate,
  onDelete,
  onUpdateItem,
  onDeleteItem,
}: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-blue-600" />
        Pedidos Realizados
      </h2>

      {data.length === 0 && (
        <p className="text-sm text-gray-500">No hay pedidos registrados aún.</p>
      )}

      <div className="space-y-3">
        {data.map((pedido) => (
          <div
            key={pedido.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow transition grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
          >
            <div className="md:col-span-2">
              <div className="font-semibold text-gray-800">
                {pedido.codigo || 'Sin código'}
              </div>
              <div className="text-sm text-gray-500">
                Estado: <span className="capitalize">{pedido.estado}</span>
              </div>
              <div className="text-xs text-gray-400">
                Pedido: {format(new Date(pedido.fechaPedido), 'dd/MM/yyyy')}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500">Responsable</span>
              <div className="text-sm text-gray-700">{pedido.responsableId}</div>
            </div>

            <div>
              <span className="text-xs text-gray-500">Lista</span>
              <div className="text-sm text-gray-700">{pedido.listaId}</div>
            </div>

            <div className="flex justify-end gap-2">
              {onView && (
                <Button size="sm" variant="outline" onClick={() => onView(pedido.id)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              )}

              {onUpdate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate(pedido.id, {})} // puedes ajustar el payload real
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => onDelete(pedido.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
