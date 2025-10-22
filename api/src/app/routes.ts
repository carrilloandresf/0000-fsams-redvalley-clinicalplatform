import { Router } from 'express';
import { StatusModel } from '../infra/db/models/statusModel';
import { ProviderModel } from '../infra/db/models/providerModel';

export const router = Router();

// Health
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// GET /statuses  -> lista los statuses (ordenados)
router.get('/statuses', async (_req, res) => {
  try {
    const rows = await StatusModel.findAll({ order: [['order', 'ASC'], ['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('GET /statuses error:', err);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});

// GET /providers -> lista los providers (más recientes primero)
router.get('/providers', async (_req, res) => {
  try {
    const rows = await ProviderModel.findAll({ order: [['created_at', 'DESC']] });
    res.json(rows);
  } catch (err) {
    console.error('GET /providers error:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});
