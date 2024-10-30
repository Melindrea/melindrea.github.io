/*
 * Custom theme helpers for Handlebars.js
 */

module.exports = function(partial, options) {
    //console.log(partial)
    //console.log(options)
    return 'blog-' + partial + '-posts';
};
