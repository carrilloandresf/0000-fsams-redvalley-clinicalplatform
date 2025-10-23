import { Router } from 'express';

import { randomUUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { PatientModel } from '../infra/db/models/patientModel';
import { StatusModel } from '../infra/db/models/statusModel';
import { ProviderModel } from '../infra/db/models/providerModel';
import { StatusHistoryModel } from '../infra/db/models/statusHistoryModel';
import { sequelize } from '../infra/db/sequelize';

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

// GET /statuses/tree -> árbol padre-hijo ordenado
router.get('/statuses/tree', async (_req, res) => {
  try {
    const all = await StatusModel.findAll({
      order: [['order', 'ASC'], ['name', 'ASC']],
      raw: true,
    });

    const byId = new Map(all.map(s => [s.id, { ...s, children: [] as any[] }]));
    const roots: any[] = [];

    for (const s of all) {
      const node = byId.get(s.id)!;
      if (s.parent_id) {
        const parent = byId.get(s.parent_id);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return res.json(roots);
  } catch (err) {
    console.error('GET /statuses/tree error:', err);
    return res.status(500).json({ error: 'Failed to build status tree' });
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

// POST /providers -> crea un nuevo provider
router.post('/providers', async (req, res) => {
  try {
    const { full_name, specialty } = req.body ?? {};

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return res.status(400).json({ error: 'full_name is required (min 2 chars)' });
    }

    if (!specialty || typeof specialty !== 'string' || specialty.trim().length < 2) {
      return res.status(400).json({ error: 'specialty is required (min 2 chars)' });
    }

    const provider = await ProviderModel.create({
      id: uuidv4(),
      full_name: full_name.trim(),
      specialty: specialty.trim(),
    });

    return res.status(201).json(provider);
  } catch (err) {
    console.error('POST /providers error:', err);
    return res.status(500).json({ error: 'Failed to create provider' });
  }
});

// POST /patients  -> crea paciente (sin provider/status por defecto)
router.post('/patients', async (req, res) => {
  try {
    const body = req.body ?? {};
    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
    const phoneRaw = typeof body.phone === 'string' ? body.phone.trim() : '';
    const providerIdRaw = typeof body.provider_id === 'string' ? body.provider_id.trim() : '';
    const statusIdRaw = typeof body.status_id === 'string' ? body.status_id.trim() : '';
    const providerId = providerIdRaw.length > 0 ? providerIdRaw : null;
    const statusId = statusIdRaw.length > 0 ? statusIdRaw : null;

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ error: 'full_name is required (min 2 chars)' });
    }

    if (!emailRaw || !/^\S+@\S+\.\S+$/.test(emailRaw)) {
      return res.status(400).json({ error: 'email is invalid' });
    }

    if (!phoneRaw || phoneRaw.length < 5) {
      return res.status(400).json({ error: 'phone is required (min 5 chars)' });
    }

    if (providerId) {
      const provider = await ProviderModel.findByPk(providerId);
      if (!provider) {
        return res.status(400).json({ error: 'provider_id not found' });
      }
    }

    if (statusId) {
      const status = await StatusModel.findByPk(statusId);
      if (!status) {
        return res.status(400).json({ error: 'status_id not found' });
      }
    }

    const patient = await PatientModel.create({
      id: randomUUID(),
      full_name: fullName,
      email: emailRaw.toLowerCase(),
      phone: phoneRaw,
      provider_id: providerId,
      status_id: statusId,
    });

    return res.status(201).json(patient);
  } catch (err) {
    console.error('POST /patients error:', err);
    return res.status(500).json({ error: 'Failed to create patient' });
  }
});

// GET /patients
router.get('/patients', async (_req, res) => {
  try {
    const patients = await PatientModel.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: ProviderModel, as: 'provider', attributes: ['id', 'full_name', 'specialty'] },
        { model: StatusModel, as: 'status', attributes: ['id', 'name'] }
      ]
    });
    return res.json(patients);
  } catch (err) {
    console.error('GET /patients error:', err);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /patients/:id -> detalle con include
router.get('/patients/:id', async (req, res) => {
  try {
    const patient = await PatientModel.findByPk(req.params.id, {
      include: [
        { model: ProviderModel, as: 'provider', attributes: ['id', 'full_name', 'specialty'] },
        { model: StatusModel, as: 'status', attributes: ['id', 'name'] }
      ]
    });
    if (!patient) return res.status(404).json({ error: 'patient not found' });
    return res.json(patient);
  } catch (err) {
    console.error('GET /patients/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /patients/:id/assign-provider  -> { provider_id }
router.post('/patients/:id/assign-provider', async (req, res) => {
  try {
    const patientId = req.params.id;
    const providerIdRaw = typeof req.body?.provider_id === 'string' ? req.body.provider_id.trim() : '';

    if (!providerIdRaw) {
      return res.status(400).json({ error: 'provider_id is required' });
    }

    const patient = await PatientModel.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'patient not found' });
    }

    const provider = await ProviderModel.findByPk(providerIdRaw);
    if (provider == null) {
      return res.status(400).json({ error: 'provider_id not found' });
    }

    await patient.update({ provider_id: providerIdRaw });
    return res.json({ ok: true });
  } catch (err) {
    console.error('POST /patients/:id/assign-provider error:', err);
    return res.status(500).json({ error: 'Failed to assign provider' });
  }
});

// POST /patients/:id/change-status -> { status_id }
// Reglas mínimas: si existe status => OK. (Validación de jerarquía es opcional y la podemos añadir luego)
router.post('/patients/:id/change-status', async (req, res) => {
  const transaction = await sequelize.transaction();

  const rollbackAndRespond = async (statusCode: number, payload: unknown) => {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('POST /patients/:id/change-status rollback error:', rollbackError);
    }
    return res.status(statusCode).json(payload);
  };

  try {
    const patientId = req.params.id;
    const statusIdRaw = typeof req.body?.status_id === 'string' ? req.body.status_id.trim() : '';

    if (!statusIdRaw) {
      return rollbackAndRespond(400, { error: 'status_id is required' });
    }

    const patient = await PatientModel.findByPk(patientId, { transaction });
    if (!patient) {
      return rollbackAndRespond(404, { error: 'patient not found' });
    }

    const status = await StatusModel.findByPk(statusIdRaw, { transaction });
    if (!status) {
      return rollbackAndRespond(400, { error: 'status_id not found' });
    }

    await patient.update({ status_id: statusIdRaw }, { transaction });

    await StatusHistoryModel.create(
      { id: randomUUID(), patient_id: patient.id, status_id: statusIdRaw },
      { transaction }
    );

    await transaction.commit();
    return res.json({ ok: true });
  } catch (err) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error('POST /patients/:id/change-status rollback error:', rollbackError);
    }
    console.error('POST /patients/:id/change-status error:', err);
    return res.status(500).json({ error: 'Failed to change status' });
  }
});

// GET /patients/:id/history -> timeline (desc por fecha)
router.get('/patients/:id/history', async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await PatientModel.findByPk(patientId);
    if (!patient) return res.status(404).json({ error: 'patient not found' });

    const history = await StatusHistoryModel.findAll({
      where: { patient_id: patientId } as any,
      order: [['changed_at', 'DESC']],
      include: [{ model: StatusModel, as: 'status', attributes: ['id', 'name'] }]
    });

    return res.json(history);
  } catch (err) {
    console.error('GET /patients/:id/history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});