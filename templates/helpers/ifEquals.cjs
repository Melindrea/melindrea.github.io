/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function (context, options) {
  if (options.hash.comparison === context) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
};
