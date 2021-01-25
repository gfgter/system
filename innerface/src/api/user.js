const express = require('express');
const router = express.Router();
const mongodb = require('../db/mongo')
const { formatData } = require('../utils')
const crypto = require('crypto');
const { query } = require('express');
const colName = 'users'
const { getFile } = require('./file');
const { ObjectId } = require('mongodb');
// const mongo = require('../db/mongo');
const token = require('../utils/token')

//用户注册
router.post('/register', async(req, res) => {
    console.log(req.body);
    let {
        username,
        password,
        sex = '--',
        imgSrc = 'http://47.103.207.13:2008/img/default.jpg',
        sign = '',
        friends = [],
        addTime = Date.now(),
        tel = '',
        status = 0,
        apply = [],
        role = 'normal'
    } = req.body.data

    password = String(password);
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');

    let result = await mongodb.find(colName, { username })
    if (result.flag) {
        return res.send(formatData({ code: 400, data: [{ flag: !result.flag }], msg: '用户已存在' }))
    }
    let user = {
        username,
        password: newPassword,
        sex,
        imgSrc,
        sign,
        friends,
        addTime,
        tel,
        status,
        apply,
        role
    }
    result = await mongodb.create(colName, user)
    res.send(formatData({ code: 200, data: [{ username }], msg: '注册成功!' }))
})

// 用户登录
router.get('/login', async(req, res) => {
    let { username, password } = JSON.parse(req.query.data)

    password = String(password)
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');

    let data = {
        username,
        password: newPassword,
    }
    console.log(data);

    let result = await mongodb.find(colName, data)
    console.log(result);
    if (result.flag) {
        // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        if (result.result[0].status == 0) {
            res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        } else if (result.result[0].status == 1) {
            res.send(formatData({ code: 400, msg: '账号异常，请联系管理员' }))
        }
    } else {
        res.send(formatData({ code: 400, msg: '用户名或者密码错误' }))
    }
})

// router.get('/login/lo', async(req, res) => {
//     const { username, password } = req.query;

//     const hash = crypto.createHash('sha256');
//     hash.update(password);
//     const newPassword = hash.digest('base64');

//     // 创建token
//     const Authorization = token.create({ username, password: newPassword })

//     const result = await mongo.find(colName, { username, password: newPassword }, { projection: { password: 0 } });
//     if (result.length > 0) {
//         res.set({
//             Authorization
//         })
//         res.send(formatData({
//             data: {
//                 ...result[0],
//                 Authorization
//             }
//         }))
//     } else {
//         res.send(formatData({ code: 400 }))
//     }
// });


//修改信息(换头像)
router.post('/userUpdate', async(req, res) => {
    let { query, data, fileData = '' } = req.body.data;
    if (query._id) {
        query._id = ObjectId(query._id)
    }
    if (fileData) {
        let filePath = await getFile(fileData);
        let result = await mongodb.update(colName, query, { $set: { imgSrc: filePath, data } })
        if (result) {
            res.send(formatData({ code: 200, msg: '修改成功' }))
        } else {
            res.send(formatData({ code: 400, msg: '修改失败' }))
        }
    } else {
        let result = await mongodb.update(colName, query, { $set: data })
        if (result) {
            res.send(formatData({ code: 200, msg: '修改成功' }))
        } else {
            res.send(formatData({ code: 400, msg: '修改失败' }))
        }
    }
})

//发送好友申请
router.get('/addFriend', async(req, res) => {
    let { query, data } = JSON.parse(req.query.data)
    if (data._id) {
        data._id = ObjectId(data._id)
    }
    //查找对方
    let receiver = await mongodb.find(colName, query)
    if (receiver.flag) {
        let friendList = receiver.result[0].friends;
        let apply = receiver.result[0].apply
        console.log(apply);
        let flag = friendList.some(item => {
            // console.log(item._id, data._id, 'panduan');
            return item._id == data._id;
            // return ObjectId(item._id).toString() = ObjectId(data._id).toString();

        })
        console.log(flag);
        if (flag) {
            console.log('对方已是你的好友');
            res.send(formatData({ code: 400, msg: '对方已是你的好友' }))
        } else {
            console.log(1212);
            if (apply.length <= 0) {
                console.log('已成功发送好友申请');
                await mongodb.update(colName, query, { $push: { apply: { _id: data._id, status: 1 } } });
                res.send(formatData({ code: 200, msg: '已成功发送好友申请' }))
            } else {
                console.log(9999999999);
                console.log(apply);
                let isApply = apply.some(item => {
                        // console.log(item._id, data._id);
                        // return item._id == data._id
                        return ObjectId(item._id).toString() == ObjectId(data._id).toString()
                    })
                    // console.log(isApply);
                if (isApply) {
                    console.log('对方暂未处理，请勿频繁好友申请');
                    return res.send(formatData({ code: 400, msg: '对方暂未处理，请勿频繁好友申请' }))
                } else {
                    await mongodb.update(colName, query, { $push: { apply: { _id: data._id, status: 1 } } });
                    res.send(formatData({ code: 200, msg: '已成功发送好友申请' }))
                }
                apply.forEach(item => {
                    console.log(data._id, item._id);
                    if (ObjectId(item._id).toString() == ObjectId(data._id).toString()) {
                        console.log('对方暂未处理，请勿频繁好友申请');
                        return res.send(formatData({ code: 400, msg: '对方暂未处理，请勿频繁好友申请' }))
                    }
                })

                // console.log('已成功发送好友申请');
                // await mongodb.update(colName, query, { $push: { apply: { _id: data._id, status: 1 } } });
                // res.send(formatData({ code: 200, msg: '已成功发送好友申请' }))
            }
            //
        }
    }

})

//通过好友申请
router.post('/pass', async(req, res) => {
    let { query, data } = req.body.data
    console.log(req.body.data);
    //查找己方
    if (query._id) {
        query._id = ObjectId(query._id)
    }
    if (data._id) {
        data._id = ObjectId(data._id)
    }
    let owner = await mongodb.find(colName, data)
    let ow_id = owner.result[0]._id;

    // // //查找对方
    let opposite = await mongodb.find(colName, query)
    let op_id = opposite.result[0]._id;

    console.log(owner, '1', opposite, '2');

    if (owner.flag) {
        //查找自己的好友申请列表
        let apply = owner.result[0].apply;
        let arr = [];
        apply.forEach(item => {
            console.log(item._id, op_id);
            if (ObjectId(item._id).toString() != ObjectId(op_id).toString()) {
                // if (item._id == op_id) {
                //通过好友申请，把申请状态值改为0；
                // item.status = 0;
                // console.log(item, 'item');
                arr.push(item)
            }
        })
        console.log(apply);
        console.log(arr);
        await mongodb.update(colName, data, { $set: { apply: arr } })

        //把对方添加到自己的好友列表
        let friendList = owner.result[0].friends;
        let flag = friendList.some(item => {
            // return item._id = op_id;
            return ObjectId(item._id).toString() == ObjectId(op_id).toString()
        })
        if (flag) {
            console.log('对方已是你的好友ow');
            res.send(formatData({ code: 200, msg: '对方已是你的好友' }))
        } else {
            let name = `${ow_id}&${op_id}`;
            i_data = { name, details: [{ _id: ow_id, username: owner.result[0].username, imgSrc: owner.result[0].imgSrc, msg: ['我们已经是好友了，快来聊天吧'], addTime: Date.now() }] }
            let result = await mongodb.insertHistory('chathistory', i_data)

            console.log('添加好友成功ow');
            mongodb.update(colName, data, { $push: { friends: { _id: op_id, status: 0 } } })
            friendList.push({ _id: op_id, status: 0 });
            let arr = [];
            if (friendList.length <= 0) {
                arr.push(op_id)
            } else {
                friendList.forEach(item => {
                    arr.push(item._id)
                })
            }
            arr = [new Set(arr)]
            res.send(formatData({ code: 200, data: { history: result.history[0], friendList: arr }, msg: '添加好友成功' }))
        }
    }

    if (opposite.flag) {
        //把自己添加到对方的好友列表
        let friendList = opposite.result[0].friends;
        if (friendList.length <= 0) {
            mongodb.update(colName, query, { $push: { friends: { _id: ow_id, status: 0 } } })
            console.log('添加好友成功op');
            return;
        }
        let flag = friendList.some(item => {
            // return item._id = op_id;
            return ObjectId(item._id).toString() == ObjectId(op_id).toString()
        })
        if (flag) {
            console.log('对方已是你的好友op');
        } else {
            console.log('添加好友成功op');
            mongodb.update(colName, query, { $push: { friends: { _id: ow_id, status: 0 } } })
        }
    }
})

//查找(精确查找/模糊查找)
router.get('/search', async(req, res) => {
    let { query = '', keyword = '', dbname = 'users', name = '' } = JSON.parse(req.query.data);
    if (query._id) {
        query._id = ObjectId(query._id)
            //
        let result = await mongodb.find(dbname, query)
        if (result.flag) {
            res.send(formatData({ code: 200, data: result.result }))
        }
    }
    if (keyword) {
        let { key = 'username', word } = keyword;
        let result = await mongodb.find(dbname, {
            [key]: new RegExp(word)
        })
        res.send(formatData({ code: 200, data: result.result }))
    }
    if (Array.isArray(query)) {
        console.log(query);
        let result = await mongodb.find(dbname, { name: { $in: query } })
        console.log(result);
        if (result.flag) {
            res.send(formatData({ code: 200, data: result.result }))
        } else {
            res.send(formatData({ code: 200, msg: 'null' }))
        }
    }
    // if (keyword == '') {
    //     if (query == '') {
    //         console.log(123);
    //     }
    // }
    if (query == '' && keyword == '') {
        let result = await mongodb.find(dbname, query)
        if (result.flag) {
            res.send(formatData({ code: 200, data: result.result }))
        }
    }
})

//查找所有好友
router.get('/getFriends', async(req, res) => {
    let { _id } = JSON.parse(req.query.data)
    let user = await mongodb.find(colName, { _id: ObjectId(_id) })
    console.log(user);
    if (user.flag) {
        let friendList = user.result[0].friends;
        let list = [];
        if (friendList.length > 0) {
            friendList.forEach(item => {
                list.push(item._id)
            })
        }
        let friends = await mongodb.find(colName, { _id: { $in: list } });
        if (friends.flag) {
            return res.send(formatData({ code: 200, data: friends.result }))
        }
        res.send(formatData({ code: 400 }))
    }
})

//获取好友申请列表
router.get('/getApply', async(req, res) => {
    // let { _id } = JSON.parse(req.query);
    let { _id } = req.query;

    let user = await mongodb.find(colName, { _id: ObjectId(_id) })
        // console.log(user);
    if (user.flag) {
        let friendList = user.result[0].friends;
        let apply = [];
        user.result[0].apply.forEach(item => {
            apply.push(item._id)
        })
        let arr = [];
        console.log(apply, 'apply');
        console.log(friendList, 'friendslist');

        if (friendList.length > 0) {
            console.log('okm');
            apply.forEach(ele => {
                let flag = friendList.some(item => {
                    console.log(item._id, ele);
                    return ObjectId(item._id).toString() == ObjectId(ele).toString()
                })
                if (!flag) {
                    arr.push(ele)
                }
                console.log(flag);
            })
            apply = arr;
        }
        console.log(apply, 'oo');
        let friends = await mongodb.find(colName, { _id: { $in: apply } });
        if (friends.flag) {
            return res.send(formatData({ code: 200, data: friends.result }))
        }
        res.send(formatData({ code: 400, msg: '暂无好友申请' }))
    }
})

//删除好友
router.get('/deleteFriend', async(req, res) => {
    let { _id, op_id } = req.query;

    _id = ObjectId(_id);
    op_id = ObjectId(op_id)

    let user = await mongodb.find(colName, { _id })
    let op_user = await mongodb.find(colName, { _id: op_id })

    if (user.flag && op_user.flag) {
        console.log(user, op_user);

        let userFriend = user.result[0].friends;
        let opuserFriend = op_user.result[0].friends;
        let ow_friends = []
        let op_friends = []

        console.log(userFriend, opuserFriend);

        userFriend.forEach(item => {
            // console.log(item, typeof(item._id), typeof(op_id),'type');
            if (ObjectId(item._id).toString() != ObjectId(op_id).toString()) {
                // console.log(item._id);
                ow_friends.push(item)
            }
        })
        opuserFriend.forEach(item => {
            if (ObjectId(item._id).toString() != ObjectId(_id).toString()) {
                // console.log(item._id);
                op_friends.push(item)
            }
        })
        let result1 = await mongodb.update(colName, { _id }, { $set: { friends: ow_friends } })
        let result2 = await mongodb.update(colName, { _id: op_id }, { $set: { friends: op_friends } })
        if (result1 && result2) {
            let A = ObjectId(_id).toString()
            let B = ObjectId(op_id).toString()
            await mongodb.deleteData('chathistory', { name: { $in: [`${A}&${B}`, `${B}&${A}`] } })
            res.send(formatData({ code: 200, msg: '删除好友成功' }))
        } else {
            res.send(formatData({ code: 400, msg: '删除失败' }))
        }
        console.log(userFriend, '--------------------', ow_friends, '============', 'ow');
        console.log(opuserFriend, '------------------', op_friends, '================', 'op');
    } else {
        res.send(formatData({ code: 400, msg: '删除失败' }))
    }
})

//删除数据
router.get('/deleteData', async(req, res) => {
    let { dbname = 'users', data } = JSON.parse(req.query.data)
    if (data._id) {
        data._id = ObjectId(data._id)
    }
    console.log(data, dbname);
    let isTrue = await mongodb.find(dbname, data);
    console.log(isTrue);
    if (!isTrue.flag) {
        return res.send(formatData({ code: 400, data: false, msg: '删除失败' }))
    }

    let result = await mongodb.deleteData(dbname, data)
    if (result) {
        return res.send(formatData({ code: 200, data: result, msg: '删除成功' }))
    } else {
        res.send(formatData({ code: 400, data: false, msg: '删除失败' }))
    }
})


// //管理员登陆
// router.get('/admin', async(req, res) => {
//     let { username, password } = JSON.parse(req.query.data)

//     password = String(password)
//     const hash = crypto.createHash('sha256');
//     hash.update(password);
//     newPassword = hash.digest('base64');

//     let data = {
//         username,
//         password: newPassword,
//     }
//     let result = await mongodb.find(colName, data)
//     if (result.flag) {
//         // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
//         if (result.result[0].role == 'admin') {
//             res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
//         } else if (result.result[0].role == 'normal') {
//             res.send(formatData({ code: 200, msg: '你没有操作权限' }))
//         }
//     } else {
//         res.send(formatData({ code: 400, msg: '用户名或者密码错误' }))
//     }
// })

//管理员登陆
router.get('/admin', async(req, res) => {
    let { username, password } = JSON.parse(req.query.data)

    password = String(password);
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');

    let data = {
        username,
        password: newPassword
    }


    let result = await mongodb.find(colName, data)
    console.log(result);
    if (result.flag) {
        // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        if (result.result[0].role == 'admin') {
            res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        } else if (result.result[0].role == 'normal') {
            res.send(formatData({ code: 400, msg: '你没有操作权限' }))
        }
    } else {
        res.send(formatData({ code: 400, msg: '用户名或者密码错误' }))
    }
})

//用户修改
router.post('/updateAllinfo', async(req, res) => {
    console.log(req.body.info);
    let { details = '', file, query, dbname = 'users' } = req.body.info;

    if (query._id) {
        query._id = ObjectId(query._id)
    }
    // console.log(file);
    let { username = '', password } = details;
    let user = await mongodb.find(dbname, query);
    // console.log(user, 'user');
    if (user.flag) {

        if (password) {
            password = String(password);
            const hash = crypto.createHash('sha256');
            hash.update(password);
            newPassword = hash.digest('base64');
            details.password = newPassword;
        }


        let isHad = await mongodb.find(dbname, { username });
        // console.log(isHad, 'ishad');
        if (isHad.flag == true && user.result[0].username != isHad.result[0].username) {
            // console.log('该用户名已被使用');
            return res.send(formatData({ code: 400, msg: '该用户名已被使用' }))
        }
        // console.log(file);
        let picName = await getFile(file);
        // console.log(picName);
        if (picName == false) {
            let update = await mongodb.update(dbname, query, { $set: details });
            if (update) {
                let newUser = await mongodb.find(dbname, { _id: user.result[0]._id })
                    // console.log(newUser);
                return res.send(formatData({ code: 200, data: newUser.result[0] }))
            }
        }
        // console.log(picName, 'picName');
        details.imgSrc = picName[0].imgSrc
            // console.log(details);
        let update = await mongodb.update(dbname, query, { $set: details });
        if (update) {
            let newUser = await mongodb.find(dbname, { _id: user.result[0]._id })
                // console.log(newUser);
            return res.send(formatData({ code: 200, data: newUser.result[0] }))
        }
        // let newUser = await mongodb.find(dbname, { _id: user.result[0]._id })
        // console.log(newUser);
        // return res.send(formatData({ code: 200, data: update }))
    }














    // let { username = '' } = details;
    // // console.log(req.body.info, username, 'username');
    // let user = await mongodb.find(dbname, query);
    // if (user.flag && user.result[0].username == username) {
    //     let update = await mongodb.update(dbname, query, {$set:details});
    //     return res.send(update)
    // }

    // // let user = await mongodb.find(dbname, query)
    // // console.log(user);
    // let picName = await getFile(file);
    // if (picName == false) {
    //     let update = await mongodb.update(dbname, query, details);
    //     return res.send(update)
    // }
    // details.imgSrc = picName
    // let update = await mongodb.update(dbname, query, details);
    // return res.send(update)
})


//创建管理员
router.post('/createAdmin', async(req, res) => {
    // console.log(req.body.obj);
    let { file = [], details } = req.body.obj
    let picName = await getFile(file);
    // console.log(picName);
    if (!picName) {
        picName = 'http://47.103.207.13:2008/img/default.jpg'
    }
    let {
        username,
        password,
        sex = '--',
        imgSrc = picName,
        sign = '',
        friends = [],
        addTime = Date.now(),
        tel = '',
        status = 0,
        apply = [],
        role = 'normal'
    } = details

    console.log(password);
    password = String(password);
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');
    console.log(newPassword);

    let result = await mongodb.find(colName, { username })
        // console.log(result, 'result');
    if (result.flag) {
        return res.send(formatData({ code: 400, data: [{ flag: !result.flag }], msg: '用户已存在' }))
    }
    let user = {
            username,
            password: newPassword,
            sex,
            imgSrc,
            sign,
            friends,
            addTime,
            tel,
            status,
            apply,
            role
        }
        // console.log(user);
    result = await mongodb.create(colName, user)
    res.send(formatData({ code: 200, data: [{ username }], msg: '注册成功!' }))

})


//查找(精确查找/模糊查找)，排除自己
router.get('/search2', async(req, res) => {
    let { _id = '', keyword = '', dbname = 'users', name = '' } = JSON.parse(req.query.data);
    if (_id) {
        _id = ObjectId(_id)
    }
    console.log(_id, keyword);
    if (keyword) {
        let { key = 'username', word } = keyword;
        let result = await mongodb.find(dbname, {
            [key]: new RegExp(word)
        })
        let newList = [];
        if (result.flag) {
            console.log(result.result, 'result');
            result.result.forEach(item => {
                console.log(item);
                if (ObjectId(item._id).toString() != ObjectId(_id).toString()) {
                    newList.push(item)
                }
            })
            console.log(newList, result.result);
        }
        return res.send(formatData({ code: 200, data: newList }))
    } else {
        return res.send(formatData({ code: 400 }))
    }
})






//管理员登陆
router.get('/admin/token', async(req, res) => {
    let { username, password, remeber = 'false' } = JSON.parse(req.query.data)

    password = String(password);
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');

    let data = {
        username,
        password: newPassword
    }
    let time = 1800;
    if (remeber == 'true') {
        time = (7 * 24 * 60 * 60);
    }
    let Authorization = token.create({ username, password: newPassword }, time)
    let result = await mongodb.find(colName, data, { projection: { password: 0 } })
    console.log(result);
    if (result.flag) {
        // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        if (result.result[0].role == 'admin') {
            console.log('---------------');
            res.set({ Authorization })

            // res.send(formatData({ code: 200, data: [result.result, Authorization], msg: '登录成功' }))
            res.send(formatData({
                data: {
                    ...result.result[0],
                    Authorization
                }
                // data: [
                //     result.result[0],
                //     Authorization
                // ]
            }))
        } else if (result.result[0].role == 'normal') {
            res.send(formatData({ code: 400, msg: '你没有操作权限' }))
        }
    } else {
        res.send(formatData({ code: 400, msg: '用户名或者密码错误' }))
    }
})









// 用户登录
router.get('/login/token', async(req, res) => {
    let { username, password } = JSON.parse(req.query.data)

    password = String(password)
    const hash = crypto.createHash('sha256');
    hash.update(password);
    newPassword = hash.digest('base64');

    let data = {
            username,
            password: newPassword,
        }
        // console.log(data);
        //
    let time = 180000;
    const Authorization = token.create({ username, password: newPassword }, time)
    let result = await mongodb.find(colName, data, { projection: { password: 0 } })

    //
    // let result = await mongodb.find(colName, data)
    console.log(result, '==========================');
    // console.log(result);
    if (result.flag) {
        // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        if (result.result[0].status == 0) {
            //
            console.log('---------------');
            res.set({
                Authorization
            })
            res.send(formatData({
                    data: {
                        ...result.result[0],
                        Authorization
                    }
                    // data: [
                    //     result.result[0],
                    //     Authorization
                    // ]
                }))
                //
                // res.send(formatData({ code: 200, data: result.result, msg: '登录成功' }))
        } else if (result.result[0].status == 1) {
            res.send(formatData({ code: 400, msg: '账号异常，请联系管理员' }))
        }
    } else {
        res.send(formatData({ code: 400, msg: '用户名或者密码错误' }))
    }
})

router.get('/verify', async(req, res) => {
    console.log('使用令牌');
    let Authorization = req.get('Authorization');
    console.log('Authorization', Authorization)
    const expires = await token.verify(Authorization);
    console.log('expires', expires)
    res.send(formatData({
        code: expires ? 200 : 400
    }))
})

module.exports = router;