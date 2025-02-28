<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="content-main">
      <el-tabs v-model="activename" @tab-click="handleClick">
        <el-tab-pane label="待付款" name="first"></el-tab-pane>
        <el-tab-pane label="待发货" name="second"></el-tab-pane>
        <el-tab-pane label="待收货" name="third"></el-tab-pane>
        <el-tab-pane label="已收货" name="fourth"></el-tab-pane>
        <el-tab-pane label="已关闭" name="fifth"></el-tab-pane>
        <el-tab-pane label="全部订单" name="sixth"></el-tab-pane>
      </el-tabs>
      <div class="filter-box">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="订单号">
            <el-input
                class="filter-input"
                v-model="filterForm.orderSn"
                placeholder="请输入订单号"
            ></el-input>
          </el-form-item>
          <el-form-item label="收货人">
            <el-input
                class="filter-input"
                v-model="filterForm.consignee"
                placeholder="请输入收货人"
            ></el-input>
          </el-form-item>
          <el-form-item label="快递号">
            <el-input
                class="filter-input"
                v-model="filterForm.logisticCode"
                placeholder="请输入快递单号"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmitFilter">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="form-table-box">
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange"
                           v-loading="orderLoading" element-loading-text="正在加载订单列表">
          <div v-for="item in tableData" class="list-wrap clearfix">
            <div class="header clearfix">
              <div class="left">
                <div class="off-text" v-if="item.offlinePay">线下支付订单</div>
                <div class="status-text">{{ item.orderStatusText }}</div>
                <div class="add-time">下单时间：{{ item.addTime }}</div>
                <div class="pay-time" v-if="item.payTime != 0">
                  付款时间：{{ item.payTime }}
                </div>
                <div class="order-id">订单号：{{ item.orderSn }}</div>
              </div>
              <div class="right">
                <div class="goods-num">共{{ item.goodsCount }}件商品</div>
                <div
                    v-if="item.changePrice != item.actualPrice"
                    class="price-change"
                >
                  改价前{{ item.changePrice }}元
                </div>
                <div class="price-wrap">
                  当前合计{{ item.actualPrice }}元（含运费{{
                    item.freightPrice
                  }}元）
                </div>
              </div>
            </div>
            <div class="content-wrap clearfix">
              <div class="left">
                <div class="goods-list" v-for="iitem in item.goodsList">
                  <img :src="iitem.listPicUrl" class="goods-img"/>
                  <div class="goods-name">{{ iitem.goodsAka }}</div>
                  <div class="goods-number">
                    <label>数量：</label>{{ iitem.number }}
                  </div>
                </div>
              </div>
              <div class="user-wrap">
                <div class="avatar-wrap">
                  <img :src="item.userInfo.avatar" class="avatar-img"/>
                  <div class="nickname">{{ item.userInfo.nickname }}</div>
                </div>
                <div class="name">姓名：{{ item.userInfo.name }}</div>
                <div class="mobile">手机：{{ item.userInfo.mobile }}</div>
              </div>
              <div class="main">
                <div v-if="item.expressInfo != ''" class="express-info">
                  {{ item.expressInfo }}
                </div>
                <div class="m1">
                  <div class="user-name">{{ item.consignee }}</div>
                  <div class="user-mobile">{{ item.mobile }}</div>
                </div>
                <div class="user-address">
                  {{ item.fullRegion }}{{ item.address }}
                </div>
                <div v-if="item.postscript != ''" class="user-post">
                  留言：{{ item.postscript }}
                </div>
                <el-input
                    class="admin-memo"
                    type="textarea"
                    @blur="changeMemo(item.id, item.adminMemo)"
                    v-model="item.adminMemo"
                    placeholder="备注"
                ></el-input>
              </div>
              <div class="right">
                <el-button
                    v-if="item.printStatus == 1 && item.orderStatus == 300"
                    class="d-btn"
                    type="primary"
                    @click="deliveryConfirm(item.id)"
                    size="mini"
                >发货
                </el-button>
                <el-button
                    v-if="item.orderStatus == 101"
                    size="mini"
                    @click="orderEdit(item)"
                >修改价格
                </el-button>
                <el-button
                    v-else-if="
                    item.orderStatus == 300 || item.orderStatus == 301
                  "
                    size="mini"
                    @click="orderEdit(item)"
                >打印快递单
                </el-button>
                <el-button
                    class="right-detail"
                    type="text"
                    @click="viewDetail(item.id)"
                    size="mini"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <div class="page-box">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            :current-page="page"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>确定打包备货</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="dialogVisible2">
      <span>确定收货？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="receiveConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="打印快递单" :visible.sync="dialogFormVisible">
      <el-form :model="dform">
        <div class="dialog-wrap">
          <div class="list-wrap">
            <div class="goods-list" v-for="ditem in orderInfo.goodsList">
              <img :src="ditem.listPicUrl" class="goods-img"/>
              <div class="goods-name">{{ ditem.goodsname }}</div>
              <div class="goods-name">{{ ditem.goodsAka }}</div>
              <div class="goods-spec">
                {{ ditem.goodsSpecifitionnameValue }}
              </div>
              <div class="goods-number">
                <label>数量：</label>{{ ditem.number }}
              </div>
            </div>
          </div>
          <div class="dialog-main" v-if="dform.method == 1">
            <div class="l">
              <div class="title">寄件人</div>
              <div class="detail">
                <div class="m1">
                  <div class="user-name">
                    <el-input
                        size="mini"
                        class="senderInput"
                        v-model="sender.name"
                        placeholder="寄件人姓名"
                    ></el-input>
                  </div>
                  <div class="user-mobile">
                    <el-input
                        size="mini"
                        class="senderInput"
                        v-model="sender.mobile"
                        placeholder="寄件人手机"
                    ></el-input>
                  </div>
                </div>
                <div class="user-address">
                  <el-cascader
                      style="width: 200px"
                      size="mini"
                      :options="options"
                      placeholder="请选择地区"
                      v-model="senderOptions"
                  >
                  </el-cascader>
                  <el-input
                      size="mini"
                      class="address-input"
                      v-model="sender.address"
                      auto-complete="off"
                      placeholder="请输入详细地"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-main" v-if="dform.method == 1">
            <div class="l">
              <div class="title">收件人</div>
              <div class="detail">
                <div class="m1">
                  <div class="user-name">
                    <el-input
                        size="mini"
                        class="senderInput"
                        v-model="receiver.name"
                        placeholder="收件人姓名"
                    ></el-input>
                  </div>
                  <div class="user-mobile">
                    <el-input
                        size="mini"
                        class="senderInput"
                        v-model="receiver.mobile"
                        placeholder="收件人手机"
                    ></el-input>
                  </div>
                </div>
                <div class="user-address">
                  <el-cascader
                      style="width: 200px"
                      size="mini"
                      :options="options"
                      placeholder="请选择地区"
                      v-model="receiveOptions"
                  >
                  </el-cascader>
                  <el-input
                      size="mini"
                      class="address-input"
                      v-model="receiver.address"
                      auto-complete="off"
                      placeholder="请输入详细地"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>
          <div v-if="orderInfo.postscript != ''" class="user-post-t">
            买家留言：{{ orderInfo.postscript }}
          </div>
          <div
              v-if="orderInfo.adminMemo != '' && orderInfo.adminMemo != null"
              class="user-admin-t"
          >
            备注：{{ orderInfo.adminMemo }}
          </div>
        </div>
        <el-form-item label="类型" style="margin-top: 10px">
          <el-radio-group
              v-model="dform.method"
              @change="deliveryMethodChange(dform.method)"
          >
            <el-radio :label="1">快递</el-radio>
            <el-radio :label="2">手动输入快递</el-radio>
            <el-radio :label="3">自提件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择快递" v-if="dform.method == 1">
          <el-radio-group v-model="expressType">
            <el-radio :label="1">顺丰(保价)</el-radio>
            <el-radio :label="2">外省顺丰(不保价)</el-radio>
            <el-radio :label="3">江浙沪皖顺丰(特惠)</el-radio>
            <el-radio :label="4">圆通</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="保价金额及提醒" v-if="expressType == 1">
          <el-input-number
              :mini="1"
              :max="9999"
              v-model="orderInfo.expressValue"
              @change="changeExpressValue(orderInfo)"
              @blur="changeExpressValue(orderInfo)"
              placeholder="请输入保价金额"
          ></el-input-number>
          <el-input
              v-model="orderInfo.remark"
              @blur="changeRemarkInfo(orderInfo)"
              placeholder="快递单上的提醒"
          ></el-input>
        </el-form-item>
        <el-form-item label="快递单上的提醒" v-if="expressType == 2">
          <el-input
              v-model="orderInfo.remark"
              @blur="changeRemarkInfo(orderInfo)"
              placeholder="快递单上的提醒"
          ></el-input>
        </el-form-item>
        <el-form-item
            label="要在快递单上打印单发货内容"
            v-if="dform.method == 1"
        >
          <el-input
              type="textarea"
              v-model="orderInfo.printInfo"
              @blur="changeInfo(orderInfo)"
              placeholder="请输入发货信息"
          ></el-input>
        </el-form-item>
        <el-form-item label="快递单号" v-if="dform.method == 2">
          <el-input v-model="dform.logisticCode"></el-input>
        </el-form-item>
        <el-form-item label="选择快递" v-if="dform.method == 2">
          <el-select
              v-model="nowDeliveryId"
              value-key="id"
              placeholder="请选择快递"
          >
            <el-option
                v-for="item in deliveryCom"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer print-footer">
        <div class="f-left">
          <el-checkbox
              v-if="dform.method == 1 && orderInfo.orderStatus == 300"
              v-model="autoGoDelivery"
          >打印完成后自动发货
          </el-checkbox>
        </div>
        <div class="f-right" v-if="dform.method != 1">
          <el-button style="margin-right: 20px" @click="hidePrintDialog"
          >取 消
          </el-button
          >
          <el-button type="primary" @click="deliveryGoGo">发货</el-button>
        </div>
        <div class="f-right" v-if="dform.method == 1">
          <el-button style="margin-right: 20px" @click="hidePrintDialog"
          >取 消
          </el-button
          >
          <div v-if="rePrintStatus == 0">
            <el-button
                v-if="autoGoDelivery"
                type="primary"
                @click="deliveyGoConfirm"
            >打印快递单并发货
            </el-button
            >
            <el-button
                v-if="!autoGoDelivery"
                type="primary"
                @click="deliveyGoConfirm"
            >只打印快递单
            </el-button
            >
          </div>
          <div v-if="rePrintStatus == 1">
            <el-button
                v-if="autoGoDelivery"
                type="primary"
                @click="directPrintConfirm"
            >打印快递单并发货
            </el-button
            >
            <el-button
                v-if="!autoGoDelivery"
                type="primary"
                @click="directPrintConfirm"
            >只打印快递单
            </el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="提醒！" :visible.sync="dialogExpressVisible">
      <div class="form-table-box">
        该订单已经生成过一个快递单号，是否用该单号打印？
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="f-right">
          <el-button @click="dialogExpressVisible = false">取 消</el-button>
          <el-button type="primary" @click="rePrintExpress"
          >重新生成订单号打印
          </el-button
          >
          <el-button type="success" @click="directPrintExpress"
          >直接用该单号打印
          </el-button
          >
        </div>
      </div>
    </el-dialog>
    <el-dialog
        title="快递单预览"
        class="express-dialog"
        :visible.sync="printMiandan"
    >
      <div
          id="sfbj-block"
          v-if="expressType == 1 || expressType == 2"
          style="
          display: block;
          width: 400px;
          height: 500px;
          border: 1px solid #333;
          background: #fff;
          overflow: hidden;
          margin: 0 auto;
        "
      >
        <div
            style="
            display: flex;
            width: 100%;
            justify-content: space-between;
            border-bottom: 1px solid #333;
          "
        >
          <div
              style="
              border-right: 1px solid #333;
              width: 300px;
              text-align: center;
            "
          >
            <barcode
                :value="sfHasValue.logisticCode"
                height="40"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
          <div style="font-size: 16px; font-weight: bold">
            {{ sfHasValue.remark }}
          </div>
        </div>
        <div
            style="
            display: flex;
            flex-direction: column;
            width: 100%;
            border-bottom: 1px solid #333;
          "
        >
          <div style="text-align: center; font-size: 32px; font-weight: bold">
            {{ sfHasValue.destinatioCode }}
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 12px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 12px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ senderInfo.name }} {{ senderInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            托寄物
          </div>
          <div
              style="
              font-size: 20px;
              width: 30%;
              border-right: 1px solid #333;
              margin-right: 4px;
            "
          >
            海鲜
          </div>
          <div
              style="
              width: 30%;
              display: flex;
              flex-direction: column;
              border-right: 1px solid #333;
              margin-right: 4px;
            "
          >
            <div style="height: 30px; font-size: 12px">收件员</div>
            <div style="height: 30px; font-size: 12px">派件员</div>
          </div>
          <div style="width: 20%; display: flex; flex-direction: column">
            <div style="height: 30px; font-size: 12px">收方签署</div>
            <div style="height: 30px; font-size: 12px">日期</div>
          </div>
        </div>
        <div
            style="
            width: 100%;
            text-align: center;
            height: 16px;
            font-size: 10px;
            border-bottom: 1px solid #333;
          "
        >
          寄件时间:{{ sfHasValue.sendTime }},账号:{{
            sfHasValue.monthCode
          }},<label v-if="sfHasValue.expressValue > 0"
        >保价:{{ sfHasValue.expressValue }}元</label
        >
        </div>
        <div style="display: flex; width: 100%; border-bottom: 1px solid #333">
          <div style="width: 100%; text-align: center">
            <barcode
                :value="sfHasValue.logisticCode"
                height="30"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ senderInfo.name }} {{ senderInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div style="height: 80px; font-size: 10px">
          {{ orderInfo.printInfo }}
        </div>
      </div>
      <div
          id="sfth-block"
          v-if="expressType == 3"
          style="
          display: block;
          width: 400px;
          height: 500px;
          border: 1px solid #333;
          background: #fff;
          overflow: hidden;
          margin: 0 auto;
        "
      >
        <div style="display: flex; width: 100%; border-bottom: 1px solid #333">
          <div style="width: 100%; text-align: center">
            <barcode
                :value="sfHasValue.logisticCode"
                height="40"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            flex-direction: column;
            width: 100%;
            border-bottom: 1px solid #333;
          "
        >
          <div style="text-align: center; font-size: 32px; font-weight: bold">
            {{ sfHasValue.destinatioCode }}
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 12px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 12px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ senderInfo.name }} {{ senderInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            托寄物
          </div>
          <div
              style="
              font-size: 20px;
              width: 30%;
              border-right: 1px solid #333;
              margin-right: 4px;
            "
          >
            海干货
          </div>
          <div
              style="
              width: 30%;
              display: flex;
              flex-direction: column;
              border-right: 1px solid #333;
              margin-right: 4px;
            "
          >
            <div style="height: 30px; font-size: 12px">收件员</div>
            <div style="height: 30px; font-size: 12px">派件员</div>
          </div>
          <div style="width: 20%; display: flex; flex-direction: column">
            <div style="height: 30px; font-size: 12px">收方签署</div>
            <div style="height: 30px; font-size: 12px">日期</div>
          </div>
        </div>
        <div
            style="
            width: 100%;
            text-align: center;
            height: 16px;
            font-size: 10px;
            border-bottom: 1px solid #333;
          "
        >
          寄件时间:{{ sfHasValue.sendTime }},账号:{{
            sfHasValue.monthCode
          }},<label v-if="sfHasValue.expressValue > 0"
        >保价:{{ sfHasValue.expressValue }}元</label
        >
        </div>
        <div style="display: flex; width: 100%; border-bottom: 1px solid #333">
          <div style="width: 100%; text-align: center">
            <barcode
                :value="sfHasValue.logisticCode"
                height="30"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ senderInfo.name }} {{ senderInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div style="height: 80px; font-size: 10px">
          {{ orderInfo.printInfo }}
        </div>
      </div>
      <div
          id="yto-block"
          v-if="expressType == 4"
          style="
          display: block;
          width: 400px;
          height: 720px;
          border: 1px solid #333;
          background: #fff;
          overflow: hidden;
          margin: 0 auto;
        "
      >
        <div style="display: flex; width: 100%; border-bottom: 1px solid #333">
          <div style="width: 100%; text-align: center">
            <barcode
                :value="sfHasValue.logisticCode"
                height="50"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            flex-direction: column;
            width: 100%;
            border-bottom: 1px solid #333;
          "
        >
          <div style="text-align: center; font-size: 44px; font-weight: bold">
            {{ sfHasValue.MarkDestination }}
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 12px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 12px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 12px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 12px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄件人
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 12px;
              "
            >
              {{ senderInfo.name }}{{ senderInfo.tel }}
            </div>
            <div style="font-size: 12px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div style="width: 50%; height: 70px; border-right: 1px solid #333">
            <div style="height: 30px; font-size: 12px">收件人/代收人：</div>
          </div>
          <div style="width: 50%; height: 70px">
            <div style="height: 30px; font-size: 12px">签收时间：</div>
          </div>
        </div>
        <div
            style="width: 100%; text-align: center; height: 30px; font-size: 10px"
        >
          寄件时间：{{ sfHasValue.sendTime }}
        </div>

        <div
            style="width: 100%; text-align: center; height: 60px; font-size: 10px"
        ></div>
        <div style="display: flex; width: 100%; border-bottom: 1px solid #333">
          <div style="width: 100%; text-align: center">
            <barcode
                :value="sfHasValue.logisticCode"
                height="30"
                display-value="false"
                tag="img"
            ></barcode>
            <div
                style="
                width: 100%;
                margin: 0 auto;
                text-align: center;
                font-size: 12px;
                padding-bottom: 2px;
              "
            >
              快递单号:{{ sfHasValue.logisticCode }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            收方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ receiverInfo.name }} {{ receiverInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                receiverInfo.provinceName +
                receiverInfo.cityName +
                receiverInfo.expAreaName +
                receiverInfo.address
              }}
            </div>
          </div>
        </div>
        <div
            style="
            display: flex;
            justify-content: flex-start;
            border-bottom: 1px solid #333;
            position: relative;
          "
        >
          <div
              style="
              width: 12px;
              padding: 0 2px;
              text-align: center;
              font-size: 10px;
              border-right: 1px solid #333;
              margin-right: 10px;
            "
          >
            寄方
          </div>
          <div style="display: flex; flex-direction: column">
            <div
                style="
                display: flex;
                justify-content: flex-start;
                font-size: 10px;
              "
            >
              {{ senderInfo.name }}{{ senderInfo.tel }}
            </div>
            <div style="font-size: 10px">
              {{
                senderInfo.provinceName +
                senderInfo.cityName +
                senderInfo.expAreaName +
                senderInfo.address
              }}
            </div>
          </div>
        </div>
        <div style="height: 80px; font-size: 10px">
          {{ orderInfo.printInfo }}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPrint">取 消</el-button>
        <el-button
            v-if="autoGoDelivery"
            type="primary"
            @click="printAndDeliveryConfirm"
        >打印并发货
        </el-button
        >
        <el-button
            v-else-if="!autoGoDelivery"
            type="primary"
            @click="printOnlyConfirm"
        >只打印快递单
        </el-button
        >
      </div>
    </el-dialog>
    <el-dialog title="修改价格" :visible.sync="dialogPriceVisible">
      <el-form :model="orderInfo">
        <el-form-item label="改价前总价:">
          <h2>¥{{ orderInfo.changePrice }}</h2>
        </el-form-item>

        <el-form-item label="修改商品价格:">
          <el-input-number
              @change="goodsPriceChange"
              :min="0"
              :max="99999999"
              v-model="orderInfo.goodsPrice"
              auto-complete="off"
              placeholder="请输入商品价格"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="修改快递价格:">
          <el-input-number
              @change="freightPriceChange"
              :min="0"
              :max="99999999"
              v-model="orderInfo.freightPrice"
              auto-complete="off"
              placeholder="请输入修改后的快递"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="改价后总价:">
          <h2>¥{{ orderInfo.actualPrice }}</h2>
        </el-form-item>
        <el-form-item label="">
          {{
            orderInfo.changePrice - orderInfo.actualPrice > 0
                ? "优惠金额：" +
                (orderInfo.changePrice - orderInfo.actualPrice).toFixed(2)
                : "涨价金额：" +
                (orderInfo.actualPrice - orderInfo.changePrice).toFixed(2)
          }}
        </el-form-item>
        <!-- <el-form-item label="快递费用:">
                    <el-input v-model="orderInfo.freightPrice" auto-complete="off" placeholder="请输入修改后的快递价格"></el-input>
                </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPriceVisible = false">取 消</el-button>
        <el-button type="primary" @click="priceChangeConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import VueBarcode from "../../../node_modules/vue-barcode";
import ElButton from "../../../node_modules/element-ui/packages/button/src/button.vue";
import {
  CheckExpress,
  Destroy, Detail, DirectPrintExpress,
  GetAllRegion, GetAutoStatus, GetMianExpress, GetOrder, GoDelivery, GoPrintOnly,
  OrderDelivery,
  OrderPack, OrderPrice, OrderReceive, RePrintExpress,
  SaveAdminMemo,
  SaveExpressValueInfo,
  SavePrintInfo,
  SaveRemarkInfo
} from "@/api/order";
import {Delivery} from "@/api/shipper";
// Vue.component(VueBarcode.name, VueBarcode);

// import { Button } from 'element-ui';

export default {
  data() {
    return {
      autoGoDelivery: true,
      sfHasValue: {},
      barcodeValue: "test",
      printMiandan: false,
      rawHtml: "",
      testApi:
          "http://sandboxapi.kdniao.com:8080/kdniaosandbox/gateway/exterfaceInvoke.json",
      expressType: 0, // 选择快递方式
      checkAll: false,
      checkedCities: ["上海", "北京"],
      cities: ["上海", "北京", "广州", "深圳"],
      isIndeterminate: true,
      page: 1,
      total: 0,
      filterForm: {
        name: "",
        logisticCode: "",
      },
      tableData: [],
      activename: "second",
      orderStatus: 300,
      dialogVisible: false,
      dialogVisible2: false,
      dialogFormVisible: false,
      dialogPriceVisible: false,
      dialogText: "",
      dialogIndex: 0,
      orderSn: 0,
      orderId: 0,
      dform: {
        method: 2,
      },
      orderInfo: {},
      isShow: true,
      deliveryCom: [],
      nowDeliveryId: "",
      formLabelWidth: "120px",
      barcodeOption: {
        displayValue: false, //是否默认显示条形码数据
        background: "#fff", //条形码背景颜色
        width: 2,
        height: 100,
        fontSize: 20, //字体大小
      },
      senderInfo: {},
      receiverInfo: {},
      dialogExpressVisible: false,
      rePrintStatus: 0,
      changeSender: 0,
      changeReceive: 0,
      options: [],
      senderOptions: [],
      receiveOptions: [],
      receiver: {},
      sender: {},
      orderLoading: false,
    };
  },
  methods: {
    hidePrintDialog() {
      this.dform.method = 2;
      this.dialogFormVisible = false;
      console.log("11111");
    },
    goodsPriceChange(value) {
      console.log(value);
      this.orderInfo.goodsPrice = value;
      this.orderInfo.actualPrice =
          Number(this.orderInfo.goodsPrice) +
          Number(this.orderInfo.freightPrice);
    },
    freightPriceChange(value) {
      this.orderInfo.freightPrice = value;
      this.orderInfo.actualPrice =
          Number(this.orderInfo.goodsPrice) + Number(value);
    },
    getAllRegion() {
      let that = this;
      this.$request.get(GetAllRegion).then((response) => {
        this.options = response.data;
      });
    },
    deliveryGoGo() {
      console.log(this.orderId);
      console.log(this.nowDeliveryId);
      console.log(this.dform);
      if (this.dform.method == 2) {
        if (this.dform.logisticCode == undefined || this.nowDeliveryId == "") {
          this.$message({
            type: "error",
            message: "请输入快递单号和快递公司",
          });
          return false;
        }
      }
      this.$request.get(OrderDelivery, {
        orderId: this.orderId,
        shipper: this.nowDeliveryId,
        method: this.dform.method,
        logisticCode: this.dform.logisticCode,
      }).then((response) => {
        this.dialogFormVisible = false;
        this.dialogExpressVisible = false;
        this.getList();
      });
    },
    getDeliveyInfo() {
      this.$request.get(Delivery).then((response) => {
        this.deliveryCom = response.data;
      });
    },
    changeExpressValue(info) {
      if (this.expressType == 1) {
        this.$request.post(SaveExpressValueInfo, {
          expressValue: info.expressValue,
          id: info.id,
        }).then((response) => {
          this.$message({
            type: "success",
            message: "保存成功!",
          });
        });
      }
    },
    confirm() {
      this.$request.get(OrderPack, {orderId: this.orderId})
          .then((response) => {
            this.dialogVisible = false;
            this.getList();
          });
    },
    changeRemarkInfo(info) {
      this.$request.post(SaveRemarkInfo, {
        remark: info.remark,
        id: info.id,
      }).then((response) => {
        this.$message({
          type: "success",
          message: "保存成功!",
        });
      });
    },
    changeInfo(info) {
      let id = info.id;
      let printInfo = info.printInfo;
      this.$request.post(SavePrintInfo, {
        printInfo: printInfo,
        id: id,
      }).then((response) => {
        this.$message({
          type: "success",
          message: "保存成功!",
        });
      });
    },
    changeMemo(id, text) {
      this.$request.post(SaveAdminMemo, {
        text: text,
        id: id,
      }).then((response) => {
        this.$message({
          type: "success",
          message: "保存成功!",
        });
      });
    },
    cancelPrint() {
      this.printMiandan = false;
      this.dialogFormVisible = false;
    },
    handleCheckedCitiesChange() {
      console.log("哈哈");
    },
    onPrintNum() {
      this.$request.post(this.testApi, this.testData, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      })
          .then((response) => {
            console.log(response.data);
          });
    },
    viewDetail(index) {
      this.$router.push({
        name: "order_detail",
        query: {
          orderId: index,
        },
      });
    },
    handleClick(tab, event) {
      let pindex = tab._data.index;
      if (pindex == 0) {
        this.orderStatus = "101,801";
      } else if (pindex == 1) {
        this.orderStatus = 300;
      } else if (pindex == 2) {
        this.orderStatus = 301;
      } else if (pindex == 3) {
        this.orderStatus = 401;
      } else if (pindex == 4) {
        this.orderStatus = "102,103";
      } else if (pindex == 5) {
        this.orderStatus = "101,102,103,202,203,300,301,302,303,401,801,802";
      }
      this.getList();
    },

    handleSizeChange(val) {
      this.sieze = val;
      //保存到localStorage
      localStorage.setItem("orderPage", this.page);
      localStorage.setItem("orderFilterForm", JSON.stringify(this.filterForm));
      this.getList();
    },

    handlePageChange(val) {
      this.page = val;
      //保存到localStorage
      localStorage.setItem("orderPage", this.page);
      localStorage.setItem("orderFilterForm", JSON.stringify(this.filterForm));
      this.getList();
    },
    handleRowEdit(index, row) {
      this.$router.push({
        name: "orderDetail",
        query: {
          id: row.id,
        },
      });
    },
    // handleRowDelete(index, row) {
    //   this.$confirm("确定要删除?", "提示", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning",
    //   }).then(() => {
    //     this.$request.post(Destroy, {
    //       id: row.id,
    //     }).then((response) => {
    //       console.log(response.data);
    //       this.$message({
    //         type: "success",
    //         message: "删除成功!",
    //       });
    //       this.getList();
    //     });
    //   });
    // },
    onSubmitFilter() {
      this.page = 1;
      this.getList();
    },
    getList() {
      this.orderLoading = true;
      this.$request.get(GetOrder, {
        page: this.page,
        orderSn: this.filterForm.orderSn,
        consignee: this.filterForm.consignee,
        logisticCode: this.filterForm.logisticCode,
        status: this.orderStatus,
      }).then((response) => {
        this.tableData = response.data.records;
        this.page = response.data.current;
        this.total = response.data.total;
        this.orderLoading = false;
      });
    },
    orderEdit(item) {
      this.rePrintStatus = 0;
      console.log(0);
      this.orderId = item.id;
      if (item.orderStatus == 300 || item.orderStatus == 301) {
        this.rePrintStatus = 0;
        this.checkExpressInfo();
        console.log(1);
      } else if (item.orderStatus == 101) {
        this.getOrderInfo(this.orderId);
        this.dialogPriceVisible = true;
        console.log(2);
      } else if (item.orderStatus == 301 && item.isFake == 1) {
        this.dialogVisible2 = true;
        console.log(3);
      }
    },
    rePrintExpress() {
      this.rePrintStatus = 0;
      this.$request.get(RePrintExpress, {orderId: this.orderId})
          .then((response) => {
            this.expressType = 0;
            this.getOrderInfo(this.orderId);
            this.dialogFormVisible = true;
          });
    },
    directPrintExpress() {
      this.rePrintStatus = 1;
      this.$request.get(DirectPrintExpress, {
        params: {
          orderId: this.orderId,
        },
      }).then((response) => {
        let express = response.data;
        this.expressType = express.express_type;
        let orderInfo = this.orderInfo;
        this.sfHasValue = {
          logisticCode: express.logisticCode,
          remark: orderInfo.remark,
          destinatioCode: express.regionCode,
          MarkDestination: express.regionCode,
          sendTime: express.sendTime,
          monthCode: express.monthCode,
        };
        this.expressType = 0;
        this.dialogFormVisible = true;
      });
    },
    directPrintConfirm() {
      let expressType = this.expressType;
      if (expressType == 0) {
        this.$message({
          type: "error",
          message: "请选择一个快递免单模板!",
        });
        return false;
      }
      if (expressType == 1) {
        this.sfHasValue.expressValue = this.orderInfo.expressValue;
      }
      this.printMiandan = true;
      this.dialogFormVisible = false;
      this.dialogExpressVisible = false;
    },
    checkExpressInfo() {
      this.getOrderInfo(this.orderId);
      this.$request.get(CheckExpress, {orderId: this.orderId}).then((response) => {
        console.log(response.data);
        // TODO 这里记一下需要验证经过拦截器后还能不能判断200
        if (response.data.code === 200) {
          this.dialogExpressVisible = true;
        } else {
          this.expressType = 0;
          this.dialogFormVisible = true;
        }
      });
    },
    receiveConfirm() {
      this.$request.get(OrderReceive, {orderId: this.orderId})
          .then((response) => {
            this.dialogVisible2 = false;
            this.getList();
          });
    },

    deliveyGoConfirm() {
      // 可以设置成不预览，那么直接打印了
      // 逻辑：打印快递单，这时会向快递鸟发送请求，然后得到快递单号,

      let expressType = this.expressType;
      if (expressType == 0) {
        this.$message({
          type: "error",
          message: "请选择一个快递免单模板!",
        });
        return false;
      }
      console.log(expressType);
      this.sender.senderOptions = this.senderOptions;
      this.receiver.receiveOptions = this.receiveOptions;
      this.$request.post(GetMianExpress, {
        orderId: this.orderInfo.id,
        sender: this.sender,
        receiver: this.receiver,
        expressType: expressType,
      }).then((response) => {
        let expressInfo = response.data.latestExpressInfo;
        if (expressInfo.resultCode == 100) {
          this.rawHtml = expressInfo.printTemplate;
          this.sfHasValue = expressInfo.order;
          this.sfHasValue.expressValue = expressInfo.expressValue;
          this.sfHasValue.sendTime = expressInfo.sendTime;
          this.sfHasValue.remark = expressInfo.remark;
          this.sfHasValue.monthCode = expressInfo.monthCode;
          this.sfHasValue.sendTime = expressInfo.sendTime;
          this.sfHasValue.orderId = this.orderInfo.id;
          this.sfHasValue.expressType = expressType;
          this.senderInfo = response.data.sender;
          this.receiverInfo = response.data.receiver;
          this.printMiandan = true;
          this.dialogFormVisible = false;
          this.dialogExpressVisible = false;
        } else if (response.data.latestExpressInfo.resultCode == 105) {
          this.$message({
            type: "error",
            message: "操作超时，请重试!",
          });
        }
        // let newWindow = window.open("_blank");   //打开新窗口
        // let codestr = this.rawHtml;   //获取需要生成pdf页面的div代码
        // newWindow.document.write(codestr);   //向文档写入HTML表达式或者JavaScript代码
        // newWindow.document.close();     //关闭document的输出流, 显示选定的数据
        // newWindow.print();   //打印当前窗口
      });
      // console.log('这里进来了');
      // this.axios.post('order/getPrintTest').then((response) => {
      //     console.log(response);
      //     this.rawHtml = response.data;
      //     this.printMiandan = true;
      // });
    },
    deliveryConfirm(id) {
      this.$request.post(GoDelivery, {
        orderId: id,
      }).then((response) => {
        this.getList();
        this.$message({
          type: "success",
          message: "发货成功!",
        });
      });
    },
    printAndDeliveryConfirm() {
      this.$request.post(GoDelivery, {
        orderId: this.orderId,
      }).then((response) => {
        this.getList();
        this.printMiandan = false;
        this.dialogFormVisible = false;
        let expressType = this.sfHasValue.expressType;
        if (expressType == 1 || expressType == 2) {
          this.printit1();
        } else if (expressType == 3) {
          this.printit2();
        } else if (expressType == 4) {
          this.printit3();
        }
      });
    },
    printOnlyConfirm() {
      this.$request.post(GoPrintOnly, {
        orderId: this.orderId,
      }).then((response) => {
        this.getList();
        this.printMiandan = false;
        this.dialogFormVisible = false;
        let expressType = this.sfHasValue.expressType;
        if (expressType == 1 || expressType == 2) {
          this.printit1();
        } else if (expressType == 3) {
          this.printit2();
        } else if (expressType == 4) {
          this.printit3();
        }
      });
    },
    printit1() {
      var mywindow = window.open("", "PRINT", "height=1500,width=1000");
      mywindow.document.write("<html><head><title></title>");
      mywindow.document.write("</head><body >");
      mywindow.document.write(document.getElementById("sfbj-block").innerHTML);
      mywindow.document.write("</body></html>");
      mywindow.document.close(); // necessary for IE >= 10
      mywindow.focus(); // necessary for IE >= 10*/
      mywindow.print();
      mywindow.close();
      return true;
    },
    printit2() {
      var mywindow = window.open("", "PRINT", "height=1500,width=1000");
      mywindow.document.write("<html><head><title></title>");
      mywindow.document.write("</head><body >");
      mywindow.document.write(document.getElementById("sfth-block").innerHTML);
      mywindow.document.write("</body></html>");
      mywindow.document.close(); // necessary for IE >= 10
      mywindow.focus(); // necessary for IE >= 10*/
      mywindow.print();
      mywindow.close();
      return true;
    },
    printit3() {
      var mywindow = window.open("", "PRINT", "height=1800,width=1000");
      mywindow.document.write("<html><head><title></title>");
      mywindow.document.write("</head><body >");
      mywindow.document.write(document.getElementById("yto-block").innerHTML);
      mywindow.document.write("</body></html>");
      mywindow.document.close(); // necessary for IE >= 10
      mywindow.focus(); // necessary for IE >= 10*/
      mywindow.print();
      mywindow.close();
      return true;
    },

    priceChangeConfirm() {
      if (
          this.orderInfo.actualPrice == "" ||
          this.orderInfo.actualPrice == 0
      ) {
        this.$message({
          type: "error",
          message: "总价不能为空!",
        });
        return false;
      }
      this.$request.post(OrderPrice, {
        orderId: this.orderId,
        actualPrice: this.orderInfo.actualPrice,
        freightPrice: this.orderInfo.freightPrice,
        goodsPrice: this.orderInfo.goodsPrice,
      }).then((response) => {
        this.dialogPriceVisible = false;
        this.getList();
      });
    },
    getAutoStatus() {
      this.$request.get(GetAutoStatus).then((response) => {
        let ele = response.data;
        ele == 1 ? (this.autoGoDelivery = true) : (this.autoGoDelivery = false);
      });
    },
    getOrderInfo(sn) {
      this.$request.get(Detail, {orderId: this.orderId})
          .then((response) => {
            this.orderInfo = response.data.orderInfo;
            this.receiver = response.data.receiver;
            this.sender = response.data.sender;
            console.log(this.sender);
            this.receiveOptions = [];
            this.receiveOptions.push(
                this.receiver.provinceId,
                this.receiver.cityId,
                this.receiver.districtId
            );
            this.senderOptions = [];
            this.senderOptions.push(
                this.sender.provinceId,
                this.sender.cityId,
                this.sender.districtId
            );
          });
    },
    deliveryMethodChange(val) {
      if (val != 1) {
        this.expressType = 0;
      }
    },
  },
  components: {
    ElButton,
    barcode: VueBarcode,
  },
  // created(){
  //     this.getList();
  // },
  mounted() {
    this.getList();
    this.getAutoStatus();
    this.getDeliveyInfo();
    // this.getSenderInfo();
    this.getAllRegion();
  },
};
</script>

<style scoped>
.filter-input {
  width: 200px !important;
}

.float-right {
  float: right;
}

.d-btn {
  margin-bottom: 10px;
}

.print-footer {
  display: flex;
  justify-content: space-between;
}

.print-footer .f-right {
  display: flex;
  justify-content: flex-end;
}

.btn-beihuo {
  margin-bottom: 22px;
}

.btn-fahuo {
  margin-bottom: 22px;
  margin-left: 30px;
}

.box-check {
  float: left;
}

.filter-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.filter-box .box {
  margin-right: 20px;
  margin-bottom: 10px;
}

.demo-form-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header .left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.header .right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.off-text {
  color: #fff;
  border-radius: 4px;
  background: #594d72;
  line-height: 15px;
  padding: 4px 10px;
  font-size: 12px;
  margin-right: 10px;
}

.status-text {
  color: #f0797f;
  margin-right: 10px;
}

.add-time {
  margin-right: 20px;
}

.pay-time {
  margin-right: 20px;
}

.goods-num {
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
  width: 30%;
  border-right: 1px solid #d1dbe5;
  padding: 20px 10px;
}

.content-wrap .user-wrap {
  width: 16%;
  border-right: 1px solid #d1dbe5;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
}

.content-wrap .user-wrap .avatar-wrap {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
}

.content-wrap .user-wrap .avatar-wrap .avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
}

.content-wrap .user-wrap .avatar-wrap .nickname {
  font-size: 14px;
}

.content-wrap .user-wrap .name {
  width: 100%;
  font-size: 14px;
}

.content-wrap .user-wrap .mobile {
  width: 100%;
  font-size: 14px;
}

.content-wrap .main {
  width: 36%;
  border-right: 1px solid #d1dbe5;
  padding: 20px 10px;
}

.content-wrap .right {
  width: 12%;
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
  border-bottom: 1px solid #f1f1f1;
  padding: 6px 0;
  align-items: center;
}

.goods-list:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.goods-list:first-child {
  padding-top: 0;
}

.dialog-wrap .list-wrap {
  margin-bottom: 10px;
  padding: 10px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.dialog-wrap .goods-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  /*margin-bottom:20px;*/
  /*border-bottom:1px solid #d1dbe5;*/
}

.dialog-wrap .main {
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #d1dbe5;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.dialog-wrap .main div {
  font-size: 14px;
}

.goods-name {
  color: #5e7382;
  font-size: 14px;
  margin: 0 20px 0 10px;
  width: 180px;
}

.goods-spec {
  color: #0066cc;
  font-size: 14px;
  margin-right: 30px;
  width: 60px;
}

.goods-number {
  color: #ff3456;
  font-size: 14px;
  margin-right: 20px;
}

.goods-number label {
  color: #666;
}

.goods-price {
  color: #333;
  font-size: 14px;
  margin-right: 20px;
}

.m1 {
  display: flex;
  justify-content: flex-start;
}

.dialog-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /*background: #f6fdff;*/
  border-bottom: 1px solid #f1f1f1;
}

.dialog-main .l {
  display: flex;
  justify-content: flex-start;
}

.other {
  /*background: #f1f1f1;*/
  border-top: none;
}

.dialog-main .title {
  /*background: #ecf0ff;*/
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
}

.other .title {
  background: #eaeaea;
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
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
}

.user-post {
  color: #333;
  font-size: 14px;
  line-height: 20px;
  margin-top: 4px;
  background-color: #fbf7c5;
  padding: 10px;
}

.detail {
  padding: 10px 0;
}

.receive-detail {
  padding: 10px 0;
}

.user-post-t {
  color: #333;
  font-size: 14px;
  line-height: 20px;
  margin-top: 4px;
  background-color: #fbf7c5;
  padding: 10px;
  margin: 10px 0;
}

.user-admin-t {
  color: #333;
  font-size: 14px;
  line-height: 20px;
  margin-top: 4px;
  background-color: #fde7e7;
  padding: 10px;
  margin: 10px 0;
}

.admin-memo {
  margin-top: 10px;
}

.el-input {
  width: 300px;
}

.address-input {
  margin-left: 10px;
}

.senderInput {
  width: 200px !important;
}

.senderInput .el-input__inner {
  width: 100px;
}

.senderaddressInput {
  width: 530px !important;
  margin-bottom: 10px;
}

.el-checkbox {
  margin-bottom: 22px;
  margin-right: 20px;
}

.express-info {
  padding: 10px;
  color: #ff3456;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
  background: #f0f0f0;
}

.el-form-item {
  margin-bottom: 10px;
}

/*.express-dialog{*/
/*display: flex;*/
/*!*justify-content: center;*!*/
/*}*/
</style>
