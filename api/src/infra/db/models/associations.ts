import { PatientModel } from './patientModel';
import { ProviderModel } from './providerModel';
import { StatusModel } from './statusModel';
import { StatusHistoryModel } from './statusHistoryModel';

// Patient -> Provider (actual)
PatientModel.belongsTo(ProviderModel, { foreignKey: 'provider_id', as: 'provider' });

// Patient -> Status (actual)
PatientModel.belongsTo(StatusModel, { foreignKey: 'status_id', as: 'status' });

// StatusHistory -> Patient + Status
StatusHistoryModel.belongsTo(PatientModel, { foreignKey: 'patient_id', as: 'patient' });
StatusHistoryModel.belongsTo(StatusModel, { foreignKey: 'status_id', as: 'status' });

/**
 * Inicializa las asociaciones entre los modelos de Sequelize.
 * Debe llamarse en el bootstrap antes de utilizar includes.
 * @returns {boolean} true
 */
export function initAssociations() {
  // Llamar esta función en el bootstrap antes de usar includes
  return true;
}