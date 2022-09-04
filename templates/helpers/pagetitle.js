/*
 * Custom theme helpers for Handlebars.js
 */
let pagetitle = function(context) {
    let page = context.data.root;
    let pageTitle = page.title;
    let siteTitle = page.sitename;
    if (page.layout === 'index.hbs') { // Index page
        return siteTitle;
    }
    
    let titlebits = [
        pageTitle
    ];

    if (page.context) {
        if (page.context === 'tag') {
            titlebits.push('Tags');
        } else if (page.context === 'post') {
            titlebits.push('Posts');
        }
    }
    
    titlebits.push(siteTitle);
    return titlebits.join(page.titlesep);
};

module.exports = pagetitle;
