/*
 * Custom theme helpers for Handlebars.js
 */
const slugify = require('slugify');

module.exports = function(classes) {
    return classes.map(x => slugify(x, {
        lower: true,
        strict: true,
        regex: true
    })).join(' ');
};
