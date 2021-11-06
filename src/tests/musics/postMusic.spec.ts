import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import Music from 'src/models/Music';
import User from 'src/models/User';

import { IMusicJson } from 'src/interfaces/IMusicJson';
import { IUser } from 'src/interfaces/IUser';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();

describe('Post Music', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let expiredAuthorization = '';

  let allAttributesMusic: IMusicJson = null;
  let minimalAttributesMusic: IMusicJson = null;

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);
  });

  beforeEach(async () => {
    allAttributesMusic = {
      title: 'Title Test',
      artist: 'Artist Test',
      release_date: new Date().toJSON().slice(0, 10),
      duration: new Date().toTimeString().slice(0, 8),
      number_views: 1,
      feat: true,
    };

    minimalAttributesMusic = {
      title: 'Title Test',
      artist: 'Artist Test',
      release_date: new Date().toJSON().slice(0, 10),
      duration: new Date().toTimeString().slice(0, 8),
    };
  });

  afterAll(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('post all attributes music', async () => {
    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(allAttributesMusic);

    const dbMusic = await Music.findOne({
      where: {
        id: response.body.id,
        user_id: dbUser1.id,
      },
    });

    const dbMusicJson: IMusicJson = dbMusic.toJSON();

    const validTitle = allAttributesMusic.title === dbMusicJson.title
      && dbMusicJson.title === response.body.title;

    const validArtist = allAttributesMusic.artist === dbMusicJson.artist
      && dbMusicJson.artist === response.body.artist;

    const validReleaseDate = allAttributesMusic.release_date === dbMusicJson.release_date
      && dbMusicJson.release_date === response.body.release_date;

    const validDuration = allAttributesMusic.duration === dbMusicJson.duration
      && dbMusicJson.duration === response.body.duration;

    const validNumberViews = allAttributesMusic.number_views === dbMusicJson.number_views
      && dbMusicJson.number_views === response.body.number_views;

    const validFeat = allAttributesMusic.feat === dbMusicJson.feat
      && dbMusicJson.feat === response.body.feat;

    expect(validTitle).toBeTruthy();
    expect(validArtist).toBeTruthy();
    expect(baseTdd.matchDate(response.body.release_date)).toBeTruthy();
    expect(validReleaseDate).toBeTruthy();
    expect(baseTdd.matchTime(response.body.duration)).toBeTruthy();
    expect(validDuration).toBeTruthy();
    expect(validNumberViews).toBeTruthy();
    expect(validFeat).toBeTruthy();
    expect(response.body.deleted).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
    expect(dbMusic.isDeleted()).toBeFalsy();
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(response.body.created_at).toBe(dbMusicJson.created_at);
    expect(response.body.updated_at).toBe(dbMusicJson.updated_at);
    expect(response.body.created_at).toBe(response.body.updated_at);
    expect(response.status).toBe(201);
  });

  it('post minimal attributes music', async () => {
    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const dbMusic = await Music.findOne({
      where: {
        id: response.body.id,
        user_id: dbUser1.id,
      },
    });

    const dbMusicJson: IMusicJson = dbMusic.toJSON();

    const validTitle = minimalAttributesMusic.title === dbMusicJson.title
      && dbMusicJson.title === response.body.title;

    const validArtist = minimalAttributesMusic.artist === dbMusicJson.artist
      && dbMusicJson.artist === response.body.artist;

    const validReleaseDate = minimalAttributesMusic.release_date === dbMusicJson.release_date
      && dbMusicJson.release_date === response.body.release_date;

    const validDuration = minimalAttributesMusic.duration === dbMusicJson.duration
      && dbMusicJson.duration === response.body.duration;

    const validNumberViews = dbMusicJson.number_views === 0
      && dbMusicJson.number_views === response.body.number_views;

    const validFeat = dbMusicJson.feat === false
      && dbMusicJson.feat === response.body.feat;

    expect(validTitle).toBeTruthy();
    expect(validArtist).toBeTruthy();
    expect(baseTdd.matchDate(response.body.release_date)).toBeTruthy();
    expect(validReleaseDate).toBeTruthy();
    expect(baseTdd.matchTime(response.body.duration)).toBeTruthy();
    expect(validDuration).toBeTruthy();
    expect(validNumberViews).toBeTruthy();
    expect(validFeat).toBeTruthy();
    expect(response.body.deleted).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
    expect(dbMusic.isDeleted()).toBeFalsy();
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(response.body.created_at).toBe(dbMusicJson.created_at);
    expect(response.body.updated_at).toBe(dbMusicJson.updated_at);
    expect(response.body.created_at).toBe(response.body.updated_at);
    expect(response.status).toBe(201);
  });

  it.each(
    BaseTdd.MUSIC_REQUIRED_FIELDS,
  )('post music without required fields', async (field, expectedMessage) => {
    minimalAttributesMusic[field] = '';

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('post music with release date future', async () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    minimalAttributesMusic.release_date = now.toJSON().slice(0, 10);

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.RELEASE_DATE_CANNOT_BE_FUTURE);
    expect(response.status).toBe(400);
  });

  it('post music wrong release date format', async () => {
    minimalAttributesMusic.release_date = minimalAttributesMusic.release_date.replace('-', '/');

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.WRONG_RELEASE_DATE_FORMAT);
    expect(response.status).toBe(400);
  });

  it('post music wrong duration format', async () => {
    minimalAttributesMusic.duration = minimalAttributesMusic.duration.replace(':', '/');

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.WRONG_DURATION_FORMAT);
    expect(response.status).toBe(400);
  });

  it('post music with invalid release date', async () => {
    minimalAttributesMusic.release_date = '2021-01-32';

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const expectedMessage = Messages.getInvalidDate(minimalAttributesMusic.release_date);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('post music with invalid duration', async () => {
    minimalAttributesMusic.duration = '23:60:59';

    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const expectedMessage = Messages.getInvalidTime(minimalAttributesMusic.duration);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('post music with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorization)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('post music without authorization header', async () => {
    const response = await request(app)
      .post('/musics')
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('post music without bearer authentication scheme', async () => {
    const response = await request(app)
      .post('/musics')
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'))
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('post music with expired token', async () => {
    const response = await request(app)
      .post('/musics')
      .set('Authorization', expiredAuthorization)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
