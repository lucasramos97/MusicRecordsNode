import AppController from '@controllers/AppController';
import UserFactory from '@utils/UserFactory';

const request = require('supertest');

const app = new AppController().getExpress();
const userFactory = new UserFactory();

describe('Save User', () => {
  it('save user with valid credentials', async () => {
    const user = userFactory.factoryValidCredentialsUser();

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.name).toEqual(user.name);
    expect(response.body.email).toEqual(user.email);
    expect(response.body.password).not.toEqual(user.password);
    expect(response.status).toBe(201);
  });

  it('save user without name field', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.name = '';

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.message).toBe('Name is required!');
    expect(response.status).toBe(400);
  });

  it('save user without email field', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.email = '';

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.message).toBe('E-mail is required!');
    expect(response.status).toBe(400);
  });

  it('save user without password field', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.password = '';

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.message).toBe('Password is required!');
    expect(response.status).toBe(400);
  });
});
