#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVENLABS_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Check if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Function to check environment variables
function checkEnvVars() {
  const missingVars = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missingVars.forEach(variable => {
      console.error(`  - ${variable}`);
    });
    process.exit(1);
  }

  console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set');
}

// Check for .env file in development
if (isDevelopment) {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: No .env file found.');
    console.warn('Please copy .env.example to .env and fill in your environment variables.');
  }
}

// Run the check
checkEnvVars(); 