jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('env config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses default values when env vars are missing', async () => {
    delete process.env.PORT;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;

    const { env } = await import('./env');
    const { config } = await import('dotenv');

    expect(config).toHaveBeenCalled();
    expect(env).toEqual({
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'clinical_platform',
      DB_USER: 'clinical_user',
      DB_PASS: 'clinical_pass',
    });
  });

  it('reads provided env variables', async () => {
    process.env.PORT = '4001';
    process.env.DB_HOST = 'db';
    process.env.DB_PORT = '3307';
    process.env.DB_NAME = 'custom';
    process.env.DB_USER = 'user';
    process.env.DB_PASS = 'pass';

    const { env } = await import('./env');

    expect(env).toEqual({
      PORT: '4001',
      DB_HOST: 'db',
      DB_PORT: 3307,
      DB_NAME: 'custom',
      DB_USER: 'user',
      DB_PASS: 'pass',
    });
  });
});
