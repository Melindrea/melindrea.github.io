'use strict';

// Get our requirements, installed by npm
const Metalsmith  = require('metalsmith'),
    markdown    = require('@metalsmith/markdown'),
    layouts     = require('@metalsmith/layouts'),
    permalinks = require('@metalsmith/permalinks'),
    collections = require('@metalsmith/collections'),
    publish = require('metalsmith-publish'),
    discoverPartials = require('metalsmith-discover-partials'),
    discoverHelpers = require('metalsmith-discover-helpers'),
    //discoverPartials = require('./bin/metalsmith-discover-partials'),
    //discoverHelpers = require('./bin/metalsmith-discover-helpers'),
    postcss = require('metalsmith-with-postcss'),
    include    = require('metalsmith-include-files'),
    concat = require('metalsmith-concat'),
    sitemap = require('metalsmith-sitemap'),
    toc = require('@metalsmith/table-of-contents'),
    slug = require('slug'),
    fs = require('fs'),
    pluralize = require('pluralize'),
    gallery = require('./bin/gallery'),
    blog = require('./bin/blog'),
    melindreamakes = require('./package').melindreamakes,
    repository = require('./package').repository,
    galleryMetadata = require('./gallery'),
    env = process.env.NODE_ENV || 'development',
    devMode = (env === 'development');
    


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

function addDates(files, metalsmith) {
    Object.keys(files).filter(p => p.endsWith('.html')).forEach(path => {
        if (! files[path].pubdate
            && files[path].stats.birthtime) {
            files[path].pubdate = files[path].stats.birthtime;
        }

        let lastmod = files[path].stats.mtime || false;
        let layoutFile = files[path].layout;
        
        // these are files where modifications may be  made in layout
        if (layoutFile === 'gallery.hbs' || layoutFile === 'index.hbs') {
            let stats = fs.statSync('templates/' + layoutFile);
            if (lastmod < stats.mtime) {
                lastmod = stats.mtime;
            }
        }
        files[path].lastmod  = lastmod;
    });
}

function bodyClasses(files, metalsmith) {

    // Only HTML-files
    Object.keys(files).filter(p => p.endsWith('.html')).forEach(path => {
        let sections = path.split('/');
        let bodyClasses = [];
        
        // Adds body classes to define features, like sidebar
        if ('features' in files[path]) {
            bodyClasses = Object.keys(files[path].features).map(x => 'with-' + x);
        }

        // this removes .hbs and if it's sectioned (ex blog/listing) only takes the first word
        let layout = files[path].layout.split('.')[0].split('/')[0];
        bodyClasses.push(layout);
        
        // These particular pages/sections require different classes
        if (['blog', 'index.html', 'privacy-cookies'].includes(sections[0])) {
            switch (sections[0]) {
                case 'index.html':
                    bodyClasses.push('faq');
                    break;

                case 'privacy-cookies':
                    bodyClasses.push('policy');
                    break;
                
                case 'blog':
                    if (sections[1] !== 'index.html') {
                        bodyClasses.push(...[pluralize.singular(sections[1]), slug(files[path].title)])
                    }

                    break;
            }
        } else {
            bodyClasses.push(sections[0])
        }
        bodyClasses = [... new Set(bodyClasses)] // Only unique values
        
        files[path].bodyClasses = bodyClasses;
    });
}

function breadcrumbs(files, metalsmith) {
    let navigation = metalsmith.metadata().navigation;

    Object.keys(files).filter(p => p.endsWith('.html')).forEach(path => {
        let sections = path.split('/');
        let breadcrumbs = [
            {
                text: navigation.home.name,
                url: navigation.home.url,
                key: 'home'
            }
        ];

        if (sections[0] !== 'index.html') { // This is a page
            if (sections[0] in navigation) {
                breadcrumbs.push({
                    text: navigation[sections[0]].name,
                    url: navigation[sections[0]].url,
                    key: sections[0]

                });
            } else {
                breadcrumbs.push({
                    text: files[path].header,
                    url: false,
                    key: sections[0]
    
                });
            }

            if (sections[1] !== 'index.html') { //This is subpage
                if (sections[0] === 'blog') { // Blog post or tag
                    breadcrumbs.push({
                        text: files[path].header,
                        url: false,
                        key: slug(files[path].title)
                    });
                }
            } else {
                breadcrumbs[1].url = false;
            }

        } else { // Home page
            breadcrumbs = [];
        }
        files[path].breadcrumbs = breadcrumbs;
    });
}

function github(files, metalsmith) {
    // This just creates the empty .nojekyll file

    files['.nojekyll'] = {
        contents: Buffer.from('', 'utf-8')
    };
    const regex = /(https?:\/\/)/i;
    let cname = metalsmith.metadata().siteurl.replace(regex, '');
    files['CNAME'] = {
        contents: Buffer.from(cname, 'utf-8')
    }
}

function favicons(files, metalsmith) {
    let faviconData = JSON.parse(fs.readFileSync('faviconData.json'));
    
    metalsmith.metadata().favicons = faviconData.favicon.html_code;
}
function check(files, metalsmith) {
    metalsmith.metadata().collections.blog.forEach(post => {
        /*if (post.toc) {
            console.log(post.title)
            console.log(post.toc)
        }*/
    //Object.keys(files).forEach(path => {
        //console.log(path);
        //console.log(files[path]);
    });
    let thingy = 'blog'
    //console.log(metalsmith.metadata().collections[thingy]);
    //console.log(metalsmith.metadata().images);

}

// Run Metalsmith in the current directory.
// When the .build() method runs, this reads
// and strips the frontmatter from each of our
// source files and passes it on to the plugins.
Metalsmith(__dirname)
    .metadata({
        repository: repository,
        ...melindreamakes.metadata
    })
    //.metadata(melindreamakes.metadata)
    .source('./src')            // source directory
    .destination('./docs')     // destination directory
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

        ],
        'assets/fonts': [
            './node_modules/lightgallery/fonts/*'
        ],
        'assets/images': [
            './node_modules/lightgallery/images/*'
        ],
        '' : [
            'favicons/*'
        ]
    }))
    .use(concat({
        files: [
            'assets/js/main.max.js' // found in src
        ],
        searchPaths: ['node_modules'],
        output: 'assets/js/scripts.max.js'
    }))
    .use(concat({
        files: [
            'lightgallery/lightgallery.min.js', // found in node_modules
            'lightgallery/plugins/thumbnail/lg-thumbnail.min.js', // found in node_modules
            'lightgallery/plugins/zoom/lg-zoom.min.js' // found in node_modules
        ],
        searchPaths: ['node_modules'],
        output: 'assets/js/lightgallery.min.js'
    }))
    // Use @metalsmith/markdown to convert
    // our source files' content from markdown
    // to HTML fragments.
    .use(markdown())
    .use(favicons)
    .use(addDates)
    .use(publish({
        futureMeta: 'pubdate',
        draft: devMode,
        private: devMode,
        unlisted: devMode
    }))
    .use(permalinks({
        relative: false
    }))
    .use(collections({
        gallery: 'assets/images/gallery/*.{jpg,png}',
        updates: {
          metadata: {
            title: 'Updates',
            header: 'Brief updates',
            description: 'Quick details about what is going on',
            path: 'updates',
            postTemplate: 'micro',
            listClass: 'updates',
          },
          pattern: 'updates/**/*.html',
          refer: false,
          sortBy: 'pubdate',
          reverse: true
        },
        blog: {
            pattern: 'blog/**/*.html',
            sortBy: 'pubdate',
            reverse: true,
            metadata: {
                title: 'Blog',
                header: 'All blog posts',
                description: 'Where I share my thoughts, ideas and general musings',
                index: true,
                path: 'blog',
                postTemplate: 'long',
                listClass: 'blog-index',
                widgets: {
                    tags: {
                        position: 'sidebar'
                    }
                },
                features: {
                    'sidebar': true
                }
            }
        }
    }))
    .use(blog())
    .use(gallery({
        galleryMetadata: galleryMetadata
    }))
    .use(presence)
    .use(breadcrumbs)
    .use(bodyClasses)
    .use(discoverHelpers({
        directory: 'templates/helpers'
    }))
    .use(discoverPartials({
        directory: 'templates/partials'
    }))
    .use(toc())
    // Put the HTML fragments from the step above
    // into our template, using the Frontmatter
    // properties as template variables.
    .use(layouts({
        pattern: '**/*.html',
        directory: 'templates'
    }))
    .use(sitemap({
        hostname: melindreamakes.metadata.siteurl,
        omitIndex: true
    }))
    .use(check)
    .use(github)
    // And tell Metalsmith to fire it all off.
    .build(function(err, files) {

        if (err) { throw err; }
    });
