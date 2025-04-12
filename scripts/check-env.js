#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVENLABS_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

function checkEnvVars() {
  console.log('Checking environment variables...');
  
  const missingVars = [];

  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your environment or .env file');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}

// Check if .env file exists in development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('\n⚠️  No .env file found!');
    console.log('Please copy .env.example to .env and fill in your values\n');
  }
}

checkEnvVars(); 