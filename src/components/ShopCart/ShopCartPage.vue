<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>购物车列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-main">
      <div class="filter-box">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="商品名称">
            <el-input v-model="filterForm.name" placeholder="商品名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitFilter">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="form-table-box">
        <el-table :data="tableData" style="width: 100%" border stripe>
          <el-table-column prop="id" label="ID" width="60px">
          </el-table-column>
          <el-table-column prop="userId" label="用户ID" width="80px"></el-table-column>
          <el-table-column prop="nickname" label="用户昵称" width="100px"></el-table-column>
          <el-table-column prop="goodsId" label="商品ID" width="100px"></el-table-column>
          <el-table-column prop="listPicUrl" label="图片" width="70px">
            <template slot-scope="scope">
              <img :src="scope.row.listPicUrl" alt="" style="width: 50px;height: 50px">
            </template>
          </el-table-column>
          <el-table-column prop="goodsName" label="商品名称"></el-table-column>
          <el-table-column prop="goodsSpecifitionNameValue" label="型号"></el-table-column>
          <el-table-column prop="number" label="数量" width="70px"></el-table-column>
          <el-table-column prop="retailPrice" label="成交价"></el-table-column>
          <el-table-column prop="addTime" label="加入时间"></el-table-column>
          <el-table-column prop="isDelete" label="是否删除">
            <template slot-scope="scope">
              <label>{{ scope.row.isDelete == 1 ? '已删' : '' }}</label>
            </template>
          </el-table-column>


        </el-table>
      </div>
      <div class="page-box">
        <el-pagination @current-change="handlePageChange" :current-page="page" :page-size="10"
                       layout="total, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>

import {ShopCart} from '@/api/cart'

export default {
  data() {
    return {
      page: 1,
      total: 0,
      filterForm: {
        name: ''
      },
      tableData: []
    }
  },
  methods: {
    handlePageChange(val) {
      this.page = val;
      //保存到localStorage
      localStorage.setItem('shopCartPage', this.page)
      localStorage.setItem('shopCartFilterForm', JSON.stringify(this.filterForm));
      this.getList()
    },

    onSubmitFilter() {
      this.page = 1
      this.getList()
    },
    getList() {
      this.$request.get(ShopCart, {
        page: this.page,
        name: this.filterForm.name
      }).then((response) => {
        this.tableData = response.data.records
        this.page = response.data.current
        this.total = response.data.total
      })
    }
  },
  components: {},
  mounted() {
    this.getList();
  }
}

</script>

<style scoped>

</style>
