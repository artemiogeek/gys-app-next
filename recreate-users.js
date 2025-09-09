/**
 * Script para recrear usuarios del sistema GYS
 * Elimina todos los usuarios existentes y crea nuevos usuarios de prueba
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ✅ Definición de usuarios por rol
const usersData = [
  {
    email: 'admin@gyscontrol.com',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: 'admin'
  },
  {
    email: 'gerente@gyscontrol.com', 
    password: 'gerente123',
    nombre: 'Carlos',
    apellido: 'Gerente',
    rol: 'gerente'
  },
  {
    email: 'gestor@gyscontrol.com',
    password: 'gestor123', 
    nombre: 'Ana',
    apellido: 'Gestora',
    rol: 'gestor'
  },
  {
    email: 'comercial@gyscontrol.com',
    password: 'comercial123',
    nombre: 'Luis',
    apellido: 'Comercial',
    rol: 'comercial'
  },
  {
    email: 'presupuestos@gyscontrol.com',
    password: 'presupuestos123',
    nombre: 'María',
    apellido: 'Presupuestos',
    rol: 'presupuestos'
  },
  {
    email: 'proyectos@gyscontrol.com',
    password: 'proyectos123',
    nombre: 'Roberto',
    apellido: 'Proyectos', 
    rol: 'proyectos'
  },
  {
    email: 'coordinador@gyscontrol.com',
    password: 'coordinador123',
    nombre: 'Elena',
    apellido: 'Coordinadora',
    rol: 'coordinador'
  },
  {
    email: 'logistico@gyscontrol.com',
    password: 'logistico123',
    nombre: 'Pedro',
    apellido: 'Logístico',
    rol: 'logistico'
  },
  {
    email: 'colaborador@gyscontrol.com',
    password: 'colaborador123',
    nombre: 'Sofia',
    apellido: 'Colaboradora',
    rol: 'colaborador'
  }
];

async function recreateUsers() {
  try {
    console.log('🗑️  Eliminando usuarios existentes...');
    
    // 🔁 Eliminar todos los usuarios existentes
    const deletedCount = await prisma.user.deleteMany({});
    console.log(`✅ Eliminados ${deletedCount.count} usuarios existentes`);
    
    console.log('\n👥 Creando nuevos usuarios...');
    
    const createdUsers = [];
    
    // 🔁 Crear cada usuario con contraseña hasheada
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: `${userData.nombre} ${userData.apellido}`,
          role: userData.rol
        }
      });
      
      createdUsers.push({
        id: user.id,
        email: user.email,
        nombre: user.name,
        rol: user.role,
        password: userData.password // ⚠️ Solo para mostrar, no se guarda en BD
      });
      
      console.log(`✅ Usuario creado: ${user.email} (${user.rol})`);
    }
    
    console.log('\n📋 RESUMEN DE USUARIOS RECREADOS:');
    console.log('=====================================');
    createdUsers.forEach(user => {
      console.log(`👤 ${user.nombre}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   👔 Rol: ${user.rol}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log('   ---');
    });
    
    console.log(`\n🎉 ¡${createdUsers.length} usuarios recreados exitosamente!`);
    console.log('🔐 Todas las contraseñas están hasheadas con bcrypt (salt rounds: 12)');
    console.log('🌐 Puedes usar cualquiera de estos usuarios para hacer login en: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error recreando usuarios:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 📡 Ejecutar el script
recreateUsers();