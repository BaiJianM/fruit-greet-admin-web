<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ name: 'shipperList'}">快递公司</el-breadcrumb-item>
        <el-breadcrumb-item>{{ infoForm.id ? '编辑快递公司' : '添加快递公司' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <el-button type="primary" @click="goBackPage" icon="arrow-left">返回列表</el-button>
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-form ref="infoForm" :rules="infoRules" :model="infoForm" label-width="120px">
          <el-form-item label="名字" prop="name">
            <el-input v-model="infoForm.name"></el-input>
          </el-form-item>
          <el-form-item label="代号" prop="code">
            <el-input v-model="infoForm.code"></el-input>
          </el-form-item>
          <el-form-item label="客户编号">
            <el-input v-model="infoForm.customerName"></el-input>
            <div class="form-tips">打印电子面单，需要填写</div>
          </el-form-item>
          <el-form-item label="月结账号">
            <el-input v-model="infoForm.monthCode"></el-input>
            <div class="form-tips">打印电子面单，需要填写</div>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="infoForm.sortOrder" :min="1" :max="1000"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitInfo">确定保存</el-button>
            <el-button @click="goBackPage">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {Store, Info} from '@/api/shipper';

export default {
  data() {
    return {
      infoForm: {
        id: 0,
        name: '',
        code: '',
        sortOrder: 0
      },
      infoRules: {
        name: [
          {required: true, message: '请输入快递公司名字', trigger: 'blur'},
        ],
        code: [
          {required: true, message: '请输入快递公司代号', trigger: 'blur'},
        ],
        monthCode: [
          {required: true, message: '请输入快递公司月结账号', trigger: 'blur'},
        ],
      },
    }
  },
  methods: {
    goBackPage() {
      this.$router.go(-1);
    },
    onSubmitInfo() {
      this.$refs['infoForm'].validate((valid) => {
        if (valid) {
          this.$request.post(Store, this.infoForm).then((response) => {
            this.$message({
              type: 'success',
              message: '保存成功'
            });
            this.$router.go(-1)
          })
        } else {
          return false;
        }
      });
    },
    getInfo() {
      if (this.infoForm.id <= 0) {
        return false
      }

      //加载快递公司详情
      let that = this
      this.$request.get(Info, {id: that.infoForm.id}).then((response) => {
        that.infoForm = response.data;
      })
    }

  },
  components: {},
  mounted() {
    this.infoForm.id = this.$route.query.id || 0;
    this.getInfo();
  }
}

</script>
