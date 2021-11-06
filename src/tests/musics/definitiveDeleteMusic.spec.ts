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

describe('Definitive Delete Music', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let authorizationUser2 = '';
  let expiredAuthorization = '';

  let deletedMusic: Music = null;
  let music: Music = null;

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    const dbUser2 = await userFactory.create('2');

    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    authorizationUser2 = await baseTdd.getAuthorization(app, dbUser2);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);
  });

  beforeEach(async () => {
    deletedMusic = await musicFactory.create(dbUser1.id, true);
    music = await musicFactory.create(dbUser1.id);
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

  it('definitive delete music', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`)
      .set('Authorization', authorizationUser1);

    const dbMusic = await Music.findOne({
      where: {
        id: deletedMusic.getId(),
        user_id: dbUser1.id,
      },
    });

    expect(dbMusic).toBeNull();
    expect(response.body).toBe('');
    expect(response.status).toBe(200);
  });

  it('definitive delete nonexistent music by id', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${100}`)
      .set('Authorization', authorizationUser1);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('definitive delete non deleted music', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${music.getId()}`)
      .set('Authorization', authorizationUser1);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('definitive delete nonexistent music by user', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`)
      .set('Authorization', authorizationUser2);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('definitive delete music with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`)
      .set('Authorization', authorization);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('definitive delete music without authorization header', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`);

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('definitive delete music without bearer authentication scheme', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`)
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'));

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('definitive delete music with expired token', async () => {
    const response = await request(app)
      .delete(`/musics/definitive/${deletedMusic.getId()}`)
      .set('Authorization', expiredAuthorization);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
