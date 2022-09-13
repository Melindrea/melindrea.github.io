'use strict';

//const { schedulePosts } = require('./social-integration');

//schedulePosts();
const {resolve} = require('path'),
    pkg = require(resolve('package.json')),
    argv = require('yargs')
        .help('h')
        .alias('h', 'help')
        .epilog(pkg.melindreamakes.metadata.copyright)
        .example([
            ['node $0', 'Share new post(s)'],
            ['node $0 --tbt', 'Share a random post older than 30 days']
          ])
        .usage('Usage: node $0 [--tbt]')
        .boolean('tbt')
        .default('tbt', false)
        .argv,
    { publishNew, publishRandom } = require('./social-integration'),
    env = process.env.NODE_ENV || 'dev';

//console.log(pkg.melindreamakes.metadata)
//console.log('Args:', argv);
if (argv.tbt) {
    publishRandom(env);
} else {
    publishNew(env);
}