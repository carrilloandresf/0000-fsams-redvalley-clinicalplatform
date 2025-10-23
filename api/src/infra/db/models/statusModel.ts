import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface StatusAttributes {
  id: string;
  name: string;
  parent_id: string | null;
  order: number;
}
type StatusCreation = Optional<StatusAttributes, 'id' | 'parent_id'>;

export class StatusModel extends Model<StatusAttributes, StatusCreation> implements StatusAttributes {
  declare id: string;
  declare name: string;
  declare parent_id: string | null;
  declare order: number;
}

StatusModel.init(
  {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    parent_id: { type: DataTypes.STRING(36), allowNull: true },
    order: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: 'statuses', timestamps: false }
);