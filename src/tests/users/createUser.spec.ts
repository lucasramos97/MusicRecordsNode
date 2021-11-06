import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import User from 'src/models/User';

import { IUserJson } from 'src/interfaces/IUserJson';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';

const app = new AppController().getExpress();

const baseTdd = new BaseTdd();
const userFactory = new UserFactory();

describe('Create User', () => {
  let allAttributesUser: IUserJson = null;

  beforeEach(async () => {
    allAttributesUser = {
      username: 'user1',
      email: 'user1@email.com',
      password: '123',
    };
  });

  afterEach(async () => {
    await User.destroy({
      where: {},
      truncate: true,
    });
  });

  it('create user', async () => {
    const response = await request(app)
      .post('/users')
      .send(allAttributesUser);

    const dbUser = await User.findOne({
      where: {
        id: response.body.id,
      },
    });

    const dbUserJson: IUserJson = dbUser.toJSON();

    const validUsername = allAttributesUser.username === dbUserJson.username
      && dbUserJson.username === response.body.username;

    const validEmail = allAttributesUser.email === dbUserJson.email
      && dbUserJson.email === response.body.email;

    expect(validUsername).toBeTruthy();
    expect(validEmail).toBeTruthy();
    expect(response.body.password).not.toBe(allAttributesUser.password);
    expect(baseTdd.matchDateTime(response.body.created_at)).toBeTruthy();
    expect(baseTdd.matchDateTime(response.body.updated_at)).toBeTruthy();
    expect(response.body.password).toBe(dbUserJson.password);
    expect(response.body.created_at).toBe(dbUserJson.created_at);
    expect(response.body.updated_at).toBe(dbUserJson.updated_at);
    expect(response.body.created_at).toBe(response.body.updated_at);
    expect(response.status).toBe(201);
  });

  it.each(
    BaseTdd.USER_REQUIRED_FIELDS,
  )('create user without required fields', async (field, expectedMessage) => {
    allAttributesUser[field] = '';

    const response = await request(app)
      .post('/users')
      .send(allAttributesUser);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('create user with invalid email', async () => {
    allAttributesUser.email = 'test';

    const response = await request(app)
      .post('/users')
      .send(allAttributesUser);

    expect(response.body.message).toBe(Messages.EMAIL_INVALID);
    expect(response.status).toBe(400);
  });

  it('create user with existent email', async () => {
    await userFactory.create();

    const response = await request(app)
      .post('/users')
      .send(allAttributesUser);

    const expectedMessage = Messages.getEmailAlreadyRegistered(allAttributesUser.email);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });
});
