/*
 * Custom theme helpers for Handlebars.js
 */
const path = require('path');

module.exports = function (context) {
  const page = context.data.root;
  // Ensures that whether on Windows or POSIX, the paths are right
  const normalizedPath = page.path.replace(path.sep + 'index.html', '').replaceAll(path.sep, path.posix.sep);

  const bits = [
    page.siteurl,
    page.path === 'index.html' ? '' : normalizedPath + '/'
  ];

  return bits.join('/');
};
