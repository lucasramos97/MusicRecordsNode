import * as jwt from 'jsonwebtoken';
import request from 'supertest';

import AppController from 'src/controllers/AppController';
import Messages from 'src/utils/Messages';
import User from 'src/models/User';

import { ILogin } from 'src/interfaces/ILogin';
import { IUser } from 'src/interfaces/IUser';

import BaseTdd from 'src/tests/BaseTdd';
import UserFactory from 'src/tests/factories/UserFactory';

const app = new AppController().getExpress();

const userFactory = new UserFactory();

describe('Create User', () => {
  let dbUser1: IUser = null;
  let allAttributesLogin: ILogin = null;

  beforeEach(async () => {
    dbUser1 = await userFactory.create();

    allAttributesLogin = {
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

  it('login', async () => {
    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    expect(response.body.token).toBeTruthy();
    expect(response.body.username).toBe(dbUser1.username);
    expect(response.body.email).toBe(allAttributesLogin.email);
    expect(response.body.password).toBeUndefined();
    expect(response.status).toBe(200);
  });

  it('token lasts 24 hours', async () => {
    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    const now = new Date();
    now.setDate(now.getDate() + 1);
    const expectedExp = Number(now.getTime().toString().slice(0, 10));

    let atualExp = 0;
    jwt.verify(response.body.token, process.env.SECRET, (err, decoded) => {
      atualExp = decoded.exp;
    });

    expect(atualExp).toBe(expectedExp);
  });

  it.each(
    BaseTdd.LOGIN_REQUIRED_FIELDS,
  )('login without required fields', async (field, expectedMessage) => {
    allAttributesLogin[field] = '';

    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(400);
  });

  it('login with invalid email', async () => {
    allAttributesLogin.email = 'test';

    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    expect(response.body.message).toBe(Messages.EMAIL_INVALID);
    expect(response.status).toBe(400);
  });

  it('login with nonexistent email', async () => {
    allAttributesLogin.email = 'user2@email.com';

    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    const expectedMessage = Messages.getUserNotFoundByEmail(allAttributesLogin.email);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });

  it('login with non matching password', async () => {
    allAttributesLogin.password = '321';

    const response = await request(app)
      .post('/login')
      .send(allAttributesLogin);

    const expectedMessage = Messages.getPasswordDoesNotMatchWithEmail(allAttributesLogin.email);

    expect(response.body.message).toBe(expectedMessage);
    expect(response.status).toBe(401);
  });
});
