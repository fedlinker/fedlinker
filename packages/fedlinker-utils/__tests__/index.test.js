describe('fedlinker-utils', () => {
  describe('index.js', () => {
    test('shoule export an object', () => {
      const utils = require('../index');
      expect(
        typeof utils === 'object' && !!utils && !!Object.keys(utils).length
      ).toBe(true);
    });
  });
});
