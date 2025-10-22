import { Router } from 'express';

import { v4 as uuidv4 } from 'uuid';

import { PatientModel } from '../infra/db/models/patientModel';
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

// POST /patients  -> crea paciente (sin provider/status por defecto)
router.post('/patients', async (req, res) => {
  try {
    const { full_name, email, phone, provider_id = null, status_id = null } = req.body ?? {};

    // Validaciones mínimas
    if (!full_name || !email || !phone) {
      return res.status(400).json({ error: 'full_name, email, phone are required' });
    }
    // (Opcional simple) email formato básico
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'email is invalid' });
    }

    // Si envían provider/status, verifica existencia
    if (provider_id) {
      const provider = await ProviderModel.findByPk(provider_id);
      if (!provider) return res.status(400).json({ error: 'provider_id not found' });
    }
    if (status_id) {
      const status = await StatusModel.findByPk(status_id);
      if (!status) return res.status(400).json({ error: 'status_id not found' });
    }

    const id = uuidv4();
    const patient = await PatientModel.create({ id, full_name, email, phone, provider_id, status_id });
    return res.status(201).json(patient);
  } catch (err) {
    console.error('POST /patients error:', err);
    return res.status(500).json({ error: 'Failed to create patient' });
  }
});

// GET /patients -> lista básica con provider/status "join" manual (2 queries)
router.get('/patients', async (_req, res) => {
  try {
    // Traemos pacientes
    const patients = await PatientModel.findAll({ order: [['created_at', 'DESC']] });

    // IDs únicos de providers/statuses referenciados
    const providerIds = [...new Set(patients.map(p => p.provider_id).filter(Boolean))] as string[];
    const statusIds = [...new Set(patients.map(p => p.status_id).filter(Boolean))] as string[];

    const providers = providerIds.length
      ? await ProviderModel.findAll({ where: { id: providerIds } as any })
      : [];
    const statuses = statusIds.length
      ? await StatusModel.findAll({ where: { id: statusIds } as any })
      : [];

    const providersMap = new Map(providers.map(p => [p.id, p]));
    const statusesMap = new Map(statuses.map(s => [s.id, s]));

    const result = patients.map(p => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      created_at: p.created_at,
      provider: p.provider_id ? providersMap.get(p.provider_id) : null,
      status: p.status_id ? statusesMap.get(p.status_id) : null,
    }));

    return res.json(result);
  } catch (err) {
    console.error('GET /patients error:', err);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
});