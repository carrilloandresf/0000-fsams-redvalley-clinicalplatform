import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProviderAttributes {
  id: string;
  full_name: string;
  specialty: string;
  created_at: Date;
}
type ProviderCreation = Optional<ProviderAttributes, 'id' | 'created_at'>;

export class ProviderModel extends Model<ProviderAttributes, ProviderCreation> implements ProviderAttributes {
  declare id: string;
  declare full_name: string;
  declare specialty: string;
  declare created_at: Date;
}

ProviderModel.init(
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    specialty: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'providers', timestamps: false }
);