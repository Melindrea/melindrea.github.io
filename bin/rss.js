
import xml from 'xml';
import { DateTime } from 'luxon';
import * as cheerio from 'cheerio';
    

export default function rss(options) {
    options = options || {};
    
    return function(files, metalsmith, done) {
        setImmediate(done);
        const posts = [
            ...metalsmith.metadata().collections.blog,
            ...metalsmith.metadata().collections.gallery
        ];
        
        const feed = createRSSFeed(createChannelNode(options, buildFeed(posts, options.url)));
        //testGallery(metalsmith.metadata().collections.gallery, options.url)
        let fileData = {
            contents: Buffer.from(feed, 'utf-8'),
        };
        files['feed.rss'] = fileData;
    }
}

function parseImage(image, url) {
    return { item: [
        { title: image.title },
        { pubDate: DateTime.fromJSDate(image.pubdate).toRFC2822()},
        {
            guid: [
                { _attr: { isPermaLink: false } },
                `${image.slug}`,
            ]
        },
        {
            link: `${url}/gallery/`
        },
        {
            description: {
                _cdata: image.description,
            },
        },
        {
            category: 'gallery'
        }
    ] };
}

function parsePost(post, url) {
    const $ = cheerio.load(post.contents.toString())

    $("a[href^='/'], img[src^='/'], a[href^='#']").each(function () {
        const $this = $(this);
        
        if ($this.attr('href')) {
            $this.attr('href', `${url}${$this.attr('href')}`);
        }
        if ($this.attr('src')) {
            $this.attr('src', `${url}${$this.attr('src')}`);
        }
        
    });
        
    const postContent = $('body').html();
    const date = DateTime.fromJSDate(post.pubdate);
    const imageLink = `${url}${post.featuredpath}/952.jpg`;
    const imageTag = `<img src="${imageLink}" alt="${post.image.description}" width="952" height="317">`;
    const description = `${imageTag}<p>${post.abstract}</p>${postContent}`;
    let categories = [];
    if (post.tags) {
        categories = post.tags.map(tag => {
            return {
                category: tag.name
            };
        });
    }
    const item = { item: [
        { title: post.title },
        { pubDate: date.toRFC2822()},
        {
            guid: [
                { _attr: { isPermaLink: true } },
                `${url}/${post.path}/`,
            ]
        },
        {
            description: {
                _cdata: description,
            },
        },
        ...categories
    ] };

    return item;
}

function buildFeed(items, url) {
    const feedItems = [];
    let feedItem = '';
    items.sort((a, b) => {
        const aPubdate = a.pubdate,
              bPubdate = b.pubdate;
        
        return bPubdate - aPubdate;
    }).forEach(item => {
        if (item.collection.includes('gallery')) {
            feedItem = parseImage(item, url);
        } else {
            feedItem = parsePost(item, url);
        }
        feedItems.push(feedItem);
    });

    return feedItems;
 
}

function createChannelNode(options, posts) {
    return [
        {
          'atom:link': {
            _attr: {
              href: `${options.url}/feed.rss`,
              rel: 'self',
              type: 'application/rss+xml',
            },
          },
        },
        {
          title: options.title,
        },
        {
          link: options.url,
        },
        {
          description: options.description,
        },
        {
            copyright: options.copyright
        },
        {
          language: 'en-US',
        },
        {
            image: [
                { link: options.url },
                { title: options.title },
                { description: 'a dark purply-pink image with an ornamental border and "Melindrea makes" in varigated text'},
                { url: `${options.url}/assets/images/rss-logo.jpg` },
                { height: 122 },
                { width: 140 },
            ]
        },
        {
            lastBuildDate: DateTime.now().toRFC2822(),
        },
        {
            webMaster: 'iam@mariehogebrandt.se (Antonius Marie Hogebrandt)'
        },
        ...posts
      ];
}

function createRSSFeed(channel) {
    const rssObject =  {
        rss: [{
          _attr: {
            version: '2.0',
            'xmlns:atom': 'http://www.w3.org/2005/Atom',
          },
        },
        {
          channel: channel,
        },
        ],
      };

    return xml(rssObject, { declaration: true, indent: true });
}