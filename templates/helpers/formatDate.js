/*
 * Custom theme helpers for Handlebars.js
 */
const { DateTime } = require('luxon');

let formatDate = function(value) {
    let date = DateTime.fromJSDate(value);

    return date.toFormat('MMMM d, yyyy');
};

module.exports = formatDate;