import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

function loadEnvFallback() {
  // Default: loads `.env` from current working directory (if present)
  dotenv.config()

  if (!process.env.POSTGRES_PORT) {
    const repoEnvPath = join(process.cwd(), '..', '..', '.env')
    if (existsSync(repoEnvPath)) {
      dotenv.config({ path: repoEnvPath })
    }
  }
}


export function getConStr() {
  loadEnvFallback()
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DATABASE
  } = process.env;

  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}?schema=public`;
}
