const { types, parseSync, traverse, template, transformFromAstSync } = require('@babel/core');

const VARIABLE_PREFIX = 'FEDLINKER_DOC_LOADER_VARIABLE_';
const EXAMPLE_PREFIX = 'FEDLINKER_DOC_LOADER_EXAMPLE_';
const iife = template.statement('const ID = ((PARAMS) => {BODY})(ARGUMENTS);');

const options = { sourceType: 'module', parserOpts: { plugins: ['jsx'] } };
const commonjs = ['require', 'exports', 'module'];

class ExampleResolver {
  constructor() {
    this.ast = parseSync('', options);
    this.imports = [template.statement`import React from "react";`()];
    this.variables = [];
    this.variableIndex = 0;
    this.exampleIndex = 0;
  }

  parse(code) {
    const self = this;
    const ast = parseSync(code, options);
    const params = [];
    const args = [];
    let hasDefaultExport = false;

    traverse(ast, {
      ImportDeclaration(path) {
        const node = path.node;

        if (node.specifiers.length) {
          for (let i = 0; i < node.specifiers.length; i++) {
            const specifier = node.specifiers[i];
            const id = self.getVariableId();

            params.push(specifier.local.name);
            specifier.local.name = id;
            args.push(id);
          }
        }

        self.imports.push(node);
        path.remove();
      },

      ExportDeclaration(path) {
        if (types.isExportDefaultDeclaration(path.node)) {
          path.container.push(types.returnStatement(path.node.declaration));
          path.remove();
          hasDefaultExport = true;
        } else {
          throw new Error(`[fedlinker-doc-loader]: only \`export default\` can be used`);
        }
      },

      Identifier(path) {
        if (commonjs.includes(path.node.name)) {
          throw new Error(`[fedlinker-doc-loader]: can't use commonjs, use ES6 module syntax`);
        }
      },
    });

    if (!hasDefaultExport) {
      throw new Error(`[fedlinker-doc-loader]: must export defualt in examples`);
    }

    const exampleId = this.getExampleId();
    const declaration = iife({
      ID: types.identifier(exampleId),
      PARAMS: params.map(paramName => types.identifier(paramName)),
      BODY: ast.program.body,
      ARGUMENTS: args.map(argName => types.identifier(argName)),
    });

    self.variables.push(declaration);
    return `<${exampleId} />`;
  }

  generate() {
    this.ast.program.body = [].concat(this.imports).concat(this.variables);
    return transformFromAstSync(this.ast).code;
  }

  getVariableId() {
    return VARIABLE_PREFIX + ++this.variableIndex;
  }

  getExampleId() {
    return EXAMPLE_PREFIX + ++this.exampleIndex;
  }
}

module.exports = ExampleResolver;
