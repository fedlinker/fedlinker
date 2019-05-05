const path = require('path');
const OriginalJoi = require('@hapi/joi');

const Joi = OriginalJoi.extend(joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    absolutePath: 'must be an absolute path',
    basename: 'should have a leading slash, but no trailing slash',
  },
  rules: [
    {
      name: 'absolutePath',
      validate(params, value, state, options) {
        if (!path.isAbsolute(value)) {
          return this.createError(
            'string.absolutePath',
            { v: value },
            state,
            options
          );
        }
        return value;
      },
    },
    {
      name: 'basename',
      validate(params, value, state, options) {
        if (
          value[0] !== '/' ||
          (value.length > 1 && value[value.length - 1] === '/')
        ) {
          return this.createError(
            'string.basename',
            { v: value },
            state,
            options
          );
        }
        return value;
      },
    },
  ],
}));

module.exports = Joi;
