export default class MusicFactory {
  public factoryTenMinimumValidCredentialsMusics(): any[] {
    const musics = [];

    for (let index = 1; index <= 10; index++) {
      musics.push({
        title: `Title ${index}`,
        artist: `Artist ${index}`,
        releaseDate: new Date(),
        duration: new Date(),
      });
    }

    return musics;
  }

  public factoryValidCredentialsMusic(): any {
    const releaseDate = new Date().toISOString().split('T')[0];

    return {
      title: 'Title Test',
      artist: 'Artist Test',
      releaseDate,
      duration: new Date().toISOString(),
      numberViews: 1,
      feat: true,
    };
  }

  public factoryMinimumValidCredentialsMusic(): any {
    const releaseDate = new Date().toISOString().split('T')[0];

    return {
      title: 'Title 1',
      artist: 'Artist 1',
      releaseDate,
      duration: new Date().toISOString(),
    };
  }
}
