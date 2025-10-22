import dotenv from 'dotenv';

// Carga el .env de la raíz del workspace (Nx corre desde la raíz)
dotenv.config();

export const env = {
  PORT: process.env.PORT ?? '3000',
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_NAME: process.env.DB_NAME ?? 'clinical_platform',
  DB_USER: process.env.DB_USER ?? 'clinical_user',
  DB_PASS: process.env.DB_PASS ?? 'clinical_pass',
};