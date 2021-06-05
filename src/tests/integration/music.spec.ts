import AppController from '@controllers/AppController';
import Music from '@models/Music';
import User from '@models/User';
import MusicFactory from '@utils/MusicFactory';

const request = require('supertest');

const app = new AppController().getExpress();
const musicFactory = new MusicFactory();
let userId: number;
let userId2: number;
let token: string;
let token2: string;

describe('List Musics', () => {
  beforeAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });

    const adminUser = { name: 'admin', email: 'admin@email.com', password: '123' };
    const createResponse = await request(app).post('/users').send(adminUser);
    userId = createResponse.body.id;
    const musics = musicFactory.factoryTenFirstMusicsForTesting(userId);
    await Music.bulkCreate(musics);
    const loginResponse = await request(app).post('/login').send(adminUser);
    token = loginResponse.body.token;

    const adminUser2 = { name: 'admin2', email: 'admin2@email.com', password: '321' };
    const createResponse2 = await request(app).post('/users').send(adminUser2);
    userId2 = createResponse2.body.id;
    const musics2 = musicFactory.factoryTenFirstMusicsForTesting(userId2);
    await Music.bulkCreate(musics2);
    const loginResponse2 = await request(app).post('/login').send(adminUser2);
    token2 = loginResponse2.body.token;

    const deletedMusics = musicFactory.factoryTenDeletedMusics(userId);
    await Music.bulkCreate(deletedMusics);

    const deletedMusics2 = musicFactory.factoryTenDeletedMusics(userId2);
    await Music.bulkCreate(deletedMusics2);
  });

  it('get paginated musics without query params', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.content.length).toBeLessThanOrEqual(5);
    expect(response.body.content[4].title).toBe('Title 5');
    expect(response.status).toBe(200);
  });

  it('get paginated musics with query params', async () => {
    const response = await request(app)
      .get('/musics?page=1&size=4')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.content.length).toBeLessThanOrEqual(4);
    expect(response.body.content[1].title).toBe('Title 6');
    expect(response.status).toBe(200);
  });

  it('get paginated musics distinct by users', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token}`);

    const response2 = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token2}`);

    const countAllMusics = await Music.count({ where: { deleted: false } });

    const responseIds = response.body.content.map((m) => m.id);
    const response2Ids = response2.body.content.map((m) => m.id);
    let matchIds = false;

    responseIds.forEach((e) => {
      if (response2Ids.includes(e)) {
        matchIds = true;
      }
    });

    expect(response.body.total).toBe(9);
    expect(response2.body.total).toBe(9);
    expect(countAllMusics).toBe(18);
    expect(matchIds).toBeFalsy();
    expect(response.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('get paginated musics without Authorization header', async () => {
    const response = await request(app).get('/musics');

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('get paginated musics without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('get paginated musics without token value', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Get Music', () => {
  it('get music by id', async () => {
    const music = await Music.findOne({ where: { deleted: false, user_id: userId } });

    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    const compareMusic = {
      ...music.toJSON(),
      createdAt: music.getCreatedAt().toJSON(),
      updatedAt: music.getUpdatedAt().toJSON(),
    };

    expect(response.body).toMatchObject(compareMusic);
    expect(response.status).toBe(200);
  });

  it('get music by id match different users', async () => {
    const music = await Music.findOne({ where: { deleted: false, user_id: userId } });
    const music2 = await Music.findOne({ where: { deleted: false, user_id: userId2 } });

    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    const response2 = await request(app)
      .get(`/musics/${music2.getId()}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(response.body.id).toBe(music.getId());
    expect(response2.body.id).toBe(music2.getId());
    expect(response.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('get music by id with music already deleted', async () => {
    const music = await Music.findOne({ where: { deleted: true, user_id: userId } });

    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('get music by id with non-existent music', async () => {
    const response = await request(app)
      .get(`/musics/${1000}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('get music by id with different users', async () => {
    const music = await Music.findOne({ where: { deleted: false, user_id: userId } });

    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('get music by id without Authorization header', async () => {
    const response = await request(app)
      .get(`/musics/${1}`);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('get music by id without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .get(`/musics/${1}`)
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('get music by id without token value', async () => {
    const response = await request(app)
      .get(`/musics/${1}`)
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('List Deleted Musics', () => {
  it('get deleted paginated musics without query params', async () => {
    const response = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.content.length).toBeLessThanOrEqual(5);
    expect(response.body.content[4].title).toBe('Title 3');
    expect(response.status).toBe(200);
  });

  it('get deleted paginated musics with query params', async () => {
    const response = await request(app)
      .get('/musics/deleted?page=1&size=4')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.content.length).toBeLessThanOrEqual(4);
    expect(response.body.content[1].title).toBe('Title 4');
    expect(response.status).toBe(200);
  });

  it('get deleted paginated musics distinct by users', async () => {
    const response = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const response2 = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token2}`);

    const countAllMusics = await Music.count({ where: { deleted: true } });

    const responseIds = response.body.content.map((m) => m.id);
    const response2Ids = response2.body.content.map((m) => m.id);
    let matchIds = false;

    responseIds.forEach((e) => {
      if (response2Ids.includes(e)) {
        matchIds = true;
      }
    });

    expect(response.body.total).toBe(11);
    expect(response2.body.total).toBe(11);
    expect(countAllMusics).toBe(22);
    expect(matchIds).toBeFalsy();
    expect(response.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('get deleted paginated musics without Authorization header', async () => {
    const response = await request(app).get('/musics/deleted');

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('get deleted paginated musics without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('get deleted paginated musics without token value', async () => {
    const response = await request(app)
      .get('/musics/deleted')
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Count Deleted Musics', () => {
  it('count deleted musics', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toBe(11);
    expect(response.status).toBe(200);
  });

  it('count deleted musics without Authorization header', async () => {
    const response = await request(app)
      .get('/musics/deleted/count');

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('count deleted musics without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('count deleted musics without token value', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Save Music', () => {
  it('save music with valid credentials', async () => {
    const countMusicsByUserBefore = await Music
      .count({ where: { deleted: false, user_id: userId } });

    const music = musicFactory.factoryValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    const countMusicsByUserAfter = await Music
      .count({ where: { deleted: false, user_id: userId } });

    expect(countMusicsByUserAfter).toBe(countMusicsByUserBefore + 1);
    expect(response.body).toMatchObject(music);
    expect(response.status).toBe(201);
  });

  it('save music with minimum valid credentials', async () => {
    const countMusicsByUserBefore = await Music
      .count({ where: { deleted: false, user_id: userId } });

    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    const countMusicsByUserAfter = await Music
      .count({ where: { deleted: false, user_id: userId } });

    const compareMusic = {
      ...music, numberViews: 0, feat: false, deleted: false,
    };

    expect(countMusicsByUserAfter).toBe(countMusicsByUserBefore + 1);
    expect(response.body).toMatchObject(compareMusic);
    expect(response.status).toBe(201);
  });

  it('save music without title field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.title = '';

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Title is required!');
    expect(response.status).toBe(400);
  });

  it('save music without artist field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.artist = '';

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Artist is required!');
    expect(response.status).toBe(400);
  });

  it('save music without release date field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.releaseDate = null;

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Release Date is required!');
    expect(response.status).toBe(400);
  });

  it('save music without duration field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.duration = null;

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Duration is required!');
    expect(response.status).toBe(400);
  });

  it('save music without Authorization header', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('save music without Bearer HTTP authentication scheme', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .set('Authorization', `Token ${token}`)
      .send(music);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('save music without token value', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .post('/musics')
      .set('Authorization', 'Bearer ')
      .send(music);

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Update Music', () => {
  it('update all music fields', async () => {
    const originalMusic = await Music
      .findOne({ where: { deleted: false, user_id: userId } });
    originalMusic.setTitle('Title 11');
    originalMusic.setArtist('Artist 11');
    originalMusic.setReleaseDate(new Date('2020-1-1'));
    originalMusic.setDuration(new Date(2020, 0, 1, 0, 6, 44));
    originalMusic.setNumberViews(11);
    originalMusic.setFeat(true);

    const originalMusicJson = originalMusic.toJSON();

    const response = await request(app)
      .put(`/musics/${originalMusic.getId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send(originalMusicJson);

    const editedMusic = await Music
      .findOne({ where: { id: originalMusic.getId(), deleted: false, user_id: userId } });

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
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.title = '';

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Title is required!');
    expect(response.status).toBe(400);
  });

  it('update music without artist field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.artist = '';

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Artist is required!');
    expect(response.status).toBe(400);
  });

  it('update music without release date field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.releaseDate = null;

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Release Date is required!');
    expect(response.status).toBe(400);
  });

  it('update music without duration field', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();
    music.duration = null;

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Duration is required!');
    expect(response.status).toBe(400);
  });

  it('update music with music already deleted', async () => {
    const music = await Music.findOne({ where: { deleted: true, user_id: userId } });

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music.toJSON());

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('update music with non-existent music', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .put(`/musics/${1000}`)
      .set('Authorization', `Bearer ${token}`)
      .send(music);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('update music without Authorization header', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .put(`/musics/${1}`)
      .send(music);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('update music without Bearer HTTP authentication scheme', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', `Token ${token}`)
      .send(music);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('update music without token value', async () => {
    const music = musicFactory.factoryMinimumValidCredentialsMusic();

    const response = await request(app)
      .put(`/musics/${1}`)
      .set('Authorization', 'Bearer ')
      .send(music);

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Delete Music', () => {
  it('logically delete music', async () => {
    const originalMusic = await Music
      .findOne({ where: { deleted: false, user_id: userId } });

    const response = await request(app)
      .delete(`/musics/${originalMusic.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    const deletedMusic = await Music
      .findOne({ where: { id: originalMusic.getId(), user_id: userId } });

    expect(deletedMusic.isDeleted()).toBeTruthy();
    expect(response.status).toBe(200);
  });

  it('logically delete music with music already deleted', async () => {
    const music = await Music
      .findOne({ where: { deleted: true, user_id: userId } });

    const response = await request(app)
      .delete(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('logically delete music with non-existent music', async () => {
    const response = await request(app)
      .delete(`/musics/${1000}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('logically delete music with different users', async () => {
    const music = await Music
      .findOne({ where: { deleted: false, user_id: userId } });

    const response = await request(app)
      .delete(`/musics/${music.getId()}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(response.body.message).toBe('Music not found!');
    expect(response.status).toBe(400);
  });

  it('logically delete music without Authorization header', async () => {
    const response = await request(app)
      .delete(`/musics/${1}`);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('logically delete music without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .delete(`/musics/${1}`)
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('logically delete music without token value', async () => {
    const response = await request(app)
      .delete(`/musics/${1}`)
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Restore Deleted Musics', () => {
  it('restore deleted musics', async () => {
    const deletedMusicsUserBefore = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const deletedMusicsUser2Before = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token2}`);

    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', `Bearer ${token}`)
      .send(deletedMusicsUserBefore.body.content);

    const deletedMusicsUserAfter = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const deletedMusicsUser2After = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token2}`);

    expect(response.body).toStrictEqual([5]);
    expect(deletedMusicsUserAfter.body.total).toBe(deletedMusicsUserBefore.body.total - 5);
    expect(deletedMusicsUser2After.body.total).toBe(deletedMusicsUser2Before.body.total);
    expect(response.status).toBe(200);
  });

  it('count deleted musics without Authorization header', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .send([]);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('count deleted musics without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', `Token ${token}`)
      .send([]);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('count deleted musics without token value', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', 'Bearer ')
      .send([]);

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Definitive Delete Music', () => {
  it('definitive delete music', async () => {
    const deletedMusicsBefore = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const music = deletedMusicsBefore.body.content[0];

    const response = await request(app)
      .delete(`/musics/definitive/${music.id}`)
      .set('Authorization', `Bearer ${token}`);

    const deletedMusicsAfter = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(deletedMusicsAfter.body.total).toBe(deletedMusicsBefore.body.total - 1);
    expect(deletedMusicsAfter.body.content.map((m) => m.id)).not.toContain(music.id);
    expect(response.body.deleted).toBeTruthy();
    expect(response.status).toBe(200);
  });

  it('definitive delete music with music not deleted', async () => {
    const music = await Music.findOne({ where: { deleted: false, user_id: userId } });

    const response = await request(app)
      .delete(`/musics/definitive/${music.getId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not deleted!');
    expect(response.status).toBe(400);
  });

  it('definitive delete music with non-existent music', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${1000}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.message).toBe('Music not deleted!');
    expect(response.status).toBe(400);
  });

  it('definitive delete music with different users', async () => {
    const music = await Music.findOne({ where: { deleted: true, user_id: userId } });

    const response = await request(app)
      .delete(`/musics/definitive/${music.getId()}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(response.body.message).toBe('Music not deleted!');
    expect(response.status).toBe(400);
  });

  it('definitive delete music without Authorization header', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${1}`);

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('definitive delete music without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${1}`)
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('definitive delete music without token value', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${1}`)
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});

describe('Empty List', () => {
  it('empty list', async () => {
    const listMusicUserBefore = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token}`);

    const listMusicUser2Before = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token2}`);

    const deletedListMusicUserBefore = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const deletedListMusicUser2Before = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token2}`);

    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', `Bearer ${token}`);

    const listMusicUserAfter = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token}`);

    const listMusicUser2After = await request(app)
      .get('/musics')
      .set('Authorization', `Bearer ${token2}`);

    const deletedListMusicUserAfter = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token}`);

    const deletedListMusicUser2After = await request(app)
      .get('/musics/deleted')
      .set('Authorization', `Bearer ${token2}`);

    expect(listMusicUserBefore.body.total).toBe(listMusicUserAfter.body.total);
    expect(deletedListMusicUserBefore.body.total).toBeGreaterThan(0);
    expect(deletedListMusicUserAfter.body.total).toBe(0);
    expect(listMusicUser2Before.body.total).toBe(listMusicUser2After.body.total);
    expect(deletedListMusicUser2Before.body.total).toBe(deletedListMusicUser2After.body.total);
    expect(response.body).toBe(deletedListMusicUserBefore.body.total);
    expect(response.status).toBe(200);
  });

  it('empty list without Authorization header', async () => {
    const response = await request(app)
      .delete('/musics/empty-list');

    expect(response.body.message).toBe('Header Authorization not present!');
    expect(response.status).toBe(401);
  });

  it('empty list without Bearer HTTP authentication scheme', async () => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', `Token ${token}`);

    expect(response.body.message).toBe('No Bearer HTTP authentication scheme!');
    expect(response.status).toBe(401);
  });

  it('empty list without token value', async () => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', 'Bearer ');

    expect(response.body.message).toBe('No token provided!');
    expect(response.status).toBe(401);
  });
});
