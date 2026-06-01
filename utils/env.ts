/**
 * Centralized env access. Fails fast with a clear error if required vars
 * are missing — avoids silent fallbacks to wrong URLs/credentials.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env if present. In CI, env vars come from the runner — dotenv is a no-op.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(
      `Missing required env var: ${name}.\n` +
        `→ Copy .env.example to .env and fill in values, or export ${name} in your shell.`,
    );
  }
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : fallback;
}

export const env = {
  baseUrl: requireEnv('BASE_URL'),
  userEmail: requireEnv('USER_EMAIL'),
  userPwd: requireEnv('USER_PWD'),
  testDob: optionalEnv('TEST_DOB', '1990-01-15'),
  testSex: optionalEnv('TEST_SEX_AT_BIRTH', 'Male'),
  testZip: optionalEnv('TEST_ZIP', '10001'),
};
