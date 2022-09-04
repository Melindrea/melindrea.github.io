/*
 * Custom theme helpers for Handlebars.js
 */
const slug = require('slug')

let slugify = function(value) {
    return slug(value);
};

module.exports = slugify;
