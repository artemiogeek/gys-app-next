// ===================================================
// 📁 Archivo: ProveedorForm.test.tsx
// 📌 Ubicación: src/components/logistica/__tests__/
// 🔧 Descripción: Tests para el formulario de proveedores
// ✍️ Autor: Senior Fullstack Developer
// 📅 Última actualización: 2025-01-15
// ===================================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import ProveedorForm from '../ProveedorForm'
import type { Proveedor } from '@/types/modelos'

// Mock fetch globally
global.fetch = jest.fn()

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}))

describe('ProveedorForm', () => {
  const mockOnSaved = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const defaultProps = {
    onSaved: mockOnSaved,
  }

  it('renders form with all required fields', () => {
    render(<ProveedorForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/nombre del proveedor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ruc/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear proveedor/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<ProveedorForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /crear proveedor/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockResponse: Proveedor = {
      id: '1',
      nombre: 'Test Provider',
      ruc: '12345678901',
      direccion: 'Av. Test 123',
      telefono: '+51 1 234-5678',
      correo: 'test@provider.com',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<ProveedorForm {...defaultProps} />)
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/nombre del proveedor/i), {
      target: { value: 'Test Provider' }
    })
    fireEvent.change(screen.getByLabelText(/ruc/i), {
      target: { value: '12345678901' }
    })
    fireEvent.change(screen.getByLabelText(/dirección/i), {
      target: { value: 'Av. Test 123' }
    })
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '+51 1 234-5678' }
    })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@provider.com' }
    })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear proveedor/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/proveedor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Test Provider',
          ruc: '12345678901',
          direccion: 'Av. Test 123',
          telefono: '+51 1 234-5678',
          correo: 'test@provider.com'
        }),
      })
    })

    expect(mockOnSaved).toHaveBeenCalledWith(mockResponse)
    expect(toast.success).toHaveBeenCalledWith('Proveedor creado exitosamente')
  })

  it('handles optional fields correctly', async () => {
    const mockResponse: Proveedor = {
      id: '1',
      nombre: 'Minimal Provider',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<ProveedorForm {...defaultProps} />)
    
    // Fill only required field
    fireEvent.change(screen.getByLabelText(/nombre del proveedor/i), {
      target: { value: 'Minimal Provider' }
    })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /crear proveedor/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/proveedor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Minimal Provider',
          ruc: undefined,
          direccion: undefined,
          telefono: undefined,
          correo: undefined
        }),
      })
    })

    expect(mockOnSaved).toHaveBeenCalledWith(mockResponse)
  })
})