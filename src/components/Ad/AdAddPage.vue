<template>
    <div class="content-page">
        <div class="content-nav">
            <el-breadcrumb class="breadcrumb" separator="/">
                <el-breadcrumb-item :to="{ name: 'ad' }">广告列表</el-breadcrumb-item>
                <el-breadcrumb-item>{{infoForm.id ? '编辑广告' : '添加广告'}}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="operation-nav">
                <!--<el-button type="primary" @click="test" icon="arrow-left">test</el-button>-->
                <el-button type="primary" @click="goBackPage" icon="arrow-left">返回列表</el-button>
            </div>
        </div>
        <div class="content-main">
            <div class="form-table-box">
                <el-form ref="infoForm" :rules="infoRules" :model="infoForm" label-width="120px">
					<el-form-item label="广告图片" prop="image_url" v-if="infoForm.imageUrl" class="image-uploader-diy new-height">
						<div class="index-image">
							<el-image :preview-src-list="previewList" v-if="infoForm.imageUrl" :src="infoForm.imageUrl" @click="previewIndexImg"
							 class="image-show" fit="cover"></el-image>
							<div class="o-shadow" @click="delePicList">
								<i class="el-icon-delete"></i>
							</div>
						</div>
					</el-form-item>
					<el-form-item label="广告图片" prop="image_url" v-if="!infoForm.imageUrl">
						<el-upload name="file" ref="upload" class="upload-demo" :action="qiniuZone" :on-success="handleSuccess"
						 :before-upload="getQiniuToken" :auto-upload="true" list-type="picture-card" :data="picData" :http-request="uploadIndexImg">
							<el-button size="small" type="primary">点击上传</el-button>
							<div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
						</el-upload>
					</el-form-item>
                    <el-form-item label="商品类型">
                        <el-radio-group v-model="infoForm.linkType">
                            <el-radio :label="0">商品id</el-radio>
                            <el-radio :label="1">链接</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="广告链接" prop="link" v-if="infoForm.linkType == 1">
                        <el-input class="link-input" v-model="infoForm.link"></el-input>
                    </el-form-item>
                    <el-form-item label="商品id" prop="link" v-if="infoForm.linkType == 0">
                        <el-input class="id-input" v-model="infoForm.goodsId"></el-input>
                        <el-popover
                                placement="right"
                                v-model="related_pop"
                        >
                            <el-table :data="chooseRelateGoods" stripe style="width: 100%">
                                <el-table-column prop="id" label="id" width="100"></el-table-column>
                                <el-table-column prop="list_pic_url" label="商品图片" width="120">
                                    <template slot-scope="scope">
                                        <img :src="scope.row.list_pic_url" alt="" style="width: 40px;height: 40px">
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" label="商品名称" width="300px"></el-table-column>
                                <el-table-column label="操作">
                                    <template slot-scope="scope">
                                        <el-button
                                                size="small"
                                                type="danger"
                                                @click="relateSelect(scope.row.id)">选择
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-button slot="reference" type="primary" @click="relateGoodsClick">添加关联商品</el-button>
                        </el-popover>
                    </el-form-item>
                    <el-form-item label="结束时间" prop="end_time">
                        <el-date-picker
                                v-model="infoForm.endTime"
                                type="datetime"
                                placeholder="选择日期"
                                default-time="23:59:59">
                            >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="排序" prop="sort_order">
                        <el-input-number v-model="infoForm.sortOrder" :min="1" :max="999"></el-input-number>
                    </el-form-item>
                    <el-form-item label="广告启用">
                        <el-switch active-value="1" inactive-value="0" v-model="infoForm.enabled"></el-switch>
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
    import api from '@/config/api';
	import lrz from 'lrz'
	import moment from 'moment'
    export default {
        data() {
            return {
                qiniuZone:'',
                root: '',
                fileList: [],
                infoForm: {
                    id: 0,
                    imageUrl: '',
                    linkType: 0,
                    enabled: false,
                    endTime: '',
                    goodsId:0,
                    link:''
                },
                infoRules: {
                    image_url: [
                        {required: true, message: '请输入广告图片', trigger: 'blur'},
                    ],
                    end_time: [
                        {required: true, message: '请选择时间', trigger: 'blur'},
                    ],
                },
                picData: {
                    token: ''
                },
                url: '',
                chooseRelateGoods: [],
                related_pop: false,
				previewList: [],
            }
        },
        methods: {
			handleSuccess(){},
			previewIndexImg() {
				let that = this;
				that.previewList = [];
				that.previewList.push(that.infoForm.imageUrl);
			},
			delePicList() {
				let that = this;
				that.$confirm('确定删除该图片?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					})
					.then(() => {
						that.infoForm.imageUrl = '';
					})
					.catch(() => {})
			},
			uploadIndexImg(request) {
				const file = request.file;
				lrz(file).then((rst) => {
					const config = {
						headers: {
							'Content-Type': 'multipart/form-data'
						},
					};
					const fileName = moment().format('YYYYMMDDHHmmssSSS') + Math.floor(Math.random() * 100) + file.name; //自定义图片名
					const formData = new FormData();
					formData.append('file', rst.file);
					formData.append('token', this.picData.token);
					formData.append('key', fileName);
					this.$http.post(this.qiniuZone, formData, config).then((res) => {
						this.handleUploadImageSuccess(res.data)
					})
				}).catch(function(err){
					console.log(err)
				})
			},
			handleUploadImageSuccess(res, file) {
			    let url = this.url;
			    this.infoForm.imageUrl = url + res.key;
			},
            relateSelect(id) {
                console.log(id);
                this.infoForm.goodsId = id;
                this.related_pop = false;
            },
            relateGoodsClick() {
                this.axios.post('ad/getallrelate', {id: this.infoForm.id}).then((response) => {
                    if (response.data.code === 200) {
                        this.chooseRelateGoods = response.data.data
                    }
                });
            },
            test() {
                console.log(this.infoForm.endTime);
            },
            beforeAdRemove() {
                return this.$confirm(`确定移除？`);
            },
            adRemove(file, fileList) {
                this.infoForm.imageUrl = '';
            },
            getQiniuToken() {
                let that = this
                this.axios.post('index/getQiniuToken').then((response) => {
                    let resInfo = response.data.data;
                    console.log(resInfo);
                    that.picData.token = resInfo.token;
                    that.url = resInfo.url;
                })
            },
            goBackPage() {
                this.$router.go(-1);
            },
            onSubmitInfo() {
                console.log(this.infoForm);
                // return false;
                let time = this.infoForm.endTime
                if (time == 0) {
                    this.$message({
                        type: 'error',
                        message: '请选择时间'
                    });
                    return false;
                }
                if (this.infoForm.linkType == 0) {
                    if(this.infoForm.goodsId == 0 ){
                        this.$message({
                            type: 'error',
                            message: '请选择商品'
                        });
                        return false;
                    }
                }
                if (this.infoForm.linkType == 1) {
                    if(this.infoForm.link == '' ){
                        this.$message({
                            type: 'error',
                            message: '请输入链接'
                        });
                        return false;
                    }
                }
                this.$refs['infoForm'].validate((valid) => {
                    if (valid) {
                        this.axios.post('ad/store', this.infoForm).then((response) => {
                            if (response.data.code === 200) {
                                this.$message({
                                    type: 'success',
                                    message: '保存成功'
                                });
                                this.$router.go(-1);
                            } else if (response.data.code === 100) {
                                this.$message({
                                    type: 'error',
                                    message: '该商品已经有广告关联'
                                })
                            }
                            else {
                                this.$message({
                                    type: 'error',
                                    message: '保存失败'
                                })
                            }
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
                //加载广告详情
                let that = this
                this.axios.get('ad/info', {
                    params: {
                        id: that.infoForm.id
                    }
                }).then((response) => {
                    let resInfo = response.data.data;
                    that.infoForm = resInfo;
                    that.infoForm.endTime = resInfo.end_time * 1000;
                    let info = {
                        name: resInfo.name,
                        url: resInfo.image_url
                    };
                    this.fileList.push(info);
                    console.log(this.infoForm);
                })
            }
        },
        components: {},
        mounted() {
            this.infoForm.id = this.$route.query.id || 0;
            this.getInfo();
            this.root = api.rootUrl;
            this.getQiniuToken();
            this.qiniuZone = api.qiniu;
        }
    }

</script>

<style scoped>
    .image-show {
		width: 375px;
		height: 220px;
		background-color: #f9f9f9;
		display: block;
	}

    .id-input {
        margin-bottom: 20px;
    }

    .link-input .el-input__inner {
        width: 400px !important;
    }
	
	.o-shadow {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background-color: rgba(0, 0, 0, .5);
		opacity: 0;
		transition: opacity .3s;
		color: #fff;
		font-size: 20px;
		line-height: 20px;
		padding: 10px;
		cursor: pointer;
	}
	
	.index-image {
		width: 375px;
		height: 220px;
		position: relative;
	}
	
	.index-image:hover .o-shadow {
		opacity: 1;
	}
</style>