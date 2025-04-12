// Environment variable validation
const REQUIRED_ENV_VARS = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVENLABS_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const;

type EnvVar = typeof REQUIRED_ENV_VARS[number];

export function validateEnvVariables(): void {
  const missingVars: EnvVar[] = [];

  REQUIRED_ENV_VARS.forEach((varName) => {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

export function getEnvVar(name: EnvVar): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
} 