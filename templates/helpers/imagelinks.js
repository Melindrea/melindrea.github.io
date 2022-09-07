/*
 * Custom theme helpers for Handlebars.js
 */

let imagelinks = function(links, context) {
    let mapping = {
        redbubble: {
            text: 'Buy products',
            external: true
        },
        post: {
            text: 'About image',
            external: false
        }
    };

    let formattedlinks = [];
    Object.keys(links).forEach(type => {
        let linkMap = mapping[type];
        let link = '<a href="' + links[type] + '"';
        
        if (linkMap.external) {
            link += ' target="_blank" rel="noopener noreferrer"';
        }

        link += '>' + linkMap.text + '</a>';
        if (links[type]) {
            formattedlinks.push(link);
        }
    });
    
    if (formattedlinks.length < 1) {
        return;
    }
    
    if (formattedlinks.length === 1) {
        return ' ' + formattedlinks[0];
    }

    return '<br>' + formattedlinks.join(' || ');
};

module.exports = imagelinks;
