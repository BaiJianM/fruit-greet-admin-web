<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ name: 'dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ infoForm.id ? '编辑热门搜索' : '添加热门搜索' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <el-button type="primary" @click="goBackPage" icon="arrow-left">返回列表</el-button>
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-form ref="infoForm" :rules="infoRules" :model="infoForm" label-width="120px">

          <el-form-item label="商品ID" prop="id">
            <el-input v-model="infoForm.id"></el-input>
          </el-form-item>
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="infoForm.keyword"></el-input>
          </el-form-item>
          <el-form-item label="排序">
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
import {Store, Info} from '@/api/keywords';

export default {
  data() {
    return {
      infoForm: {
        id: 0,
        keyword: '',
      },
      infoRules: {
        keyword: [
          {required: true, message: '请输入关键词', trigger: 'blur'},
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

      //加载热门搜索详情
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
