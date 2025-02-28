<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ name: 'admin' }">管理员</el-breadcrumb-item>
        <el-breadcrumb-item>{{ infoForm.id ? '编辑管理员' : '添加管理员' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <el-button type="primary" @click="goBackPage" icon="arrow-left">返回列表</el-button>
        <!--<el-button type="primary" @click="testa" icon="arrow-left">测试</el-button>-->
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-form ref="infoForm" :rules="infoRules" :model="infoForm" label-width="120px">
          <el-form-item label="管理员用户名" prop="username">
            <el-input v-model="infoForm.username"></el-input>
          </el-form-item>
          <el-form-item label="新密码" v-if="infoForm.id" prop="newPassword">
            <el-switch
                v-model="change"
                active-color="#13ce66">
            </el-switch>
          </el-form-item>
          <el-form-item label="" v-if="change" prop="newPassword">
            <el-input type="password" v-model="infoForm.newPassword" placeholder="输入新的密码"></el-input>
          </el-form-item>
          <el-form-item label="密码" v-if="!infoForm.id" prop="password">
            <el-input type="password" v-model="infoForm.password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button v-if="infoForm.id > 0" type="primary" @click="saveAdminInfo">确定保存</el-button>
            <el-button v-else type="primary" @click="addAdminInfo">确定添加</el-button>
            <el-button @click="goBackPage">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {AdminAdd, AdminDetail, AdminSave} from "@/api/admin";

export default {
  data() {
    return {
      change: false,
      infoForm: {
        id: 0,
        username: "",
        newPassword: '',
        password: ''
      },
      infoRules: {
        username: [
          {required: true, message: '请输入昵称', trigger: 'blur'},
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
        ],
      },
    }
  },
  methods: {
    testa() {
      console.log(this.tableData);
      console.log(this.infoForm);
    },
    goBackPage() {
      this.$router.go(-1);
    },
    saveAdminInfo() {
      let user = this.infoForm;
      if (this.change == true) {
        let password = user.newPassword;
        if (password == undefined) {
          user.newPassword = ''
        }
        if (password != undefined && password.replace(/(^\s*)|(\s*$)/g, "").length < 6) {
          this.$message({
            type: 'error',
            message: '密码请大于6个字符'
          })
          return false;
        }
      }
      this.$refs['infoForm'].validate((valid) => {
        if (valid) {
          this.$request.post(AdminSave + "?change=" + this.change, user).then((response) => {
            this.$message({
              type: 'success',
              message: '保存成功'
            });
          })
        } else {
          return false;
        }
      });
    },
    addAdminInfo() {
      let user = this.infoForm;
      let password = user.password;
      if (password == undefined) {
        user.password = ''
      }
      if (password != undefined && password.replace(/(^\s*)|(\s*$)/g, "").length < 6) {
        this.$message({
          type: 'error',
          message: '密码请大于6个字符'
        })
        return false;
      }
      this.$refs['infoForm'].validate((valid) => {
        if (valid) {
          this.$request.post(AdminAdd, {
            user: user,
          }).then((response) => {
            this.$message({
              type: 'success',
              message: '添加成功'
            });
            this.$router.push({name: 'admin'})
          })
        } else {
          return false;
        }
      });
    },
    getInfo() {
      //加载品牌详情
      let that = this
      this.$request.post(AdminDetail + "?id=" + that.infoForm.id).then((response) => {
        that.infoForm = response.data;
      })
    }
  },
  components: {},
  mounted() {
    this.infoForm.id = this.$route.query.id || 0;
    console.log(this.infoForm.id);
    this.getInfo();
  }
}

</script>

<style>
.image-uploader {
  height: 105px;
}

.image-uploader .el-upload {
  border: 1px solid #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #20a0ff;
}

.image-uploader .image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 187px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}

.image-uploader .image-show {
  width: 187px;
  height: 105px;
  display: block;
}

.image-uploader.new-image-uploader {
  font-size: 28px;
  color: #8c939d;
  width: 165px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}

.image-uploader.new-image-uploader .image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 165px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}

.image-uploader.new-image-uploader .image-show {
  width: 165px;
  height: 105px;
  display: block;
}
</style>
