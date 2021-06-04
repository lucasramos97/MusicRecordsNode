import StringUtils from '@utils/StringUtils';

describe('Encrypt Value', () => {
  it('encrypt value', async () => {
    const value = 'Test123';
    const encryptValue = await StringUtils.encryptValue(value);

    expect(encryptValue).not.toEqual(value);
  });
});
