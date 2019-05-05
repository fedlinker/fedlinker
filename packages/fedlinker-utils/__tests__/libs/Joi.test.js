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

    test('shoule validate basename correctly', () => {
      const { error, value } = Joi.validate(
        { basename: '/basename' },
        {
          basename: Joi.string().basename(),
        }
      );
      expect(error).toBe(null);
      expect(value).toEqual({ basename: '/basename' });

      const { error: error2 } = Joi.validate(
        { basename: 'basename' },
        {
          basename: Joi.string().basename(),
        }
      );
      expect(error2).not.toBe(null);
    });
  });
});
