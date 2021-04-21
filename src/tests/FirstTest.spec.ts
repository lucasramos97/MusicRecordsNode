import Music from '@models/Music';

test('it should be ok', () => {
  const music = new Music();

  expect(music.getTitle()).toEqual('');
});
