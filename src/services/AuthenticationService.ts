import User from '@models/User';

const jwt = require('jsonwebtoken');

export default class AuthenticationService {
  public async authenticate(user: User): Promise<any> {
    const token = await jwt.sign({ id: user.getId() }, process.env.SECRET, {
      expiresIn: '24h',
    });
    return { token };
  }
}
