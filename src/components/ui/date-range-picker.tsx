// ===================================================
// 📁 Archivo: date-range-picker.tsx
// 📌 Ubicación: src/components/ui/date-range-picker.tsx
// 🔧 Descripción: Componente de selección de rango de fechas
//
// 🧠 Uso: Permite seleccionar un rango de fechas para filtros
// ✍️ Autor: Sistema GYS
// 📅 Última actualización: 2025-01-20
// ===================================================

'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerWithRangeProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = 'Seleccionar fechas',
  className
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: es })} -{' '}
                  {format(date.to, 'dd/MM/yyyy', { locale: es })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: es })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
