const patientBelongsTo = jest.fn();
const providerBelongsTo = jest.fn();
const statusBelongsTo = jest.fn();
const statusHistoryBelongsTo = jest.fn();

jest.mock('./patientModel', () => ({
  PatientModel: { belongsTo: patientBelongsTo },
}));

jest.mock('./providerModel', () => ({
  ProviderModel: { belongsTo: providerBelongsTo },
}));

jest.mock('./statusModel', () => ({
  StatusModel: { belongsTo: statusBelongsTo },
}));

jest.mock('./statusHistoryModel', () => ({
  StatusHistoryModel: { belongsTo: statusHistoryBelongsTo },
}));

describe('associations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('initializes associations once and returns true', async () => {
    const module = await import('./associations');
    expect(module.initAssociations()).toBe(true);

    expect(patientBelongsTo).toHaveBeenNthCalledWith(1, expect.anything(), {
      foreignKey: 'provider_id',
      as: 'provider',
    });
    expect(patientBelongsTo).toHaveBeenNthCalledWith(2, expect.anything(), {
      foreignKey: 'status_id',
      as: 'status',
    });
    expect(statusHistoryBelongsTo).toHaveBeenNthCalledWith(1, expect.anything(), {
      foreignKey: 'patient_id',
      as: 'patient',
    });
    expect(statusHistoryBelongsTo).toHaveBeenNthCalledWith(2, expect.anything(), {
      foreignKey: 'status_id',
      as: 'status',
    });
  });
});
