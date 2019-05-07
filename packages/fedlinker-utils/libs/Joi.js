const path = require('path');
const OriginalJoi = require('@hapi/joi');

const Joi = OriginalJoi.extend(joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    absolutePath: 'must be an absolute path',
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
  ],
}));

module.exports = Joi;
