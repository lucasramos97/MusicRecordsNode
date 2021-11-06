import * as bcrypt from 'bcrypt';

import User from 'src/models/User';

import { IUser } from 'src/interfaces/IUser';

export default class UserFactory {
  public async create(complement = '1'): Promise<IUser> {
    const password = '123';
    const encryptedPassword = await bcrypt.hash(password, 10);

    const user: IUser = {
      username: `user${complement}`,
      email: `user${complement}@email.com`,
      password: encryptedPassword,
    };

    const dbUser = await User.create(user);

    return { ...user, id: dbUser.getId(), password };
  }
}
