// ===============================
// 📁 proveedorExcel.ts
// 🔧 Utilidades para exportar proveedores a Excel
// ===============================
import * as XLSX from 'xlsx'
import { Proveedor } from '@/types'

/**
 * Exporta la lista de proveedores a un archivo Excel
 * @param proveedores - Array de proveedores a exportar
 */
export function exportarProveedoresAExcel(proveedores: Proveedor[]) {
  // ✅ Mapear datos para Excel con campos relevantes
  const data = proveedores.map((p) => ({
    Nombre: p.nombre,
    RUC: p.ruc || '',
    Dirección: p.direccion || '',
    Teléfono: p.telefono || '',
    Correo: p.correo || ''
  }))
  
  // ✅ Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // ✅ Configurar ancho de columnas para mejor visualización
  const columnWidths = [
    { wch: 30 }, // Nombre
    { wch: 15 }, // RUC
    { wch: 40 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }  // Correo
  ]
  worksheet['!cols'] = columnWidths
  
  // ✅ Crear libro de trabajo y agregar hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores')
  
  // ✅ Generar nombre de archivo con timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `proveedores_${timestamp}.xlsx`
  
  // ✅ Descargar archivo
  XLSX.writeFile(workbook, filename)
}