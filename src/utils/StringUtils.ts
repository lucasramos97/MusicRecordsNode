export default class StringUtils {
  public static formatDuration(duration: Date): string {
    if (!duration) {
      return '';
    }

    const time = new Date(duration);
    const hours = this.addLeadingZero(time.getHours());
    const minutes = this.addLeadingZero(time.getMinutes());
    const seconds = this.addLeadingZero(time.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
  }

  public static formatDateTime(dateTime: Date): string {
    if (!dateTime) {
      return '';
    }

    const year = dateTime.getFullYear();
    const month = this.addLeadingZero(dateTime.getMonth());
    const day = this.addLeadingZero(dateTime.getDay());
    const hours = this.addLeadingZero(dateTime.getHours());
    const minutes = this.addLeadingZero(dateTime.getMinutes());
    const seconds = this.addLeadingZero(dateTime.getSeconds());
    const milliseconds = this.addLeadingZero(dateTime.getMilliseconds(), 2, false);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private static addLeadingZero(value: number, quant = 1, left = true): string {
    if (quant < 1) {
      return `${value}`;
    }

    const numberOfZeros = (quant + 1) - String(value).length;
    let result = '';
    for (let i = 0; i < numberOfZeros; i++) {
      result += '0';
    }

    return left ? `${result}${value}` : `${value}${result}`;
  }
}
