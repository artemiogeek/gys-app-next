// ===================================================
// 📁 Archivo: create-admin-user.js
// 📌 Ubicación: root/
// 🔧 Descripción: Script para crear usuario administrador
//
// 🧠 Uso: Crear usuario admin para pruebas
// ✍️ Autor: Senior Fullstack Developer
// 📅 Última actualización: 2025-01-15
// ===================================================

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...')
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Crear o actualizar usuario admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'jesus.m@gyscontrol.com' },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Jesus Martinez'
      },
      create: {
        email: 'jesus.m@gyscontrol.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Jesus Martinez',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Usuario administrador creado exitosamente:')
    console.log('📧 Email: jesus.m@gyscontrol.com')
    console.log('🔑 Password: 123456')
    console.log('👤 Role:', adminUser.role)
    console.log('🆔 ID:', adminUser.id)
    
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
createAdminUser()
  .then(() => {
    console.log('🎉 Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error)
    process.exit(1)
  })