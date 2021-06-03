export default class MusicFactory {
  public factoryTenFirstMusicsForTesting(userId: number): any[] {
    const musics = [];

    musics.push({
      title: 'Title 1',
      artist: 'Artist 1',
      releaseDate: new Date(),
      duration: new Date(),
      deleted: true,
      userId,
    });

    for (let index = 2; index <= 10; index++) {
      musics.push({
        title: `Title ${index}`,
        artist: `Artist ${index}`,
        releaseDate: new Date(),
        duration: new Date(),
        userId,
      });
    }

    return musics;
  }

  public factoryValidCredentialsMusic(userId: number): any {
    const releaseDate = new Date().toJSON().split('T')[0];

    return {
      title: 'Title Test',
      artist: 'Artist Test',
      releaseDate,
      duration: new Date().toJSON(),
      numberViews: 1,
      feat: true,
      userId,
    };
  }

  public factoryMinimumValidCredentialsMusic(userId: number): any {
    const releaseDate = new Date().toJSON().split('T')[0];

    return {
      title: 'Title 1',
      artist: 'Artist 1',
      releaseDate,
      duration: new Date().toJSON(),
      userId,
    };
  }

  public factoryTenDeletedMusics(userId: number): any[] {
    const musics = [];

    for (let index = 1; index <= 10; index++) {
      musics.push({
        title: `Title ${index}`,
        artist: `Artist ${index}`,
        releaseDate: new Date(),
        duration: new Date(),
        deleted: true,
        userId,
      });
    }

    return musics;
  }
}
