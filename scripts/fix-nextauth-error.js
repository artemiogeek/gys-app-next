// Fix NextAuth CLIENT_FETCH_ERROR Script
// This script diagnoses and fixes common NextAuth CLIENT_FETCH_ERROR issues

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing NextAuth CLIENT_FETCH_ERROR...');

// 1. Check environment variables
function checkEnvVariables() {
  console.log('\n📋 Checking environment variables...');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL');
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET');
  
  console.log(`NEXTAUTH_URL: ${hasNextAuthUrl ? '✅' : '❌'}`);
  console.log(`NEXTAUTH_SECRET: ${hasNextAuthSecret ? '✅' : '❌'}`);
  
  return hasNextAuthUrl && hasNextAuthSecret;
}

// 2. Check NextAuth API route
function checkNextAuthRoute() {
  console.log('\n🛣️ Checking NextAuth API route...');
  
  const routePath = path.join(__dirname, 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
  const exists = fs.existsSync(routePath);
  
  console.log(`NextAuth route exists: ${exists ? '✅' : '❌'}`);
  
  if (exists) {
    const content = fs.readFileSync(routePath, 'utf8');
    const hasHandler = content.includes('handler');
    const hasExports = content.includes('export { handler as GET, handler as POST }');
    
    console.log(`Handler defined: ${hasHandler ? '✅' : '❌'}`);
    console.log(`GET/POST exports: ${hasExports ? '✅' : '❌'}`);
  }
  
  return exists;
}

// 3. Fix Prisma client generation issues
function fixPrismaClient() {
  console.log('\n🔧 Fixing Prisma client generation...');
  
  try {
    // Stop any running processes that might lock files
    console.log('Stopping development server...');
    try {
      execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    } catch (e) {
      // Ignore if no node processes found
    }
    
    // Clean Prisma client
    console.log('Cleaning Prisma client...');
    const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma');
    if (fs.existsSync(prismaClientPath)) {
      fs.rmSync(prismaClientPath, { recursive: true, force: true });
    }
    
    // Regenerate Prisma client
    console.log('Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Prisma client regenerated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error fixing Prisma client:', error.message);
    return false;
  }
}

// 4. Check database connection
function checkDatabaseConnection() {
  console.log('\n🗄️ Checking database connection...');
  
  try {
    execSync('npx prisma db pull --force', { stdio: 'inherit' });
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// 5. Clear Next.js cache
function clearNextCache() {
  console.log('\n🧹 Clearing Next.js cache...');
  
  try {
    const nextCachePath = path.join(__dirname, '.next');
    if (fs.existsSync(nextCachePath)) {
      fs.rmSync(nextCachePath, { recursive: true, force: true });
    }
    
    console.log('✅ Next.js cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
    return false;
  }
}

// 6. Reinstall dependencies if needed
function reinstallDependencies() {
  console.log('\n📦 Reinstalling dependencies...');
  
  try {
    // Remove node_modules and package-lock.json
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    const lockFilePath = path.join(__dirname, 'package-lock.json');
    
    if (fs.existsSync(nodeModulesPath)) {
      console.log('Removing node_modules...');
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }
    
    if (fs.existsSync(lockFilePath)) {
      console.log('Removing package-lock.json...');
      fs.unlinkSync(lockFilePath);
    }
    
    // Reinstall
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('✅ Dependencies reinstalled successfully');
    return true;
  } catch (error) {
    console.error('❌ Error reinstalling dependencies:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting NextAuth CLIENT_FETCH_ERROR fix process...\n');
  
  const envOk = checkEnvVariables();
  const routeOk = checkNextAuthRoute();
  
  if (!envOk || !routeOk) {
    console.log('\n❌ Basic configuration issues found. Please fix them first.');
    return;
  }
  
  console.log('\n🔧 Attempting to fix the issue...');
  
  // Try fixes in order of likelihood
  let fixed = false;
  
  // 1. Clear cache and regenerate Prisma
  if (!fixed) {
    clearNextCache();
    fixed = fixPrismaClient();
  }
  
  // 2. Check database connection
  if (!fixed) {
    fixed = checkDatabaseConnection();
  }
  
  // 3. Last resort: reinstall dependencies
  if (!fixed) {
    console.log('\n⚠️ Trying last resort: reinstalling dependencies...');
    fixed = reinstallDependencies();
    if (fixed) {
      fixPrismaClient();
    }
  }
  
  if (fixed) {
    console.log('\n✅ Fix completed! Try running the development server again:');
    console.log('npm run dev');
  } else {
    console.log('\n❌ Could not automatically fix the issue.');
    console.log('\nManual steps to try:');
    console.log('1. Restart your computer to release file locks');
    console.log('2. Run as administrator');
    console.log('3. Check Windows Defender/antivirus exclusions');
    console.log('4. Verify PostgreSQL is running');
  }
}

main().catch(console.error);