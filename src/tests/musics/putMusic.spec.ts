import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import Music from 'src/models/Music';
import User from 'src/models/User';

import { IMusicJson } from 'src/interfaces/IMusicJson';
import { IUser } from 'src/interfaces/IUser';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';
import MusicFactory from 'src/tests/factories/MusicFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();
const musicFactory = new MusicFactory();

describe('Put Music', () => {
  let dbUser1: IUser = null;
  let authorizationUser1 = '';
  let authorizationUser2 = '';
  let expiredAuthorization = '';

  let music: Music = null;
  let deletedMusic: Music = null;

  let allAttributesMusic: IMusicJson = null;
  let minimalAttributesMusic: IMusicJson = null;

  beforeAll(async () => {
    dbUser1 = await userFactory.create();
    authorizationUser1 = await baseTdd.getAuthorization(app, dbUser1);
    authorizationUser2 = await baseTdd.getAuthorization(app, await userFactory.create('2'));
    expiredAuthorization = await baseTdd.getExpiredAuthorization(dbUser1.id);

    deletedMusic = await musicFactory.create(dbUser1.id, true);
  });

  beforeEach(async () => {
    music = await musicFactory.create(dbUser1.id);

    allAttributesMusic = {
      title: `${music.getTitle()} Test`,
      artist: `${music.getArtist()} Test`,
      release_date: new Date().toJSON().slice(0, 10),
      duration: new Date().toTimeString().slice(0, 8),
      number_views: music.getNumberViews() + 1,
      feat: !music.isFeat(),
    };

    minimalAttributesMusic = {
      title: `${music.getTitle()} Test`,
      artist: `${music.getArtist()} Test`,
      release_date: new Date().toJSON().slice(0, 10),
      duration: new Date().toTimeString().slice(0, 8),
    };
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

  it('put all attributes music', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(allAttributesMusic);

    const musicJson: IMusicJson = music.toJSON();

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

    const validCreatedAt = musicJson.created_at === dbMusicJson.created_at
      && dbMusicJson.created_at === response.body.created_at;

    expect(response.body.id).toBe(musicJson.id);
    expect(validTitle).toBeTruthy();
    expect(response.body.title).not.toBe(musicJson.title);
    expect(validArtist).toBeTruthy();
    expect(response.body.artist).not.toBe(musicJson.artist);
    expect(baseTdd.matchDate(response.body.release_date)).toBeTruthy();
    expect(validReleaseDate).toBeTruthy();
    expect(response.body.release_date).not.toBe(musicJson.release_date);
    expect(baseTdd.matchTime(response.body.duration)).toBeTruthy();
    expect(validDuration).toBeTruthy();
    expect(response.body.duration).not.toBe(musicJson.duration);
    expect(validNumberViews).toBeTruthy();
    expect(response.body.number_views).not.toBe(musicJson.number_views);
    expect(validFeat).toBeTruthy();
    expect(response.body.feat).not.toBe(musicJson.feat);
    expect(response.body.deleted).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
    expect(dbMusic.isDeleted()).toBeFalsy();
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(validCreatedAt).toBeTruthy();
    expect(response.body.updated_at).toBe(dbMusicJson.updated_at);
    expect(response.body.updated_at).not.toBe(musicJson.updated_at);
    expect(response.status).toBe(200);
  });

  it('put minimal attributes music', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const musicJson: IMusicJson = music.toJSON();

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

    const validNumberViews = musicJson.number_views === dbMusicJson.number_views
      && dbMusicJson.number_views === response.body.number_views;

    const validFeat = musicJson.feat === dbMusicJson.feat
      && dbMusicJson.feat === response.body.feat;

    const validCreatedAt = musicJson.created_at === dbMusicJson.created_at
      && dbMusicJson.created_at === response.body.created_at;

    expect(response.body.id).toBe(musicJson.id);
    expect(validTitle).toBeTruthy();
    expect(response.body.title).not.toBe(musicJson.title);
    expect(validArtist).toBeTruthy();
    expect(response.body.artist).not.toBe(musicJson.artist);
    expect(baseTdd.matchDate(response.body.release_date)).toBeTruthy();
    expect(validReleaseDate).toBeTruthy();
    expect(response.body.release_date).not.toBe(musicJson.release_date);
    expect(baseTdd.matchTime(response.body.duration)).toBeTruthy();
    expect(validDuration).toBeTruthy();
    expect(response.body.duration).not.toBe(musicJson.duration);
    expect(validNumberViews).toBeTruthy();
    expect(validFeat).toBeTruthy();
    expect(response.body.deleted).toBeUndefined();
    expect(response.body.userId).toBeUndefined();
    expect(dbMusic.isDeleted()).toBeFalsy();
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(validCreatedAt).toBeTruthy();
    expect(response.body.updated_at).toBe(dbMusicJson.updated_at);
    expect(response.body.updated_at).not.toBe(musicJson.updated_at);
    expect(response.status).toBe(200);
  });

  it('put nonexistent music by id', async () => {
    const response = await request(app)
      .put(`/musics/${100}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('put deleted music by id', async () => {
    const response = await request(app)
      .put(`/musics/${deletedMusic.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it('put nonexistent music by user', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser2)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.MUSIC_NOT_FOUND);
    expect(response.status).toBe(404);
  });

  it.each(
    BaseTdd.MUSIC_REQUIRED_FIELDS,
  )('put music without required fields', async (field, expectedMessage) => {
    minimalAttributesMusic[field] = '';

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('put music with release date future', async () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    minimalAttributesMusic.release_date = now.toJSON().slice(0, 10);

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.RELEASE_DATE_CANNOT_BE_FUTURE);
    expect(response.status).toBe(400);
  });

  it('put music wrong release date format', async () => {
    minimalAttributesMusic.release_date = minimalAttributesMusic.release_date.replace('-', '/');

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.WRONG_RELEASE_DATE_FORMAT);
    expect(response.status).toBe(400);
  });

  it('put music wrong duration format', async () => {
    minimalAttributesMusic.duration = minimalAttributesMusic.duration.replace(':', '/');

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.WRONG_DURATION_FORMAT);
    expect(response.status).toBe(400);
  });

  it('put music with invalid release date', async () => {
    minimalAttributesMusic.release_date = '2021-01-32';

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const expectedMessage = Messages.getInvalidDate(minimalAttributesMusic.release_date);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('put music with invalid duration', async () => {
    minimalAttributesMusic.duration = '23:60:59';

    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1)
      .send(minimalAttributesMusic);

    const expectedMessage = Messages.getInvalidTime(minimalAttributesMusic.duration);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it.each(
    BaseTdd.INAPPROPRIATE_TOKENS,
  )('put music with inappropriate tokens', async (authorization, expectedMessage) => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorization)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('put music without authorization header', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.HEADER_AUTHORIZATION_NOT_PRESENT);
    expect(response.status).toBe(401);
  });

  it('put music without bearer authentication scheme', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', authorizationUser1.replace('Bearer', 'Token'))
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.NO_BEARER_AUTHENTICATION_SCHEME);
    expect(response.status).toBe(401);
  });

  it('put music with expired token', async () => {
    const response = await request(app)
      .put(`/musics/${music.getId()}`)
      .set('Authorization', expiredAuthorization)
      .send(minimalAttributesMusic);

    expect(response.body.message).toBe(Messages.TOKEN_EXPIRED);
    expect(response.status).toBe(401);
  });
});
