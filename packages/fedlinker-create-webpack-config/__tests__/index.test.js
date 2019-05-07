const webpack = require('webpack');
const createWebapckConfig = require('../libs');

describe('fedlinker-create-webpack-config', () => {
  test('config in development', () => {
    const config = createWebapckConfig({}, 'development');
    const errors = webpack.validate(config);
    expect(errors.length).toBe(0);
  });

  test('config in production', () => {
    const config = createWebapckConfig({}, 'production');
    const errors = webpack.validate(config);
    expect(errors.length).toBe(0);
  });
});
