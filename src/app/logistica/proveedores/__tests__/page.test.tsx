// ===================================================
// 📁 Archivo: page.test.tsx
// 📌 Ubicación: src/app/logistica/proveedores/__tests__/page.test.tsx
// 🔧 Descripción: Tests para la página de proveedores con modal
// 🧠 Uso: Testing con Jest y React Testing Library
// ✍️ Autor: Senior Fullstack Developer
// 📅 Última actualización: 2025-01-15
// ===================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ProveedoresPage from '../page'
import * as proveedorService from '@/services/proveedor'
import type { Proveedor } from '@/types/proveedor'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock proveedor service
vi.mock('@/services/proveedor', () => ({
  getProveedores: vi.fn(),
  createProveedor: vi.fn(),
  updateProveedor: vi.fn(),
  deleteProveedor: vi.fn(),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

// ✅ Mock components
vi.mock('@/components/logistica/ProveedorCardView', () => ({
  default: ({ proveedores, onEdit, onDelete }: any) => (
    <div data-testid="card-view">
      {proveedores.map((proveedor: any) => (
        <div key={proveedor.id} data-testid={`provider-card-${proveedor.id}`}>
          <span>{proveedor.nombre}</span>
          <button onClick={() => onEdit(proveedor)}>Edit</button>
          <button onClick={() => onDelete(proveedor.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/logistica/ProveedorTableView', () => ({
  default: ({ proveedores, onEdit, onDelete }: any) => (
    <div data-testid="table-view">
      {proveedores.map((proveedor: any) => (
        <div key={proveedor.id} data-testid={`provider-row-${proveedor.id}`}>
          <span>{proveedor.nombre}</span>
          <button onClick={() => onEdit(proveedor)}>Edit</button>
          <button onClick={() => onDelete(proveedor.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/logistica/ProveedorModal', () => ({
  default: ({ open, onOpenChange, onSaved, initial }: any) => {
    if (!open) return null
    return (
      <div data-testid="provider-modal">
        <h2>{initial ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <button onClick={() => onOpenChange(false)}>Close</button>
        <button 
          onClick={() => {
            const mockProvider = {
              id: initial?.id || 'new-id',
              nombre: 'Test Provider',
              ruc: '12345678901',
              direccion: 'Test Address',
              telefono: '999888777',
              correo: 'test@test.com'
            }
            onSaved(mockProvider)
          }}
        >
          Save
        </button>
      </div>
    )
  },
}))

describe('ProveedoresPage', () => {
  const mockPush = vi.fn()
  const mockProveedores: Proveedor[] = [
    {
      id: '1',
      nombre: 'Proveedor A',
      ruc: '12345678901',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      nombre: 'Proveedor B',
      ruc: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
    ;(proveedorService.getProveedores as any).mockResolvedValue(mockProveedores)
  })

  describe('Page Rendering', () => {
    it('should render the page title', () => {
      render(<ProveedoresPage />)
      expect(screen.getByText('Proveedores')).toBeInTheDocument()
    })

    it('should render the add provider button', async () => {
      render(<ProveedoresPage />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Agregar Proveedor/ })).toBeInTheDocument()
      })
    })

    it('should render search input', () => {
      render(<ProveedoresPage />)
      expect(screen.getByPlaceholderText(/Buscar proveedores/)).toBeInTheDocument()
    })

    it('should render view toggle tabs', () => {
      render(<ProveedoresPage />)
      expect(screen.getByRole('tab', { name: /Tarjetas/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Tabla/ })).toBeInTheDocument()
    })

    it('should load and display providers', async () => {
      render(<ProveedoresPage />)
      await waitFor(() => {
        expect(screen.getByText('Proveedor Test 1')).toBeInTheDocument()
        expect(screen.getByText('Proveedor Test 2')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should open modal when "Agregar Proveedor" button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProveedoresPage />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Agregar Proveedor/ })).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /Agregar Proveedor/ })
      await user.click(addButton)
      
      expect(screen.getByTestId('provider-modal')).toBeInTheDocument()
      expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProveedoresPage />)
      
      // ✅ Open modal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Agregar Proveedor/ })).toBeInTheDocument()
      })
      
      const addButton = screen.getByRole('button', { name: /Agregar Proveedor/ })
      await user.click(addButton)
      
      expect(screen.getByTestId('provider-modal')).toBeInTheDocument()
      
      // ✅ Close modal
      const closeButton = screen.getByText('Close')
      await user.click(closeButton)
      
      expect(screen.queryByTestId('provider-modal')).not.toBeInTheDocument()
    })

    it('should open modal for editing when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProveedoresPage />)
      
      await waitFor(() => {
        expect(screen.getByTestId('provider-card-1')).toBeInTheDocument()
      })
      
      const editButton = screen.getAllByText('Edit')[0]
      await user.click(editButton)
      
      expect(screen.getByTestId('provider-modal')).toBeInTheDocument()
      expect(screen.getByText('Editar Proveedor')).toBeInTheDocument()
    })

    it('should add new provider to list when saved', async () => {
      const user = userEvent.setup()
      render(<ProveedoresPage />)
      
      // ✅ Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Agregar Proveedor/ })).toBeInTheDocument()
      })
      
      // ✅ Open modal and save
      const addButton = screen.getByRole('button', { name: /Agregar Proveedor/ })
      await user.click(addButton)
      
      const saveButton = screen.getByText('Save')
      await user.click(saveButton)
      
      // ✅ Verify provider was added (mock returns 'Test Provider')
      await waitFor(() => {
        expect(screen.getByText('Test Provider')).toBeInTheDocument()
      })
    })
  })

  it('renders page with correct title and breadcrumb', async () => {
    render(<ProveedoresPage />)
    
    expect(screen.getByText('Gestión de Proveedores')).toBeInTheDocument()
    expect(screen.getByText('Administra y organiza tu base de proveedores')).toBeInTheDocument()
    expect(screen.getByText('Logística')).toBeInTheDocument()
    expect(screen.getByText('Proveedores')).toBeInTheDocument()
  })

  it('loads and displays proveedores on mount', async () => {
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(proveedorService.getProveedores).toHaveBeenCalled()
    })
    
    expect(screen.getByTestId('proveedor-list')).toBeInTheDocument()
  })

  it('displays statistics cards correctly', async () => {
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Proveedores')).toBeInTheDocument()
      expect(screen.getByText('Con RUC')).toBeInTheDocument()
      expect(screen.getByText('Sin RUC')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Total
      expect(screen.getByText('1')).toBeInTheDocument() // Con RUC
      expect(screen.getByText('1')).toBeInTheDocument() // Sin RUC
    })
  })

  it('shows loading skeleton initially', () => {
    render(<ProveedoresPage />)
    
    // Should show loading state initially
    expect(screen.getByText('Loading list...')).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    const newProveedor = {
      id: '3',
      nombre: 'Test Provider',
      ruc: '12345678901',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    ;(proveedorService.createProveedor as any).mockResolvedValue(newProveedor)
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-form')).toBeInTheDocument()
    })
    
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(proveedorService.createProveedor).toHaveBeenCalledWith({
        nombre: 'Test Provider',
        ruc: '12345678901',
      })
      expect(toast.success).toHaveBeenCalledWith('Proveedor creado exitosamente')
    })
  })

  it('handles form submission error', async () => {
    ;(proveedorService.createProveedor as any).mockRejectedValue(new Error('Server error'))
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-form')).toBeInTheDocument()
    })
    
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al crear proveedor')
    })
  })

  it('handles proveedor update successfully', async () => {
    const updatedProveedor = { ...mockProveedores[0], nombre: 'Updated' }
    ;(proveedorService.updateProveedor as any).mockResolvedValue(updatedProveedor)
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-1')).toBeInTheDocument()
    })
    
    const updateButton = screen.getByText('Update')
    fireEvent.click(updateButton)
    
    await waitFor(() => {
      expect(proveedorService.updateProveedor).toHaveBeenCalledWith('1', { nombre: 'Updated' })
      expect(toast.success).toHaveBeenCalledWith('Proveedor actualizado exitosamente')
    })
  })

  it('handles proveedor update error', async () => {
    ;(proveedorService.updateProveedor as any).mockRejectedValue(new Error('Server error'))
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-1')).toBeInTheDocument()
    })
    
    const updateButton = screen.getByText('Update')
    fireEvent.click(updateButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar proveedor')
    })
  })

  it('handles proveedor deletion successfully', async () => {
    ;(proveedorService.deleteProveedor as any).mockResolvedValue(undefined)
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-1')).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(proveedorService.deleteProveedor).toHaveBeenCalledWith('1')
      expect(toast.success).toHaveBeenCalledWith('Proveedor eliminado exitosamente')
    })
  })

  it('handles proveedor deletion error', async () => {
    ;(proveedorService.deleteProveedor as any).mockRejectedValue(new Error('Server error'))
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-1')).toBeInTheDocument()
    })
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al eliminar proveedor')
    })
  })

  it('handles initial data loading error', async () => {
    ;(proveedorService.getProveedores as any).mockRejectedValue(new Error('Server error'))
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al cargar proveedores')
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(proveedorService.getProveedores).toHaveBeenCalledTimes(1)
    })
    
    const refreshButton = screen.getByRole('button', { name: /actualizar/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(proveedorService.getProveedores).toHaveBeenCalledTimes(2)
    })
  })

  it('navigates to logistica when breadcrumb is clicked', () => {
    render(<ProveedoresPage />)
    
    const logisticaLink = screen.getByText('Logística')
    fireEvent.click(logisticaLink)
    
    expect(mockPush).toHaveBeenCalledWith('/logistica')
  })

  it('shows correct statistics for empty data', async () => {
    ;(proveedorService.getProveedores as any).mockResolvedValue([])
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 for all stats
    })
  })

  it('updates statistics after adding a proveedor', async () => {
    const newProveedor = {
      id: '3',
      nombre: 'Test Provider',
      ruc: '12345678901',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    ;(proveedorService.createProveedor as any).mockResolvedValue(newProveedor)
    
    render(<ProveedoresPage />)
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Initial total
    })
    
    const submitButton = screen.getByText('Submit Form')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      // Should refresh data and update statistics
      expect(proveedorService.getProveedores).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle provider creation', async () => {
    const user = userEvent.setup()
    
    render(<ProveedoresPage />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading list...')).not.toBeInTheDocument()
    })
    
    // Click new provider button
    const newButton = screen.getByRole('button', { name: /Agregar Proveedor/i })
    await user.click(newButton)
    
    // Modal should open
    expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument()
  })

  it('should reset editing state when modal closes', async () => {
    const user = userEvent.setup()
    
    render(<ProveedoresPage />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading list...')).not.toBeInTheDocument()
    })
    
    // Click new provider button to open modal
    const newButton = screen.getByRole('button', { name: /Agregar Proveedor/i })
    await user.click(newButton)
    
    // Modal should open
    expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument()
    
    // Close modal
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByText('Nuevo Proveedor')).not.toBeInTheDocument()
    })
    
    // Open modal again - should still work (not frozen)
    await user.click(newButton)
    expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument()
  })
})