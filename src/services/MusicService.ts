import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';

export default class MusicService {
  public async getAllPagination(page = 0, size = 5): Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      offset: size * page,
      limit: size,
    });

    return new PaginatedQueryModel<Music>(result);
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
    const music = await Music.findByPk(musicId);

    if (!music || (music && music.isDeleted())) {
      throw Error('Music not found!');
    }

    const response = await Music.update(
      { deleted: true },
      { where: { id: musicId } },
    );

    return response;
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
}
