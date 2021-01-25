const express = require('express');
const ws = require('ws');
let http = require('http');
const mongodb = require('./db/mongo')
const { formatData } = require('./utils')
const colName = 'chathistory'



// express web服务器
const app = express();
// 静态资源服务器
app.use(express.static('../public'));

// 利用http连接express服务器与socket服务器
const server = http.Server(app);

// Socket服务器
const wss = new ws.Server({
    server,
    // port:1001
});

wss.on('connection', (client) => {

    // console.log(client._protocol);
    // console.log(wss.clients.size);
    // console.log(wss.clients.has(client), wss.clients.size);

    client.on('message', async(data) => {
        console.log(JSON.parse(data));
        data = JSON.parse(data)
        let { name, details } = data;
        console.log(name);
        let ow_id = name.split('&')[0];
        let op_id = name.split('&')[1];
        console.log(ow_id, op_id);


        let h_data = {
            name,
            details
        }
        console.log(h_data);
        let result = await mongodb.insertHistory('chathistory', h_data)
        console.log(result);

        wss.clients.forEach(client => {
            if (client._protocol == ow_id) {
                client.send(JSON.stringify(result.history[0]));
                // client.send(data);

            } else if (client._protocol == op_id) {
                client.send(JSON.stringify(result.history[0]));
                // client.send(data);
            }
        });


        // 服务端只做一件事情：把用户发来的消息广播给其他用户
        // wss.clients.forEach(client => {
        //     if (client._protocol == op_id) {
        //         client.send(data);
        //     }
        // })
    })
})


server.listen(2080, () => {
    console.log('server is runing on port 2080')
})