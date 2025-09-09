import { Cliente } from '@/types'
import type { ClientePayload, ClienteUpdatePayload } from '@/types/payloads'
import { buildApiUrl } from '@/lib/utils'

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetch(buildApiUrl('/api/clientes'), { cache: 'no-store' })
  if (!res.ok) throw new Error('Error al obtener clientes')
  return res.json()
}

export async function createCliente(data: ClientePayload): Promise<Cliente> {
  const res = await fetch(buildApiUrl('/api/clientes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear cliente')
  return res.json()
}

export async function updateCliente(id: string, data: ClienteUpdatePayload): Promise<Cliente> {
  const res = await fetch(buildApiUrl('/api/clientes'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!res.ok) throw new Error('Error al actualizar cliente')
  return res.json()
}

export async function deleteCliente(id: string): Promise<void> {
  const res = await fetch(buildApiUrl('/api/clientes'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Error al eliminar cliente')
}
