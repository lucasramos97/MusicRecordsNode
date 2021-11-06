import * as bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';

import AuthenticationService from 'src/services/AuthenticationService';
import Messages from 'src/utils/Messages';
import ResponseError from 'src/erros/ResponseError';
import User from 'src/models/User';

import { IAuthenticable } from 'src/interfaces/IAuthenticable';
import { ILogin } from 'src/interfaces/ILogin';
import { IUserJson } from 'src/interfaces/IUserJson';

export default class UserService {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  public async save(userJson: IUserJson): Promise<User> {
    await this.validateCreateUser(userJson);
    // eslint-disable-next-line no-param-reassign
    userJson.password = await bcrypt.hash(userJson.password, 10);

    return User.create(userJson).then((r) => r).catch((error) => {
      if (error instanceof UniqueConstraintError && error.errors[0].type === 'unique violation') {
        throw new ResponseError(Messages.getEmailAlreadyRegistered(userJson.email), 400);
      }

      throw new ResponseError(error.message, 400);
    });
  }

  public async login(login: ILogin): Promise<IAuthenticable> {
    const dbUser = await this.validateLogin(login);
    const result = await new AuthenticationService().authenticate(dbUser.getId());

    return {
      token: result.token,
      username: dbUser.getUsername(),
      email: dbUser.getEmail(),
    };
  }

  private async validateAuthenticationFields(authentication: ILogin) {
    if (!authentication.email) {
      throw new ResponseError(Messages.EMAIL_IS_REQUIRED, 400);
    }

    if (!authentication.password) {
      throw new ResponseError(Messages.PASSWORD_IS_REQUIRED, 400);
    }

    if (!UserService.EMAIL_REGEX.test(authentication.email)) {
      throw new ResponseError(Messages.EMAIL_INVALID, 400);
    }
  }

  private async validateCreateUser(user: IUserJson) {
    if (!user.username) {
      throw new ResponseError(Messages.USERNAME_IS_REQUIRED, 400);
    }

    await this.validateAuthenticationFields(user);
  }

  private async validateLogin(login: ILogin): Promise<User> {
    await this.validateAuthenticationFields(login);

    const dbUser = await User.findOne({
      where: {
        email: login.email,
      },
    });

    if (!dbUser) {
      throw new ResponseError(Messages.getUserNotFoundByEmail(login.email), 401);
    }

    const validPassword = await bcrypt.compare(login.password, dbUser.getPassword());

    if (!validPassword) {
      throw new ResponseError(Messages.getPasswordDoesNotMatchWithEmail(login.password), 401);
    }

    return dbUser;
  }
}
