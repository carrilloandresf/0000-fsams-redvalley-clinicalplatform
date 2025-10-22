import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface PatientAttributes {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  provider_id: string | null;
  status_id: string | null;
  created_at: Date;
}
type PatientCreation = Optional<PatientAttributes, 'id' | 'provider_id' | 'status_id' | 'created_at'>;

export class PatientModel extends Model<PatientAttributes, PatientCreation> implements PatientAttributes {
  declare id: string;
  declare full_name: string;
  declare email: string;
  declare phone: string;
  declare provider_id: string | null;
  declare status_id: string | null;
  declare created_at: Date;
}

PatientModel.init(
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    provider_id: { type: DataTypes.STRING(36), allowNull: true },
    status_id: { type: DataTypes.STRING(36), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'patients', timestamps: false }
);