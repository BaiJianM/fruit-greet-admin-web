<template>
  <div class="content-page">
    <div class="content-nav">
      <el-breadcrumb class="breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ name: 'nature' }"
        >商品设置
        </el-breadcrumb-item
        >
        <el-breadcrumb-item>{{
            infoForm.id ? "编辑分类" : "添加分类"
          }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="operation-nav">
        <el-button type="primary" @click="goBackPage" icon="arrow-left"
        >返回列表
        </el-button
        >
      </div>
    </div>
    <div class="content-main">
      <div class="form-table-box">
        <el-form
            ref="infoForm"
            :rules="infoRules"
            :model="infoForm"
            label-width="120px"
        >
          <!-- <el-form-item label="上级分类" prop="name">
                        <el-select v-model="infoForm.parentId" placeholder="请选择上级分类">
                            <el-option v-for="item in parentCategory" :key="item.id" :label="item.name"
                                       :value="item.id"></el-option>
                        </el-select>
                    </el-form-item> -->
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="infoForm.name"></el-input>
          </el-form-item>
          <el-form-item label="简短介绍">
            <el-input
                type="textarea"
                v-model="infoForm.frontName"
                :rows="1"
            ></el-input>
            <div class="form-tip"></div>
          </el-form-item>
          <el-form-item
              label="分类图片"
              prop="imgUrl"
              v-if="infoForm.parentId == 0"
          >
            <img
                v-if="infoForm.imgUrl"
                :src="infoForm.imgUrl"
                class="image-show"
            />
            <el-upload
                class="upload-demo"
                name="file"
                :action="qiniuZone"
                :on-remove="bannerRemove"
                :before-remove="beforeBannerRemove"
                :file-list="fileList"
                :on-success="handleUploadBannerSuccess"
                :data="picData"
                :before-upload="getQiNiuToken"
            >
              <el-button v-if="!infoForm.imgUrl" size="small" type="primary"
              >点击上传
              </el-button
              >
            </el-upload>
            <div class="form-tip">
              图片尺寸：顶级分类为690*自定义, 只能上传jpg/png文件
            </div>
          </el-form-item>
          <el-form-item
              label="分类图片高度"
              prop="pHeight"
              v-if="infoForm.parentId == 0"
          >
            <el-input v-model="infoForm.pHeight"></el-input>
          </el-form-item>
          <el-form-item
              label="图标"
              prop="iconUrl"
              v-if="infoForm.parentId == 0"
          >
            <img
                v-if="infoForm.iconUrl"
                :src="infoForm.iconUrl"
                class="image-show"
            />
            <el-upload
                class="upload-demo"
                name="file"
                :action="qiniuZone"
                :on-remove="iconRemove"
                :before-remove="beforeIconRemove"
                :file-list="fileList2"
                :data="picData"
                :on-success="handleUploadIconSuccess"
                :before-upload="getQiNiuToken"
            >
              <el-button v-if="!infoForm.iconUrl" size="small" type="primary"
              >点击上传
              </el-button
              >
            </el-upload>

            <div class="form-tip">
              图片尺寸：图标250*250, 只能上传jpg/png文件
            </div>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number
                v-model="infoForm.sortOrder"
                :min="1"
                :max="1000"
            ></el-input-number>
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
import api from '@/config/api'
import {GetQiNiuDownloadUrl, GetQiNiuToken} from '@/api/welcome'
import {DeleteBannerImage, DeleteIconImage, Info, Store, TopCategory} from "@/api/category";

export default {
  data() {
    return {
      qiniuZone: "",
      fileList: [],
      fileList2: [],
      parentCategory: [
        {
          id: 0,
          name: "顶级分类",
        },
      ],
      infoForm: {
        id: 0,
        name: "",
        parentId: 0,
        frontName: "",
        imgUrl: "",
        sortOrder: 100,
        iconUrl: "",
        pHeight: 0,
        // is_show: true,
      },
      infoRules: {
        name: [{required: true, message: "请输入名称", trigger: "blur"}],
        frontName: [
          {required: true, message: "请输入简介", trigger: "blur"},
        ],
        imgUrl: [
          {required: true, message: "请选择分类图片", trigger: "blur"},
        ],
        iconUrl: [
          {required: true, message: "请选择分类图标", trigger: "blur"},
        ],
        pHeight: [
          {required: true, message: "请输入分类图片高度", trigger: "blur"},
        ]
      },
      picData: {
        token: "",
      },
      url: "",
    };
  },
  methods: {
    getQiNiuToken() {
      let that = this;
      this.$request.get(GetQiNiuToken).then((response) => {
        let resInfo = response.data;
        console.log(resInfo);
        that.picData.token = resInfo.token;
        that.url = resInfo.url;
      });
    },
    beforeBannerRemove(file, fileList) {
      return this.$confirm(`确定移除该图？删除后将无法找回`);
    },
    beforeIconRemove(file, fileList) {
      return this.$confirm(`确定移除图标？删除后将无法找回`);
    },
    bannerRemove(file, fileList) {
      this.infoForm.imgUrl = "";
      let id = this.infoForm.id;
      this.$request.post(DeleteBannerImage + "?id=" + id)
          .then((response) => {
            this.$message({
              type: "success",
              message: "删除成功",
            });
          });
    },
    iconRemove(file, fileList) {
      this.infoForm.iconUrl = "";
      let id = this.infoForm.id;
      this.$request.post(DeleteIconImage + "?id=" + id)
          .then((response) => {
            this.$message({
              type: "success",
              message: "删除成功",
            });
          });
    },
    goBackPage() {
      this.$router.go(-1);
    },
    onSubmitInfo() {
      this.infoForm.level = this.infoForm.parentId == 0 ? "L1" : "L2";
      this.infoForm.imgUrl = this.infoForm.imgUrl.split('?')[0];
      this.infoForm.iconUrl = this.infoForm.iconUrl.split('?')[0];
      this.infoForm.pHeight = Number(this.infoForm.pHeight)
      this.$refs["infoForm"].validate((valid) => {
        if (valid) {
          this.$request.post(Store, this.infoForm).then((response) => {
            this.$message({
              type: "success",
              message: "保存成功",
            });
            // 跳转到第一个页面并设置pIndex为0，确保定位到第一个tab
            this.$router.push({path: '/dashboard/nature', query: {tab: 'first'}})
          });
        } else {
          return false;
        }
      });
    },
    handleUploadBannerSuccess(res, file) {
      this.$request.get(GetQiNiuDownloadUrl, {key: res.key}).then((response) => {
        this.infoForm.imgUrl = response.data
      });
    },
    handleUploadIconSuccess(res, file) {
      this.$request.get(GetQiNiuDownloadUrl, {key: res.key}).then((response) => {
        this.infoForm.iconUrl = response.data
      });
    },
    getTopCategory() {
      this.$request.get(TopCategory).then((response) => {
        this.parentCategory = this.parentCategory.concat(response.data);
      });
    },
    getInfo() {
      if (this.infoForm.id <= 0) {
        return false;
      }
      //加载分类详情
      let that = this;
      this.$request.get(Info, {id: that.infoForm.id})
          .then((response) => {
            let resInfo = response.data;
            console.log(resInfo);
            let data = {
              name: "分类图",
              url: resInfo.imgUrl,
            };
            this.fileList.push(data);
            let iconData = {
              name: "图标",
              url: resInfo.iconUrl,
            };
            this.fileList2.push(iconData);
            that.infoForm = resInfo;
          });
    },
  },
  mounted() {
    this.getTopCategory();
    this.infoForm.id = this.$route.query.id || 0;
    this.getInfo();
    this.qiniuZone = api.qiniu;
    this.getQiNiuToken();
  },
};
</script>

<style scoped>
.image-uploader {
  height: 105px;
}

.image-uploader .el-upload {
  border: 1px solid #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #20a0ff;
}

.image-uploader .image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  min-width: 105px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}

.image-show {
  background-color: #f8f8f8;
  min-width: 105px;
  height: 105px;
  display: block;
}
</style>
