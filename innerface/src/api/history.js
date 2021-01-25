const express = require('express');
const router = express.Router();
const mongodb = require('../db/mongo')
const { formatData } = require('../utils')
const crypto = require('crypto');
const { query } = require('express');
const colName = 'chathistory'
const { getFile } = require('./file')

//发送消息，写入聊天历史
router.post('/chatHistory', async(req, res) => {
    let { data } = req.body
    console.log(data, 'data');
    let result = await mongodb.insertHistory(colName, data);
    if (result.result) {
        res.send(formatData({ code: 200, data: { history: result.history[0] }, msg: '发送成功' }))
    } else {
        res.send(formatData({ code: 400, msg: '发送失败' }))
    }
})


module.exports = router