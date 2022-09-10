/*
 * Custom theme helpers for Handlebars.js
 */
let widgettitle = function(title, options) {
    let tag = options.hash.titletag || 'h3';
    
    return '<' + tag + '>' + title + '</' + tag + '>';
};

module.exports = widgettitle;
