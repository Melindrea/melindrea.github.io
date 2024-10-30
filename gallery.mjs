// Work-around to load gallery.json as an ESM module
import fs from 'fs';

export default JSON.parse(fs.readFileSync('./gallery.json'));
