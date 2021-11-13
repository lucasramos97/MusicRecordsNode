import DateUtils from 'src/utils/DateUtils';
import Messages from 'src/utils/Messages';
import Music from 'src/models/Music';
import ResponseError from 'src/erros/ResponseError';

import { IPaginatedQueryModel } from 'src/interfaces/IPaginatedQueryModel';
import { IMusicJson } from 'src/interfaces/IMusicJson';
import { IMusic } from 'src/interfaces/IMusic';

export default class MusicService {
  public async getAllMusics(userId: number, page = 0, size = 5, deleted = false):
    Promise<IPaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      where: {
        deleted,
        user_id: userId,
      },
      order: [
        ['artist', 'ASC'],
        ['title', 'ASC'],
      ],
      offset: size * page,
      limit: size,
    });

    return {
      content: result.rows,
      total: result.count,
    };
  }

  public async getById(musicId: number, userId: number): Promise<Music> {
    return this.getMusicIfExists(musicId, userId);
  }

  public async save(musicJson: IMusicJson): Promise<Music> {
    await this.validate(musicJson);
    const music = await this.createMusic(musicJson);

    return Music.create(music);
  }

  public async update(musicId: number, musicJson: IMusicJson): Promise<Music> {
    await this.validate(musicJson);
    const dbMusic = await this.getMusicIfExists(musicId, musicJson.userId);
    dbMusic.setTitle(musicJson.title);
    dbMusic.setArtist(musicJson.artist);
    dbMusic.setReleaseDate(DateUtils.createReleaseDate(musicJson.release_date));
    dbMusic.setDuration(DateUtils.createDuration(musicJson.duration));

    if (musicJson.number_views !== undefined) {
      dbMusic.setNumberViews(musicJson.number_views);
    }

    if (musicJson.feat !== undefined) {
      dbMusic.setFeat(musicJson.feat);
    }

    return dbMusic.save();
  }

  public async delete(musicId: number, userId: number): Promise<Music> {
    const dbMusic = await this.getMusicIfExists(musicId, userId);
    dbMusic.setDeleted(true);

    return dbMusic.save();
  }

  public async getCountDeletedMusics(userId: number): Promise<number> {
    return Music.count({
      where: {
        deleted: true,
        user_id: userId,
      },
    });
  }

  public async restoreDeletedMusics(musicsJson: IMusicJson[], userId: number): Promise<number> {
    const ids: number[] = musicsJson.map((m) => m.id);

    if (ids.some((i) => i === undefined)) {
      throw new ResponseError(Messages.ID_IS_REQUIRED, 400);
    }

    const [response] = await Music.update(
      { deleted: false },
      { where: { id: ids, deleted: true, user_id: userId } },
    );

    return response;
  }

  public async definitiveDelete(musicId: number, userId: number): Promise<void> {
    const music = await this.getMusicIfNotExists(musicId, userId);

    await music.destroy();
  }

  public async emptyList(userId: number): Promise<number> {
    return Music.destroy({
      where: {
        deleted: true,
        user_id: userId,
      },
    });
  }

  private async getMusicIfExists(musicId: number, userId: number): Promise<Music> {
    const music = await Music.findOne({
      where: {
        id: musicId,
        user_id: userId,
      },
    });

    if (!music || (music && music.isDeleted())) {
      throw new ResponseError(Messages.MUSIC_NOT_FOUND, 404);
    }

    return music;
  }

  private async validate(musicJson: IMusicJson) {
    if (!musicJson.title) {
      throw new ResponseError(Messages.TITLE_IS_REQUIRED, 400);
    }

    if (!musicJson.artist) {
      throw new ResponseError(Messages.ARTIST_IS_REQUIRED, 400);
    }

    if (!musicJson.release_date) {
      throw new ResponseError(Messages.RELEASE_DATE_IS_REQUIRED, 400);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(musicJson.release_date)) {
      throw new ResponseError(Messages.WRONG_RELEASE_DATE_FORMAT, 400);
    }

    const releaseDate = DateUtils.createReleaseDate(musicJson.release_date);

    if (Number.isNaN(releaseDate.getDate())) {
      throw new ResponseError(Messages.getInvalidDate(musicJson.release_date), 400);
    }

    if (releaseDate > new Date()) {
      throw new ResponseError(Messages.RELEASE_DATE_CANNOT_BE_FUTURE, 400);
    }

    if (!musicJson.duration) {
      throw new ResponseError(Messages.DURATION_IS_REQUIRED, 400);
    }

    if (!/^\d{2}:\d{2}:\d{2}$/.test(musicJson.duration)) {
      throw new ResponseError(Messages.WRONG_DURATION_FORMAT, 400);
    }

    const duration = DateUtils.createDuration(musicJson.duration);

    if (Number.isNaN(duration.getDate())) {
      throw new ResponseError(Messages.getInvalidTime(musicJson.duration), 400);
    }
  }

  private async createMusic(musicJson: IMusicJson): Promise<IMusic> {
    return {
      title: musicJson.title,
      artist: musicJson.artist,
      releaseDate: DateUtils.createReleaseDate(musicJson.release_date),
      duration: DateUtils.createDuration(musicJson.duration),
      numberViews: musicJson.number_views,
      feat: musicJson.feat,
      userId: musicJson.userId,
    };
  }

  private async getMusicIfNotExists(musicId: number, userId: number): Promise<Music> {
    const music = await Music.findOne({ where: { id: musicId, user_id: userId } });

    if (!music || (music && !music.isDeleted())) {
      throw new ResponseError(Messages.MUSIC_NOT_FOUND, 404);
    }

    return music;
  }
}
