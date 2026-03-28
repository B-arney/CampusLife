import "dotenv/config";

export function getConStr() {
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
