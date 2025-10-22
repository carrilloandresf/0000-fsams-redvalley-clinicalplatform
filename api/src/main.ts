import express from 'express';
import { router } from './app/routes';
import { sequelize } from './infra/db/sequelize';
import { env } from './config/env';

async function bootstrap() {
  // 1) Probar conexión a la DB
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');
  } catch (err) {
    console.error('DB connection FAILED:', err);
  }

  // 2) Iniciar servidor HTTP
  const app = express();
  app.use(express.json());
  app.use(router);

  const port = Number(env.PORT);
  app.listen(port, () => {
    console.log(`API ready on http://localhost:${port}`);
  });
}

bootstrap();