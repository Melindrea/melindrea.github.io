/*
 * Custom theme helpers for Handlebars.js
 */
const { DateTime } = require('luxon');

module.exports = function(value) {
    let date = DateTime.fromJSDate(value);

    return date.toFormat('MMMM d, yyyy');
};
