'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '@/lib/services/proveedor'
import { exportarProveedoresAExcel } from '@/lib/utils/proveedorExcel'
import { leerProveedoresDesdeExcel, validarProveedores } from '@/lib/utils/proveedorImportUtils'
import ProveedorModal from '@/components/logistica/ProveedorModal'
import ProveedorCardView from '@/components/logistica/ProveedorCardView'
import ProveedorTableView from '@/components/logistica/ProveedorTableView'
import ProveedorFilters, { ProveedorFilterState } from '@/components/logistica/ProveedorFilters'
import { BotonesImportExport } from '@/components/catalogo/BotonesImportExport'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Users, 
  Home, 
  ChevronRight, 
  Building2, 
  UserPlus,
  TrendingUp,
  Activity,
  Grid3X3,
  LayoutGrid,
  Plus,
  X
} from 'lucide-react'
import type { Proveedor, ProveedorPayload, ProveedorUpdatePayload } from '@/types'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<'cards' | 'tabla'>('tabla')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null)
  const [filtros, setFiltros] = useState<ProveedorFilterState>({
    busqueda: '',
    ruc: '',
    conDireccion: false,
    conTelefono: false,
    conCorreo: false
  })

  useEffect(() => {
    const loadProveedores = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProveedores()
        setProveedores(data)
      } catch (err) {
        setError('Error al cargar los proveedores')
        toast.error('Error al cargar los proveedores')
      } finally {
        setLoading(false)
      }
    }

    loadProveedores()
  }, [])

  const handleSaved = (proveedor: Proveedor) => {
    console.log('🎉 Proveedor guardado:', proveedor)
    if (proveedorEditando) {
      setProveedores(proveedores.map(p => p.id === proveedor.id ? proveedor : p))
    } else {
      setProveedores([...proveedores, proveedor])
    }
    // ✅ Reset editing state - modal will be closed by the modal component
    setProveedorEditando(null)
  }

  // ✅ Handle modal close - reset editing state
  const handleModalClose = (open: boolean) => {
    setModalAbierto(open)
    if (!open) {
      setProveedorEditando(null)
    }
  }

  const handleDelete = async (proveedor: Proveedor) => {
    try {
      await deleteProveedor(proveedor.id)
      setProveedores(proveedores.filter(p => p.id !== proveedor.id))
      toast.success(`Proveedor ${proveedor.nombre} eliminado exitosamente`)
    } catch (error) {
      toast.error('Error al eliminar el proveedor')
    }
  }

  const handleExportarExcel = async () => {
    try {
      await exportarProveedoresAExcel(proveedores)
      toast.success('Proveedores exportados exitosamente')
    } catch (error) {
      toast.error('Error al exportar proveedores')
    }
  }

  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0]
     if (!file) return
     
     try {
       setLoading(true)
       const proveedoresImportados = await leerProveedoresDesdeExcel(file)
       
       // Separar proveedores nuevos y existentes
       const nuevos: typeof proveedoresImportados = []
       const paraActualizar: Array<{proveedor: Proveedor, datos: typeof proveedoresImportados[0]}> = []
       const errores: string[] = []
       
       for (const proveedorImportado of proveedoresImportados) {
         // Validar nombre obligatorio
         if (!proveedorImportado.nombre) {
           errores.push('Proveedor sin nombre válido.')
           continue
         }
         
         // Validar formato de RUC si está presente
         if (proveedorImportado.ruc && proveedorImportado.ruc.length !== 11) {
           errores.push(`RUC inválido para ${proveedorImportado.nombre}: debe tener 11 dígitos.`)
           continue
         }
         
         // Validar formato de teléfono si está presente
         if (proveedorImportado.telefono && !/^[\+]?[0-9\(\)\-\s]{7,15}$/.test(proveedorImportado.telefono.trim())) {
           errores.push(`Teléfono inválido para ${proveedorImportado.nombre}: ${proveedorImportado.telefono}`)
           continue
         }
         
         // Validar formato de correo si está presente
         if (proveedorImportado.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorImportado.correo)) {
           errores.push(`Correo inválido para ${proveedorImportado.nombre}: ${proveedorImportado.correo}`)
           continue
         }
         
         // Buscar si el proveedor ya existe
         const proveedorExistente = proveedores.find(p => p.nombre.toLowerCase() === proveedorImportado.nombre.toLowerCase())
         
         if (proveedorExistente) {
           paraActualizar.push({ proveedor: proveedorExistente, datos: proveedorImportado })
         } else {
           nuevos.push(proveedorImportado)
         }
       }
       
       if (errores.length > 0) {
         toast.error(`Se encontraron ${errores.length} errores en el archivo`)
         errores.forEach(error => toast.error(error))
         return
       }
       
       let creados = 0
       let actualizados = 0
       
       // Crear proveedores nuevos
       for (const proveedorData of nuevos) {
         const nuevoProveedor = await createProveedor(proveedorData)
         if (nuevoProveedor) {
           setProveedores(prev => [...prev, nuevoProveedor])
           creados++
         }
       }
       
       // Actualizar proveedores existentes
       for (const { proveedor, datos } of paraActualizar) {
         const datosActualizacion: ProveedorUpdatePayload = {
           nombre: datos.nombre,
           ruc: datos.ruc || proveedor.ruc,
           direccion: datos.direccion || proveedor.direccion,
           telefono: datos.telefono || proveedor.telefono,
           correo: datos.correo || proveedor.correo
         }
         
         const proveedorActualizado = await updateProveedor(proveedor.id, datosActualizacion)
         if (proveedorActualizado) {
           setProveedores(prev => prev.map(p => p.id === proveedor.id ? proveedorActualizado : p))
           actualizados++
         }
       }
       
       const mensaje = []
       if (creados > 0) mensaje.push(`${creados} proveedores creados`)
       if (actualizados > 0) mensaje.push(`${actualizados} proveedores actualizados`)
       
       toast.success(mensaje.join(', '))
     } catch (error) {
       toast.error('Error al importar proveedores desde Excel')
     } finally {
       setLoading(false)
       // Reset input
       e.target.value = ''
     }
   }



  const handleNuevoProveedor = () => {
    setProveedorEditando(null)
    setModalAbierto(true)
  }

  // ✅ Función para abrir modal de edición de proveedor
  const handleEditarProveedor = (proveedor: Proveedor) => {
    setProveedorEditando(proveedor)
    setModalAbierto(true)
  }

  // 🔍 Filter providers based on current filters
  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter(proveedor => {
      // Text search in name
      if (filtros.busqueda && !proveedor.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
        return false;
      }
      
      // RUC search
      if (filtros.ruc && !proveedor.ruc?.toLowerCase().includes(filtros.ruc.toLowerCase())) {
        return false;
      }
      
      // Contact information filters
      if (filtros.conDireccion && (!proveedor.direccion || proveedor.direccion.trim() === '')) {
        return false;
      }
      
      if (filtros.conTelefono && (!proveedor.telefono || proveedor.telefono.trim() === '')) {
        return false;
      }
      
      if (filtros.conCorreo && (!proveedor.correo || proveedor.correo.trim() === '')) {
        return false;
      }
      
      return true;
    });
  }, [proveedores, filtros]);

  // 📊 Estadísticas rápidas
  const totalProveedores = proveedores.length
  const proveedoresConRuc = proveedores.filter(p => p.ruc).length

  return (
    <motion.div 
      className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <motion.nav 
          className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
          variants={itemVariants}
        >
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <ChevronRight className="h-4 w-4" />
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            Logística
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Proveedores</span>
        </motion.nav>

        {/* Header Section */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {proveedorEditando ? 'Editar Proveedor' : 'Gestión de Proveedores'}
              </h1>
              <p className="text-gray-600 mt-1">
                {proveedorEditando ? 'Modifica la información del proveedor' : 'Administra la base de datos de proveedores'}
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalProveedores}</div>
              <div className="text-sm text-gray-500">Total Proveedores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{proveedoresConRuc}</div>
              <div className="text-sm text-gray-500">Con RUC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalProveedores - proveedoresConRuc}</div>
              <div className="text-sm text-gray-500">Sin RUC</div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div variants={itemVariants}>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}



        {/* Providers List Section */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Lista de Proveedores
                  </CardTitle>
                  <CardDescription>
                    Gestiona todos los proveedores registrados en el sistema
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleNuevoProveedor}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Proveedor
                  </Button>
                  <BotonesImportExport
                     onExportar={handleExportarExcel}
                     onImportar={handleImportarExcel}
                     importando={loading}
                   />
                </div>
              </div>
            </CardHeader>
              <CardContent>
                {/* Filters Section */}
                <div className="mb-6">
                  <ProveedorFilters
                    filters={filtros}
                    onFiltersChange={setFiltros}
                    totalProveedores={proveedores.length}
                    proveedoresFiltrados={proveedoresFiltrados.length}
                  />
                </div>

                <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as 'cards' | 'tabla')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="cards" className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Cards
                    </TabsTrigger>
                    <TabsTrigger value="tabla" className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Tabla
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cards" className="mt-6">
                  <ProveedorCardView 
                    proveedores={proveedoresFiltrados}
                    onEdit={handleEditarProveedor}
                    onDelete={handleDelete}
                    isLoading={loading}
                  />
                </TabsContent>
                <TabsContent value="tabla" className="mt-6">
                  <ProveedorTableView 
                    proveedores={proveedoresFiltrados}
                    onEdit={handleEditarProveedor}
                    onDelete={handleDelete}
                    isLoading={loading}
                  />
                </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal para crear/editar proveedor */}
        <ProveedorModal
          open={modalAbierto}
          onOpenChange={handleModalClose}
          onSaved={handleSaved}
          proveedor={proveedorEditando}
        />
      </div>
    </motion.div>
  )
}
