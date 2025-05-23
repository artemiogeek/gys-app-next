import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const data = await prisma.recurso.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error al actualizar recurso:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await prisma.recurso.delete({
      where: { id: params.id },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error al eliminar recurso:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
