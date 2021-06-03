import {
  Table, Column, Model, AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export default class User extends Model {
  @AllowNull(false)
  @Column
  private name: string;

  @AllowNull(false)
  @Column
  private email: string;

  @AllowNull(false)
  @Column
  private password: string;

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string) {
    this.name = name;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string) {
    this.email = email;
  }

  public getPassword(): string {
    return this.password;
  }

  public setPassword(password: string) {
    this.password = password;
  }
}
