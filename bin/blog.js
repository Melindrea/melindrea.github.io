'use strict';

const { post } = require('jquery');

const wordsCount = require('words-count').default,
    { stripHtml } = require("string-strip-html"),
    slug = require('slug'),
    fs = require('fs'),
    { DateTime } = require('luxon'),
    melindreamakes = require('../package').melindreamakes;
    
module.exports = plugin;

function plugin(options) {
    options = options || {};
    //let directory = options.directory || 'OEBPS';
    return function(files, metalsmith, done) {
        setImmediate(done);
        const blogList = metalsmith.metadata().collections.blog || [];
        if (blogList.length > 1) {
            pagination(blogList);
        }

        handleTags(files, metalsmith);

        handlePosts(files, metalsmith.metadata().collections.blog);

        handleIndices(files, metalsmith.metadata().collections);
    }
}

function postHasFeatured(post) {
    // Does it have a valid featured image?
    const sizes = ['1464', '300', '767', '952', '1208'],
        imagepath = './src/assets/images/featured-images/' + slug(post.title) + '/';
    
    for (let i = 0; i < sizes.length; i++) { 
        let path = imagepath + sizes[i] + '.jpg';
        if (! fs.existsSync(path)) {
            console.warn('NB: Post "' + post.title + '" has no featured image.')
            return false;
        }
    }
    
    return true;
}

function handleTags(files, metalsmith) {
    // Tags are declared in package.json, under melindreamakes key
    metalsmith.metadata().collections.tags = [];
    Object.keys(melindreamakes.tags).forEach(tag => {
        let posts = metalsmith.metadata().collections[tag] || [];
    
        if (posts.length > 0) {
            const path = 'blog/tags/' + tag;
            
            let fileData = {
                title: tag,
                contents: Buffer.from('', 'utf-8'),
                posts: posts,
                postcount: posts.length,
                context: 'tag',
                layout: 'blog/listing.hbs',
                path: path
            };
            
            let file = {
                ...fileData,
                ...melindreamakes.tags[tag],
                ...getListDates(posts)
            };
            
            files[path + '/index.html'] = file;
            metalsmith.metadata().collections.tags.push(file);

        } else {
            console.log('Tag "' + tag + '" has no posts.')
        }
    });
}

function getListDates(posts) {
    let pubdate = 0;
    let lastmod = 0;
    for (let i = 0; i < posts.length; i++) {
        let ppdate = posts[i].pubdate;
        let pmdate = posts[i].lastmod;
        if (pubdate === 0 || ppdate < pubdate) { // Hasn't been set yet or the new date is newer than the old
            pubdate = ppdate;
        }

        if (pmdate > lastmod) {
            lastmod = pmdate;
        }
    }
    
    return { pubdate: pubdate, lastmod: lastmod };
}

function handlePosts(files, postCollection) {
    postCollection.forEach(post => {
        let tags = [];
        let oldPath = post.path;

        post['collection'].filter(c => c !== 'blog').forEach(tag => {
            let link = 'blog/tags/' + tag;
            tags.push({
                link: '/' + link,
                name: tag
            });

            if (!(tag in melindreamakes.tags)) {
                console.warn('NB! Tag "' + tag + '" does not exist yet!')
            }
        });
        
        post['tags'] = tags;
        post.context = 'post';
        postHasFeatured(post);

        // Word count + estimated reading
        post.wordcount = getWordCount(post);
        post.estimate = getReadingTime(post.wordcount);
        post.layout = 'blog/post.hbs';

        let newPath = 'blog/posts/' + slug(post.title);
        post.path = newPath;
        post.slug = slug(post.title);
        files[newPath + '/index.html'] = post;
        delete files[oldPath + '/index.html'];
        
    });
    /*Object.keys(files).filter(p => p.startsWith('blog/')).forEach(path => {
        let tags = [];
        post['collection'].filter(c => c !== 'blog').forEach(function(tag) {
            let link = 'blog/tags/' + tag;
            tags.push({
                link: '/' + link,
                name: tag
            });

            if (!(tag in melindreamakes.tags)) {
                console.warn('NB! Tag "' + tag + '" does not exist yet!')
            }
        });
        post['tags'] = tags;
        post.context = 'post';
        postHasFeatured(post);

        // Word count + estimated reading
        post.wordcount = getWordCount(post);
        post.estimate = getReadingTime(post.wordcount);
        post.layout = 'blog/post.hbs';

        let newPath = 'blog/posts' + slug(post.title) + '/index.html';
        console.log(post.path);
    });*/
}

function handleIndices(files, collections) {
    let indices = [
        {
            type: 'blog',
            layout: 'blog/listing',
            deletePosts: false
        },
        {
            type: 'updates',
            deletePosts: true
        }
    ];

    for (let i = 0; i < indices.length; i++) {
        let index = indices[i];

        let layout = "layout" in index ? index.layout : index.type;
        let posts = collections[index.type];
        let path = index.type + '/index.html';

        files[path] = createIndexFile(layout + '.hbs', posts);

        if (index.deletePosts) {
            deletePosts(files, posts);
        }

    }
}

function deletePosts(files, posts) {
    for (let i = 0; i < posts.length; i++) {
        let path = posts[i]['path'] + '/index.html';
        //console.log('Deleting file "' + path + '"')
        delete files[path];
    }
}

function createIndexFile(layout, posts) {
    let fileData = {
        contents: Buffer.from('', 'utf-8'),
        layout: layout,
        posts: posts,
        postcount: posts.length
    };
    
    return {
        ...fileData,
        ...posts.metadata,
        ...getListDates(posts)
    };
}

function getWordCount(post) {
    return wordsCount(stripHtml(post.contents.toString()).result);
}

function getReadingTime(count) {
    const averageReading = 225; //200-250
    let time = Math.round(count/averageReading);

    if (time < 5) {
        return "less than 5 minutes";
    }

    return time + " minutes";
}

function pagination(blogList) {
    // Add the next/previous functionality to the blogs
    const noBlogs = blogList.length;
    if (noBlogs > 1) { // Since if there's only one post, it has neither next nor prior
        blogList.forEach((post, index) => {
            let prior = index + 1,
                next = index - 1;

            if (index === 0) { // This is the first post
                post.previous = blogList[prior];
            } else if (prior === noBlogs) { // This is the last post
                post.next = blogList[next];
            } else {
                post.next = blogList[next];
                post.previous = blogList[prior];
            }
        });
    }
}