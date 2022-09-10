/*
 * Custom theme helpers for Handlebars.js
 */
const slug = require('slug')

module.exports = function(classes) {
    return classes.map(x => slug(x)).join(' ');
};
