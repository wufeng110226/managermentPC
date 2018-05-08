<template>
	<section v-loading="loading">
		<el-table :data="allAdminList" border style="width:100%">
			<el-table-column prop="userName" label="用户名"></el-table-column>
			<el-table-column prop="identity" label="权限">
				<template scope="scope">
		    		<el-tag v-if="scope.row.identity == 1" type="warning" close-transition>超级管理</el-tag>
		        	<el-tag v-else-if="scope.row.identity == 2" type="success" close-transition>财务</el-tag>
		        	<el-tag v-else-if="scope.row.identity == 3" type="danger" close-transition>业务</el-tag>
		        	<el-tag v-else-if="scope.row.identity == 4" type="danger" close-transition>市场</el-tag>
		      	</template>
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="filterTime"></el-table-column>
			<el-table-column label="操作" width="330">
				<template scope="scope">
					<el-button size="small" type="warning" @click="resetPwd(scope.row)"><i class="fa fa-recycle fa-fw fa-lg"></i>重置密码</el-button>
					<el-button size="small" type="info" v-if="scope.row.identity == 4" @click="checkMchlist(scope.row)"><i class="fa fa-user-plus fa-fw fa-lg"></i>查看商户列表</el-button>
					<el-button size="small" type="danger" @click="deleteAdmin(scope.row)"><i class="fa fa-trash-o fa-fw fa-lg"></i>删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getAlladminList" style="float:right;"></el-pagination>
		</el-col>
		
		<!--支付接口dialog-->
		<el-dialog title="分配商户" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" class="specialDialog">
			<el-checkbox-group v-model="checkMchArr" style="display: flex;flex-wrap:wrap;">
			    <el-checkbox v-for="(item, index) in mchList" :label="item.mchId" :key="item.mchId" style="width:18%;margin-bottom:10px;overflow: hidden;margin-right:2%;">{{item.mchName}}</el-checkbox>
			</el-checkbox-group>
			<div slot="footer">
				<el-button @click="conformPost">确定</el-button>
				<el-button @click="cancelEdit('cancelAllotmch')">关闭</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				total:0,
				pageIndex:1,
				pageSize:20,
				allAdminList:[],
				mchList:[],              //商户列表
				_cacheUid:'',            //用户uid暂存          
				checkMchArr:[],          //被选择的mchlist数组
 				dialogFormVisible:false
			}
		},
		methods: {
			resetPwd(scope){
				let form
				this.$confirm('此操作将重置用户密码，是否继续？','警告',{
					confirmButtonText:'确定',
					cancelButtonText:'取消',
					type:'warning'
				}).then(() => {
					form = {
						uid:scope.uid,
						mchId:0,
						newPassword:'admin'
					}
					this.loading = true;
					this.$http.post(httpUrl.resetPassword,form)
						.then(
							response => {
								this.loading = false;
								if(response.body.code == '200'){
									this.$notify({
							          title: '通知',
							          message: '管理员：'+scope.userName+'的密码已经被重置为admin',
							          type: 'success'
							        });
								}else{
									this.$message.error(response.body.result);
								}
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
							}
						)
				}).catch(() => {
					/*取消*/
				})
			},
			deleteAdmin(scope){
				this.$confirm('此操作将永久删除该用户，是否继续？','警告',{
					confirmButtonText:'确定',
					showCancelButton:false,
					type:'warning'
				}).then(() => {
					let form = {
						uid:scope.uid
					}
					this.loading = true;
					this.$http.post(httpUrl.operaAdmin,form)
						.then(
							response => {
								this.loading = false;
								if(response.body.code == '200'){
									this.$message.success('修改成功！');
								}else{
									this.$message.error(response.body.result);
								}
								this.getAlladminList();
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
								this.getAlladminList();
							}
						)
				}).catch(() => {
					/*取消*/
				})
			},
			checkMchlist(scope){
				this.checkMchArr = (scope.viewMchList == '') ? [] : JSON.parse(scope.viewMchList);
				this._cacheUid = scope.uid;
				this.dialogFormVisible = true;
			},
			conformPost(){
				const form = {
					uid:this._cacheUid,
					viewMchList:JSON.stringify(this.checkMchArr),
					code:1
				}
				this.$http.post(httpUrl.operaViewMchList,form)
					.then(
						response => {
							if(response.body.code == '200'){
								this.checkMchArr = [];
								this._cacheUid = '';
								 this.$message({message: '分配商户成功',type: 'success'});
								this.dialogFormVisible = false;
								this.getAlladminList();
							}else{
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			cancelEdit(formName){
				this.checkMchArr = [];
				this._cacheUid = '';
				this.dialogFormVisible = false;
			},
			getmchList(){  //获取商户列表
				const form = {
					pageIndex:"1",
					pageSize:"100"
				}
				this.$http.post(httpUrl.getMchInfos,form)
					.then(
						response => {
							if(response.body.code == '200'){
								this.mchList = response.body.result.mchInfosList.list;
							}else{
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			getAlladminList(val){
				this.loading = true;
				if(val) this.pageIndex = val;
				const form = {
					pageIndex:this.pageIndex,
					pageSize:this.pageSize
				}
				this.$http.post(httpUrl.getAllAdmin,form)
					.then(
						response => {
							this.loading = false;
							if(response.body.code == '200'){
								this.total = response.body.result.total;
								this.allAdminList = response.body.result.list;
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			filterTime(row, column){
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			}
		},
		mounted(){
			this.getAlladminList();
			this.getmchList();
		}
	}
</script>

<style lang="scss">
	.specialDialog {
		.el-dialog {
			width:auto;
		}
	}
	.el-checkbox+.el-checkbox {
		margin-left:0;
	}
</style>