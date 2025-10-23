import { Router } from 'express';
import type { Request, Response } from 'express';

const patientModelMock = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const statusModelMock = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
};

const providerModelMock = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const statusHistoryModelMock = {
  findAll: jest.fn(),
  create: jest.fn(),
};

const sequelizeMock = {
  transaction: jest.fn(),
};

jest.mock('../infra/db/models/patientModel', () => ({
  PatientModel: patientModelMock,
}));

jest.mock('../infra/db/models/statusModel', () => ({
  StatusModel: statusModelMock,
}));

jest.mock('../infra/db/models/providerModel', () => ({
  ProviderModel: providerModelMock,
}));

jest.mock('../infra/db/models/statusHistoryModel', () => ({
  StatusHistoryModel: statusHistoryModelMock,
}));

jest.mock('../infra/db/sequelize', () => ({
  sequelize: sequelizeMock,
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-mock'),
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'crypto-mock'),
}));

import { router } from './routes';

function getHandler(method: 'get' | 'post', path: string) {
  const layer = (router as Router & { stack: any[] }).stack.find(
    (l: any) => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer) {
    throw new Error(`Handler for ${method.toUpperCase()} ${path} not found`);
  }
  return layer.route.stack[0].handle;
}

function createRes() {
  const res = {
    statusCode: 200,
    payload: undefined,
    status: jest.fn(function status(this: any, code: number) {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn(function json(this: any, data: any) {
      res.payload = data;
      return res;
    }),
  };

  return res as unknown as Response & { statusCode: number; payload: any };
}

describe('app routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sequelizeMock.transaction.mockImplementation(async () => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    }));
  });

  test('GET /health returns ok', async () => {
    const handler = getHandler('get', '/health');
    const res = createRes();
    await handler({} as Request, res);
    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test('GET /statuses returns ordered statuses', async () => {
    statusModelMock.findAll.mockResolvedValueOnce([{ id: '1' }]);
    const handler = getHandler('get', '/statuses');
    const res = createRes();
    await handler({} as Request, res);
    expect(statusModelMock.findAll).toHaveBeenCalledWith({ order: [['order', 'ASC'], ['name', 'ASC']] });
    expect(res.payload).toEqual([{ id: '1' }]);
  });

  test('GET /statuses handles errors', async () => {
    const error = new Error('boom');
    statusModelMock.findAll.mockRejectedValueOnce(error);
    const handler = getHandler('get', '/statuses');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({} as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to fetch statuses' });
    consoleSpy.mockRestore();
  });

  test('GET /statuses/tree builds hierarchy', async () => {
    statusModelMock.findAll.mockResolvedValueOnce([
      { id: 'a', parent_id: null, order: 1, name: 'Root', extra: true },
      { id: 'b', parent_id: 'a', order: 2, name: 'Child' },
    ]);
    const handler = getHandler('get', '/statuses/tree');
    const res = createRes();
    await handler({} as Request, res);
    expect(res.statusCode).toBe(200);
    expect(res.payload).toEqual([
      {
        id: 'a',
        parent_id: null,
        order: 1,
        name: 'Root',
        extra: true,
        children: [
          {
            id: 'b',
            parent_id: 'a',
            order: 2,
            name: 'Child',
            children: [],
          },
        ],
      },
    ]);
  });

  test('GET /statuses/tree handles errors', async () => {
    statusModelMock.findAll.mockRejectedValueOnce(new Error('fail'));
    const handler = getHandler('get', '/statuses/tree');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({} as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to build status tree' });
    consoleSpy.mockRestore();
  });

  test('GET /providers returns providers', async () => {
    providerModelMock.findAll.mockResolvedValueOnce([{ id: 'p1' }]);
    const handler = getHandler('get', '/providers');
    const res = createRes();
    await handler({} as Request, res);
    expect(providerModelMock.findAll).toHaveBeenCalledWith({ order: [['created_at', 'DESC']] });
    expect(res.payload).toEqual([{ id: 'p1' }]);
  });

  test('GET /providers handles errors', async () => {
    providerModelMock.findAll.mockRejectedValueOnce(new Error('fail'));
    const handler = getHandler('get', '/providers');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({} as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to fetch providers' });
    consoleSpy.mockRestore();
  });

  test('POST /providers validates name', async () => {
    const handler = getHandler('post', '/providers');
    const res = createRes();
    await handler({ body: { specialty: 'A' } } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'full_name is required (min 2 chars)' });
  });

  test('POST /providers validates specialty', async () => {
    const handler = getHandler('post', '/providers');
    const res = createRes();
    await handler({ body: { full_name: 'Dr. A', specialty: 'x' } } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'specialty is required (min 2 chars)' });
  });

  test('POST /providers creates provider', async () => {
    providerModelMock.create.mockResolvedValueOnce({ id: 'new-provider', full_name: 'Dr. B' });
    const handler = getHandler('post', '/providers');
    const res = createRes();
    await handler({ body: { full_name: ' Dr. B ', specialty: ' Cardio ' } } as Request, res);
    expect(providerModelMock.create).toHaveBeenCalledWith({
      id: 'uuid-mock',
      full_name: 'Dr. B',
      specialty: 'Cardio',
    });
    expect(res.statusCode).toBe(201);
    expect(res.payload).toEqual({ id: 'new-provider', full_name: 'Dr. B' });
  });

  test('POST /providers handles errors', async () => {
    providerModelMock.create.mockRejectedValueOnce(new Error('boom'));
    const handler = getHandler('post', '/providers');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({ body: { full_name: 'Dr. C', specialty: 'Onco' } } as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to create provider' });
    consoleSpy.mockRestore();
  });

  test('POST /patients validates full name', async () => {
    const handler = getHandler('post', '/patients');
    const res = createRes();
    await handler({ body: { email: 'test@test.com', phone: '12345' } } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'full_name is required (min 2 chars)' });
  });

  test('POST /patients validates email format', async () => {
    const handler = getHandler('post', '/patients');
    const res = createRes();
    await handler({ body: { full_name: 'John', email: 'bad', phone: '12345' } } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'email is invalid' });
  });

  test('POST /patients validates phone length', async () => {
    const handler = getHandler('post', '/patients');
    const res = createRes();
    await handler({ body: { full_name: 'John', email: 'john@test.com', phone: '123' } } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'phone is required (min 5 chars)' });
  });

  test('POST /patients validates provider existence', async () => {
    const handler = getHandler('post', '/patients');
    const res = createRes();
    providerModelMock.findByPk.mockResolvedValueOnce(null);
    await handler({
      body: { full_name: 'John', email: 'john@test.com', phone: '12345', provider_id: 'p', status_id: null },
    } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'provider_id not found' });
  });

  test('POST /patients validates status existence', async () => {
    const handler = getHandler('post', '/patients');
    const res = createRes();
    providerModelMock.findByPk.mockResolvedValueOnce({ id: 'p' });
    statusModelMock.findByPk.mockResolvedValueOnce(null);
    await handler({
      body: { full_name: 'John', email: 'john@test.com', phone: '12345', status_id: 's', provider_id: null },
    } as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'status_id not found' });
  });

  test('POST /patients creates patient', async () => {
    providerModelMock.findByPk.mockResolvedValueOnce({ id: 'p1' });
    statusModelMock.findByPk.mockResolvedValueOnce({ id: 's1' });
    patientModelMock.create.mockResolvedValueOnce({ id: 'created' });
    const handler = getHandler('post', '/patients');
    const res = createRes();
    await handler({
      body: {
        full_name: ' John ',
        email: ' JOHN@test.com ',
        phone: ' 55555 ',
        provider_id: 'p1',
        status_id: 's1',
      },
    } as Request, res);
    expect(patientModelMock.create).toHaveBeenCalledWith({
      id: 'crypto-mock',
      full_name: 'John',
      email: 'john@test.com',
      phone: '55555',
      provider_id: 'p1',
      status_id: 's1',
    });
    expect(res.statusCode).toBe(201);
    expect(res.payload).toEqual({ id: 'created' });
  });

  test('POST /patients handles errors', async () => {
    patientModelMock.create.mockRejectedValueOnce(new Error('fail'));
    const handler = getHandler('post', '/patients');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({
      body: { full_name: 'John', email: 'john@test.com', phone: '12345' },
    } as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to create patient' });
    consoleSpy.mockRestore();
  });

  test('GET /patients returns list', async () => {
    patientModelMock.findAll.mockResolvedValueOnce([{ id: 'p1' }]);
    const handler = getHandler('get', '/patients');
    const res = createRes();
    await handler({} as Request, res);
    expect(patientModelMock.findAll).toHaveBeenCalledWith({
      order: [['created_at', 'DESC']],
      include: [
        { model: providerModelMock, as: 'provider', attributes: ['id', 'full_name', 'specialty'] },
        { model: statusModelMock, as: 'status', attributes: ['id', 'name'] },
      ],
    });
    expect(res.payload).toEqual([{ id: 'p1' }]);
  });

  test('GET /patients handles errors', async () => {
    patientModelMock.findAll.mockRejectedValueOnce(new Error('fail'));
    const handler = getHandler('get', '/patients');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({} as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to fetch patients' });
    consoleSpy.mockRestore();
  });

  test('GET /patients/:id returns patient', async () => {
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1' });
    const handler = getHandler('get', '/patients/:id');
    const res = createRes();
    await handler({ params: { id: 'p1' } } as unknown as Request, res);
    expect(patientModelMock.findByPk).toHaveBeenCalledWith('p1', {
      include: [
        { model: providerModelMock, as: 'provider', attributes: ['id', 'full_name', 'specialty'] },
        { model: statusModelMock, as: 'status', attributes: ['id', 'name'] },
      ],
    });
    expect(res.payload).toEqual({ id: 'p1' });
  });

  test('GET /patients/:id returns 404 when missing', async () => {
    patientModelMock.findByPk.mockResolvedValueOnce(null);
    const handler = getHandler('get', '/patients/:id');
    const res = createRes();
    await handler({ params: { id: 'missing' } } as unknown as Request, res);
    expect(res.statusCode).toBe(404);
    expect(res.payload).toEqual({ error: 'patient not found' });
  });

  test('GET /patients/:id handles errors', async () => {
    patientModelMock.findByPk.mockRejectedValueOnce(new Error('fail'));
    const handler = getHandler('get', '/patients/:id');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({ params: { id: 'p1' } } as unknown as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to fetch patient' });
    consoleSpy.mockRestore();
  });

  test('POST /patients/:id/assign-provider validates payload', async () => {
    const handler = getHandler('post', '/patients/:id/assign-provider');
    const res = createRes();
    await handler({ params: { id: 'p1' }, body: {} } as unknown as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'provider_id is required' });
  });

  test('POST /patients/:id/assign-provider requires patient', async () => {
    const handler = getHandler('post', '/patients/:id/assign-provider');
    const res = createRes();
    patientModelMock.findByPk.mockResolvedValueOnce(null);
    providerModelMock.findByPk.mockResolvedValueOnce({ id: 'prov' });
    await handler({ params: { id: 'p1' }, body: { provider_id: 'prov' } } as unknown as Request, res);
    expect(res.statusCode).toBe(404);
    expect(res.payload).toEqual({ error: 'patient not found' });
  });

  test('POST /patients/:id/assign-provider requires provider', async () => {
    const handler = getHandler('post', '/patients/:id/assign-provider');
    const res = createRes();
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1', update: jest.fn() });
    providerModelMock.findByPk.mockResolvedValueOnce(null);
    await handler({ params: { id: 'p1' }, body: { provider_id: 'prov' } } as unknown as Request, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'provider_id not found' });
  });

  test('POST /patients/:id/assign-provider updates provider', async () => {
    const update = jest.fn();
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1', update });
    providerModelMock.findByPk.mockResolvedValueOnce({ id: 'prov' });
    const handler = getHandler('post', '/patients/:id/assign-provider');
    const res = createRes();
    await handler({ params: { id: 'p1' }, body: { provider_id: 'prov' } } as unknown as Request, res);
    expect(update).toHaveBeenCalledWith({ provider_id: 'prov' });
    expect(res.payload).toEqual({ ok: true });
  });

  test('POST /patients/:id/assign-provider handles errors', async () => {
    patientModelMock.findByPk.mockRejectedValueOnce(new Error('fail'));
    providerModelMock.findByPk.mockResolvedValueOnce({ id: 'prov' });
    const handler = getHandler('post', '/patients/:id/assign-provider');
    const res = createRes();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({ params: { id: 'p1' }, body: { provider_id: 'prov' } } as unknown as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to assign provider' });
    consoleSpy.mockRestore();
  });

  test('POST /patients/:id/change-status requires status_id', async () => {
    const handler = getHandler('post', '/patients/:id/change-status');
    const res = createRes();
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelizeMock.transaction.mockResolvedValueOnce(transaction);
    await handler({ params: { id: 'p1' }, body: {} } as unknown as Request, res);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'status_id is required' });
  });

  test('POST /patients/:id/change-status validates patient existence', async () => {
    const handler = getHandler('post', '/patients/:id/change-status');
    const res = createRes();
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelizeMock.transaction.mockResolvedValueOnce(transaction);
    patientModelMock.findByPk.mockResolvedValueOnce(null);
    statusModelMock.findByPk.mockResolvedValueOnce({ id: 's' });
    await handler({ params: { id: 'p1' }, body: { status_id: 's' } } as unknown as Request, res);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(404);
    expect(res.payload).toEqual({ error: 'patient not found' });
  });

  test('POST /patients/:id/change-status validates status existence', async () => {
    const handler = getHandler('post', '/patients/:id/change-status');
    const res = createRes();
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelizeMock.transaction.mockResolvedValueOnce(transaction);
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1', update: jest.fn() });
    statusModelMock.findByPk.mockResolvedValueOnce(null);
    await handler({ params: { id: 'p1' }, body: { status_id: 's' } } as unknown as Request, res);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(400);
    expect(res.payload).toEqual({ error: 'status_id not found' });
  });

  test('POST /patients/:id/change-status updates patient and history', async () => {
    const update = jest.fn();
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelizeMock.transaction.mockResolvedValueOnce(transaction);
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1', update });
    statusModelMock.findByPk.mockResolvedValueOnce({ id: 's1' });
    statusHistoryModelMock.create.mockResolvedValueOnce({ id: 'history' });
    const handler = getHandler('post', '/patients/:id/change-status');
    const res = createRes();
    await handler({ params: { id: 'p1' }, body: { status_id: 's1' } } as unknown as Request, res);
    expect(update).toHaveBeenCalledWith({ status_id: 's1' }, { transaction });
    expect(statusHistoryModelMock.create).toHaveBeenCalledWith(
      { id: 'crypto-mock', patient_id: 'p1', status_id: 's1' },
      { transaction }
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(res.payload).toEqual({ ok: true });
  });

  test('POST /patients/:id/change-status handles errors', async () => {
    const handler = getHandler('post', '/patients/:id/change-status');
    const res = createRes();
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelizeMock.transaction.mockResolvedValueOnce(transaction);
    patientModelMock.findByPk.mockRejectedValueOnce(new Error('fail'));
    statusModelMock.findByPk.mockResolvedValueOnce({ id: 's1' });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({ params: { id: 'p1' }, body: { status_id: 's1' } } as unknown as Request, res);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to change status' });
    consoleSpy.mockRestore();
  });

  test('GET /patients/:id/history requires patient', async () => {
    const handler = getHandler('get', '/patients/:id/history');
    const res = createRes();
    patientModelMock.findByPk.mockResolvedValueOnce(null);
    await handler({ params: { id: 'p1' } } as unknown as Request, res);
    expect(res.statusCode).toBe(404);
    expect(res.payload).toEqual({ error: 'patient not found' });
  });

  test('GET /patients/:id/history returns history', async () => {
    const handler = getHandler('get', '/patients/:id/history');
    const res = createRes();
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1' });
    statusHistoryModelMock.findAll.mockResolvedValueOnce([{ id: 'h1' }]);
    await handler({ params: { id: 'p1' } } as unknown as Request, res);
    expect(statusHistoryModelMock.findAll).toHaveBeenCalledWith({
      where: { patient_id: 'p1' } as any,
      order: [['changed_at', 'DESC']],
      include: [{ model: statusModelMock, as: 'status', attributes: ['id', 'name'] }],
    });
    expect(res.payload).toEqual([{ id: 'h1' }]);
  });

  test('GET /patients/:id/history handles errors', async () => {
    const handler = getHandler('get', '/patients/:id/history');
    const res = createRes();
    patientModelMock.findByPk.mockResolvedValueOnce({ id: 'p1' });
    statusHistoryModelMock.findAll.mockRejectedValueOnce(new Error('fail'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await handler({ params: { id: 'p1' } } as unknown as Request, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload).toEqual({ error: 'Failed to fetch history' });
    consoleSpy.mockRestore();
  });
});
