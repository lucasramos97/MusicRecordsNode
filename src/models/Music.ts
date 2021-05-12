import {
  Table, Column, Model, DataType, AllowNull, Default,
} from 'sequelize-typescript';

@Table({ tableName: 'musics' })
export default class Music extends Model {
  @AllowNull(false)
  @Column
  private title: string;

  @AllowNull(false)
  @Column
  private artist: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  private releaseDate: Date;

  @AllowNull(false)
  @Column(DataType.TIME)
  private duration: Date;

  @Default(0)
  @Column
  private numberViews: number;

  @AllowNull(false)
  @Default(false)
  @Column
  private feat: boolean;

  @AllowNull(false)
  @Default(false)
  @Column
  private deleted: boolean;

  public getId(): number {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string) {
    this.title = title;
  }

  public getArtist(): string {
    return this.artist;
  }

  public setArtist(artist: string) {
    this.artist = artist;
  }

  public getReleaseDate(): Date {
    return this.releaseDate;
  }

  public setReleaseDate(releaseDate: Date) {
    this.releaseDate = releaseDate;
  }

  public getDuration(): Date {
    return this.duration;
  }

  public setDuration(duration: Date) {
    this.duration = duration;
  }

  public getNumberViews(): number {
    return this.numberViews;
  }

  public setNumberViews(numberViews: number) {
    this.numberViews = numberViews;
  }

  public isFeat(): boolean {
    return this.feat;
  }

  public setFeat(feat: boolean) {
    this.feat = feat;
  }

  public isDeleted(): boolean {
    return this.deleted;
  }

  public setDeleted(deleted: boolean) {
    this.deleted = deleted;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
