/*
 * Custom theme helpers for Handlebars.js
 */
module.exports = function(context) {
    let page = context.data.root;
    let bits = [
        page.siteurl,
        page.path === 'index.html' ? '' : page.path + '/'
    ];
    
    return bits.join('/')
};
