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
    include    = require('metalsmith-include-files'),
    melindreamakes = require('./package').melindreamakes;

function presence(files, metalsmith) {
  Object.keys(files).forEach(path => {
    if (files[path].presence) {
        files[path].presence = melindreamakes.presence;
    }

    if (files[path].mastodon) {
        files[path].mastodon = melindreamakes.mastodon;
    }
  })
}

function pages(files, metalsmith) {
    folder = "pages/";
  Object.keys(files).forEach(path => {
    if (path.includes(folder)) {
        new_path = path.replace(folder, '');
        files[new_path] = files[path];
        delete files[path];
    }
  })
}

function check(files, metalsmith) {
    /*folder = 'updates/'; */
    Object.keys(files).forEach(path => {
        //if (path.includes(folder) && path !== folder + 'index.html') {
            console.log(path);
        //}
    })
    //console.log(metalsmith.metadata().collections);
}

function addPubdates(files, metalsmith) {
    Object.keys(files).forEach(path => {
        if (! files[path].pubdate
            && path.includes('.html')
            && files[path].stats.birthtime) {
            files[path].pubdate = files[path].stats.birthtime;
        }
    })
}

function updatesConfig(files, metalsmith) {
    let updates = metalsmith.metadata().collections.updates;
    let indexFile = files['updates/index.html'];
    indexFile['title'] = updates.metadata.title;
    indexFile['description'] = updates.metadata.description;

    for (let i = 0; i < updates.length; i++) {
        delete files[updates[i]['path'] + '/index.html'];
    }

    //console.log(updates);
}

// Run Metalsmith in the current directory.
// When the .build() method runs, this reads
// and strips the frontmatter from each of our
// source files and passes it on to the plugins.
Metalsmith(__dirname)
    .metadata(melindreamakes.metadata)
    .source('./src')            // source directory
    .destination('./build')     // destination directory
    .clean(true)                // clean destination before
    .ignore('**/*.DS_Store')
    .use(postcss({
        plugins: {
            'postcss-import': {},
            'tailwindcss': {},
            'autoprefixer': {}
        }
    }))
    .use(include({            // include external JavaScript
        'assets/js': [
            './node_modules/jquery/dist/jquery.slim.min.js'
        ]
    }))
    // Use @metalsmith/markdown to convert
    // our source files' content from markdown
    // to HTML fragments.
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use(collections({
        gallery: 'photos/**/*.{jpg,png}',
        updates: {
          metadata: {
            title: 'Short updates',
            description: 'Quick updates about what is going on',
            slug: 'updates'
          },
          pattern: 'updates/**/*.html',
          refer: false,
          sortBy: 'pubdate',
          reverse: true
        },
        blog: 'posts/**/*.html'
    }))
    .use(pages)
    .use(addPubdates)
    .use(updatesConfig)
    //.use(check)
    .use(presence)
    .use(discoverHelpers())
    .use(discoverPartials({
        directory: 'templates/partials',
        pattern: /\.hbs$/
    }))
    // Put the HTML fragments from the step above
    // into our template, using the Frontmatter
    // properties as template variables.
    .use(layouts({
        pattern: '**/*.html',
        directory: 'templates'
    }))

    // And tell Metalsmith to fire it all off.
    .build(function(err, files) {
        if (err) { throw err; }
    });
