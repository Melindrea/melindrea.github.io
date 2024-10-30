/*
 * Custom theme helpers for Handlebars.js
 */
const { DateTime } = require('luxon');

module.exports = function (value) {
  const date = DateTime.fromJSDate(value);

  return date.toFormat('MMMM d, yyyy');
};
