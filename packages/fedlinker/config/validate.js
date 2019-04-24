const Ajv = require('ajv');
const schema = require('./schema.json');
const ajv = new Ajv();
const validate = ajv.compile(schema);

module.exports = config => {
  if (!validate(config)) {
    throw new Error(String(validate.errors));
  }

  if (config.flow && config.typescript) {
    throw new Error(`Can't enable Flow and TypeScript both`);
  }
};
