/* eslint-disable camelcase */
import { ILogin } from 'src/interfaces/ILogin';
import { IUser } from 'src/interfaces/IUser';

export interface IUserJson extends ILogin, IUser {
  created_at?: string,
  updated_at?: string,
}
