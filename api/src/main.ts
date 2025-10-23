import express from 'express';
import { router } from './app/routes';
import { sequelize } from './infra/db/sequelize';
import { env } from './config/env';
import { initAssociations } from './infra/db/models/associations';
import cors from 'cors';

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');
  } catch (err) {
    console.error('DB connection FAILED:', err);
  }

  // Inicializar asociaciones
  initAssociations();

  const app = express();

  // Habilitar CORS para 5173 y 4200
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4200'] }));

  app.use(express.json());
  app.use(router);

  const port = Number(env.PORT);
  app.listen(port, () => {
    console.log(`API ready on http://localhost:${port}`);
  });
}

bootstrap();