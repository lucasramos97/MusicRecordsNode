export default class ResponseError extends Error {
  private code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }

  public getMessage(): string {
    return this.message;
  }

  public getCode(): number {
    return this.code;
  }
}
