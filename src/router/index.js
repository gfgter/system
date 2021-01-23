import Vue from 'vue';
// 1. 引入
import VueRouter from 'vue-router';

import Admin from '../views/Admin.vue';
import User from '../views/User.vue'
import NotFound from '../views/NotFound.vue'
import First from '../views/First.vue'
import Second from '../views/Second.vue'
import Three from '../views/Three.vue'
import Four from '../views/Four.vue'

const {
    getCookie
} = require('../utils/cookie')

import store from '../store'
import request from '../utils/request'

// 2. 使用
Vue.use(VueRouter);


// 3. 配置
const router = new VueRouter({
    mode: 'history', // history,hash

    // 路由配置
    routes: [{
            path: '/admin',
            component: Admin,
        },
        {
            path: '/',
            redirect: '/admin',
        },
        {
            path: '/user',
            component: User,
            meta: { requiresAuth: true },
            redirect: '/first',
            children: [{
                    path: '/first',
                    component: First
                },
                {
                    path: '/second',
                    component: Second
                },
                {
                    path: '/three',
                    component: Three
                },
                {
                    path: '/four',
                    component: Four
                }

            ]
        },
        {
            path: '/*',
            component: NotFound,
        }
    ]
});
// 开始导航
router.beforeEach((to, from, next) => {
    // let flag = getCookie('login')
    // console.log(flag);
    // if (!flag) {
    //     if (from.fullPath == '/admin') {
    //         next();
    //     }
    //     if (to.fullPath == '/admin') {
    //         next();
    //     } else {
    //         next('/admin')
    //     }
    // }
    // if (flag && to.fullPath == '/admin') {
    //     next('/user')
    // }
    // next();
    // console.log('beforeEach=', to.path, from.path);
    if (to.matched.some(item => item.meta.requiresAuth)) {
        // 判断是否登录
        if (store.getters.isLogin) {
            next();
            request.get('/user/verify', {
                params: {},
                headers: {
                    Authorization: store.state.user.userInfo.Authorization
                }
            }).then(({
                data
            }) => {
                if (data.code == 400) {
                    store.commit('logout');
                    router.push({
                        path: '/admin',
                        query: {
                            redirectTo: to.fullPath
                        }
                    })
                }
            })
        } else {
            // next({
            //   path:'/login',
            //   query:{
            //     redirectTo:to.fullPath
            //   }
            // })
            router.push({
                path: '/admin',
                query: {
                    redirectTo: to.fullPath
                }
            })
        }

    } else {
        next();
    }
})

// // 确认导航
// router.beforeResolve((to, from, next) => {
//         console.log('beforeResolve=', to.path, from.path);
//         next();
//     })
//     // 结束导航
// router.afterEach(function(to, from) {
//     console.log('afterEach=', to.path, from.path);
// })
export default router;