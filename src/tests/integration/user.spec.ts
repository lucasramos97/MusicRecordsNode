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

  it('save user with e-mail invalid', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.email = 'test';

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.message).toBe('E-mail invalid!');
    expect(response.status).toBe(400);
  });

  it('save user with existing e-mail', async () => {
    const user = userFactory.factoryValidCredentialsUser();

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body.message).toBe(`The ${user.email} e-mail has already been registered!`);
    expect(response.status).toBe(400);
  });
});

describe('Login', () => {
  it('login with valid credentials', async () => {
    const user = userFactory.factoryValidCredentialsUser();

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.token).not.toBeNull();
    expect(response.status).toBe(200);
  });

  it('login without email field', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.email = '';

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.message).toBe('E-mail is required!');
    expect(response.status).toBe(401);
  });

  it('login without password field', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.password = '';

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.message).toBe('Password is required!');
    expect(response.status).toBe(401);
  });

  it('login with e-mail invalid', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.email = 'test';

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.message).toBe('E-mail invalid!');
    expect(response.status).toBe(401);
  });

  it('login with non-existent e-mail', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.email = 'test@email.com';

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.message).toBe(`User not found by e-mail: ${user.email}!`);
    expect(response.status).toBe(401);
  });

  it('login with password invalid', async () => {
    const user = userFactory.factoryValidCredentialsUser();
    user.password = '1234';

    const response = await request(app)
      .post('/login')
      .send(user);

    expect(response.body.message).toBe('Password invalid!');
    expect(response.status).toBe(401);
  });
});
