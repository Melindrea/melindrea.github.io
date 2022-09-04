/*
 * Custom theme helpers for Handlebars.js
 */

let getWidgetPartial = function(partial) {
    return "widget-" + partial;
};

module.exports = getWidgetPartial;
