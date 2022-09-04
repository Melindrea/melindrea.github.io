/*
 * Custom theme helpers for Handlebars.js
 */
let pagetitle = function(context) {
    let page = context.data.root;
    let image = '/assets/images/';
    if (page.image) {
        if (page.image.slug) {
            image += 'page-images/' + page.image.slug
        } else if (page.slug) {
            image += 'featured-images/' + page.slug + '/1464-jpg';
        }
    } else {
        image += 'site-image.jpg';
    }

    return image;
};

module.exports = pagetitle;
