const bcrypt = require('bcrypt');

export default class StringUtils {
  public static async encryptValue(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  public static validEmail(email: string): boolean {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  }
}
