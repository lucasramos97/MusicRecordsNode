import { ILogin } from 'src/interfaces/ILogin';

export interface IUser extends ILogin {
  id?: number,
  username: string,
}
