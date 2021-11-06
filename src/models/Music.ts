import {
  Table, Column, Model, DataType, AllowNull, Default, ForeignKey,
} from 'sequelize-typescript';

import StringUtils from 'src/utils/StringUtils';
import User from 'src/models/User';

import { IMusicJson } from 'src/interfaces/IMusicJson';

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

  @ForeignKey(() => User)
  @Column
  private userId: number;

  public getId(): number {
    return this.id;
  }

  public setId(id: number) {
    this.id = id;
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

  public getUserId(): number {
    return this.userId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON(): IMusicJson {
    const json: any = super.toJSON();

    return {
      id: json.id,
      title: json.title,
      artist: json.artist,
      release_date: json.releaseDate,
      duration: StringUtils.formatDuration(this.duration),
      number_views: json.numberViews,
      feat: json.feat,
      created_at: StringUtils.formatDateTime(this.createdAt),
      updated_at: StringUtils.formatDateTime(this.updatedAt),
    };
  }
}
