/*
 * Custom theme helpers for Handlebars.js
 */
const { DateTime } = require('luxon');

module.exports = function(value, options) {
    let date = DateTime.fromJSDate(value);
    let attributes = {
        datetime: date.toISO(),
        ...options.hash
    };
    //console.log(attributes)
    let timeAttributes = [];
    Object.keys(attributes).forEach(attribute => {
        timeAttributes.push(attribute + '="' + attributes[attribute] + '"');
    });
    let time = '<time ' + timeAttributes.join(' ') + '>' + date.toFormat('MMMM d, yyyy') + '</time>'
    return time;
};

