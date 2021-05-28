/* eslint-disable no-await-in-loop */
import AppController from '@controllers/AppController';
import Music from '@models/Music';
import MusicFactory from '@utils/MusicFactory';

const request = require('supertest');

const app = new AppController().getExpress();
const musicFactory = new MusicFactory();

beforeAll(async () => {
  await Music.destroy({
    where: {},
    truncate: true,
  });
});

describe('List Musics', () => {
  beforeAll(async () => {
    const musics = musicFactory.factoryTenFirstMusicsForTesting();
    await Music.bulkCreate(musics);
  });

  it('get musics paginated without query params', async () => {
    const response = await request(app).get('/musics');

    expect(response.body.content.length).toBeLessThanOrEqual(5);
    expect(response.body.content[4].title).toBe('Title 5');
    expect(response.status).toBe(200);
  });

  it('get musics paginated with query params', async () => {
    const response = await request(app).get('/musics?page=1&size=4');

    expect(response.body.content.length).toBeLessThanOrEqual(4);
    expect(response.body.content[1].title).toBe('Title 6');
    expect(response.status).toBe(200);
  });
});

describe('Get Music', () => {
  it('get music by id', async () => {
    const music = await Music.findOne({ where: { title: 'Title 2' } });

    const response = await request(app).get(`/musics/${music.getId()}`);

    const compareMusic = {
      ...music.toJSON(),
      createdAt: music.getCreatedAt().toJSON(),
      updatedAt: music.getUpdatedAt().toJSON(),
    };

    expect(response.body).toMatchObject(compareMusic);
    expect(response.status).toBe(200);
  });

  it('get music by id with music already deleted', async () => {
    const music = await Music.findOne({ where: { title: 'Title 1' } });

    const response = await request(app).get(`/musics/${music.getId()}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('get music by id with non-existent music', async () => {
    const response = await request(app).get(`/musics/${1000}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });
});

describe('Save Music', () => {
  it('save music with valid credentials', async () => {
    const music = musicFactory.factoryValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body).toMatchObject(music);
    expect(response.status).toBe(201);
  });

  it('save music with minimum valid credentials', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .send(music);

    const compareMusic = {
      ...music, numberViews: 0, feat: false, deleted: false,
    };

    expect(response.body).toMatchObject(compareMusic);
    expect(response.status).toBe(201);
  });

  it('save music without title field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.title = '';

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body.message).toBe('Title is required!');
    expect(response.status).toBe(400);
  });

  it('save music without artist field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.artist = '';

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body.message).toBe('Artist is required!');
    expect(response.status).toBe(400);
  });

  it('save music without release date field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.releaseDate = null;

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body.message).toBe('Release Date is required!');
    expect(response.status).toBe(400);
  });

  it('save music without duration field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.duration = null;

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body.message).toBe('Duration is required!');
    expect(response.status).toBe(400);
  });
});

describe('Update Music', () => {
  it('update all music fields', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 10' } });
    originalMusic.setTitle('Title 11');
    originalMusic.setArtist('Artist 11');
    originalMusic.setReleaseDate(new Date('2020-1-1'));
    originalMusic.setDuration(new Date(2020, 0, 1, 0, 6, 44));
    originalMusic.setNumberViews(11);
    originalMusic.setFeat(true);

    const originalMusicJson = originalMusic.toJSON();

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .send(originalMusicJson);

    const editedMusic = await Music.findByPk(originalMusic.getId());

    const compareOriginalMusic = {
      ...originalMusicJson,
      releaseDate: originalMusic.getReleaseDate(),
      duration: originalMusic.getDuration().toJSON(),
      updatedAt: editedMusic.getUpdatedAt(),
    };

    expect(response.body).toStrictEqual([1]);
    expect(editedMusic.toJSON()).toMatchObject(compareOriginalMusic);
    expect(response.status).toBe(200);
  });

  it('update music without title field', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 11' } });
    originalMusic.setTitle('');

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .send(originalMusic.toJSON());

    expect(response.body.message).toBe('Title is required!');
    expect(response.status).toBe(400);
  });

  it('update music without artist field', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 11' } });
    originalMusic.setArtist('');

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .send(originalMusic.toJSON());

    expect(response.body.message).toBe('Artist is required!');
    expect(response.status).toBe(400);
  });

  it('update music without release date field', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 11' } });
    originalMusic.setReleaseDate(null);

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .send(originalMusic.toJSON());

    expect(response.body.message).toBe('Release Date is required!');
    expect(response.status).toBe(400);
  });

  it('update music without duration field', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 11' } });
    originalMusic.setDuration(null);

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .send(originalMusic.toJSON());

    expect(response.body.message).toBe('Duration is required!');
    expect(response.status).toBe(400);
  });
});

describe('Delete Music', () => {
  it('logically delete music', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 11' } });

    const response = await request(app).delete(`/musics/${originalMusic.getId()}`);

    const deletedMusic = await Music.findByPk(originalMusic.getId());

    expect(originalMusic.isDeleted()).toBe(false);
    expect(deletedMusic.isDeleted()).toBe(true);
    expect(response.status).toBe(200);
  });

  it('logically delete music with music already deleted', async () => {
    const music = await Music.findOne({ where: { title: 'Title 11' } });

    const response = await request(app).delete(`/musics/${music.getId()}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('logically delete music with non-existent music', async () => {
    const response = await request(app).delete(`/musics/${1000}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });
});

describe('List Deleted Musics', () => {
  beforeAll(async () => {
    const musics = musicFactory.factoryTenDeletedMusics();
    await Music.bulkCreate(musics);
  });

  it('get deleted musics paginated without query params', async () => {
    const response = await request(app).get('/musics/deleted');

    expect(response.body.content.length).toBeLessThanOrEqual(5);
    expect(response.body.content[4].title).toBe('Title 2');
    expect(response.status).toBe(200);
  });

  it('get deleted musics paginated with query params', async () => {
    const response = await request(app).get('/musics/deleted/?page=1&size=4');

    expect(response.body.content.length).toBeLessThanOrEqual(4);
    expect(response.body.content[1].title).toBe('Title 3');
    expect(response.status).toBe(200);
  });
});

describe('Count Deleted Musics', () => {
  it('count deleted musics', async () => {
    const response = await request(app).get('/musics/deleted/count');

    expect(response.body).toBe(12);
    expect(response.status).toBe(200);
  });
});

describe('Restore Deleted Musics', () => {
  it('restore deleted musics', async () => {
    const deletedMusicsBefore = await request(app).get('/musics/deleted');

    const response = await request(app)
      .post('/musics/deleted/restore')
      .send(deletedMusicsBefore.body.content);

    const deletedMusicsAfter = await request(app).get('/musics/deleted');

    expect(response.body).toStrictEqual([5]);
    expect(deletedMusicsAfter.body.total).toBe(deletedMusicsBefore.body.total - 5);
    expect(response.status).toBe(200);
  });
});

describe('Definitive Delete Music', () => {
  it('definitive delete music', async () => {
    const originalMusic = await Music.findOne({ where: { title: 'Title 4', deleted: true } });

    const response = await request(app).delete(`/musics/definitive/${originalMusic.getId()}`);

    const deletedMusic = await Music.findByPk(originalMusic.getId());

    expect(response.body.deleted).toBe(true);
    expect(deletedMusic).toBe(null);
    expect(response.status).toBe(200);
  });

  it('definitive delete music with music not deleted', async () => {
    const music = await Music.findOne({ where: { title: 'Title 4', deleted: false } });

    const response = await request(app).delete(`/musics/definitive/${music.getId()}`);

    expect(response.body.message).toBe('Music not deleted!');
    expect(response.status).toBe(400);
  });

  it('definitive delete music with non-existent music', async () => {
    const response = await request(app).delete(`/musics/definitive/${1000}`);

    expect(response.body.message).toBe('Music not deleted!');
    expect(response.status).toBe(400);
  });
});
