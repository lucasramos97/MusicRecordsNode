import * as jwt from 'jsonwebtoken';

export default class AuthenticationService {
  public async authenticate(userId: number): Promise<any> {
    const token = await jwt.sign({ id: userId }, process.env.SECRET, {
      expiresIn: '24h',
    });
    return { token };
  }
}
