import { Model } from 'sequelize-typescript';

export default class PaginatedQueryModel<M extends Model> {
  private content: M[];

  private total: number;

  constructor({ rows, count }) {
    this.content = rows;
    this.total = count;
  }

  public getContent(): M[] {
    return this.content;
  }

  public setContent(content: M[]) {
    this.content = content;
  }

  public getTotal(): number {
    return this.total;
  }

  public setTotal(total: number) {
    this.total = total;
  }
}
