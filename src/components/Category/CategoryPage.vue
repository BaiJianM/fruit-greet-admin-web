<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard/nature' }">商品设置</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <router-link to="/dashboard/category/add">
          <el-button type="primary" icon="plus">添加分类</el-button>
        </router-link>
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-table :data="tableData" style="width: 100%" border stripe>
          <el-table-column prop="name" label="分类名称">
            <template slot-scope="scope">
              <div v-if="scope.row.level==1" class="bg-gray">{{ scope.row.name }}</div>
              <div v-if="scope.row.level==2" class="bg-left">{{ scope.row.name }}</div>
              <!-- {{ scope.row.level == 2 ? '　' : '' }} {{scope.row.name}} -->
            </template>
          </el-table-column>
          <el-table-column label="图标显示" width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.is_channel"
                  active-text=""
                  inactive-text=""
                  @change='changeChannelStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="首页显示" width="80">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isShow"
                  active-text=""
                  inactive-text=""
                  @change='changeShowStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="全部产品页面显示" width="140">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isCategory"
                  active-text=""
                  inactive-text=""
                  @change='changeCategoryStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序" width="100" sortable>
            <template slot-scope="scope">
              <el-input v-model="scope.row.sortOrder" placeholder="排序"
                        @blur="submitSort(scope.$index, scope.row)"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button size="small" @click="handleRowEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleRowDelete(scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>

import {CategoryStatus, ChannelStatus, Destroy, GetCategory, ShowStatus, UpdateSort} from "@/api/category";

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
    changeShowStatus($event, para) {
      this.$request.get(ShowStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    },
    changeChannelStatus($event, para) {
      this.$request.get(ChannelStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    },
    changeCategoryStatus($event, para) {
      this.$request.get(CategoryStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    },
    submitSort(index, row) {
      this.$request.post(UpdateSort, {id: row.id, sort: row.sortOrder}).then((response) => {
      })
    },
    handleRowEdit(index, row) {
      this.$router.push({name: 'category_add', query: {id: row.id}})
    },
    handleRowDelete(index, row) {
      this.$confirm('确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post(Destroy + '?id=' + row.id).then((response) => {
          console.log(response.data)
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getList();
        })
      });
    },
    onSubmitFilter() {
      this.page = 1
      this.getList()
    },
    getList() {
      this.$request.get(GetCategory, {
        page: this.page,
        name: this.filterForm.name
      }).then((response) => {
        this.tableData = response.data
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
.sub-category .el-table__expanded-cell {
  padding: 0;
}

.bg-gray {
  /* background:gray; */
  color: red;
  font-weight: bold;
}

.bg-left {
  margin-left: 30px;
}
</style>
