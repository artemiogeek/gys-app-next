/**
 * Script para probar la conexión a la base de datos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión simple
    await prisma.$connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Probar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Consulta de prueba exitosa:', result);
    
    // Verificar si existen tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tablas encontradas:', tables.length);
    if (tables.length > 0) {
      console.log('   Tablas:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('⚠️  No se encontraron tablas. Necesitas ejecutar: npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verificar que PostgreSQL esté ejecutándose');
      console.log('2. Verificar usuario y contraseña en .env');
      console.log('3. Verificar que la base de datos "gys_db" exista');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();