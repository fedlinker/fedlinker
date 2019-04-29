const createWebpackConfig = require('../index');
module.exports = createWebpackConfig(undefined, process.env.NODE_ENV);
