'use strict';

require('dotenv').config()

const Mastodon  = require('mastodon-api'),
    {resolve} = require('path'),
    { DateTime } = require('luxon'),
    fs = require('fs'),
    postsfile = resolve('posts.json'),
    posts = require(postsfile),
    post_to = {
        mastodon: {
            create: (post) => createMastodonPost(post),
            schedule: (postConfig, post) => sendMastodonPost(postConfig, post)
        }
    };

let isProduction;
let isThrowbackPost = false;

exports.publishNew = function(env) {
    isProduction = (env === 'prod');

    const unpostedPosts = Object.entries(posts).filter(([key, value]) => ! value.pushed);
    unpostedPosts.forEach(item => {
        let [slug, post] = item;
        
        let config;
        Object.keys(post_to).forEach(type => {
            config = post_to[type].create(post);
            post_to[type].schedule(config, post);
        });
        if (isProduction) {
            posts[slug].pushed = true;
        }
    });

    if (isProduction && unpostedPosts.length > 0) {
        let data = JSON.stringify(posts, null, 4);
        fs.writeFile(postsfile, data, (err) => {
            if (err) {
                throw err;
            }
            console.log('Posts saved to ' + postsfile);
        });
    }
    
}

exports.publishRandom = function(env) {
    isProduction = (env === 'prod');
    isThrowbackPost = true;
    const throwbackDuration = { days: -30 };
    const now = DateTime.now(),
        cutoffDate = now.plus(throwbackDuration);
    
    let olderPosts = Object.values(posts).filter( post => {
        let publishedDate = DateTime.fromISO(post.stats.published);
        return publishedDate < cutoffDate;
    });

    if (olderPosts.length < 1 ) {
        console.log('No posts can be shared with #ThrowbackToot');
        return;
    } 

    let post;
    if (olderPosts.length === 1) {
        post = olderPosts[0];
    } else {
        post = olderPosts[Math.floor(Math.random() * olderPosts.length)];
    }
    
    let config;
    Object.keys(post_to).forEach(type => {
        config = post_to[type].create(post);
        post_to[type].schedule(config, post);
    });
}

function createMastodonPost(post) {
        let postConfig = {
            status: buildPost(post, 'mastodon'), //Text
        };

        return postConfig;
}

function buildPost(post, type) {
    let snippets = [
        `${post.title}:`,
        post.summary,
        post.link,
        getAddenda(post.addenda, type)
    ];

    return snippets.join(' ');
    
    
    //`TESTING API: <a href="${post.link}">${post.title}</>: ${post.summary} ${getMastodonAddenda(post.addenda)}`
}

function getAddenda(addenda, type) {
    let general = addenda.general || [];
    let specific = addenda[type] || [];

    if (isThrowbackPost) {
        general.push('#ThrowbackToot');
    }
    
    return general.concat(specific).join(' ');
}

function sendMastodonPost(postConfig, post) {
    if (isProduction) {
        const M = new Mastodon({
            access_token: process.env.MASTODON_ACCESS_TOKEN,
            timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
            api_url:process.env.MASTODON_BASE_URL
        });

        M.post('statuses', postConfig).then(resp => {
            if ( 'error' in resp.data) {
                console.log(`Post ${post.title} not published due to error: ${resp.data.error}`)
            } else {
                console.log(resp.data);
            }
        });
    } else {
        console.log('Not posting to API due to dev environment');
        console.log(postConfig);
    }
    //console.log(postConfig)
    /*M.get('statuses/' + tootid, {}).then((resp) => {
        console.log(resp.data.url)
    });*/
    /*M.delete('scheduled_statuses/8', {}).then((resp) => {
        console.log(resp.data)
    });
    M.get('scheduled_statuses', {}).then((resp) => {
        console.log(resp.data)
    });*/
    /*M.post('statuses', postConfig).then(resp => {
        //const id = resp.data.id;
        // In here I need to somehow give an answer to the
        console.log(resp.data)
    });*/
    /*M.post('media', imageConfig).then(resp => {
        const id = resp.data.id,
            type = resp.data.type;

        if (type === 'image') {
            postConfig.media_ids.push[id];
            M.post('statuses', postConfig).then(resp => {
                //const id = resp.data.id;
                // In here I need to somehow give an answer to the
            });
        }
    });*/
}