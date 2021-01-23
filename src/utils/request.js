import axios from 'axios';

// 创建一个axios实例
// export const request = axios.create({
//     // baseURL: 'http://47.103.207.13:2008/api'
//     baseURL: process.env.NODE_ENV === 'development' ?
//         'http://47.103.207.13:2008/api' : 'http://47.103.207.13:2008/api'
// })

export const request = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ?
        'http://47.103.207.13:2008/api' : 'http://47.103.207.13:2008/api'
})

export default request;