const { ObjectId, MongoClient, Logger } = require('mongodb');


//数据库配置
const config = {
    dbUrl: "mongodb://localhost:27017",
    dbName: 'chat',
    useUnifiedTopology: true
}

//封装一个连接数据库函数

async function connect() {
    const client = await MongoClient.connect(config.dbUrl, { useUnifiedTopology: true });
    let db = client.db(config.dbName);

    //查询数据库CRUD

    return {
        client,
        db
    }
}

//增加数据
async function create(colName, data) {
    let { client, db } = await connect();
    const col = db.collection(colName);

    if (!Array.isArray(data)) {
        data = [data];
    }

    let result;

    try {
        await col.insertMany(data);
        result = true;
    } catch {
        result = false;
    }

    //关闭连接，释放资源暂用
    client.close();
    return result;

}

//查找
async function find(colName, data) {
    let { client, db } = await connect();
    const col = db.collection(colName);
    // if (data._id) {
    //     data._id = new ObjectId(data._id)
    // }
    // if (data.userId) {
    //     let idList = data.userId;
    //     idList.forEach(item => {
    //         item.userId = new ObjectId(item.userId)
    //     });
    //     idList = [...new Set(idList)]
    //     data = { userId: { $in: idList }, status: 0 }
    // }
    let result = '';
    let flag;
    try {
        result = await col.find(data).toArray();
    } catch {
        throw err;
    }
    if (result.length > 0) {
        flag = true;
    } else {
        flag = false;
    }
    //关闭连接，释放资源暂用
    client.close();
    return { result, flag };
}

//更新
async function update(colName, query, data) {
    let { client, db } = await connect();
    const col = db.collection(colName);

    let result;
    try {
        await col.updateMany(query, data);
        result = true;
    } catch (err) {
        result = false;
    }

    client.close();
    return result;
}

//创建一个集合
async function insertHistory(colName, data) {
    let { client, db } = await connect();
    const col = db.collection(colName);

    const { name, details } = data;
    let A = name.split('&')[0];
    let B = name.split('&')[1];

    console.log(colName, 'colname', data, 'data');

    let result = '';
    let history = '';
    if (!Array.isArray(data)) {
        data = [data];
    }
    if (details[0]._id) {
        details[0]._id = ObjectId(details[0]._id)
    }
    try {
        console.log(`${A}&${B}`, 'a&b');
        history = await col.find({ name: { $in: [`${A}&${B}`, `${B}&${A}`] } }).toArray()
        if (history <= 0) {
            await col.insertMany(data);
            result = true
        } else {
            await col.updateMany({ name: { $in: [`${A}&${B}`, `${B}&${A}`] } }, { $push: { details: details[0] } })
            history = await (await col.find({ name: { $in: [`${A}&${B}`, `${B}&${A}`] } }).toArray())
            console.log(history);
            result = true;
        }
    } catch (err) {
        result = true
    }

    client.close();
    // return { result, history };
    return { result, history };
}

//删除数据
async function deleteData(colName, data) {
    let { client, db } = await connect();
    const col = db.collection(colName);

    let result = '';
    try {
        await col.deleteMany(data)
        result = true
    } catch (err) {
        result = false
    }
    client.close();
    return result;
}


module.exports = {
    create,
    // remove,
    update,
    find,
    insertHistory,
    deleteData
    // findRandom,
}