import { Model } from 'sequelize-typescript';

export interface IPaginatedQueryModel<M extends Model> {
  content: M[];
  total: number;
}
