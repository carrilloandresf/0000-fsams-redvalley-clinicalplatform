import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface StatusHistoryAttributes {
  id: string;
  patient_id: string;
  status_id: string;
  changed_at: Date;
}
type StatusHistoryCreation = Optional<StatusHistoryAttributes, 'id' | 'changed_at'>;

export class StatusHistoryModel extends Model<StatusHistoryAttributes, StatusHistoryCreation> implements StatusHistoryAttributes {
  declare id: string;
  declare patient_id: string;
  declare status_id: string;
  declare changed_at: Date;
}

StatusHistoryModel.init(
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    patient_id: { type: DataTypes.STRING(36), allowNull: false },
    status_id: { type: DataTypes.STRING(36), allowNull: false },
    changed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'status_history', timestamps: false }
);