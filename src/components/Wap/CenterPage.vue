<template>
  <div class="wrap">
    <div class="top">
      <img src="http://lucky-icon.meiweiyuxian.com/hio/pinwheel.jpg"/>
      <div class="menu">
        <div class="menu-item">
          <router-link to="/dashboard">
            <i class="fa fa-user"></i>
          </router-link>
        </div>
        <div class="menu-item">
          <i class="fa fa-sign-out" @click="logout"></i>
        </div>
      </div>
    </div>
    <div class="header clearfix">
      <el-card class="box-card card-red">

        <div class="text item">商品</div>

      </el-card>
      <el-card class="box-card card-green">
        <h1></h1>
        <div class="text item">订单</div>
      </el-card>
    </div>
    <div class="main">
      <div></div>
      <div class="form-table-box">
        <el-table :data="tableData" style="width: 100%" stripe>
          <el-table-column prop="listPicUrl" label="图片" width="80">
            <template slot-scope="scope">
              <img :src="scope.row.listPicUrl" alt="" style="width: 60px;height: 60px">
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称">
          </el-table-column>
          <el-table-column prop="retailPrice" label="售价" width="90" sortable>
            <template slot-scope="scope">
              <el-input v-model="scope.row.retailPrice" placeholder="售价"
                        @blur="submit(scope.$index, scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="上架" width="60">
            <template slot-scope="scope">
              <el-switch
                  v-model="tableData[scope.$index].isOnSale"
                  active-text=""
                  inactive-text=""
                  @change='changeStatus($event,tableData[scope.$index].goodsId)'>
              </el-switch>
            </template>
          </el-table-column>

        </el-table>
      </div>
    </div>

  </div>
</template>
<script scoped>
import api from '@/config/api';

export default {
  data() {
    return {}
  },
  components: {},
  methods: {

    logout() {
      this.$confirm('是否要退出?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        localStorage.clear();
        this.$router.replace({name: 'login'});
      });
    },


  },
  mounted() {
    this.getList();
  }
}
</script>
<style>

</style>