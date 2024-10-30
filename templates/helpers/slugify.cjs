/*
 * Custom theme helpers for Handlebars.js
 */

const slugify = require('slugify'); 

module.exports =  function(value) {
    return slugify(value, {
        lower: true,
        strict: true,
        regex: true
    });
};
