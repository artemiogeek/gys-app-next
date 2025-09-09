/**
 * Script para crear usuarios con diferentes roles en la base de datos GYS
 * Genera usuarios de prueba para cada rol disponible en el sistema
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ✅ Usuarios con diferentes roles para testing
const usersToCreate = [
  {
    email: 'admin@gyscontrol.com',
    password: 'admin123',
    name: 'Administrador Sistema',
    role: 'admin'
  },
  {
    email: 'gerente@gyscontrol.com',
    password: 'gerente123',
    name: 'Gerente General',
    role: 'gerente'
  },
  {
    email: 'gestor@gyscontrol.com',
    password: 'gestor123',
    name: 'Gestor de Proyectos',
    role: 'gestor'
  },
  {
    email: 'comercial@gyscontrol.com',
    password: 'comercial123',
    name: 'Ejecutivo Comercial',
    role: 'comercial'
  },
  {
    email: 'presupuestos@gyscontrol.com',
    password: 'presup123',
    name: 'Analista de Presupuestos',
    role: 'presupuestos'
  },
  {
    email: 'proyectos@gyscontrol.com',
    password: 'proyect123',
    name: 'Coordinador de Proyectos',
    role: 'proyectos'
  },
  {
    email: 'coordinador@gyscontrol.com',
    password: 'coord123',
    name: 'Coordinador General',
    role: 'coordinador'
  },
  {
    email: 'logistico@gyscontrol.com',
    password: 'logist123',
    name: 'Especialista Logístico',
    role: 'logistico'
  },
  {
    email: 'colaborador@gyscontrol.com',
    password: 'colab123',
    name: 'Colaborador General',
    role: 'colaborador'
  }
];

async function createUsersWithRoles() {
  try {
    console.log('🚀 Iniciando creación de usuarios con roles...');
    
    const createdUsers = [];
    
    for (const userData of usersToCreate) {
      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 📡 Create or update user
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: userData.role
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role
        }
      });
      
      createdUsers.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password: userData.password // ⚠️ Solo para referencia, no se almacena en BD
      });
      
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    }
    
    console.log('\n📋 RESUMEN DE USUARIOS CREADOS:');
    console.log('================================');
    createdUsers.forEach(user => {
      console.log(`👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   👔 Rol: ${user.role}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log('   ---');
    });
    
    console.log('\n🎉 Todos los usuarios han sido creados exitosamente!');
    console.log('🌐 Puedes acceder al sistema en: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 🔁 Execute function
createUsersWithRoles();