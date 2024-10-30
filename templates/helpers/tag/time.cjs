/*
 * Custom theme helpers for Handlebars.js
 */
const { DateTime } = require('luxon');

module.exports = function (value, options) {
  const date = DateTime.fromJSDate(value);
  const attributes = {
    datetime: date.toISO(),
    ...options.hash
  };
    // console.log(attributes)
  const timeAttributes = [];
  Object.keys(attributes).forEach(attribute => {
    timeAttributes.push(attribute + '="' + attributes[attribute] + '"');
  });
  const time = '<time ' + timeAttributes.join(' ') + '>' + date.toFormat('MMMM d, yyyy') + '</time>';
  return time;
};
