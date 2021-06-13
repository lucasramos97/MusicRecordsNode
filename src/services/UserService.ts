import User from '@models/User';
import AuthenticationService from '@services/AuthenticationService';
import StringUtils from '@utils/StringUtils';

export default class UserService {
  public async save(user: any): Promise<User> {
    await this.validateSave(user);
    // eslint-disable-next-line no-param-reassign
    user.password = await StringUtils.encryptValue(user.password);
    return User.create(user);
  }

  public async login(user: any): Promise<any> {
    const validUser = await this.validateLogin(user);
    const result = await new AuthenticationService().authenticate(validUser);
    return { username: validUser.getName(), email: validUser.getEmail(), token: result.token };
  }

  private async validateSave(user: any) {
    if (!user.name) {
      throw new Error('Name is required!');
    }

    if (!user.email) {
      throw new Error('E-mail is required!');
    }

    if (!user.password) {
      throw new Error('Password is required!');
    }

    if (!StringUtils.validEmail(user.email)) {
      throw new Error('E-mail invalid!');
    }
  }

  private async validateLogin(user: any): Promise<User> {
    if (!user.email) {
      throw new Error('E-mail is required!');
    }

    if (!user.password) {
      throw new Error('Password is required!');
    }

    if (!StringUtils.validEmail(user.email)) {
      throw new Error('E-mail invalid!');
    }

    const dbUser = await User.findOne({ where: { email: user.email } });

    if (!dbUser) {
      throw new Error(`User not found by e-mail: ${user.email}!`);
    }

    const validPassword = await StringUtils
      .compareEncryptValue(user.password, dbUser.getPassword());

    if (!validPassword) {
      throw new Error('Password invalid!');
    }

    return dbUser;
  }
}
