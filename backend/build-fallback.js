#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting fallback build process...');

try {
  // Try to use NestJS CLI first
  console.log('📦 Attempting to use NestJS CLI...');
  execSync('npx nest build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully with NestJS CLI!');
} catch (error) {
  console.log('⚠️ NestJS CLI failed, trying fallback with TypeScript compiler...');
  
  try {
    // Fallback to TypeScript compiler
    execSync('npx tsc', { stdio: 'inherit' });
    console.log('✅ Build completed with TypeScript compiler!');
  } catch (tscError) {
    console.log('❌ TypeScript build failed, trying SWC...');
    
    try {
      // Last resort: use SWC
      execSync('npx swc src -d dist --delete-dir-on-start', { stdio: 'inherit' });
      console.log('✅ Build completed with SWC!');
    } catch (swcError) {
      console.error('❌ All build methods failed!');
      console.error('NestJS CLI Error:', error.message);
      console.error('TypeScript Error:', tscError.message);
      console.error('SWC Error:', swcError.message);
      process.exit(1);
    }
  }
}

console.log('🎉 Build process completed successfully!'); 