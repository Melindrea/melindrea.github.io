// Get our requirements, installed by npm
const Metalsmith  = require('metalsmith'),
    markdown    = require('@metalsmith/markdown'),
    layouts     = require('@metalsmith/layouts'),
    permalinks = require('@metalsmith/permalinks'),
    collections = require('@metalsmith/collections'),
    publish = require('metalsmith-publish'),
    discoverPartials = require('metalsmith-discover-partials'),
    discoverHelpers = require('metalsmith-discover-helpers'),
    postcss = require('metalsmith-with-postcss'),
    melindreamakes = require("./package.json").melindreamakes;


// Run Metalsmith in the current directory.
// When the .build() method runs, this reads
// and strips the frontmatter from each of our
// source files and passes it on to the plugins.
Metalsmith(__dirname)
    .metadata(melindreamakes.metadata)
    .source('./src')            // source directory
    .destination('./build')     // destination directory
    .clean(true)                // clean destination before
    .use(postcss({
        plugins: {
            'postcss-import': {},
            'tailwindcss': {},
            'autoprefixer': {}
        }
    }))
    // Use @metalsmith/markdown to convert
    // our source files' content from markdown
    // to HTML fragments.
    .use(markdown())
    .use(permalinks())
    .use(discoverHelpers({
        directory: 'templates/helpers',
        pattern: /\.js$/
    }))
    .use(discoverPartials({
        directory: 'templates/partials',
        pattern: /\.hbs$/
    }))
    // Put the HTML fragments from the step above
    // into our template, using the Frontmatter
    // properties as template variables.
    .use(layouts({
        directory: 'templates'
    }))

    // And tell Metalsmith to fire it all off.
    .build(function(err, files) {
        if (err) { throw err; }
    });