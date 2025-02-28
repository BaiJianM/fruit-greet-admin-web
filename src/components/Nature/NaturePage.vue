<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>商品设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-main">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="商品分类" name="first"></el-tab-pane>
        <el-tab-pane label="商品型号" name="second"></el-tab-pane>
      </el-tabs>
      <div class="form-table-box">
        <div class="btn-wrap">
          <router-link v-if="pIndex == 0" to="/dashboard/category/add">
            <el-button plain type="primary" icon="plus">添加分类</el-button>
          </router-link>
          <router-link v-if="pIndex == 1" to="/dashboard/specification/detail">
            <el-button plain type="primary" icon="plus">添加型号</el-button>
          </router-link>
        </div>
        <el-table v-if="pIndex == 0" key="t1" :data="categoryData" style="width: 100%" border stripe>
          <el-table-column prop="name" label="分类名称" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.level==1" class="bg-gray">{{ scope.row.name }}</div>
              <div v-if="scope.row.level==2" class="bg-left">{{ scope.row.name }}</div>
              <!-- {{ scope.row.level == 2 ? '　' : '' }} {{scope.row.name}} -->
            </template>
          </el-table-column>
          <el-table-column label="图标显示" align="center">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isChannel"
                  active-text=""
                  inactive-text=""
                  @change='changeChannelStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="首页显示" align="center">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isShow"
                  active-text=""
                  inactive-text=""
                  @change='changeShowStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="全部产品页面显示" align="center">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isCategory"
                  active-text=""
                  inactive-text=""
                  @change='changeCategoryStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序" align="center" sortable>
            <template slot-scope="scope">
              <el-input v-model="scope.row.sortOrder" placeholder="排序"
                        @blur="submitSort(scope.$index, scope.row)"
                        @keyup.enter.native="submitSort(scope.$index, scope.row)" style="width: 50px"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="small" @click="handleRowEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleRowDelete(scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table v-if="pIndex == 1" key="t2" :data="specData" style="width: 100%" border stripe>
          <el-table-column prop="id" label="ID" align="center">
          </el-table-column>
          <el-table-column prop="name" label="型号名" align="center">
          </el-table-column>
          <el-table-column prop="sortOrder" label="排序" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="small" @click="specEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="specDelete(scope.$index, scope.row)">删除
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
import {GetSpecification} from "@/api/specification";

export default {
  data() {
    return {
      activeName: 'first',
      pIndex: 0,
      categoryData: [],
      isSpecAdd: false,
      dialogFormVisible: false,
      specData: [],
      form: {},
      formLabelWidth: '120px'
    }
  },
  methods: {
    handleClick(tab, event) {
      let pindex = tab._data.index;
      this.pIndex = pindex;
      if (pindex == 0) {
        this.getList();
      } else if (pindex == 1) {
        this.getSpecList();
      }
    },
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
        this.getList()
      })
    },
    handleRowEdit(index, row) {
      this.$router.push({name: 'category_add', query: {id: row.id}})
    },
    specEdit(index, row) {
      console.log(row.id);
      this.$router.push({name: 'specification_detail', query: {id: row.id}})
    },
    specDelete(index, row) {
      this.$confirm('确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.post(Delete + "?id=" + row.id).then((response) => {
          console.log(response.data)
          if (response.data.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getSpecList();
          } else {
            this.$message({
              type: 'error',
              message: '删除失败，该型号下有商品!'
            });
          }
        })
      });
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
    getList() {
      this.$request.get(GetCategory).then((response) => {
        this.categoryData = response.data
      })
    },
    getSpecList() {
      this.$request.get(GetSpecification).then((response) => {
        this.specData = response.data
      })
    }
  },
  components: {},
  mounted() {
    this.getList();
    if (this.$route.query.tab === 'second') {
      this.pIndex = 1;
      this.activeName = 'second';
      this.getSpecList();
    } else {
      this.pIndex = 0;
      this.activeName = 'first';
      this.getList();
    }
  }
}

</script>

<style scoped>
.sort-width {
  width: 90px;
}

.right {
  float: right;
}

.form-inline {
  margin-top: 2px;
  height: 40px;
  margin-right: 20px;
}

.block {
  margin-bottom: 10px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.active {
  border-color: #ff4949;
  color: #ff4949;
}

.marginRight {
  margin-right: 20px;
}

.btn-wrap {
  margin-bottom: 10px;
}
</style>
