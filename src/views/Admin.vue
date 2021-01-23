<template>
    <div class="img1">
        <el-header class="title" style="text-align:center">
            <h1>LET'S WE CHAT管理系统</h1>
        </el-header>
        <div class="view">
            <el-form :model="ruleForm" status-icon :rules="rules" ref="loginForm" label-width="100px">
                <el-form-item label="admin" prop="username" :error="errMsg">
                    <el-input v-model="ruleForm.username"></el-input>
                </el-form-item>
                <el-form-item label="password" prop="password" :error="errMsg">
                    <el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="checked" style="margin-right:30px" ref="check">七天免登陆</el-checkbox>
                    <el-button type="primary" @click="open4">登录</el-button>
                    <!-- <el-button type="primary" @click="submitForm">登录</el-button> -->
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
    import {
        mapMutations
    } from 'vuex';
    const crypto = require('crypto');

    export default {
        name: 'Admin',
        data() {
            return {
                errMsg: "",
                checked: false,
                ruleForm: {
                    username: "",
                    password: "",
                    flag: '',
                    msg: '',
                },
                rules: {
                    username: [{
                            required: true,
                            message: "请输入管理用户名",
                            trigger: "blur"
                        },
                        {
                            min: 3,
                            max: 20,
                            message: "用户名长度必须在3到20",
                            trigger: "blur",
                        }
                    ],
                    password: [{
                            required: true,
                            message: "请输入密码",
                            trigger: "blur"
                        },
                        {
                            min: 6,
                            max: 12,
                            message: "密码长度必须在6到12",
                            trigger: "blur",
                        }
                    ],
                },
                user: ''
            }
        },
        methods: {
            ...mapMutations(['login']),
            submitForm() {
                return new Promise((resolve, reject) => {
                    this.$refs.loginForm.validate(async (valid) => {
                        if (valid) {
                            const {
                                username,
                                password
                            } = this.ruleForm;

                            let newPassword = password
                            const hash = crypto.createHash('sha256');
                            hash.update(newPassword);
                            newPassword = hash.digest('hex');

                            let remeber = `${this.$refs.check.value}`
                            let obj = {
                                username,
                                password: newPassword,
                                remeber
                            }
                            let result = await this.$ajax.get(
                                '/user/admin/token', {
                                    params: {
                                        data: obj
                                    }
                                });
                            if (result.data.code == 200) {
                                this.user = result.data.data
                                this.$store.commit('login', this.user);
                                let {
                                    redirectTo = '/user'
                                } = this.$route.query;
                                this.$router.replace(redirectTo)
                                this.msg = result.data.msg;
                                this.flag = true;
                                } else {
                                    this.errMsg = '用户名或密码错误';
                                    this.flag = false
                                    this.msg = result.data.msg;
                                    resolve()
                            }
                        }
                    });
                })
            },
            open4() {
                this.submitForm().then(() => {
                    this.$message({
                        showClose: true,
                        message: this.msg,
                        type: this.flag ? 'success' : 'error'
                    });
                })
            }
        },
    }
</script>


<style lang="scss" scoped>
    body {
        width: 100%;
        height: 100%;
        background: gray;
        background-size: 100% 100%;
    }

    .title {
        padding-top: 50px;
    }

    .view {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -120%);
        width: 400px;
        height: 180px;
        background: #ccc;
        border: 1px solid purple;
        box-shadow: 0px 0px 7px 7px #ccc;
        margin: 200px auto;
        // opacity: .8;
        padding: 60px;
        font-weight: bold;
        color: black;
    }

    .img1 {
        background: url('../../public/timg.jpg') center center no-repeat;
        background-size: 100% 100%;
        height: 100%;
        position: fixed;
        width: 100%;
        opacity: .7;
    }
</style>