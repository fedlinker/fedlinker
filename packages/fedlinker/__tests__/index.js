describe('CLI', () => {
  test(`should throw error when use fedlinker via package main entry`, () => {
    expect(() => {
      require('../index');
    }).toThrow();
  });
});
