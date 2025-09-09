/**
 * 🧪 Configuración Global de Testing
 * 
 * Setup inicial para Jest/Vitest con mocks, fixtures y utilidades
 * globales para el sistema GYS.
 * 
 * @author TRAE - Agente Senior Fullstack
 * @version 1.0.0
 */

import React from 'react'
import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// 🌍 Hacer React disponible globalmente para JSX
global.React = React

// 🎭 Importar mocks y fixtures
import { setupDefaultMocks, mockUtils } from './__mocks__/services'
import { testConfig } from './__mocks__/fixtures'

// 🌐 Configuración global de fetch
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'fetch', {
    writable: true,
    value: vi.fn()
  })
} else {
  global.fetch = vi.fn()
}

// 📱 Mock de APIs del navegador
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
} else {
  global.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
}

// 🖼️ Mock de IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// 📏 Mock de ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// 🔊 Mock de HTMLMediaElement
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve())
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn()
})

// 📍 Mock de geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: -12.0464,
          longitude: -77.0428,
          accuracy: 100
        }
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }
})

// 📋 Mock de clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve('mocked text'))
  }
})

// 🗄️ Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock
})

// 🍪 Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: sessionStorageMock
})

// 🌐 Mock de URL y URLSearchParams
Object.defineProperty(window, 'URL', {
  writable: true,
  value: class MockURL {
    constructor(public href: string, public base?: string) {}
    toString() { return this.href }
  }
})

// 📁 Mock de File y FileReader
Object.defineProperty(window, 'File', {
  writable: true,
  value: class MockFile {
    constructor(
      public name: string,
      public size: number = 1024,
      public type: string = 'application/pdf'
    ) {}
  }
})

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    result: string | ArrayBuffer | null = null
    error: any = null
    readyState: number = 0
    
    onload: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null
    onprogress: ((event: any) => void) | null = null
    
    readAsDataURL(file: any) {
      setTimeout(() => {
        this.result = `data:${file.type};base64,mockbase64data`
        this.readyState = 2
        if (this.onload) {
          this.onload({ target: this })
        }
      }, 10)
    }
    
    readAsText(file: any) {
      setTimeout(() => {
        this.result = 'mock file content'
        this.readyState = 2
        if (this.onload) {
          this.onload({ target: this })
        }
      }, 10)
    }
    
    abort() {
      this.readyState = 0
    }
  }
})

// 🎨 Mock de Canvas
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn()
  })
})

// 🔔 Mock de Notification
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: class MockNotification {
    static permission = 'granted'
    static requestPermission = vi.fn().mockResolvedValue('granted')
    
    constructor(public title: string, public options?: any) {}
    
    close = vi.fn()
    onclick: ((event: Event) => void) | null = null
    onshow: ((event: Event) => void) | null = null
    onclose: ((event: Event) => void) | null = null
    onerror: ((event: Event) => void) | null = null
  }
})

// 🌐 Configuración de variables de entorno para testing
// ✅ Configuración simplificada para evitar errores
// NODE_ENV es establecido automáticamente por el test runner
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/gys_test'

// 🎯 Configuración de timeouts
vi.setConfig({
  testTimeout: testConfig.timeouts.long,
  hookTimeout: testConfig.timeouts.medium
})

// 🔧 Setup global antes de todos los tests
beforeAll(async () => {
  // 🎭 Configurar mocks por defecto
  setupDefaultMocks()
  
  // 🗄️ Configurar localStorage con datos iniciales
  localStorageMock.getItem.mockImplementation((key: string) => {
    const mockData: Record<string, string> = {
      'gys-theme': 'light',
      'gys-language': 'es',
      'gys-user-preferences': JSON.stringify({
        itemsPerPage: 10,
        defaultCurrency: 'USD'
      })
    }
    return mockData[key] || null
  })
  
  // 🍪 Configurar sessionStorage
  sessionStorageMock.getItem.mockImplementation((key: string) => {
    const mockData: Record<string, string> = {
      'gys-session-data': JSON.stringify({
        lastActivity: Date.now(),
        currentModule: 'finanzas'
      })
    }
    return mockData[key] || null
  })
  
  console.log('🧪 Test environment initialized')
})

// 🔄 Setup antes de cada test
beforeEach(() => {
  // 🧹 Limpiar mocks
  mockUtils.resetAllMocks()
  
  // 🎭 Resetear mocks del DOM
  vi.clearAllTimers()
  vi.useRealTimers()
  
  // 🗄️ Limpiar storage mocks
  localStorageMock.clear.mockClear()
  sessionStorageMock.clear.mockClear()
  
  // 🌐 Resetear fetch mock
  if (window.fetch && vi.isMockFunction(window.fetch)) {
    (window.fetch as any).mockClear()
  }
})

// 🧹 Cleanup después de cada test
afterEach(() => {
  // 🧹 Limpiar DOM
  cleanup()
  
  // 🔄 Restaurar timers
  vi.useRealTimers()
  
  // 🗑️ Limpiar console mocks si existen
  if (vi.isMockFunction(console.error)) {
    (console.error as any).mockRestore()
  }
  if (vi.isMockFunction(console.warn)) {
    (console.warn as any).mockRestore()
  }
})

// 🏁 Cleanup final después de todos los tests
afterAll(() => {
  // 🧹 Limpiar todos los mocks
  vi.clearAllMocks()
  vi.resetAllMocks()
  
  console.log('🧪 Test environment cleaned up')
})

// 🛠️ Utilidades globales para tests
declare global {
  var testUtils: {
    // 🎭 Mock helpers
    mockConsole: () => {
      error: ReturnType<typeof vi.spyOn>
      warn: ReturnType<typeof vi.spyOn>
      log: ReturnType<typeof vi.spyOn>
    }
    
    // ⏱️ Timer helpers
    advanceTimers: (ms: number) => void
    runAllTimers: () => void
    
    // 🌐 Network helpers
    mockNetworkError: () => void
    mockSlowNetwork: (delay?: number) => void
    
    // 📱 Device helpers
    mockMobileDevice: () => void
    mockDesktopDevice: () => void
    
    // 🔐 Auth helpers
    mockAuthenticatedUser: (role?: string) => void
    mockUnauthenticatedUser: () => void
    
    // 📊 Data helpers
    generateMockId: () => string
    generateMockEmail: () => string
    generateMockDate: (daysFromNow?: number) => Date
  }
}

// 🌍 Implementar utilidades globales
global.testUtils = {
  // 🎭 Mock console methods
  mockConsole: () => ({
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {})
  }),
  
  // ⏱️ Timer utilities
  advanceTimers: (ms: number) => {
    vi.useFakeTimers()
    vi.advanceTimersByTime(ms)
  },
  
  runAllTimers: () => {
    vi.useFakeTimers()
    vi.runAllTimers()
  },
  
  // 🌐 Network simulation
  mockNetworkError: () => {
    if (window.fetch && vi.isMockFunction(window.fetch)) {
      (window.fetch as any).mockRejectedValueOnce(new Error('Network Error'))
    }
  },
  
  mockSlowNetwork: (delay = 3000) => {
    if (window.fetch && vi.isMockFunction(window.fetch)) {
      (window.fetch as any).mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, data: [] })
          }), delay)
        )
      )
    }
  },
  
  // 📱 Device simulation
  mockMobileDevice: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  mockDesktopDevice: () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    })
    window.dispatchEvent(new Event('resize'))
  },
  
  // 🔐 Authentication helpers
  mockAuthenticatedUser: (role = 'ADMIN') => {
    mockUtils.mockUserRole(role)
  },
  
  mockUnauthenticatedUser: () => {
    // Mock será implementado cuando se importe el servicio de auth
  },
  
  // 📊 Data generation helpers
  generateMockId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  generateMockEmail: () => `test-${Date.now()}@gys.com`,
  
  generateMockDate: (daysFromNow = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date
  }
}

// 🎯 Configuración específica para diferentes tipos de test
export const testConfigurations = {
  // 🧪 Tests unitarios
  unit: {
    timeout: testConfig.timeouts.short,
    retries: 0,
    concurrent: true
  },
  
  // 🔗 Tests de integración
  integration: {
    timeout: testConfig.timeouts.medium,
    retries: 1,
    concurrent: false
  },
  
  // 🎭 Tests E2E
  e2e: {
    timeout: testConfig.timeouts.long,
    retries: 2,
    concurrent: false
  }
}

// 🎨 Helpers para testing de componentes React
export const reactTestHelpers = {
  /**
   * 🎯 Esperar a que un elemento aparezca
   */
  waitForElement: async (getByTestId: any, testId: string, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const checkElement = () => {
        try {
          const element = getByTestId(testId)
          if (element) {
            resolve(element)
            return
          }
        } catch (error) {
          // Element not found yet
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`))
          return
        }
        
        setTimeout(checkElement, 100)
      }
      checkElement()
    })
  },
  
  /**
   * 🔄 Simular cambio en input
   */
  changeInput: async (element: HTMLElement, value: string) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(element, { target: { value } })
    fireEvent.blur(element)
  },
  
  /**
   * 📝 Simular envío de formulario
   */
  submitForm: async (form: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.submit(form)
  }
}

export default {
  testConfigurations,
  reactTestHelpers
}