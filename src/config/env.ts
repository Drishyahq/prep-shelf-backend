interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string | number;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseJwtExpiry(value: string | undefined): string | number {
  if (!value) return "7d";
  const num = Number(value);
  return Number.isFinite(num) ? num : value;
}

export const env: EnvConfig = {
  PORT: Number(process.env["PORT"]) || 3000,
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: parseJwtExpiry(process.env["JWT_EXPIRES_IN"]),
};
