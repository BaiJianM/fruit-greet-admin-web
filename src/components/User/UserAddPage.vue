<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ name: 'user' }">会员管理</el-breadcrumb-item>
        <el-breadcrumb-item>会员详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <el-button type="primary" @click="goBackPage" icon="arrow-left">返回列表</el-button>
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-table :data="userData" style="width: 100%" border stripe>
          <el-table-column prop="id" label="ID" width="60">
          </el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img :src="scope.row.avatar" alt="" style="width: 50px;height: 50px">
            </template>
          </el-table-column>
          <el-table-column prop="nickname" width="80" label="昵称"></el-table-column>
          <el-table-column prop="name" width="110" label="姓名">
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row.name" placeholder="姓名"
                        @blur="submitName(scope.$index, scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="name" width="160" label="手机">
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row.mobile" placeholder="手机"
                        @blur="submitMobile(scope.$index, scope.row)"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别" width="60">
            <template slot-scope="scope">
              {{ scope.row.gender == 2 ? '女' : '男' }}
            </template>
          </el-table-column>
          <el-table-column prop="registerTime" label="注册时间" width="180"></el-table-column>
          <el-table-column prop="lastLoginTime" label="最近登录" width="180"></el-table-column>
        </el-table>
      </div>
      <div class="block-box">
        <div class="block">
          <div class="text">提交订单数:</div>
          <div class="num">{{ this.dataInfo.orderSum }}笔</div>
        </div>
        <div class="block">
          <div class="text">成交订单:</div>
          <div class="num">{{ this.dataInfo.orderDone }}笔</div>
        </div>
        <div class="block">
          <div class="text">消费金额:</div>
          <div class="num" v-if="this.dataInfo.orderMoney == null">0元</div>
          <div class="num" v-else>{{ this.dataInfo.orderMoney }}元</div>
        </div>
        <div class="block">
          <div class="text">加入购物车:</div>
          <div class="num" v-if="this.dataInfo.cartSum == null">0件</div>
          <div class="num" v-else>{{ this.dataInfo.cartSum }}件</div>

        </div>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="订单" name="first"></el-tab-pane>
        <el-tab-pane label="地址管理" name="second"></el-tab-pane>
        <el-tab-pane label="购物车" name="third"></el-tab-pane>
        <el-tab-pane label="足迹" name="fourth"></el-tab-pane>
      </el-tabs>
      <div class="form-table-box" v-if="this.pIndex == 0">
        <div v-for="item in orderData" class="list-wrap clearfix">
          <div class="header clearfix">
            <div class="status-text">{{ item.orderStatusText }}</div>
            <div class="add-time">{{ item.addTime }}</div>
            <div class="order-id">订单号：{{ item.orderSn }}</div>
            <div class="price-wrap">当前合计{{ item.actualPrice }}元（含运费{{ item.freightPrice }}元）</div>
            <div v-if="item.changePrice!= item.actualPrice" class="price-change">
              改价前{{ item.changePrice }}元
            </div>
            <div class="goods-num">共{{ item.goodsCount }}件商品</div>
          </div>
          <div class="content-wrap clearfix">

            <div class="left">
              <div class="goods-list" v-for="iitem in item.goodsList">

                <img :src="iitem.listPicUrl" class="goods-img">
                <div class="goods-name">{{ iitem.goodsName }}</div>
                <div class="goods-spec">{{ iitem.goodsSpecifitionNameValue }}</div>
                <div class="goods-number">数量：{{ iitem.number }}</div>
                <div class="goods-number">¥{{ iitem.retailPrice }}</div>
              </div>
            </div>
            <div class="main">
              <div class="m1">
                <div class="user-name">{{ item.consignee }}</div>
                <div class="user-mobile">{{ item.mobile }}</div>
              </div>
              <div class="user-address">{{ item.fullRegion }}{{ item.address }}</div>
              <div class="user-post">{{ item.postscript }}</div>
            </div>
            <div class="right">
              <el-button class="right-detail" type="text" @click="viewDetail(item.id)"
                         size="mini">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="address-wrap" v-if="this.pIndex == 1">
        <div class="coupon-w">
          <div class="top">
            <div class="l">
              <div class="f1" style="width: 100px;">收件人</div>
              <div class="f1" style="width: 100px;">手机</div>
              <div class="f1" style="width: 600px;">详细地址</div>
            </div>
            <div class="r">操作</div>
          </div>
          <div class="bottom" v-for="item in addressData">
            <div class="l">
              <div class="f1" style="width: 100px;">{{ item.name }}</div>
              <div class="f1" style="width: 100px;">{{ item.mobile }}</div>
              <div class="f1" style="width: 600px;">{{ item.fullRegion }}</div>
            </div>
            <div class="r">
              <el-button size="small" @click="addressEdit(item)">编辑</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-table-box" v-if="this.pIndex == 2">
        <el-table :data="cartData" style="width: 100%" border stripe>
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
      <div class="form-table-box" v-if="this.pIndex == 3">
        <el-table :data="footData" style="width: 100%" stripe>
          <el-table-column prop="id" label="商品ID" width="100px"></el-table-column>
          <el-table-column prop="listPicUrl" label="图片" width="70px">
            <template slot-scope="scope">
              <img :src="scope.row.listPicUrl" alt="" style="width: 50px;height: 50px">
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称"></el-table-column>
        </el-table>
      </div>
      <div class="page-box">
        <el-pagination @current-change="handlePageChange" :current-page="page" :page-size="10"
                       layout="total, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="修改地址" :visible.sync="dialogAddressVisible">
      <el-form :model="nowAddressData">
        <el-form-item label="所在地区:" label-width="120px">
          <el-cascader
              :options="options"
              placeholder="请选择"
              v-model="addOptions">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址:" label-width="120px">
          <el-input class="el-input" v-model="nowAddressData.address" auto-complete="off"
                    placeholder="请输入详细地"></el-input>
        </el-form-item>
        <el-form-item label="收货人:" label-width="120px">
          <el-input class="el-input" v-model="nowAddressData.name" auto-complete="off"
                    placeholder="请输入收货人"></el-input>
        </el-form-item>
        <el-form-item label="手机:" label-width="120px">
          <el-input class="el-input" v-model="nowAddressData.mobile" auto-complete="off"
                    placeholder="请输入收货人手机"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddressVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddress">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {GetAllRegion} from "@/api/order";
import {
  Address,
  CartData,
  DataInfo,
  Foot,
  Info,
  Order,
  SaveAddress,
  UpdateInfo,
  UpdateMobile,
  UpdateName
} from "@/api/user";

export default {
  data() {
    return {
      loginInfo: null,
      page: 1,
      total: 0,
      filterForm: {
        name: ''
      },
      tableData: [],
      activeName: 'first',
      pIndex: 0,
      num: 0,
      infoForm: {
        id: 0
      },
      userData: [],
      addressData: [],
      cartData: [],
      footData: [],
      orderData: [],
      dialogAddressVisible: false,
      nowAddressData: {},
      addOptions: [],
      options: [],
      addValue: {},
      dataInfo: {},
      dataMoney: [],
      dataSum: [],
      forList: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    }
  },
  methods: {
    saveAddress() {
      this.nowAddressData.addOptions = this.addOptions;
      this.$request.post(SaveAddress, this.nowAddressData).then((response) => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
        this.addressData = [];
        this.getAddress();
        this.dialogAddressVisible = false;
      })
    },
    addressEdit(item) {
      this.nowAddressData = item;
      this.addOptions.push(
          item.provinceId,
          item.cityId,
          item.districtId,
      )

      this.dialogAddressVisible = true
    },
    viewDetail(index) {
      this.$router.push({name: 'order_detail', query: {orderId: index}})
    },
    handleClick(tab, event) {
      let pindex = tab._data.index;
      this.page = 1;
      this.total = 0
      if (pindex == 0) {
        this.pIndex = 0;
        this.getOrder();
      } else if (pindex == 1) {
        this.pIndex = 1;
        this.getAddress();
      } else if (pindex == 2) {
        this.pIndex = 2;
        this.getCartData();
      } else if (pindex == 3) {
        this.pIndex = 3;
        this.getFootData();
      }
    },
    submitNick(index, row) {
      this.$request.post(UpdateInfo, {id: row.id, nickname: row.nickname}).then((response) => {

      })
    },
    submitName(index, row) {
      this.$request.post(UpdateName, {id: row.id, name: row.name}).then((response) => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
      })
    },
    submitMobile(index, row) {
      this.$request.post(UpdateMobile, {id: row.id, mobile: row.mobile}).then((response) => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
      })
    },
    handlePageChange(val) {
      this.page = val;
      //保存到localStorage
      localStorage.setItem('thisPage', this.page)
      let pindex = this.pIndex;
      if (pindex == 0) {
        this.getOrder();
      } else if (pindex == 1) {
        this.getAddress();
      } else if (pindex == 2) {
        this.getCartData();
      } else if (pindex == 3) {
        this.getFootData();
      }
    },
    goBackPage() {
      this.$router.go(-1);
    },
    datainfo() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this;
      this.$request.get(DataInfo, {id: that.infoForm.id}).then((response) => {
        this.dataInfo = response.data;
      })
    },
    getInfo() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this;
      this.$request.get(Info, {id: that.infoForm.id}).then((response) => {
        let info = response.data;
        this.userData.push(info);
      })
    },
    getOrder() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this;
      this.$request.get(Order, {
        id: that.infoForm.id,
        page: this.page,
      }).then((response) => {
        this.orderData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total
      })
    },
    getAddress() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this;
      this.$request.get(Address, {
        id: that.infoForm.id,
        page: this.page,
      }).then((response) => {
        this.addressData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
      })

    },
    getCartData() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this;
      this.$request.get(CartData, {
        id: that.infoForm.id,
        page: this.page,
      }).then((response) => {
        this.cartData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total
      })
    },
    getFootData() {
      if (this.infoForm.id <= 0) {
        return false
      }
      let that = this
      this.$request.get(Foot, {
        id: that.infoForm.id,
        page: this.page,
      }).then((response) => {
        this.footData = response.data.records
        this.page = response.data.current
        this.total = response.data.total
      })
    },
    getAllRegion() {
      let that = this;
      this.$request.get(GetAllRegion).then((response) => {
        this.options = response.data;
      })
    },
  },
  components: {},
  mounted() {
    this.infoForm.id = this.$route.query.id || 0;
    this.getInfo();
    this.getOrder();
    this.datainfo();
    this.getAllRegion();
    // this.root = api.rootUrl;
    if (!this.loginInfo) {
      this.loginInfo = JSON.parse(window.localStorage.getItem('userInfo') || null);
    }
  }
}

</script>

<style>
.form-table-box {
  margin-bottom: 20px;
}

.addr-w {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f1f1f1;
}

.addr-w .l {
  display: flex;
  justify-content: flex-start;
}

.addr-w .l .f1 {
  min-width: 100px;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  margin-right: 20px;
}

.addr-w .r {
  min-width: 100px;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  text-align: center;
}

.coupon-w {
  display: flex;
  flex-direction: column;
}

.coupon-w .top {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f1f1f1;
  color: #888;
}

.coupon-w .bottom {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f1f1f1;

}

.coupon-w .l {
  display: flex;
  justify-content: flex-start;
}

.coupon-w .l .f1 {
  min-width: 100px;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  margin-right: 20px;
}

.coupon-w .r {
  min-width: 100px;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  text-align: center;
}

.list-wrap {
  width: 100%;
  border: 1px solid #dfe5ed;
  margin-bottom: 10px;
}

.goods-img {
  width: 40px;
  height: 40px;
}

.list-wrap .header {
  width: 100%;
  height: 40px;
  background-color: rgba(236, 245, 255, 0.51);
  line-height: 40px;
  color: #1f2d3d;
  font-size: 13px;
  padding: 0 10px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.status-text {
  float: left;
  color: #f0797f;
  margin-right: 10px;
}

.add-time {
  float: left;
  margin-right: 20px;
}

.order-id {
  float: left;
}

.goods-num {
  float: right;
  margin-right: 20px;
}

.price-wrap {
  float: right;
  margin-right: 20px;
}

.edit-wrap {
  float: right;
  margin-top: 5px;
}

.price-change {
  float: right;
  margin-right: 10px;
  color: #e64242;
}

.content-wrap {
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.content-wrap .left {
  width: 50%;
  border-right: 1px solid #d1dbe5;
  padding: 10px;
}

.content-wrap .main {
  width: 40%;

  border-right: 1px solid #d1dbe5;
  padding: 20px 10px;
}

.content-wrap .right {
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.right .right-detail {
  margin-left: 0;
  margin-top: 6px;
}

.goods-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.goods-name {
  color: #5e7382;
  font-size: 14px;
  margin-right: 20px;
  width: 200px;
}

.goods-spec {
  color: #0066cc;
  font-size: 14px;
  margin-right: 30px;
}

.goods-number {
  color: #000000;
  font-size: 14px;
  margin-right: 20px;
}

.m1 {
  display: flex;
  justify-content: flex-start;
}

.user-name {
  color: #000000;
  font-size: 14px;
  margin-right: 10px;
  line-height: 20px;
}

.user-mobile {
  color: #000000;
  font-size: 14px;
  line-height: 20px;
  margin-right: 20px;
}

.user-address {
  color: #333;
  font-size: 13px;
  line-height: 20px;
}

.user-post {
  color: #333;
  font-size: 14px;
  line-height: 20px;
  margin-top: 4px;
  background-color: #e6e3b8;
}

.block-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.block-box .block {
  display: flex;
  justify-content: flex-start;
  background: #fafafa;
  align-items: center;
  border: 1px solid #f1f1f1;
  padding: 40px;
  width: 24%;
  box-sizing: border-box;
  box-shadow: 1px 4px 4px #f1f1f1;
}

.block-box .a-block {
  display: flex;
  background: #fdf6ec;
  flex-direction: column;
  border: 1px solid #f1f1f1;
  padding: 20px;
  width: 160px;
}

.a-block .text {
  font-size: 20px;
}

.a-block .time .label1 {
  margin-right: 10px;
}

.a-block .time {
  font-size: 12px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.block .text {
  font-size: 14px;
  color: #888;
  margin-right: 10px;
}

.block .num {
  color: #222;
  font-size: 18px;
}
</style>
