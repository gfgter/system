const express = require('express');
const fs = require('fs')
const router = express.Router();

router.use('/', async(req, res) => {
    let { data } = await req.body;
    let path = filename = "";
    let arr = [];
    if (data) {
        data = JSON.parse(data);
        data.forEach(item => {
            console.log(1);
            const flag = item.substr(0, 50)
            if (flag.includes('jpeg')) {
                filename = Date.now() + '.jpg';
                path = '../public/img/img' + filename;
                item = item.replace(/^data:image\/\w+;base64,/, "");
                obj = { imgSrc: 'http://localhost:2008/img/img' + filename }
                arr.push(obj)
            } else if (flag.includes('png')) {
                filename = Date.now() + '.png';
                path = '../public/img/img' + filename;
                item = item.replace(/^data:image\/\w+;base64,/, "");
                obj = { imgSrc: 'http://localhost:2008/img/png' + filename }
                arr.push(obj)
            } else if (flag.includes('json')) {
                filename = Date.now() + '.json';
                path = '../public/json/json' + filename;
                item = item.replace(/^data:application\/json;base64,/, '');
            } else if (flag.includes('mp4')) {
                filename = Date.now() + '.mp4';
                path = '../public/mp4/mp4' + filename;
                item = item.replace(/^data:video\/mp4;base64,/, "");
            }

            item = item.replace(/\s/g, '+')
            const dataBuffer = Buffer.from(item, 'base64');
            fs.writeFile(path, dataBuffer, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(path);
                    console.log('写入成功！');
                }
            })
        });
        res.send(JSON.stringify(arr))
    } else {
        res.send('fail')
    }
})


module.exports = router