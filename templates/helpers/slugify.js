/*
 * Custom theme helpers for Handlebars.js
 */
const slug = require('slug')

module.exports = function(value) {
    return slug(value);
};
