import * as faker from 'faker';

import Music from 'src/models/Music';

import { IMusic } from 'src/interfaces/IMusic';

export default class MusicFactory {
  public async create(userId: number, deleted = false): Promise<Music> {
    return Music.create(this.factoryMusic(deleted, userId));
  }

  public async createBatch(quant: number, userId: number, deleted = false): Promise<Music[]> {
    if (quant < 1) {
      return [];
    }

    const musics: IMusic[] = [];
    for (let index = 0; index < quant; index++) {
      musics.push(this.factoryMusic(deleted, userId));
    }

    return Music.bulkCreate(musics);
  }

  private factoryMusic(deleted: boolean, userId: number): IMusic {
    return {
      title: faker.lorem.words(),
      artist: faker.name.findName(),
      releaseDate: faker.date.past(),
      duration: faker.date.between(new Date(), new Date().getDate() + 1),
      numberViews: faker.datatype.number(),
      feat: faker.datatype.boolean(),
      deleted,
      userId,
    };
  }
}
