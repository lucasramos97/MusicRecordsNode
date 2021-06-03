import User from '@models/User';

export default class UserService {
  public async save(user: any): Promise<User> {
    await this.validate(user);
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
