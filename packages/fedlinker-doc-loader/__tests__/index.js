const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const loader = require('../index');
const testContent = fs.readFileSync(path.resolve(__dirname, './test.md'), 'utf8');

describe('fedlinker-doc-loader', () => {
  test('should parse correctly', () => {
    loader.call(
      {
        async: () => {
          return (error, content, map, meta) => {
            expect(error).toBe(null);
            expect(content).toMatchSnapshot();
            expect(() => {
              babel.parse(content, { sourceType: 'module', parserOpts: { plugins: ['jsx'] } });
            }).not.toThrow();
          };
        },
      },
      testContent
    );
  });
});
