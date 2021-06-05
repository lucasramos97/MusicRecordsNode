import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';

export default class MusicService {
  public async getAllPagination(page = 0, size = 5, userId: number):
  Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      where: {
        deleted: false,
        user_id: userId,
      },
      order: [
        ['artist', 'ASC'],
        ['title', 'ASC'],
      ],
      offset: size * page,
      limit: size,
    });

    return new PaginatedQueryModel<Music>(result);
  }

  public async getById(musicId: number, userId: number): Promise<Music> {
    return this.getMusicIfExists(musicId, userId);
  }

  public async save(music: any): Promise<Music> {
    await this.validate(music);
    return Music.create(music);
  }

  public async update(musicId: number, music: any): Promise<[number, Music[]]> {
    await this.validate(music);
    await this.getMusicIfExists(musicId, music.userId);
    return Music.update(
      music,
      { where: { id: musicId, user_id: music.userId } },
    );
  }

  public async logicalDelete(musicId: number, userId: number): Promise<[number, Music[]]> {
    await this.getMusicIfExists(musicId, userId);

    const response = await Music.update(
      { deleted: true },
      { where: { id: musicId, user_id: userId } },
    );

    return response;
  }

  public async getCountDeletedMusics(userId: number): Promise<number> {
    return Music.count({
      where: {
        deleted: true,
        user_id: userId,
      },
    });
  }

  public async getAllDeletedPagination(page = 0, size = 5, userId: number):
  Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      where: {
        deleted: true,
        user_id: userId,
      },
      order: [
        ['artist', 'ASC'],
        ['title', 'ASC'],
      ],
      offset: size * page,
      limit: size,
    });

    return new PaginatedQueryModel<Music>(result);
  }

  public async restoreDeletedMusics(musics: Music[], userId: number): Promise<[number, Music[]]> {
    const response = await Music.update(
      { deleted: false },
      { where: { id: musics.map((m) => m.id), user_id: userId } },
    );

    return response;
  }

  public async definitiveDelete(musicId: number, userId: number): Promise<Music> {
    const music = await this.getMusicIfNotExists(musicId, userId);

    await music.destroy();

    return music;
  }

  public async emptyList(userId: number): Promise<number> {
    return Music.destroy({
      where: {
        deleted: true,
        user_id: userId,
      },
    });
  }

  private async validate(music: any) {
    if (!music.title) {
      throw new Error('Title is required!');
    }

    if (!music.artist) {
      throw new Error('Artist is required!');
    }

    if (!music.releaseDate) {
      throw new Error('Release Date is required!');
    }

    if (!music.duration) {
      throw new Error('Duration is required!');
    }
  }

  private async getMusicIfExists(musicId: number, userId: number): Promise<Music> {
    const music = await Music.findOne({ where: { id: musicId, user_id: userId } });

    if (!music || (music && music.isDeleted())) {
      throw Error('Music not found!');
    }

    return music;
  }

  private async getMusicIfNotExists(musicId: number, userId: number): Promise<Music> {
    const music = await Music.findOne({ where: { id: musicId, user_id: userId } });

    if (!music || (music && !music.isDeleted())) {
      throw Error('Music not deleted!');
    }

    return music;
  }
}
