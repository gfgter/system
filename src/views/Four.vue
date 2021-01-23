<template>
    <div>
        <template>
            <div><input type="text" ref="keyword" @keyup.enter="search">包含敏感字查询</div>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column fixed prop="_id" label="id" width="300" class="item">
                </el-table-column>
                <el-table-column prop="imgSrc" label="头像" width="120" class="item">
                    <template slot-scope="scope">
                        <img :src="scope.row.imgSrc" alt="" style="width:80px;height:80px">
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户名" width="120" class="item">
                </el-table-column>
                <el-table-column prop="addTime" label="添加时间" width="185" class="item">
                </el-table-column>
                <el-table-column prop="description" label="内容" width="350" class="item">
                </el-table-column>
                <el-table-column prop="status" label="状态(0:正常;1:不可显示)" width="120" class="item">
                </el-table-column>
                <el-table-column label="操作" width="150" class="item">
                    <template slot-scope="scope">
                        <el-button @click="remove(scope.row)" type="text" size="small">删除</el-button>
                        <el-button @click="resetStatus(scope.row)" type="text" size="small">违规处理</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>

    </div>
</template>

<script>
    export default {
        name: 'four',
        data() {
            return {
                tableData: [],
            }
        },
        methods: {
            remove(scope) {
                this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let data = {
                        data: {
                            _id: scope._id,
                        },
                        dbname: 'friendscircle'
                    }
                    let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/deleteData', {
                        params: {
                            data: data,
                        }
                    });
                    console.log(result);
                    if (result.data.data) {
                        this.getData()
                    }
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
                console.log('remove');
            },
            async resetStatus(scope) {
                this.$confirm('此操作将永久数据将不可见, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let data = {
                        query: {
                            _id: scope._id
                        },
                        data: {
                            status: 1
                        },
                    }
                    let result = await this.$ajax.post(
                        'http://47.103.207.13:2008/api/circle/statusUpdate', {
                            data
                        });
                    if (result) {
                        this.getData()
                    }
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
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
                        key: 'description',
                        word
                    },
                    dbname: 'friendscircle'
                }
                let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/search', {
                    params: {
                        data
                    }
                });
                this.tableData = result.data.data;
            },
            async getData() {
                let data = {
                    dbname: 'friendscircle'
                }
                let result = await this.$ajax.get('http://47.103.207.13:2008/api/user/search', {
                    params: {
                        data
                    }
                });
                result.data.data.forEach(item => {
                    let data = new Date(item.addTime);
                    let year = data.getFullYear();
                    let month = data.getMonth() + 1;
                    let day = data.getDate();
                    let hour = data.getHours();
                    let mintue = data.getMinutes();
                    let second = data.getSeconds();
                    month = month < 10 ? '0' + month : month
                    day = day < 10 ? '0' + day : day
                    hour = hour < 10 ? '0' + hour : hour;
                    mintue = mintue < 10 ? '0' + mintue : mintue;
                    second = second < 10 ? '0' + second : second;
                    let str = `${year}-${month}-${day} ${hour}:${mintue}:${second}`
                    console.log(str);
                    item.addTime = str;
                    // item.addTime = new Date(item.addTime).toString();
                })
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