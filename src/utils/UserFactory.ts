export default class UserFactory {
  public factoryValidCredentialsUser(): any {
    return {
      name: 'Name Test',
      email: 'email@test.com',
      password: '123',
    };
  }
}
