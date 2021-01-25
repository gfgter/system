const express = require('express');
const rootRouter = require('./api');
const app = express();
const port = 2008;


// 静态资源服务器
app.use(express.static('../public'));

// 接口
app.use('/api', rootRouter);

app.listen(port, () => {
    console.log('runing');
})