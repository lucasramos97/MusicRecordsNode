import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import User from 'src/models/User';

import { IUser } from 'src/interfaces/IUser';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';
import Music from 'src/models/Music';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Empty List', () => {
  let dbUser1: IUser = null;
  let dbUser2: IUser = null;
  let authorizationUser1 = '';
  let expiredAuthorization = '';

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    dbUser2 = await userFactory.create('2');

    await musicFactory.createBatch(10, dbUser1.id, true);
    await musicFactory.createBatch(10, dbUser2.id, true);
    await musicFactory.create(dbUser1.id);
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('empty list', async () => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', authorizationUser1);

    const musicsUser1 = await Music.findAll({
      where: {
        user_id: dbUser1.id,
      },
    });
    const musicUser1 = musicsUser1[0];
    const countMusicsUser2 = await Music.count({
      where: {
        user_id: dbUser2.id,
      },
    });

    expect(response.body).toBe(10);
    expect(musicsUser1.length).toBe(1);
    expect(musicUser1.isDeleted()).toBeFalsy();
    expect(countMusicsUser2).toBe(10);
    expect(response.status).toBe(200);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('empty list with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', authorization);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('empty list without authorization header', async () => {
    const response = await request(app)
      .delete('/musics/empty-list');

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('empty list without bearer authentication scheme', async () => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'));

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('empty list with expired token', async () => {
    const response = await request(app)
      .delete('/musics/empty-list')
      .set('Authorization', expiredAuthorization);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
