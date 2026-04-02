#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Setting up Raza Traders App...');

try {
  console.log('✓ Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✓ Build complete!');
  console.log('🎉 Setup successful!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
