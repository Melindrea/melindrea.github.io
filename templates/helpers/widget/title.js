/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function(title, options) {
    let tag = options.hash.titletag || 'h3';
    
    return '<' + tag + '>' + title + '</' + tag + '>';
};

