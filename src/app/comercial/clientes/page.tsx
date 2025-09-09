'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getClientes, createCliente, deleteCliente } from '@/lib/services/cliente'

import ClienteCardView from '@/components/clientes/ClienteCardView'
import ClienteTableView from '@/components/clientes/ClienteTableView'
import { BotonesImportExport } from '@/components/catalogo/BotonesImportExport'
import ClienteModal from '@/components/clientes/ClienteModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Users, 
  Home, 
  ChevronRight, 
  Building2, 

  TrendingUp,
  Activity,
  LayoutGrid,
  Table,
  Plus,
  Edit
} from 'lucide-react'
import type { Cliente } from '@/types'
import { exportarClientesAExcel } from '@/lib/utils/clienteExcel'
import { leerClientesDesdeExcel, validarClientes } from '@/lib/utils/clienteImportUtils'

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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<'cards' | 'tabla'>('tabla')
  
  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null)

  useEffect(() => {
    const loadClientes = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getClientes()
        setClientes(data)
      } catch (err) {
        setError('Error al cargar los clientes')
        toast.error('Error al cargar los clientes')
      } finally {
        setLoading(false)
      }
    }

    loadClientes()
  }, [])



  const handleDelete = async (id: string) => {
    try {
      // ✅ Llamar al servicio de eliminación primero
      await deleteCliente(id)
      // ✅ Solo actualizar el estado local si la eliminación fue exitosa
      setClientes(clientes.filter(c => c.id !== id))
      toast.success('Cliente eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      toast.error('Error al eliminar el cliente')
    }
  }

  // 📊 Excel export handler
  const handleExportarExcel = () => {
    try {
      exportarClientesAExcel(clientes)
      toast.success('Clientes exportados a Excel correctamente')
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al exportar clientes a Excel')
    }
  }

  // 📥 Excel import handler
  const handleImportarExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const clientesImportados = await leerClientesDesdeExcel(file)
      const { nuevos, errores, duplicados } = validarClientes(clientesImportados, clientes.map(c => c.nombre))

      if (errores.length > 0) {
        toast.error(`Se encontraron ${errores.length} errores en el archivo`)
        errores.forEach(error => toast.error(error))
        return
      }

      if (duplicados.length > 0) {
        toast.warning(`Se encontraron ${duplicados.length} clientes duplicados que no se importarán`)
        duplicados.forEach(nombre => toast.warning(`Cliente duplicado: ${nombre}`))
      }

      // Create clients in batch
      for (const clienteData of nuevos) {
        const nuevoCliente = await createCliente(clienteData)
        if (nuevoCliente) {
          setClientes(prev => [...prev, nuevoCliente])
        }
      }

      toast.success(`${nuevos.length} clientes importados correctamente`)
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al procesar el archivo Excel')
    } finally {
      setLoading(false)
      // Reset input value
      if (event.target) {
        event.target.value = ''
      }
    }
  }



  // Funciones para el modal
  const handleAbrirModalCrear = () => {
    setClienteParaEditar(null)
    setModalAbierto(true)
  }

  const handleAbrirModalEditar = (cliente: Cliente) => {
    setClienteParaEditar(cliente)
    setModalAbierto(true)
  }

  const handleCerrarModal = () => {
    setModalAbierto(false)
    setClienteParaEditar(null)
  }

  const handleClienteGuardado = async () => {
    try {
      // No usar setLoading(true) aquí para evitar bloquear la UI
      const data = await getClientes()
      setClientes(data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los clientes')
      toast.error('Error al cargar los clientes')
    }
  }

  // Calculate statistics
  const totalClientes = clientes.length
  const clientesConRuc = clientes.filter(c => c.ruc).length
  const clientesConCorreo = clientes.filter(c => c.correo).length

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
            Comercial
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Clientes</span>
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
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra la base de datos de clientes
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleAbrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalClientes}</div>
              <div className="text-sm text-gray-500">Total Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{clientesConRuc}</div>
              <div className="text-sm text-gray-500">Con RUC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{clientesConCorreo}</div>
              <div className="text-sm text-gray-500">Con Email</div>
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

        <div className="grid grid-cols-1 gap-6">


          {/* Clients List Section */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Lista de Clientes
                    </CardTitle>
                    <CardDescription>
                      Gestiona todos los clientes registrados en el sistema
                    </CardDescription>
                  </div>
                  <BotonesImportExport
                    onExportar={handleExportarExcel}
                    onImportar={handleImportarExcel}
                    importando={loading}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={vistaActual} onValueChange={(value) => setVistaActual(value as 'cards' | 'tabla')} className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-fit grid-cols-2">
                      <TabsTrigger value="tabla" className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        Tabla
                      </TabsTrigger>
                      <TabsTrigger value="cards" className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Cards
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="tabla" className="mt-0">
                    <ClienteTableView
                      clientes={clientes}
                      onEdit={handleAbrirModalEditar}
                      onDelete={(cliente) => handleDelete(cliente.id)}
                      isLoading={loading}
                    />
                  </TabsContent>
                  
                  <TabsContent value="cards" className="mt-0">
                    <ClienteCardView
                      clientes={clientes}
                      onDeleted={handleDelete}
                      onEdit={handleAbrirModalEditar}
                      loading={loading}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Modal para crear/editar clientes */}
        <ClienteModal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          cliente={clienteParaEditar}
          onSaved={handleClienteGuardado}
        />
      </div>
    </motion.div>
  )
}
