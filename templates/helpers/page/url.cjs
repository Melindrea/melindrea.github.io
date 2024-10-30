/*
 * Custom theme helpers for Handlebars.js
 */
const path = require('path');

module.exports = function(context) {
    let page = context.data.root;
    // Ensures that whether on Windows or POSIX, the paths are right
    let normalizedPath = page.path.replace(path.sep + 'index.html', '').replaceAll(path.sep, path.posix.sep);
    
    let bits = [
        page.siteurl,
        page.path === 'index.html' ? '' : normalizedPath + '/'
    ];
    
    return bits.join('/')
};
