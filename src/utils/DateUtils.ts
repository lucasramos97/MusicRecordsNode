export default class DateUtils {
  public static createReleaseDate(releaseDate: string): Date {
    return new Date(`${releaseDate}T00:00:00`);
  }

  public static createDuration(duration: string): Date {
    if (duration.length === 8) {
      return new Date(`2021-01-01T${duration}`);
    }

    return new Date(duration);
  }
}
