<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <router-link to="/dashboard/goods/add">
          <el-button type="primary" icon="plus" size="small">添加商品</el-button>
        </router-link>
      </div>
    </div>
    <div class="content-main">
      <div class="block">
				<span class="wrapper">
					<el-button :plain="true" type="primary" :class="activeClass == 1 ? 'active' : '' "
                     @click="sortOrder(1)" size="small">按销量排序</el-button>
					<el-button :plain="true" type="primary" :class="activeClass == 2 ? 'active' : '' "
                     @click="sortOrder(2)" size="small">按售价排序</el-button>
					<el-button :plain="true" type="primary" :class="activeClass == 3 ? 'active' : '' "
                     @click="sortOrder(3)" size="small">按库存排序</el-button>
				</span>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="全部商品" name="first"/>
        <el-tab-pane label="出售中" name="second"/>
        <el-tab-pane label="已售完" name="third"/>
        <el-tab-pane label="已下架" name="fourth"/>
      </el-tabs>
      <div class="filter-box">
        <el-form :inline="true" :model="filterForm" class="form-inline">
          <el-form-item label="商品名称">
            <el-input size="small" v-model="filterForm.name" placeholder="商品名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="onSubmitFilter">查询</el-button>
            <el-button size="small" @click="clear">清空</el-button>
          </el-form-item>
        </el-form>
        <!--<el-button @click="expandToggle" type="primary" icon="plus" size="small">{{expand == false?'全部展开':'全部收起'}}</el-button>-->
      </div>
      <div class="form-table-box">
        <el-table :data="tableData" style="width: 100%" stripe v-loading="goodsLoading"
                  element-loading-text="正在加载商品列表">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table :data="props.row.product" style="width: 100%" stripe>
                <el-table-column prop="id" label="id" width="60"></el-table-column>
                <el-table-column prop="goodsSn" label="商品SKU" width="140">
                  <template slot-scope="scope">
                    <el-input @blur="checkSkuOnly(scope.$index, scope.row)" size="mini"
                              v-model="scope.row.goodsSn" placeholder="商品SKU"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="goodsAka" label="快递单上的简称" width="160">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.goodsName"
                              placeholder="简称"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="型号/规格" width="140">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.value" placeholder="如1斤/条"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="cost" label="成本(元)" width="90">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.cost" placeholder="成本"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="retailPrice" label="零售(元)" width="90">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.retailPrice"
                              placeholder="零售"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="goodsWeight" label="重量(KG)" width="90">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.goodsWeight"
                              placeholder="重量"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="goodsNumber" label="库存" width="90">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.goodsNumber"
                              placeholder="库存"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                  <template slot-scope="scope">
                    <el-button
                        size="mini"
                        type="danger"
                        icon="el-icon-check" circle
                        @click="specSave(scope.$index, scope.row)">
                    </el-button>
                    <el-switch
                        size="mini"
                        v-model="scope.row.isOnSale"
                        active-text=""
                        inactive-text=""
                        active-value="1"
                        inactive-value="0"
                        @change='changeProductStatus($event,scope.row.id)'>
                    </el-switch>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" align="center"></el-table-column>
          <el-table-column prop="listPicUrl" label="商品图片" align="center">
            <template slot-scope="scope">
              <img :src="scope.row.listPicUrl" alt="" style="width: 40px;height: 40px">
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称" align="center"></el-table-column>
          <el-table-column prop="sortOrder" label="排序" align="center" sortable>
            <template slot-scope="scope">
              <el-input-number class="sort-width" size="mini" :min="1" :max="100" controls-position="right"
                               v-model="scope.row.sortOrder" placeholder="排序"
                               @blur="submitSort(scope.$index, scope.row)"
                               @change="submitSort(scope.$index, scope.row)"></el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="sellVolume" label="销量" align="center" sortable></el-table-column>
          <el-table-column prop="goodsNumber" label="库存" align="center" sortable>
          </el-table-column>
          <el-table-column label="首页显示" align="center">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isIndex"
                  active-text=""
                  inactive-text=""
                  @change='changeShowStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="上架" align="center">
            <template slot-scope="scope">
              <el-switch
                  v-model="scope.row.isOnSale"
                  active-text=""
                  inactive-text=""
                  @change='changeStatus($event,scope.row.id)'>
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="small" @click="handleRowEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="small" plain type="danger" @click="handleRowDelete(scope.$index, scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-box">
        <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange" :current-page="page"
                       :page-size="size"
                       layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>

import {
  CheckSku,
  Destroy,
  Drop,
  GetGoods, IndexShowStatus,
  OnSale,
  Out, ProductStatus, SaleStatus,
  Sort,
  UpdatePrice,
  UpdateShort,
  UpdateShortName
} from "@/api/goods";

export default {
  data() {
    return {
      page: 1,
      size: 10,
      total: 0,
      filterForm: {
        name: ''
      },
      tableData: [],
      activeName: 'second',
      pIndex: 0,
      num: 0,
      activeClass: 0,
      expand: true,
      tableDa: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      goodsLoading: false,
    }
  },
  methods: {
    // stockSyc() {
    //   this.$confirm('确定要同步库存?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     this.axios.post('crontab/updateStockByHand').then((response) => {
    //       if (response.data.code === 200) {
    //         this.$message({
    //           type: 'success',
    //           message: '同步成功'
    //         });
    //         this.getOnSaleList();
    //       }
    //     })
    //   }).catch(() => {
    //
    //   });
    // },
    // updateGoodsNumber() {
    //   this.axios.post('goods/updateGoodsNumber').then((response) => {
    //     if (response.data.code === 200) {
    //       this.$message({
    //         type: 'success',
    //         message: '同步成功2/2，完成'
    //       });
    //     }
    //   })
    // },
    specSave(index, row) {
      if (row.goodsName == '' || row.value == '' || row.cost == '' || row.retailPrice == '' || row.goodsWeight == '') {
        this.$message({
          type: 'error',
          message: '值不能为空!'
        });
        return false;
      }
      this.$request.post(UpdatePrice, row).then((response) => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
      })

    },
    checkSkuOnly(index, row) {
      console.log(index);
      console.log(row);
      if (row.goodsSn == '') {
        this.$message({
          type: 'error',
          message: 'SKU不能为空'
        })
        return false;
      }
      this.$request.post(CheckSku, {info: row}).then((response) => {
        this.$message({
          type: 'error',
          message: '该SKU已存在！'
        })
      })
    },
    expandToggle() {
      this.expand = !this.expand;
    },
    test() {
      console.log(this.tableData);
    },
    submitSort(index, row) {
      this.$request.post(UpdateShort, {id: row.id, sort: row.sortOrder}).then((response) => {
      })
    },
    handleClick(tab, event) {
      let pindex = tab._data.index;
      this.page = 1;
      this.activeClass = 0;
      if (pindex == 0) {
        this.getList();
        this.pIndex = 0;
      } else if (pindex == 1) {
        this.getOnSaleList();
        this.pIndex = 1;
      } else if (pindex == 2) {
        this.getOutList();
        this.pIndex = 2;
      } else if (pindex == 3) {
        this.getDropList();
        this.pIndex = 3;
      }
    },
    handleSizeChange(val) {
      this.size = val;
      let nIndex = this.pIndex;
      if (nIndex == 0) {
        this.getList();
      } else if (nIndex == 1) {
        this.getOnSaleList();
      } else if (nIndex == 2) {
        this.getOutList();
      } else if (nIndex == 3) {
        this.getDropList();
      } else if (nIndex == 4) {
        this.sortOrder(this.num);
      }
    },
    handlePageChange(val) {
      this.page = val;
      let nIndex = this.pIndex;
      if (nIndex == 0) {
        this.getList();
      } else if (nIndex == 1) {
        this.getOnSaleList();
      } else if (nIndex == 2) {
        this.getOutList();
      } else if (nIndex == 3) {
        this.getDropList();
      } else if (nIndex == 4) {
        this.sortOrder(this.num);
      }

    },
    handleRowEdit(index, row) {
      this.$router.push({name: 'goods_add', query: {id: row.id}})
    },
    handleRowDelete(index, row) {

      this.$confirm('确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this;
        that.$request.post(Destroy + "?id=" + row.id).then((response) => {
          that.$message({
            type: 'success',
            message: '删除成功!'
          });
          let pIndex = this.pIndex;
          console.log(pIndex);
          if (pIndex == 0) {
            that.getList();
          } else if (pIndex == 1) {
            that.getOnSaleList();
          } else if (pIndex == 2) {
            that.getOutList();
          } else if (pIndex == 3) {
            that.getDropList();
          }
        })
      })
    },
    onSubmitFilter() {
      this.page = 1;
      if (this.pIndex == 0) {
        this.getList();
      } else if (this.pIndex == 1) {
        this.getOnSaleList();
      } else if (this.pIndex == 2) {
        this.getOutList();
      } else if (this.pIndex == 3) {
        this.getDropList();
      }
    },
    clear() {
      this.$request.get(GetGoods, {
        page: this.page,
        name: ''
      }).then((response) => {
        this.tableData = response.data.records
        this.page = response.data.current
        this.total = response.data.total
      })
    },
    getList() {
      this.goodsLoading = true
      this.$request.get(GetGoods, {
        page: this.page,
        size: this.size,
        name: this.filterForm.name
      }).then((response) => {
        this.tableData = response.data.records
        this.page = response.data.current
        this.total = response.data.total
        this.goodsLoading = false
      })
    },
    getOnSaleList() {
      this.goodsLoading = true
      this.$request.get(OnSale, {
        page: this.page,
        size: this.size
      }).then((response) => {
        this.tableData = response.data.records
        this.page = response.data.current
        this.total = response.data.total
        this.goodsLoading = false
      })
    },
    getOutList() {
      this.goodsLoading = true
      this.$request.get(Out, {
        page: this.page,
        size: this.size
      }).then((response) => {
        this.tableData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
        this.goodsLoading = false
      })
    },
    getDropList() {
      this.goodsLoading = true
      this.$request.get(Drop, {
        page: this.page,
        size: this.size
      }).then((response) => {
        this.tableData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
        this.goodsLoading = false
      })
    },
    sortOrder(num) {
      this.num = num;
      this.pIndex = 4;
      this.activeClass = num;
      this.$request.get(Sort, {
        page: this.page,
        size: this.size,
        index: num
      }).then((response) => {
        this.tableData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
      })
    },
    changeStatus($event, para) {
      this.$request.get(SaleStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    },
    changeProductStatus($event, para) {
      this.$request.get(ProductStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    },
    changeShowStatus($event, para) {
      this.$request.post(IndexShowStatus, {
        status: $event,
        id: para
      }).then((response) => {

      })
    }
  },
  components: {},
  mounted() {
    this.getOnSaleList();
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

.content-main .form-table-box {
  display: flex;
  flex-direction: column;
  width: 100%;
}

</style>
