const bcrypt = require('bcrypt');

export default class StringUtils {
  public static async encryptValue(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }
}
