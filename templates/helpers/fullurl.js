/*
 * Custom theme helpers for Handlebars.js
 */
let fullurl = function(context) {
    let page = context.data.root;
    let bits = [
        page.siteurl,
        page.path === 'index.html' ? '' : page.path + '/'
    ];
    
    return bits.join('/')
};

module.exports = fullurl;
