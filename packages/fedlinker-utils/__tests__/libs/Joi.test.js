const Joi = require('../../libs/Joi');

describe('fedlinker-utils', () => {
  describe('libs/Joi.js', () => {
    test('should validate absolutePath correctly', () => {
      const { error, value } = Joi.validate(
        { absolutePath: process.cwd() },
        {
          absolutePath: Joi.string().absolutePath(),
        }
      );
      expect(error).toBe(null);
      expect(value).toEqual({ absolutePath: process.cwd() });

      const { error: error2 } = Joi.validate(
        { absolutePath: 'relative' },
        {
          absolutePath: Joi.string().absolutePath(),
        }
      );
      expect(error2).not.toBe(null);
    });
  });
});
