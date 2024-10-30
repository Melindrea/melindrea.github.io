// Work-around to load package.json as an ESM module
import fs from 'fs';

export default JSON.parse(fs.readFileSync('./package.json'));