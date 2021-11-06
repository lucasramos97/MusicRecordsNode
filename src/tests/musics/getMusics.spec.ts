import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import User from 'src/models/User';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';
import Music from 'src/models/Music';
import { IUser } from 'src/interfaces/IUser';
import { IMusicJson } from 'src/interfaces/IMusicJson';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Get Musics', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let expiredAuthorization = '';

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    await musicFactory.createBatch(10, dbUser1.id);
    await musicFactory.createBatch(10, (await userFactory.create('2')).id);
    await musicFactory.create(dbUser1.id, true);
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('get musics with default query params', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', authorizationUser1);

    const dbMusics = await Music.findAll({
      where: {
        deleted: false,
        user_id: dbUser1.id,
      },
      order: [
        ['artist', 'ASC'],
        ['title', 'ASC'],
      ],
    });

    const dbMusicsJson: IMusicJson[] = [];
    dbMusics.forEach((m) => {
      dbMusicsJson.push(m.toJSON());
    });

    expect(response.body.content).toStrictEqual(dbMusicsJson.slice(0, 5));
    expect(response.body.content.length).toBe(5);
    expect(response.body.total).toBe(dbMusics.length);
    expect(response.status).toBe(200);
  });

  it('get musics with explicit query params', async () => {
    const response = await request(app)
      .get('/musics?page=2&size=4')
      .set('Authorization', authorizationUser1);

    const dbMusics = await Music.findAll({
      where: {
        deleted: false,
        user_id: dbUser1.id,
      },
      order: [
        ['artist', 'ASC'],
        ['title', 'ASC'],
      ],
    });

    const dbMusicsJson: IMusicJson[] = [];
    dbMusics.forEach((m) => {
      dbMusicsJson.push(m.toJSON());
    });

    expect(response.body.content).toStrictEqual(dbMusicsJson.slice(4, 8));
    expect(response.body.content.length).toBe(4);
    expect(response.body.total).toBe(dbMusics.length);
    expect(response.status).toBe(200);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('get musics with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', authorization);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('get musics without authorization header', async () => {
    const response = await request(app)
      .get('/musics');

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('get musics without bearer authentication scheme', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'));

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('get musics with expired token', async () => {
    const response = await request(app)
      .get('/musics')
      .set('Authorization', expiredAuthorization);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
