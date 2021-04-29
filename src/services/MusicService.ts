import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';

export default class MusicService {
  async getAllPagination(page = 0, size = 5): Promise<PaginatedQueryModel<Music>> {
    const result = await Music.findAndCountAll({
      offset: size * page,
      limit: size,
    });

    return new PaginatedQueryModel<Music>(result);
  }

  async save(music: any): Promise<Music> {
    await this.validate(music);
    return Music.create(music);
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
