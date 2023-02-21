'use strict';

const wordsCount = require('words-count').default,
    { stripHtml } = require("string-strip-html"),
    slug = require('slug'),
    fs = require('fs'),
    { DateTime } = require('luxon'),
    {resolve, sep} = require('path'),
    melindreamakes = require('../package').melindreamakes;
    
module.exports = plugin;

function plugin(options) {
    options = options || {
        dev: true
    };
    
    return function(files, metalsmith, done) {
        setImmediate(done);
        const blogList = metalsmith.metadata().collections.blog || [];
        if (blogList.length > 1) {
            pagination(blogList);
        }

        handleTags(files, metalsmith);

        handlePosts(files, metalsmith.metadata().collections.blog);
        
        if (! options.dev) {
            updatePublishedPosts(metalsmith.metadata().siteurl, metalsmith.metadata().collections.blog);
        }

        handleIndices(files, metalsmith.metadata().collections);
    }
}

function updatePublishedPosts(baseurl, postCollection) {
    const postsfile = resolve('posts.json'),
        postsData= require(postsfile); 
    
    let postArray = []; // This is used to sort-of sort--I want the file to be in something resembling order
    
        // I want this to be sync
    for (let i = 0; i <postCollection.length; i++) {
        let post = postCollection[i];

        let postData = {
            title: post.title,
            summary: post.abstract,
            link: `${baseurl}/${post.path}/`,
            image: {
                description: post.image.description,
                path: post.featuredpath + '/1464.jpg'
            },
            stats: {
                modified: post.lastmod,
                published: post.pubdate
            },
            pushed: false,
            slug: post.slug
        };
        
        // Any already-added posts just needs to be update
        if (post.slug in postsData) {
            postData.pushed = postsData[post.slug].pushed;
        } else {
            console.log(`New post ${post.title} added to posts.`);
        }

        if ('social_media' in post) {
            postData.addenda = socialMedia(post.social_media);
        }
        
        postArray.push(postData);
    }

    const postMap = new Map();

    postArray.sort((a, b) => {
        const aPub = a.stats.published,
              bPub = b.stats.published;

        return bPub.getTime() - aPub.getTime(); // Want newest at top
    }).forEach(object => {
        let slug = object.slug;
        delete object.slug;
        postMap.set(slug, object);
    });
    
    const data = JSON.stringify(Object.fromEntries(postMap), null, 4);
    
    fs.writeFile(postsfile, data, (err) => {
        if (err) {
            throw err;
        }
        console.log('Posts saved to ' + postsfile);
    });
}

function socialMedia(smMeta) {
    const prefixes = {
        masto: 'mastodon',
        tw: 'twitter',
        fb: 'facebook'
    },
    mastodon_groups = {
        amwriting: '@amwriting@a.gup.pe',
        fiberarts: '@fiberarts@a.gup.pe'
    };
    
    let addenda = {
        general: [
            '#MelindreaMakes'
        ]
    };

    if ('hashtag' in smMeta) {
        for (const hashtag of smMeta.hashtag.values()) {
            let parts = hashtag.split(';');
            
            if (parts.length === 1) {
                addenda.general.push('#' + hashtag);
            } else if (parts.length === 2) {
                let type = prefixes[parts[0]];

                if (type in addenda) {
                    addenda[type].push('#' + parts[1]);
                } else {
                    addenda[type] = ['#' + parts[1]];
                }
            }
        }
    }

    // This is mastodon specific
    if ('groups' in smMeta) {
        let groups = [];

        for (const group of smMeta.groups.values()) {
            if (group in mastodon_groups) {
                groups.push(mastodon_groups[group]);
            } else {
                console.log('Group ' + group + ' is not defined');
            }
        }

        if ('mastodon' in addenda) {
            addenda.mastodon.push(...groups);
        } else {
            addenda.mastodon = groups;
        }
    }

    return addenda;
} 

function postHasFeatured(post) {
    // Does it have a valid featured image?
    const sizes = ['1464', '300', '767', '952', '1208'],
        image_url_path = './src' + post.featuredpath + '/';
    
    for (let i = 0; i < sizes.length; i++) { 
        let url = image_url_path + sizes[i] + '.jpg';
        if (! fs.existsSync(url)) {
            console.warn('NB: Post "' + post.title + '" has no featured image.')
            return false;
        }
    }
    
    return true;
}

function getFilePath(items) {
    // Gets a file path with the separator based on the OS
    return items.join(sep);
}

function getUrlPath(items) {
    // Gets an url path with / separating the items
    return items.join('/')
}

function handleTags(files, metalsmith) {
    // Tags are declared in package.json, under melindreamakes key
    let tags = [];
    
    Object.keys(melindreamakes.tags).forEach(tag => {
        let posts = metalsmith.metadata().collections[tag] || [];
    
        if (posts.length > 0) {
            const url = getUrlPath(['blog', 'tags', tag]);
            
            let fileData = {
                title: tag,
                contents: Buffer.from('', 'utf-8'),
                posts: posts.sort((a, b) => {
                    const aPubdate = a.pubdate,
                          bPubdate = b.pubdate;

                    return bPubdate - aPubdate;
                }),
                postcount: posts.length,
                context: 'tag',
                layout: 'blog/listing.hbs',
                path: url,
                postTemplate: 'long',
                widgets: {
                    tags: {
                        position: 'sidebar'
                    }
                },
                features: {
                    sidebar: true
                },
                listClass: 'tag-' + slug(tag)
            };
            
            let file = {
                ...fileData,
                ...melindreamakes.tags[tag],
                ...getListDates(posts)
            };
            
            files[url + '/index.html'] = file;
            tags.push(file);

        } else {
            console.log('Tag "' + tag + '" has no posts.')
        }
    });
    
    metalsmith.metadata().collections.tags = tags.sort((a, b) => {
        // Step 1: Compare post count
        let postDiff = b.postcount - a.postcount;

        if (postDiff !== 0) {
            return postDiff;
        }
        
        // Step 2, compare titles
        const aTitle = a.title.toUpperCase(); // ignore upper and lowercase
        const bTitle = b.title.toUpperCase(); // ignore upper and lowercase
        if (aTitle < bTitle) {
            return -1;
        }
        if (aTitle > bTitle) {
            return 1;
        }

        // names must be equal
        return 0;
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
        let originalFilePath = post.path.replace('/', sep) + sep + 'index.html';

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
        post.featuredpath = '/assets/images/featured-images/' + slug(post.title);
        
        postHasFeatured(post);

        // Word count + estimated reading
        post.wordcount = getWordCount(post);
        post.estimate = getReadingTime(post.wordcount);
        post.layout = 'blog/post.hbs';
        post.features = {'sidebar': true};
        post.widgets = {
            meta: {
                position: 'sidebar'
            }
        };

        let postslug = slug(post.title);
        post.path = getUrlPath(['blog', 'posts', postslug, 'index.html']);
        post.slug = postslug;
        
        files[getFilePath(['blog', 'posts', postslug, 'index.html'])] = post;
        delete files[originalFilePath];
        
    });
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
            layout: 'blog/listing',
            deletePosts: true
        }
    ];

    for (let i = 0; i < indices.length; i++) {
        let index = indices[i];

        let layout = 'layout' in index ? index.layout : index.type;
        let posts = collections[index.type];
        let filepath = index.type + sep + 'index.html';

        files[filepath] = createIndexFile(layout + '.hbs', posts);

        if (index.deletePosts) {
            deletePosts(files, posts);
        }

    }
}

function deletePosts(files, posts) {
    for (let i = 0; i < posts.length; i++) {
        let filepath = posts[i]['path'].replace('/', sep) + sep + 'index.html';
        //console.log('Deleting file "' + filepath + '"')
        delete files[filepath];
    }
}

function createIndexFile(layout, posts) {
    let fileData = {
        contents: Buffer.from('', 'utf-8'),
        layout: layout,
        posts: posts.sort((a, b) => {
            const aPubdate = a.pubdate,
                  bPubdate = b.pubdate;

            return bPubdate - aPubdate;
        }),
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