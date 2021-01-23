<template>
    <div class="contain">
        <div class="nav">
            <el-tabs class="tab-nav" tab-position='top' v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="创建管理员" name="first"></el-tab-pane>
                <el-tab-pane label="操作用户" name="second"></el-tab-pane>
                <el-tab-pane label="个人修改" name="three"></el-tab-pane>
                <el-tab-pane label="朋友圈违规删除" name="four"></el-tab-pane>
            </el-tabs>
            <div class="userBox">
                <img :src="userInfo.imgSrc ? userInfo.imgSrc: 'https://www.w3school.com.cn/i/eg_tulip.jpg'" alt="">
                <p class="username">{{userInfo.username}}</p>
                <p class="logout" @click="exit">注销</p>
            </div>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    export default {
        nane: 'User',
        data() {
            return {
                activeName: this.$route.path.replace(/\//,''),
                userInfo: ''
            }
        },
        mounted() {
            let userInfo = this.$store.state.user.userInfo;
            this.userInfo = userInfo;
            console.log(userInfo);
        },
        methods: {
            allUser() {
                console.log(1);
            },
            handleClick() {
                this.$router.push(`/${this.activeName}`)
            },
            exit() {
                this.$confirm('确认退出登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$store.commit('logout');
                    this.$message({
                        type: 'success',
                        message: '成功退出登录!'
                    });
                    this.$router.replace('/admin');
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            }
        },
        created() {
            // console.log(this.$route.path);
        }
    }
</script>

<style lang="scss" scoped>
    .contain {
        margin: 0;
        padding: 0;

        .nav {
            width: 100%;
            overflow: hidden;

            .tab-nav {
                height: 60px;
                width: calc(100% - 180px);
                float: left;
            }

            .userBox {
                width: 180px;
                height: 80px;
                float: left;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-content: center;

                .username {
                    width: 80px;
                    height: 15px;
                    font-size: 12px;
                    font-weight: bold;
                    color: blue;
                    overflow: hidden;
                }

                img {
                    width: 50px;
                    height: 50px;
                    margin-right: 15px;
                }

                .logout {
                    font-size: 16px;
                    color: red;

                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }
    }
</style>