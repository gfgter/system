<template>
    <div class="contain">
        <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="用户名称">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input type="password" v-model="form.password" ref="password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
                <el-input v-model="form.tel"></el-input>
            </el-form-item>
            <el-form-item label="性别">
                <el-input v-model="form.sex"></el-input>
            </el-form-item>
            <el-form-item label="用户权限">
                <el-select v-model="form.role" placeholder="请选择用户权限">
                    <el-option label="普通用户" value="normal"></el-option>
                    <el-option label="管理员" value="admin"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="上传头像">
                <el-upload class="upload-demo" ref="upload" action="http://47.103.207.13:2008/api/nn"
                    :on-success="hadSuccess" :on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList"
                    :auto-upload="false">
                    <el-button slot="trigger" size="small" type="primary">选取照片</el-button>
                    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传照片
                    </el-button>
                    <div slot="tip" class="el-upload__tip">上传图片</div>
                </el-upload>
            </el-form-item>
        </el-form>
        <el-button type="primary" @click="newUser" style="margin-left:50px">新建用户</el-button>
    </div>
</template>

<script>
    const crypto = require('crypto');

    export default {
        name: 'first',
        data() {
            return {
                form: {
                    name: '',
                    password: '',
                    tel: '',
                    sex: '',
                    role: '',
                },
                fileList: [],
                picData: [],
            }
        },
        methods: {
            submitUpload() {
                this.$refs.upload.submit();
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            hadSuccess(data, file) {
                console.log(data);

                var reader = new FileReader();
                reader.readAsDataURL(file.raw)
                reader.onloadstart = function () {
                    console.log('正在读取文件');
                }
                reader.onloadend = async () => {
                    console.log('已成功读取文件');
                    let data = reader.result
                    if (!Array.isArray(data)) {
                        data = [data]
                    }
                    this.picData = data
                }
            },
            newUser() {
                this.$confirm('确认新建用户吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success'
                }).then(async () => {
                    if (this.form.password == '' || this.form.name == '') {
                        return this.$message({
                            showClose: true,
                            message: '用户名或者密码不能为空',
                            type: 'error'
                        });
                    }
                    let newPassword = this.form.password
                    const hash = crypto.createHash('sha256');
                    hash.update(newPassword);
                    newPassword = hash.digest('hex')

                    let obj = {
                        file: this.picData,
                        details: {
                            username: this.form.name,
                            tel: this.form.tel,
                            sex: this.form.sex,
                            role: this.form.role,
                            password: newPassword
                        }
                    }
                    console.log(obj);
                    let result = await this.$ajax.post('http://47.103.207.13:2008/api/user/createAdmin', {
                        obj
                    })
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    console.log(result);
                    this.form.name = '';
                    this.form.tel = '';
                    this.form.sex = '';
                    this.form.role = '';
                    this.form.password = '';
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            }
        },
        created() {}
    }
</script>
<style lang="scss" scoped>
    .contain {
        margin-top: 30px;
        margin-left: 30px;
        max-width: 30%;
    }
</style>