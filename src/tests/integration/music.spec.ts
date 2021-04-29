/* eslint-disable no-await-in-loop */
import AppController from '@controllers/AppController';
import Music from '@models/Music';

const request = require('supertest');

const app = new AppController().getExpress();

beforeAll(async () => {
  await Music.destroy({
    where: {},
    truncate: true,
  });

  for (let index = 1; index <= 10; index++) {
    await request(app)
      .post('/musics')
      .send({
        title: `Title ${index}`,
        artist: `Artist ${index}`,
        releaseDate: new Date(),
        duration: new Date(),
        numberViews: index,
        feat: true,
      });
  }
});

describe('Save Music', () => {
  it('save musics with valid credentials', async () => {
    const releaseDate = new Date().toISOString().split('T')[0];

    const music = {
      title: 'Title 1',
      artist: 'Artist 1',
      releaseDate,
      duration: new Date().toISOString(),
      numberViews: 1,
      feat: true,
    };

    const response = await request(app)
      .post('/musics')
      .send(music);

    expect(response.body).toMatchObject(music);
    expect(response.status).toBe(201);
  });

  it('save musics with minimum valid credentials', async () => {
    const releaseDate = new Date().toISOString().split('T')[0];

    const music = {
      title: 'Title 1',
      artist: 'Artist 1',
      releaseDate,
      duration: new Date().toISOString(),
    };

    const response = await request(app)
      .post('/musics')
      .send(music);

    const musicReturn = {
      ...music, numberViews: 0, feat: false, deleted: false,
    };

    expect(response.body).toMatchObject(musicReturn);
    expect(response.status).toBe(201);
  });

  it('save musics without title field', async () => {
    const response = await request(app)
      .post('/musics')
      .send({
        title: '',
        artist: 'Artist 1',
        releaseDate: new Date(),
        duration: new Date(),
        numberViews: 1,
        feat: true,
      });

    expect(response.body.message).toBe('Title is required!');
    expect(response.status).toBe(400);
  });

  it('save musics without artist field', async () => {
    const response = await request(app)
      .post('/musics')
      .send({
        title: 'Title 1',
        artist: '',
        releaseDate: new Date(),
        duration: new Date(),
        numberViews: 1,
        feat: true,
      });

    expect(response.body.message).toBe('Artist is required!');
    expect(response.status).toBe(400);
  });

  it('save musics without release date field', async () => {
    const response = await request(app)
      .post('/musics')
      .send({
        title: 'Title 1',
        artist: 'Artist 1',
        releaseDate: null,
        duration: new Date(),
        numberViews: 1,
        feat: true,
      });

    expect(response.body.message).toBe('Release Date is required!');
    expect(response.status).toBe(400);
  });

  it('save musics without duration field', async () => {
    const response = await request(app)
      .post('/musics')
      .send({
        title: 'Title 1',
        artist: 'Artist 1',
        releaseDate: new Date(),
        duration: null,
        numberViews: 1,
        feat: true,
      });

    expect(response.body.message).toBe('Duration is required!');
    expect(response.status).toBe(400);
  });
});

describe('List Musics', () => {
  it('get all musics paginated without query params', async () => {
    const response = await request(app).get('/musics');

    expect(response.body.content.length).toBeLessThanOrEqual(5);
    expect(response.body.content[4].title).toBe('Title 5');
    expect(response.status).toBe(200);
  });

  it('get all musics paginated with query params', async () => {
    const response = await request(app).get('/musics?page=1&size=4');

    expect(response.body.content.length).toBeLessThanOrEqual(4);
    expect(response.body.content[1].title).toBe('Title 6');
    expect(response.status).toBe(200);
  });
});
