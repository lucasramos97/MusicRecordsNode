import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import Music from 'src/models/Music';
import User from 'src/models/User';

import { IUser } from 'src/interfaces/IUser';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Get Music By Id', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let authorizationUser2 = '';
  let expiredAuthorization = '';

  let music: Music = null;
  let deletedMusic: Music = null;

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    authorizationUser2 = await baseTdd.getAuthorization(app, await userFactory.create('2'));
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    music = await musicFactory.create(dbUser1.id);
    deletedMusic = await musicFactory.create(dbUser1.id, true);
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('get music by id', async () => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1);

    const dbMusic = await Music.findOne({
      where: {
        id: music.getId(),
        user_id: dbUser1.id,
      },
    });

    expect(dbMusic.toJSON().toString()).toBe(response.body.toString());
    expect(baseTdd.matchDate(response.body.release_date)).toBeTruthy();
    expect(baseTdd.matchTime(response.body.duration)).toBeTruthy();
    expect(response.body.deleted).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(response.status).toBe(200);
  });

  it('get nonexistent music by id', async () => {
    const response = await request(app)
      .get(`/musics/${100}`)
      .set('Authorization', authorizationUser1);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('get deleted music by id', async () => {
    const response = await request(app)
      .get(`/musics/${deletedMusic.getId()}`)
      .set('Authorization', authorizationUser1);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('get nonexistent music by user', async () => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser2);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('get music by id with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', authorization);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('get music by id without authorization header', async () => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`);

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('get music by id without bearer authentication scheme', async () => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'));

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('get music by id with expired token', async () => {
    const response = await request(app)
      .get(`/musics/${music.getId()}`)
      .set('Authorization', expiredAuthorization);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
