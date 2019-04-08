const Prism = require('node-prismjs');
const h2x = require('h2x-core');
const h2xJsx = require('h2x-plugin-jsx').default;
const MarkdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;
const unescapeAll = require('markdown-it/lib/common/utils').unescapeAll;
const escapeHtml = require('markdown-it/lib/common/utils').escapeHtml;
const ExampleParser = require('./ExampleParser');

const RUN_FLAG = /@run/;
const LANGUAGES = ['js', 'javascript', 'jsx'];
const EXAMPLE_PREFIX = 'FEDLINKER_DOC_LOADER_EXAMPLE_';
const EXAMPLE_PREFIX_RE = new RegExp(EXAMPLE_PREFIX, 'gi');

const highlight = (code, lang) => {
  const language = Prism.languages[lang] || Prism.languages.autoit;
  return Prism.highlight(code, language);
};

module.exports = function(content) {
  const callback = this.async();
  const exampleParser = new ExampleParser();

  Promise.resolve(content)
    .then(markdown => {
      let toc;
      const md = new MarkdownIt({ html: true, linkify: true, typographer: true, highlight });

      md.renderer.rules.fence = function(tokens, idx, options, env, slf) {
        const token = tokens[idx];
        const info = token.info ? unescapeAll(token.info).trim() : '';
        const lang = info ? info.split(/\s+/g)[0] : '';
        const runtime = RUN_FLAG.test(info) && LANGUAGES.includes(lang);

        let i;
        let highlighted;
        let tmpAttrs;
        let tmpToken;
        let example = '';

        if (runtime) {
          example = exampleParser.parse(token.content);
          if (runtime && example) {
            example = `<div class="example">${example}</div>`;
          }
        }

        if (options.highlight) {
          highlighted = options.highlight(token.content, lang) || escapeHtml(token.content);
        } else {
          highlighted = escapeHtml(token.content);
        }

        if (highlighted.indexOf('<pre') === 0) {
          return example + highlighted + '\n';
        }

        if (info) {
          i = token.attrIndex('class');
          tmpAttrs = token.attrs ? token.attrs.slice() : [];

          if (i < 0) tmpAttrs.push(['class', options.langPrefix + lang]);
          else tmpAttrs[i][1] += ' ' + options.langPrefix + lang;

          tmpToken = { attrs: tmpAttrs };
          return `${example}<pre><code ${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`;
        }

        return `${example}<pre><code ${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`;
      };

      // https://github.com/medfreeman/markdown-it-toc-and-anchor
      md.use(markdownItTocAndAnchor, {
        tocClassName: 'toc',
        tocFirstLevel: 2,
        anchorLinkBefore: false,
        anchorClassName: 'anchor',
        tocCallback: function(tocMarkdown, tocArray, tocHtml) {
          toc = tocHtml;
        },
      });

      const article = md.render(markdown);
      return `<article>${article}</article><aside><nav>${toc}</nav></aside>`;
    })

    .then(html => {
      return h2x.transform(html, { plugins: [h2xJsx] });
    })

    .then(jsx => {
      let result = `${exampleParser.generate()}\n\nexport default (<>${jsx}</>)`;
      result = result.replace(EXAMPLE_PREFIX_RE, EXAMPLE_PREFIX);
      callback(null, result);
    })

    .catch(error => {
      callback(error);
    });
};
