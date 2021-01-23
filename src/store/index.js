import Vue from 'vue'
import Vuex from 'vuex'

import user from './user'


Vue.use(Vuex);


const store = new Vuex.Store({
    //全局数据
    state: {},
    getters: {},
    mutations: {},
    actions: {},

    //模块
    modules: {
        user,
    }
})


export default store;