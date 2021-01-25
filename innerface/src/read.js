const fs = require('fs')

let path = '../public/json/json1610515761127.json';

let readStream = fs.createReadStream(path);
let data = "";
readStream.on('data', (chunk) => {
    data += chunk;
})
readStream.on('end', () => {
    console.log(JSON.parse(data));
})