import StringUtils from '@utils/StringUtils';

describe('Encrypt Value', () => {
  it('encrypt value', async () => {
    const value = 'Test123';
    const encryptValue = await StringUtils.encryptValue(value);

    expect(encryptValue).not.toEqual(value);
  });
});

describe('Valid E-mail', () => {
  it('valid emails', async () => {
    const email1 = 'mysite@ourearth.com';
    const email2 = 'my.ownsite@ourearth.org';
    const email3 = 'mysite@you.me.net';

    expect(StringUtils.validEmail(email1)).toBeTruthy();
    expect(StringUtils.validEmail(email2)).toBeTruthy();
    expect(StringUtils.validEmail(email3)).toBeTruthy();
  });

  it('invalid emails', async () => {
    const email1 = 'mysite.ourearth.com';
    const email2 = 'mysite@.com.my';
    const email3 = '@you.me.net';
    const email4 = 'mysite()*@gmail.com';

    expect(StringUtils.validEmail(email1)).toBeFalsy();
    expect(StringUtils.validEmail(email2)).toBeFalsy();
    expect(StringUtils.validEmail(email3)).toBeFalsy();
    expect(StringUtils.validEmail(email4)).toBeFalsy();
  });
});
