const fs = require('fs')

function getFile(data) {
    let path = filename = "";
    let arr = [];
    // console.log(data);
    if (data == '') {
        return false;
    }
    data.forEach(item => {
        const flag = item.substr(0, 50)
        if (flag.includes('jpeg')) {
            filename = Date.now() + '.jpg';
            path = '../public/img' + filename;
            item = item.replace(/^data:image\/\w+;base64,/, "");
            obj = { imgSrc: 'http://47.103.207.13:2008/img' + filename }
            arr.push(obj)

        } else if (flag.includes('png')) {
            filename = Date.now() + '.png';
            path = '../public/img' + filename;
            item = item.replace(/^data:image\/\w+;base64,/, "");
            obj = { imgSrc: 'http://47.103.207.13:2008/img' + filename }
            arr.push(obj)

        } else if (flag.includes('json')) {
            filename = Date.now() + '.json';
            path = '../public/json' + filename;
            item = item.replace(/^data:application\/json;base64,/, '');
            obj = { imgSrc: 'http://47.103.207.13:2008/json' + filename }

        } else if (flag.includes('mp4')) {
            filename = Date.now() + '.mp4';
            path = '../public/mp4' + filename;
            item = item.replace(/^data:video\/mp4;base64,/, "");
            obj = { imgSrc: 'http://47.103.207.13:2008/mp4' + filename }
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
    // res.send(JSON.stringify(arr))
    return arr;
}

module.exports = {
    getFile
}