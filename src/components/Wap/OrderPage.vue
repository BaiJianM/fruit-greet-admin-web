<template>
  <div class="wrap">
    <div class="main">
      <!--<div class="filter-box">-->
      <!--<el-form :inline="true" :model="filterForm" class="filter-wrap">-->
      <!--<el-form-item label="收货人">-->
      <!--<el-input v-model="filterForm.consignee" placeholder="请输入收货人"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item>-->
      <!--<el-button type="primary" @click="onSubmitFilter">查询</el-button>-->
      <!--</el-form-item>-->
      <!--</el-form>-->
      <!--</div>-->
      <div class="top-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="待备货" name="first"></el-tab-pane>
          <el-tab-pane label="待发货" name="second"></el-tab-pane>
          <el-tab-pane label="待付款" name="third"></el-tab-pane>
        </el-tabs>

      </div>
      <div class="form-table-box">
        <el-input v-show="0" style="opacity: 0" id="foo" v-model="copyText" value="">{{ copyText }}
        </el-input>

        <div v-for="item in tableData" class="list-wrap clearfix">
          <div class="header clearfix">
            <div class="h1">
              <div class="in1">
                <div class="status-text">{{ item.orderStatusText }}{{ item.isFake ? '--假的订单' : '' }}
                </div>
                <div class="goods-num">共{{ item.goodsCount }}件商品</div>
              </div>
              <div class="add-time">{{ item.addTime }}</div>
            </div>
            <!--<div class="order-id">订单号：{{item.orderSn}}</div>-->
            <div class="h2">
              <div class="price-wrap">当前合计{{ item.actualPrice }}元（含运费{{ item.freightPrice }}元）</div>
              <div v-if="item.changePrice!= item.actualPrice" class="price-change">
                改价前{{ item.changePrice }}元
              </div>
            </div>

          </div>
          <div class="content-wrap clearfix">
            <div class="goods-list" v-for="iitem in item.goodsList">
              <img :src="iitem.listPicUrl" style="width: 40px;height: 40px" class="goods-img">
              <div class="content">
                <div class="c1">
                  <div class="goods-name">{{ iitem.goodsName }}</div>
                  <div class="goods-spec">{{ iitem.goodsSpecifitionNameValue }}</div>
                </div>
                <div class="c2">
                  <div class="goods-number">数量：{{ iitem.number }}</div>
                  <div class="goods-number">¥{{ iitem.retailPrice }}</div>
                </div>
              </div>
            </div>
            <div class="goods-main">
              <div class="to">
                <div class="t">收件人信息：</div>
                <!--<el-button :class="'c'+item.id" data-clipboard-target="#foo" size="mini" type="primary" round-->
                <!--plain @click="copyit(item)">点击复制-->
                <!--</el-button>-->
              </div>

              <div class="m1">
                <div class="user-name">{{ item.consignee }} {{ item.mobile }}</div>
              </div>
              <div class="m2">
                <div class="user-address">{{ item.fullRegion }}{{ item.address }}</div>
                <div class="user-post">{{ item.postscript }}</div>
              </div>

            </div>
            <div class="right">
              <el-button round plain v-if="item.buttonText !='查看详情'" size="small" type="danger"
                         @click="orderEdit(item.orderSn,item.buttonText)">
                {{ item.buttonText }}
              </el-button>
            </div>
          </div>
        </div>
        <div class="page-box">
          <el-pagination @current-change="handlePageChange" :current-page="page" :page-size="10"
                         layout="total, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="70%">
      <span>确定打包备货</span>
      <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
    </el-dialog>
    <el-dialog title="发货" :visible.sync="dialogFormVisible" width="94%">
      <el-form :model="dform">
        <div class="dialog-wrap">
          <div class="d-list-wrap">
            <div class="d-goods-list" v-for="ditem in orderInfo.goodsList">
              <img :src="ditem.listPicUrl" style="width: 40px;height: 40px;margin-right: 8px;" class="d-goods-img">
              <div class="goods-name">{{ ditem.goodsName }}</div>
              <div class="goods-spec">【{{ ditem.goodsSpecifitionNameValue }}】</div>
              <div class="goods-number">× {{ ditem.number }}</div>
            </div>
          </div>
          <div class="d-main">
            <div class="m1">
              <div class="user-name">{{ orderInfo.consignee }}</div>
              <div class="user-mobile">{{ orderInfo.mobile }}</div>
            </div>
            <div class="user-address">{{ orderInfo.fullRegion }}{{ orderInfo.address }}</div>
            <div class="user-post">{{ orderInfo.postscript }}</div>
          </div>
        </div>
        <el-form-item class="d-hoho" label="发货方式">
          <el-radio-group v-model="dform.method" @change="deliveryMethodChange(dform.method)">
            <el-radio :label="1">快递</el-radio>
            <el-radio :label="2">无需快递</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item class="d-hoho" label="选择快递" v-if="isShow">
          <el-select v-model="nowDeliveryId" value-key="id" placeholder="请选择快递">
            <el-option
                v-for="item in deliveryCom"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
          <!--@change="deliveryChange(deliveryCom.id)"-->
        </el-form-item>

        <el-form-item class="d-haha" label="快递单号" v-if="isShow">
          <el-input v-model="dform.logisticCode"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="deliveyGoConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改价格" :visible.sync="dialogPriceVisible" width="90%">
      <el-form :model="orderInfo">
        <el-form-item label="改价前总价:">
          <h2>¥{{ orderInfo.changePrice }}</h2>
        </el-form-item>
        <el-form-item label="货款总价:">
          <el-input v-model="orderInfo.goodsPrice" auto-complete="off" placeholder="请输入修改后的价格"></el-input>
        </el-form-item>
        <el-form-item label="快递费用:">
          <el-input v-model="orderInfo.freightPrice" auto-complete="off"
                    placeholder="请输入修改后的快递价格"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPriceVisible = false">取 消</el-button>
        <el-button type="primary" @click="priceChangeConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import api from '@/config/api';
import {Detail, GetOrder, OrderDelivery, OrderPack} from "@/api/order";
import {Delivery} from "@/api/shipper";

export default {
  data() {
    return {
      page: 1,
      total: 0,
      filterForm: {
        name: ''
      },
      orderStatus: 201,
      tableData: [],
      activeName: 'first',
      pIndex: 0,
      num: 0,
      activeClass: 0,
      copyBtn: '',
      copyText: '',
      orderSn: 0,
      dialogVisible: false,
      dialogFormVisible: false,
      dialogPriceVisible: false,
      dform: {
        method: 1,
      },
      orderInfo: {},
      isShow: true,
      nowDeliveryId: 0,
      deliveryCom: [],
    }
  },
  methods: {
    deliveryMethodChange(val) {
      if (val == 1) {
        this.isShow = true
      } else {
        this.isShow = false
      }
    },
    priceChangeConfirm() {
      this.$request.get(OrderPrice, {
        orderSn: this.orderSn,
        goodsPrice: this.orderInfo.goodsPrice,
        kdPrice: this.orderInfo.freightPrice,
      }).then((response) => {
        this.dialogPriceVisible = false;
        this.getList();
      });

    },
    getOrderInfo(sn) {
      this.$request.get(Detail, {orderSn: this.orderSn}).then((response) => {
        this.orderInfo = response.data;
        // console.log(this.orderInfo);
      })
    },
    // copyit(item) {
    //   console.log(item);
    //   let val = item.consignee + '|' + item.mobile + '|' + item.fullRegion + item.address + item.postscript;
    //   this.copyText = val;
    //   let classo = "c" + item.id;
    //   console.log(classo);
    //   var clipboard = new Clipboard('.' + classo);
    //   clipboard.on('success', function (e) {
    //     console.info('Text:', e.text);
    //     console.log('复制成功');
    //     clipboard.destroy();
    //     e.clearSelection();
    //
    //   });
    //   clipboard.on('error', function (e) {
    //     console.error('Action:', e.action);
    //     console.error('Trigger:', e.trigger);
    //   });
    //
    // },
    handlePageChange(val) {
      this.page = val;
      //保存到localStorage
      localStorage.setItem('orderPage', this.page)
      localStorage.setItem('orderFilterForm', JSON.stringify(this.filterForm));
      this.getList()
    },
    onSubmitFilter() {
      this.page = 1
      this.getList()
    },
    handleClick(tab, event) {
      let pindex = tab._data.index;
      if (pindex == 0) {
        this.orderStatus = 201
      } else if (pindex == 1) {
        this.orderStatus = 300
      } else if (pindex == 2) {
        this.orderStatus = '101'
      }
      this.getList();
    },
    orderEdit(sn, para) {
      this.orderSn = sn;
      // console.log(this.orderSn);
      if (para == '备货') {
        // console.log(para);
        this.dialogVisible = true;
      } else if (para == '发货') {
        this.deliveryCom.id = 0;
        this.dform.logisticCode = '';
        this.getOrderInfo(this.orderSn);
        this.dialogFormVisible = true;
      } else if (para == '修改价格') {
        this.getOrderInfo(this.orderSn);
        this.dialogPriceVisible = true;
      }
    },
    getDeliveyInfo() {
      this.$request.get(Delivery).then((response) => {
        this.deliveryCom = response.data;
        // console.log(this.deliveryCom);
      })
    },
    confirm() {
      this.$request.get(OrderPack, {orderSn: this.orderSn}).then((response) => {
        this.dialogVisible = false;
        this.getList();
      })
    },
    deliveyGoConfirm() {
      let method = this.method;
      // console.log(this.orderSn);
      // console.log(this.nowDeliveryId);
      // console.log(this.dform.method);
      this.$request.get(OrderDelivery, {
        orderSn: this.orderSn,
        shipper: this.nowDeliveryId,
        method: this.dform.method,
        logisticCode: this.dform.logisticCode
      }).then((response) => {
        this.dialogFormVisible = false;
        this.getList();
      });

      this.dialogFormVisible = false;
    },
    getList() {
      // console.log(this.orderStatus);
      this.$request.get(GetOrder, {
        params: {
          page: this.page,
          orderSn: this.filterForm.orderSn,
          consignee: this.filterForm.consignee,
          status: this.orderStatus,
        }
      }).then((response) => {
        console.log(88888);
        this.tableData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
      })
    },
  },
  mounted() {
    this.getList();
    this.getDeliveyInfo();
  }
}
</script>
<style scoped>
.el-pagination {
  padding-right: 30px;
  margin-bottom: 40px;
}

.top-wrap {
  padding: 0 12px;
}

.tabs-wrap {
  padding: 0 10px;
}

.filter-wrap {
  height: 42px;
  padding: 12px;
}

.main {
  padding: 50px 0;
}

.el-message-box {
  width: 300px !important;
}

.wrap {
  background: #fff;
}

.list-wrap {
  /*width: 100%;*/
  border: 1px solid #dfe5ed;
  margin: 12px;
  padding: 10px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}

.header .h1 {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  border-bottom: 1px solid #f1f1f1;
}

.h1 .in1 {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.in1 .goods-num {
  margin-left: 4px;
  color: #ff3456;
}

.header .h2 {
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 13px;
  border-bottom: 1px solid #f1f1f1;
}

.price-change {
  float: right;
  margin-right: 10px;
  color: #e64242;
}


.content-wrap .goods-list {
  border-bottom: 1px solid #f1f1f1;
  padding: 12px 0;
  display: flex;
  justify-content: flex-start;
}

.goods-list .goods-img {
  width: 80px !important;
  height: 80px !important;
}

.content-wrap .content {
  margin-left: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.content .c1 {
  width: 100%;
  height: 40px;
  line-height: 40px;
  display: flex;
  justify-content: space-between;
}

.content .c2 {
  width: 100%;
  line-height: 40px;
  display: flex;
  justify-content: space-between;

}

.content-wrap .goods-main {
  padding: 12px 0;
  border-bottom: 1px solid #f1f1f1;
}

.goods-main .to {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

.goods-main .m1 {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  line-height: 30px;
}

.goods-main .m2 {
  font-size: 15px;
  line-height: 30px;
}

.content-wrap .right {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.dialog-wrap .d-list-wrap {
  margin-bottom: 10px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.dialog-wrap .d-goods-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
  /*margin-bottom:20px;*/
  /*border-bottom:1px solid #d1dbe5;*/
}

.dialog-wrap .d-main {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #d1dbe5;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.dialog-wrap .d-main div {
  font-size: 14px;
}

.d-hoho {
  margin-bottom: 10px;
}

.d-haha {
  margin: 0;
}

.fahuo .el-dialog__body {
  padding: 0 20px !important;
}
</style>