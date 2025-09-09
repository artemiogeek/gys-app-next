// ===============================
// 📁 clienteImportUtils.ts
// 🔧 Utilidades para importar clientes desde Excel
// ===============================
import * as XLSX from 'xlsx'

/**
 * Interface para cliente importado desde Excel
 */
export interface ClienteImportado {
  nombre: string
  ruc?: string
  direccion?: string
  telefono?: string
  correo?: string
}

/**
 * Lee clientes desde un archivo Excel
 * @param file - Archivo Excel a procesar
 * @returns Promise con array de clientes importados
 */
export async function leerClientesDesdeExcel(file: File): Promise<ClienteImportado[]> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  return json.map((row) => ({
    nombre: (typeof row['Nombre'] === 'string' ? row['Nombre'].trim() : String(row['Nombre'] || '').trim()) || '',
    ruc: row['RUC'] ? (typeof row['RUC'] === 'string' ? row['RUC'].trim() : String(row['RUC']).trim()) || undefined : undefined,
    direccion: row['Dirección'] ? (typeof row['Dirección'] === 'string' ? row['Dirección'].trim() : String(row['Dirección']).trim()) || undefined : undefined,
    telefono: row['Teléfono'] ? (typeof row['Teléfono'] === 'string' ? row['Teléfono'].trim() : String(row['Teléfono']).trim()) || undefined : undefined,
    correo: row['Correo'] ? (typeof row['Correo'] === 'string' ? row['Correo'].trim() : String(row['Correo']).trim()) || undefined : undefined
  }))
}

/**
 * Valida los clientes importados
 * @param clientes - Array de clientes a validar
 * @param existentes - Array de nombres de clientes existentes
 * @returns Objeto con clientes nuevos, errores y duplicados
 */
export function validarClientes(
  clientes: ClienteImportado[],
  existentes: string[]
): {
  nuevos: ClienteImportado[]
  errores: string[]
  duplicados: string[]
} {
  const nuevos: ClienteImportado[] = []
  const errores: string[] = []
  const duplicados: string[] = []

  for (const c of clientes) {
    // ✅ Validar nombre obligatorio
    if (!c.nombre) {
      errores.push('Cliente sin nombre válido.')
      continue
    }
    
    // ✅ Verificar duplicados
    if (existentes.includes(c.nombre)) {
      duplicados.push(c.nombre)
      continue
    }
    
    // ✅ Validar formato de RUC si está presente
    if (c.ruc && c.ruc.length !== 11) {
      errores.push(`RUC inválido para ${c.nombre}: debe tener 11 dígitos.`)
      continue
    }
    
    // ✅ Validar formato de correo si está presente
    if (c.correo && !isValidEmail(c.correo)) {
      errores.push(`Correo inválido para ${c.nombre}: ${c.correo}`)
      continue
    }
    
    nuevos.push(c)
  }

  return { nuevos, errores, duplicados }
}

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si es válido, false si no
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}