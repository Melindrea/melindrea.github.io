/*
 * Custom theme helpers for Handlebars.js
 */
const slug = require('slug')

let classify = function(classes) {
    return classes.map(x => slug(x)).join(' ');
};

module.exports = classify;
