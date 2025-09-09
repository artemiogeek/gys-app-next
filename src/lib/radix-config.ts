/**
 * 🔧 Configuración para Radix UI - Prevención de conflictos aria-hidden
 * 
 * Este archivo contiene configuraciones y utilidades para prevenir
 * los warnings de "Blocked aria-hidden" que ocurren cuando Radix UI
 * aplica aria-hidden a contenedores pero elementos focusables mantienen el foco.
 */

import { useEffect } from 'react'

// ✅ Configuración global para Radix UI
export const RADIX_CONFIG = {
  // Prevenir aria-hidden en elementos con foco
  preventAriaHiddenOnFocus: true,
  // Usar inert en lugar de aria-hidden cuando sea posible
  preferInert: true,
  // Configuración de portales
  portal: {
    // Contenedor específico para portales
    container: typeof document !== 'undefined' ? document.body : undefined,
  },
} as const

/**
 * 🔧 Hook para configurar Radix UI y prevenir conflictos de aria-hidden
 * 
 * Este hook debe ser usado en el layout principal de la aplicación
 * para configurar globalmente el comportamiento de Radix UI.
 */
export const useRadixConfig = () => {
  useEffect(() => {
    // 🚫 DESHABILITADO TEMPORALMENTE - Sistema de prevención completamente inactivo
    console.log('🔧 Radix Config: Sistema de prevención aria-hidden DESHABILITADO')
    
    // No hacer nada - permitir que Radix UI funcione sin interferencias
    return () => {
      // Cleanup vacío
    }
  }, [])
}

/**
 * 🔧 Utilidad para crear props seguros para componentes Radix
 * 
 * Esta función asegura que los componentes Radix no generen
 * conflictos de aria-hidden.
 */
export function createSafeRadixProps<T extends Record<string, any>>(props: T): T {
  return {
    ...props,
    // ✅ Configurar portal para evitar conflictos
    ...(props.container === undefined && {
      container: RADIX_CONFIG.portal.container,
    }),
  }
}

/**
 * 🔧 Configuración específica para DropdownMenu
 */
export const DROPDOWN_MENU_CONFIG = {
  // ✅ Configuración para contenido del dropdown
  content: {
    sideOffset: 4,
    align: 'start' as const,
  },
  // ✅ Configuración para portal del dropdown
  portal: {
    container: typeof document !== 'undefined' ? document.body : undefined,
  },
} as const

/**
 * 🔧 Configuración específica para Dialog
 */
export const DIALOG_CONFIG = {
  // ✅ Configuración mínima para evitar errores
  content: {},
  portal: {
    container: typeof document !== 'undefined' ? document.body : undefined,
  },
} as const

/**
 * Limpia conflictos de aria-hidden en componentes de Radix UI
 * Versión mínima que solo actúa en casos críticos
 */
export function cleanupAriaHiddenConflicts(): void {
  // 🎯 Solo buscar dialogs activos con problemas
  const activeDialogs = document.querySelectorAll('[data-radix-dialog-content][data-state="open"]')
  
  activeDialogs.forEach((dialog) => {
    const container = dialog.closest('[data-radix-portal]')
    if (container?.getAttribute('aria-hidden') === 'true') {
      console.warn('🚨 Radix Config: Removing aria-hidden from active dialog container')
      container.removeAttribute('aria-hidden')
    }
  })
}

/**
 * 🔧 Función de utilidad para verificar si un elemento está en conflicto
 */
export function hasAriaHiddenConflict(element: Element): boolean {
  const activeElement = document.activeElement
  return !!(activeElement && 
           element.getAttribute('aria-hidden') === 'true' && 
           element.contains(activeElement))
}

/**
 * 🔧 Función para aplicar configuración segura a componentes Radix
 */
export function applySafeRadixConfig(element: Element) {
  if (hasAriaHiddenConflict(element)) {
    element.removeAttribute('aria-hidden')
    console.warn('🔧 Applied safe Radix config to:', element)
  }
}