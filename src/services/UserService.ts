import User from '@models/User';
import StringUtils from '@utils/StringUtils';

export default class UserService {
  public async save(user: any): Promise<User> {
    await this.validate(user);
    // eslint-disable-next-line no-param-reassign
    user.password = await StringUtils.encryptValue(user.password);
    return User.create(user);
  }

  private async validate(user: any) {
    if (!user.name) {
      throw new Error('Name is required!');
    }

    if (!user.email) {
      throw new Error('E-mail is required!');
    }

    if (!user.password) {
      throw new Error('Password is required!');
    }
  }
}
