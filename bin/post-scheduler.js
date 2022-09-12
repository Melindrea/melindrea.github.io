'use strict';

require('dotenv').config()

const Mastodon  = require('mastodon-api'),
    {resolve} = require('path'),
    fs = require('fs'),
    { DateTime } = require('luxon'),
    postsfile = resolve('posts.json'),
    posts = require(postsfile);

exports.schedulePosts = function(env) {
    let unscheduledPosts = Object.values(posts).filter( post => {
        return ! post.pushed;
    });
    unscheduledPosts.forEach(post => {
        let imagepath = resolve('asrc' + post.image.path);
        if (fs.existsSync(imagepath)) {
            // The file exists, so we can do the media and stuff
            let image = fs.createReadStream(imagepath);
        } else {
            console.log(`Will not schedule post for "${post.title}" as image ${imagepath} does not exist.`)
        }

    });
}

function schedulePost(mediastream, status) {
    // /108967226291574854
    const M = new Mastodon({
        access_token: process.env.MASTODON_AUTHORIZATION_CODE,
        timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
        api_url:process.env.MASTODON_BASE_URL
      });
    //console.log(M)
    //M.get('statuses/108967226291574854', {
    //}).then((resp) => console.log(resp.data))
    
    
    /*M.post('media', { file: fs.createReadStream('path/to/image.png') }).then(resp => {
        const id = resp.data.id;
        M.post('statuses', { status: '#selfie', media_ids: [id] });
    });*/
}