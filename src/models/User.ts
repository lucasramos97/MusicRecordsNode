import {
  Table, Column, Model, AllowNull,
} from 'sequelize-typescript';

import StringUtils from 'src/utils/StringUtils';

import { IUserJson } from 'src/interfaces/IUserJson';

@Table({ tableName: 'users' })
export default class User extends Model {
  @AllowNull(false)
  @Column
  private username: string;

  @AllowNull(false)
  @Column
  private email: string;

  @AllowNull(false)
  @Column
  private password: string;

  public getId(): number {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public setUsername(username: string) {
    this.username = username;
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

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON(): IUserJson {
    const json: any = super.toJSON();

    return {
      id: json.id,
      username: json.username,
      email: json.email,
      password: json.password,
      created_at: StringUtils.formatDateTime(this.createdAt),
      updated_at: StringUtils.formatDateTime(this.updatedAt),
    };
  }
}
