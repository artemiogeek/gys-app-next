'use client'

import React from 'react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  showIcon?: boolean
}

export default function LogoutButton({ className, showIcon = true, ...props }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ✅ Función para manejar el logout con mejor manejo de errores
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      setOpen(false)
      
      // 🔧 Configuración mejorada para NextAuth signOut
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Error al cerrar sesión. Intenta nuevamente.')
      
      // 🔁 Fallback: redirigir manualmente si signOut falla
      window.location.href = '/login'
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={className || 'w-full mt-6 flex items-center gap-2 justify-center'}
          disabled={isLoading}
          {...props}
        >
          {showIcon && <LogOut size={16} className="text-gray-600" />}
          <span>{isLoading ? 'Cerrando...' : 'Cerrar sesión'}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Deseas cerrar sesión?</DialogTitle>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
