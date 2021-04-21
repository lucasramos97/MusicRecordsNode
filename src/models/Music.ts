export default class Music {
  private title: string;

  constructor() {
    this.title = '';
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string) {
    this.title = title;
  }
}
