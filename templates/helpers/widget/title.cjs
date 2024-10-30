/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function (title, options) {
  const tag = options.hash.titletag || 'h3';

  return '<' + tag + '>' + title + '</' + tag + '>';
};
