<template>
    <div>
        <template>
            <div><input type="text" ref="keyword" @keyup.enter="search">查找好友</div>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column fixed prop="_id" label="id" width="150" class="item">
                </el-table-column>
                <el-table-column prop="imgSrc" label="头像" width="120" class="item">
                    <template slot-scope="scope">
                        <img :src="scope.row.imgSrc" alt="" style="width:80px;height:80px">
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户名" width="120" class="item">
                </el-table-column>
                <el-table-column prop="sex" label="性别" width="120" class="item">
                </el-table-column>
                <el-table-column prop="tel" label="电话" width="300" class="item">
                </el-table-column>
                <el-table-column prop="status" label="状态(0:正常;1已封号)" width="120" class="item">
                </el-table-column>
                <el-table-column label="操作" width="130" class="item">
                    <template slot-scope="scope">
                        <el-button @click="remove(scope.row)" type="text" size="small">删除</el-button>
                        <el-button @click="fenghao(scope.row)" type="text" size="small">封号</el-button>
                        <el-button @click="reset(scope.row)" type="text" size="small">解封</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

    </div>
</template>

<script>
    export default {
        name: 'second',
        data() {
            return {
                tableData: [],
            }
        },
        methods: {
            remove(scope) {
                this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    console.log(scope._id);
                    let data = {
                        data: {
                            _id: scope._id
                        },
                    }
                    let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/deleteData', {
                        params: {
                            data: data
                        }
                    });
                    if (result.data.data) {
                        this.getData()
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            fenghao(scope) {
                this.$confirm('确认对该账号进行封号处理？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    this.$message({
                        type: 'success',
                        message: '已成功把该账号停用!'
                    });
                    console.log('fenghao');
                    let data = {
                        query: {
                            _id: scope._id
                        }, //修改用户的id
                        data: {
                            status: 1
                        },
                    }
                    let result = await this.$ajax.post('http://47.103.207.13:2008/api/user/userUpdate', {
                        data
                    });
                    if (result) {
                        this.getData()
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            },
            async search() {
                let word = this.$refs.keyword.value;
                let data = {
                    keyword: {
                        key: 'username',
                        word
                    },
                    dbname: 'users'
                }
                let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/search', {
                    params: {
                        data
                    }
                });
                this.tableData = result.data.data;
            },
            reset(scope) {
                this.$confirm('把该账号解封?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success'
                }).then(async() => {
                    this.$message({
                        type: 'success',
                        message: '解封成功!'
                    });
                    let data = {
                        query: {
                            _id: scope._id
                        }, //修改用户的id
                        data: {
                            status: 0
                        },
                    }
                    let result = await this.$ajax.post('http://47.103.207.13:2008/api/user/userUpdate', {
                        data
                    });
                    if (result) {
                        this.getData()
                    }
                }).catch(async () => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            },
            async getData() {
                let data = {
                    keyword: {
                        key: 'username',
                        word: ''
                    },
                    dbname: 'users'
                }
                let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/search', {
                    params: {
                        data
                    }
                });
                this.tableData = result.data.data;
            }
        },
        async created() {
            this.getData();
        }
    }
</script>
<style lang="scss" scoped>
</style>