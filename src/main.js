import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import { request } from './utils'
const { getCookie, setCookie } = require('./utils/cookie')


//

import Router from 'vue-router'
const routerPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}

//



// 引入element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false;

// 把ajax请求方法写入Vue原型，方便在组件中使用
Vue.prototype.$ajax = request;
Vue.prototype.$setCookie = setCookie;
Vue.prototype.$getCookie = getCookie;



new Vue({
    // 4. 注入根实例
    router,
    store,
    render: h => h(App),
}).$mount('#app')