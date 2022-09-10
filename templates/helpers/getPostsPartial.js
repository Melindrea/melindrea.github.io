/*
 * Custom theme helpers for Handlebars.js
 */

let getPostsPartial = function(partial, options) {
    //console.log(partial)
    //console.log(options)
    return partial + '-posts';
};

module.exports = getPostsPartial;
