import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';

export default class MusicService {
  public async getAllPagination(page = 0, size = 5): Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      where: {
        deleted: false,
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

  public async getById(musicId: number): Promise<Music> {
    return this.getMusicIfExists(musicId);
  }

  public async save(music: any): Promise<Music> {
    await this.validate(music);
    return Music.create(music);
  }

  public async update(musicId: number, music: any): Promise<[number, Music[]]> {
    await this.validate(music);
    return Music.update(
      music,
      { where: { id: musicId } },
    );
  }

  public async logicalDelete(musicId: number): Promise<[number, Music[]]> {
    await this.getMusicIfExists(musicId);

    const response = await Music.update(
      { deleted: true },
      { where: { id: musicId } },
    );

    return response;
  }

  public async getCountDeletedMusics(): Promise<Number> {
    return Music.count({
      where: {
        deleted: true,
      },
    });
  }

  public async getAllDeletedPagination(page = 0, size = 5): Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      where: {
        deleted: true,
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

  public async restoreDeletedMusics(musics: Music[]): Promise<[number, Music[]]> {
    const response = await Music.update(
      { deleted: false },
      { where: { id: musics.map((m) => m.id) } },
    );

    return response;
  }

  public async definitiveDelete(musicId: number): Promise<Music> {
    const music = await this.getMusicIfNotExists(musicId);

    await music.destroy();

    return music;
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

  private async getMusicIfExists(musicId: number): Promise<Music> {
    const music = await Music.findByPk(musicId);

    if (!music || (music && music.isDeleted())) {
      throw Error('Music not found!');
    }

    return music;
  }

  private async getMusicIfNotExists(musicId: number): Promise<Music> {
    const music = await Music.findByPk(musicId);

    if (!music || (music && !music.isDeleted())) {
      throw Error('Music not deleted!');
    }

    return music;
  }
}
