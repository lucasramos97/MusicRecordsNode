export default class Messages {
  // User Messages
  public static readonly USERNAME_IS_REQUIRED = 'Username is required!';

  public static readonly EMAIL_INVALID = 'E-mail invalid!';

  public static readonly EMAIL_IS_REQUIRED = 'E-mail is required!';

  public static readonly PASSWORD_IS_REQUIRED = 'Password is required!';

  // Music Messages
  public static readonly ID_IS_REQUIRED = 'Id is required!';

  public static readonly TITLE_IS_REQUIRED = 'Title is required!';

  public static readonly ARTIST_IS_REQUIRED = 'Artist is required!';

  public static readonly RELEASE_DATE_IS_REQUIRED = 'Release Date is required!';

  public static readonly DURATION_IS_REQUIRED = 'Duration is required!';

  public static readonly MUSIC_NOT_FOUND = 'Music not found!';

  public static readonly RELEASE_DATE_CANNOT_BE_FUTURE = 'Release Date cannot be future!';

  public static readonly WRONG_RELEASE_DATE_FORMAT = 'Wrong Release Date format, try yyyy-MM-dd!';

  public static readonly WRONG_DURATION_FORMAT = 'Wrong Duration format, try HH:mm:ss!';

  // Authorization Messages
  public static readonly HEADER_AUTHORIZATION_NOT_PRESENT = 'Header Authorization not present!';

  public static readonly NO_BEARER_AUTHENTICATION_SCHEME = 'No Bearer HTTP authentication scheme!';

  public static readonly NO_TOKEN_PROVIDED = 'No token provided!';

  public static readonly INVALID_TOKEN = 'Invalid token!';

  public static readonly TOKEN_EXPIRED = 'Log in again, your token has expired!';

  public static getInvalidDate(date: string): string {
    return `'${date}' is not a valid date!`;
  }

  public static getInvalidTime(time: string): string {
    return `'${time}' is not a valid time!`;
  }

  public static getEmailAlreadyRegistered(email: string): string {
    return `The ${email} e-mail has already been registered!`;
  }

  public static getUserNotFoundByEmail(email: string): string {
    return `User not found by e-mail: ${email}!`;
  }

  public static getPasswordDoesNotMatchWithEmail(email: string): string {
    return `Password does not match with email: ${email}!`;
  }
}
