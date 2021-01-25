const express = require('express');
const router = express.Router();
const mongodb = require('../db/mongo')
const { formatData } = require('../utils')
const crypto = require('crypto');
const { query } = require('express');
const colName = 'friendscircle'
const { getFile } = require('./file');
const { ObjectId } = require('mongodb');

//获取朋友圈
router.get('/getCircle', async(req, res) => {
    let { _id } = JSON.parse(req.query.data);
    let user = await mongodb.find('users', { _id: ObjectId(_id) })
    console.log(user);
    if (user.flag) {
        let friendList = user.result[0].friends;
        let list = [ObjectId(_id)];
        if (friendList.length > 0) {
            friendList.forEach(item => {
                list.push(ObjectId(item._id))
            })
        }
        let circle = await mongodb.find(colName, { userId: { $in: list }, status: 0 });
        if (circle.flag) {
            return res.send(formatData({ code: 200, data: circle.result }))
        }
        res.send(formatData({ code: 400 }))
    }
})


//点赞或者评论
router.post('/updateCircle', async(req, res) => {
    let { data } = req.body
        // console.log(data);
    let { like = 1, comments = '', _id, userId } = data
    _id = ObjectId(_id), userId = ObjectId(userId)
    let a = await mongodb.find(colName, { _id })
    let user = await mongodb.find('users', { _id: userId })
    user = user.result[0];
    let details = { userId: user._id, username: user.username, imgSrc: user.imgSrc }
        // console.log(comments, 'comments');
        // console.log(user, details);
    if (a.flag) {
        if (like == 0) {
            console.log(userId);
            let doWeight = await mongodb.find(colName, { _id })
            let likeList = doWeight.result[0].like;

            let isCunzai = likeList.some(item => {
                console.log(item.userId, userId);
                return ObjectId(item.userId).toString() == ObjectId(userId).toString()
            })
            let result = true;
            console.log(isCunzai, 'iscunzai');
            // let result = true;
            if (isCunzai != true) {
                result = await mongodb.update(colName, { _id }, { $push: { like: details } })
                    // let doWeight = await mongodb.find(colName, { _id })
                    // let likeList = doWeight.result[0].like;

            }
            console.log(isCunzai);
            console.log(likeList);

            // console.log(likeList);
            // let obj = {}
            // likeList = likeList.reduce((prev, item) => { obj[item.name] ? '' : obj[item.name] = prev.push(item); return prev }, [])
            // console.log(likeList, 'likelist');

            // let result = await mongodb.update(colName, { _id }, { $set: { like: likeList } })
            if (result) {
                console.log('success');
                let user = await mongodb.find('users', { _id: userId })
                if (user.flag) {
                    let friendList = user.result[0].friends;
                    let list = [userId];
                    if (friendList.length > 0) {
                        friendList.forEach(item => {
                            list.push(item._id)
                        })
                    }
                    let circle = await mongodb.find(colName, { userId: { $in: list } });
                    if (circle.flag) {
                        return res.send(formatData({ code: 200, data: circle.result }))
                    }
                    res.send(formatData({ code: 400 }))
                }
            } else {
                res.send(formatData({ code: 400 }))
            }
        }
        if (comments) {
            details = { userId: user._id, username: user.username, imgSrc: user.imgSrc, comments }
            console.log(details, );
            let isComments = await mongodb.update(colName, { _id }, { $push: { comments: details } })
            if (isComments) {
                console.log('success');
                let user = await mongodb.find('users', { _id: userId })
                if (user.flag) {
                    let friendList = user.result[0].friends;
                    let list = [userId];
                    if (friendList.length > 0) {
                        friendList.forEach(item => {
                            list.push(item._id)
                        })
                    }
                    let circle = await mongodb.find(colName, { userId: { $in: list } });
                    if (circle.flag) {
                        return res.send(formatData({ code: 200, data: circle.result }))
                    }
                    res.send(formatData({ code: 400 }))
                }
            } else {
                res.send(formatData({ code: 400 }))
            }
        }
    }
})


//添加朋友圈
router.post('/addCircle', async(req, res) => {
    let { userId, media = [], description } = req.body.data;
    userId = ObjectId(userId)
    let filePath;


    let upic = await mongodb.find('users', { _id: userId })
    let pic = '';
    let uname = '';
    if (upic.flag) {
        pic = upic.result[0].imgSrc;
        uname = upic.result[0].username;
    }


    if (media) {
        filePath = await getFile(media);
    } else {
        filePath = '';
    }
    let info = {
        username: uname,
        imgSrc: pic,
        userId,
        media: filePath,
        description,
        like: [],
        comments: [],
        status: 0,
        addTime: Date.now()
    }
    if (!Array.isArray(info)) {
        info = [info];
    }
    let result = await mongodb.create(colName, info);
    if (result) {
        console.log(userId);
        let user = await mongodb.find('users', { _id: userId })
        if (user.flag) {
            let friendList = user.result[0].friends;
            let list = [userId];
            if (friendList.length > 0) {
                friendList.forEach(item => {
                    list.push(item._id)
                })
            }
            let circle = await mongodb.find(colName, { userId: { $in: list } });
            if (circle.flag) {
                res.send(formatData({ code: 200, data: circle.result }))
            }
        }
    }
})

//更改状态
router.post('/statusUpdate', async(req, res) => {
    let { query, data } = req.body.data;
    if (query._id) {
        query._id = ObjectId(query._id)
    }
    // if (fileData) {
    //     let filePath = await getFile(fileData);
    //     let result = await mongodb.update(colName, query, { $set: { imgSrc: filePath, data } })
    //     if (result) {
    //         res.send(formatData({ code: 200, msg: '修改成功' }))
    //     } else {
    //         res.send(formatData({ code: 400, msg: '修改失败' }))
    //     }
    // } 
    // else {
    let result = await mongodb.update(colName, query, { $set: data })
    if (result) {
        res.send(formatData({ code: 200, msg: '修改成功' }))
    } else {
        res.send(formatData({ code: 400, msg: '修改失败' }))
    }
    // }
})


module.exports = router