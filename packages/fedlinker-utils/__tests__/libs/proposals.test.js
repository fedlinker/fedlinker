describe('fedlinker-utils', () => {
  describe('libs/proposals.js', () => {
    test('should export an array', () => {
      const proposals = require('../../libs/proposals');
      expect(Array.isArray(proposals) && !!proposals.length).toBe(true);
    });
  });
});
