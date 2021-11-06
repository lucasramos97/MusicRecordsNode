import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import User from 'src/models/User';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Count Deleted Musics', () => {
  let authorizationUser1 = '';
  let expiredAuthorization = '';

  beforeAll(async () => {
    const dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    await musicFactory.createBatch(10, dbUser1.id, true);
    await musicFactory.create(dbUser1.id);
    await musicFactory.create((await userFactory.create('2')).id, true);
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('count deleted musics', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', authorizationUser1);

    expect(response.body).toBe(10);
    expect(response.status).toBe(200);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('count deleted musics with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', authorization);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('count deleted musics without authorization header', async () => {
    const response = await request(app)
      .get('/musics/deleted/count');

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('count deleted musics without bearer authentication scheme', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'));

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('count deleted musics with expired token', async () => {
    const response = await request(app)
      .get('/musics/deleted/count')
      .set('Authorization', expiredAuthorization);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
