<template>
	<div class="content-page">
		<div class="content-nav">
			<el-breadcrumb class="breadcrumb" separator="/">
				<el-breadcrumb-item>用户列表</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="content-main">
			<div class="filter-box">
				<el-form :inline="true" :model="filterForm" class="demo-form-inline">
					<el-form-item label="用户昵称">
						<el-input v-model="filterForm.nickname" placeholder="用户昵称"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onSubmitFilter">查询</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div class="form-table-box">
				<el-table :data="tableData" style="width: 100%" border stripe>
					<el-table-column prop="id" label="ID" width="60">
					</el-table-column>
					<el-table-column label="头像" width="80">
						<template slot-scope="scope">
							<img :src="scope.row.avatar" alt="" style="width: 50px;height: 50px">
						</template>
					</el-table-column>
					<!--<el-table-column prop="username" label="会员名称">-->
					<!--</el-table-column>-->
					<el-table-column prop="nickname" label="昵称">
						<template slot-scope="scope">
							<el-input v-model="scope.row.nickname" placeholder="昵称" @blur="submitNick(scope.$index, scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="gender" label="性别" width="120">
						<template slot-scope="scope">
							{{ scope.row.gender == 2 ? '女' : '男' }}
						</template>
					</el-table-column>
					<!--<el-table-column prop="mobile" label="手机号"></el-table-column>-->
					<el-table-column prop="register_time" label="注册时间" width="180">
					</el-table-column>
					<el-table-column prop="last_login_time" label="最近登录" width="180">
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="scope">
							<el-button size="small" @click="handleRowEdit(scope.$index, scope.row)">编辑</el-button>
							<!-- <el-button plain size="small" type="danger" @click="handleRowDelete(scope.$index, scope.row)">删除</el-button> -->
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="page-box">
				<el-pagination background @size-change="handleSizeChange" @current-change="handlePageChange" :current-page.sync="page" 
				:page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			page: 1,
			total: 0,
			filterForm: {
				name: ''
			},
			tableData: [],
            loginInfo:null,
            username:''
		}
	},
	methods: {
        submitNick(index, row){
            this.axios.post('user/updateInfo', { id: row.id,nickname:row.nickname }).then((response) => {

            })
		},
		handleSizeChange(val) {
			this.size = val;
			//保存到localStorage
			localStorage.setItem('userPage', this.page)
			this.getList()
		},
		handlePageChange(val) {
			this.page = val;
			//保存到localStorage
			localStorage.setItem('userPage', this.page)
			this.getList()
		},
		handleRowEdit(index, row) {
			this.$router.push({ name: 'user_add', query: { id: row.id } })
		},
		handleRowDelete(index, row) {

			this.$confirm('确定要删除?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {

				this.axios.post('user/destory?id=' + row.id).then((response) => {
					console.log(response.data)
					if (response.data.code === 200) {
						this.$message({
							type: 'success',
							message: '删除成功!'
						});

						this.getList();
					}
				})


			});
		},
		onSubmitFilter() {
			this.page = 1
			this.getList()
		},
		getList() {
			this.axios.get('user', {
				params: {
					page: this.page,
                    nickname: this.filterForm.nickname
				}
			}).then((response) => {
                this.tableData = response.data.data.records;
                this.page = response.data.data.current;
                this.total = response.data.data.total;
			})
            if(!this.loginInfo){
                this.loginInfo = JSON.parse(window.localStorage.getItem('userInfo') || null);
                this.username = this.loginInfo.username;
            }
		}
	},
	components: {

	},
	mounted() {
		let thePage = localStorage.getItem('userPage');
        if(thePage == null){
            thePage = 1;
        }
		this.page = Number(thePage);
        console.log(this.page);
		this.getList();
	}
}

</script>

<style scoped>

</style>
