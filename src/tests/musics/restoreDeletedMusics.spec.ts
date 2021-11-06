import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import Music from 'src/models/Music';
import User from 'src/models/User';

import { IUser } from 'src/interfaces/IUser';
import { IMusicJson } from 'src/interfaces/IMusicJson';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Restore Deleted Musics', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let expiredAuthorization = '';

  let dbUser2: IUser = null;
  let authorizationUser2 = '';

  let deletedMusics: Music[] = null;
  let musics: Music[] = null;
  let deletedMusicsJson: IMusicJson[] = null;

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    dbUser2 = await userFactory.create('2');
    authorizationUser2 = await baseTdd.getAuthorization(app, dbUser2);
  });

  beforeEach(async () => {
    deletedMusics = await musicFactory.createBatch(10, dbUser1.id, true);
    musics = await musicFactory.createBatch(1, dbUser1.id, false);
    await musicFactory.createBatch(10, dbUser2.id, true);

    deletedMusicsJson = [];
    deletedMusics.forEach((m) => {
      deletedMusicsJson.push(m.toJSON());
    });
  });

  afterEach(async () => {
    await Music.destroy({
      where: {},
      truncate: true,
    });
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('restore deleted musics', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser1)
      .send(deletedMusicsJson);

    const countMusicsUser1 = await Music.count({
      where: {
        deleted: false,
        user_id: dbUser1.id,
      },
    });

    const countDeletedMusicsUser2 = await Music.count({
      where: {
        deleted: true,
        user_id: dbUser2.id,
      },
    });

    expect(response.body).toBe(10);
    expect(countMusicsUser1).toBe(11);
    expect(countDeletedMusicsUser2).toBe(10);
    expect(response.status).toBe(200);
  });

  it('restore deleted nonexistent musics by id', async () => {
    const musicJson: IMusicJson = deletedMusicsJson.shift();
    musicJson.id = 1000;
    deletedMusicsJson.push(musicJson);

    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser1)
      .send(deletedMusicsJson);

    const countMusicsUser1 = await Music.count({
      where: {
        deleted: false,
        user_id: dbUser1.id,
      },
    });

    const countDeletedMusicsUser2 = await Music.count({
      where: {
        deleted: true,
        user_id: dbUser2.id,
      },
    });

    expect(response.body).toBe(9);
    expect(countMusicsUser1).toBe(10);
    expect(countDeletedMusicsUser2).toBe(10);
    expect(response.status).toBe(200);
  });

  it('restore deleted non deleted musics', async () => {
    const musicsJson: IMusicJson[] = [];
    musics.forEach((m) => {
      musicsJson.push(m.toJSON());
    });

    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser1)
      .send(musicsJson);

    const dbMusicsUser1 = await Music.findAll({
      where: {
        user_id: dbUser1.id,
      },
    });

    const countDeletedMusicsUser2 = await Music.count({
      where: {
        deleted: true,
        user_id: dbUser2.id,
      },
    });

    expect(response.body).toBe(0);
    expect(dbMusicsUser1.length).toBe(11);
    expect(dbMusicsUser1.some((m) => !m.isDeleted())).toBeTruthy();
    expect(countDeletedMusicsUser2).toBe(10);
    expect(response.status).toBe(200);
  });

  it('restore deleted nonexistent musics by user', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser2)
      .send(deletedMusicsJson);

    const countMusicsUser1 = await Music.count({
      where: {
        deleted: false,
        user_id: dbUser1.id,
      },
    });

    const countDeletedMusicsUser2 = await Music.count({
      where: {
        deleted: true,
        user_id: dbUser2.id,
      },
    });

    expect(response.body).toBe(0);
    expect(countMusicsUser1).toBe(1);
    expect(countDeletedMusicsUser2).toBe(10);
    expect(response.status).toBe(200);
  });

  it('restore deleted musics without id field', async () => {
    const musicJson: any = deletedMusicsJson.shift();
    musicJson.none = musicJson.id;
    delete musicJson.id;
    deletedMusicsJson.push(musicJson);

    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser1)
      .send(deletedMusicsJson);

    expect(response.body.message).toBe(Messages.ID_IS_REQUIRED);
    expect(response.status).toBe(400);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('restore deleted musics with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorization)
      .send(deletedMusicsJson);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('restore deleted musics without authorization header', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .send(deletedMusicsJson);

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('restore deleted musics without bearer authentication scheme', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'))
      .send(deletedMusicsJson);

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('restore deleted musics with expired token', async () => {
    const response = await request(app)
      .post('/musics/deleted/restore')
      .set('Authorization', expiredAuthorization)
      .send(deletedMusicsJson);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
