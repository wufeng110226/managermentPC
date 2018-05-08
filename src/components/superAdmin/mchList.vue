<template>
	<section v-loading.fullscreen.lock="loading">
		<el-table :data="mchList" ref="multipleTable" border style="width: 100%" @selection-change="handleSelectionChange">
			<el-table-column type="selection" width="45"></el-table-column>
			<el-table-column prop="mchId" label="商户ID" width="85"></el-table-column>
			<el-table-column prop="mchName" label="昵称"></el-table-column>
			<el-table-column prop="userName" label="用户名"></el-table-column>
			<el-table-column prop="settlementAccount" label="结算账户" width="200"></el-table-column>
			<el-table-column prop="mchMobile" label="手机号" width="130"></el-table-column>
			<el-table-column prop="notifyNum" label="短信通知次数" width="130"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="filterTime" width="120"></el-table-column>
			<el-table-column prop="updateTime" label="更新时间" :formatter="filterTime" width="120"></el-table-column>
			<el-table-column prop="rate" label="费率%" width="80"></el-table-column>
			<el-table-column label="操作" width="330">
				<template scope="scope">
					<el-button size="small" icon="edit" type="primary" @click="handleClick(scope.row)">基本信息编辑</el-button>
					<el-button size="small" type="warning" @click="resetPwd(scope.row)"><i class="fa fa-recycle fa-fw fa-lg"></i>重置密码</el-button>
					<el-button size="small" type="danger" @click="deleteMch(scope.row)"><i class="fa fa-trash-o fa-fw fa-lg"></i>删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-button @click="editBatch" type="primary" icon="menu">批量编辑费率</el-button>
			<el-button @click="addMch" type="danger" icon="plus">添加商户</el-button>
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getmchList" style="float:right;"></el-pagination>
		</el-col>
		
		
		<!--批量编辑dialog-->
		<el-dialog title="批量编辑" :visible.sync="BdialogFormVisible" size="small" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-form :model="batchForm" ref="batchForm">
				<el-form-item prop="rate" label="费率">
					<el-input v-model="batchForm.rate" class="popInputWidth"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="cancelEdit('batchForm')">取 消</el-button>
				<el-button type="primary" @click="submitForm('batchEdits','batchForm')">保存</el-button>
			</div>
		</el-dialog>
		
		
		<!--列编辑dialog-->
		<el-dialog title="修改用户配置" :visible.sync="SdialogFormVisible" size="tiny" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-form :model="singleForm" :rules="singleFormrules" ref="singleForm">
				<el-form-item prop="mchName" label="商户名称">
					<el-input v-model="singleForm.mchName" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="rate" label="费率">
					<el-input v-model="singleForm.rate" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="" label="手机号">
					<el-input v-model="singleForm.mchMobile" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="" label="通知次数">
					<el-input type="number" v-model="singleForm.notifyNum" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item label="开户行">
					<el-input v-model="singleForm.settlementInfo.bank" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item label="开户支行">
					<el-input v-model="singleForm.settlementInfo.branch" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="settlementAccount" label="结算账号">
					<el-input v-model="singleForm.settlementAccount" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="single" label="单笔限额">
					<el-input placeholder="输入0为不限" v-model.number="singleForm.single" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item label="支付方式">
					<el-select v-model="singleForm.channelList" placeholder="请选择支付方式" class="popInputWidth">
					    <el-option
					      v-for="(item, index) in channelList"
					      :key="item.bankId"
					      :label="item.bankName"
					      :value="item.bankId">
					    </el-option>
					</el-select>
				</el-form-item>
				
				<el-form-item prop="daily" label="日限额">
					<el-input placeholder="输入0为不限" v-model.number="singleForm.daily" class="popInputWidth"></el-input>
				</el-form-item>
				
				<el-form-item prop="total" label="总限额">
					<el-input placeholder="输入0为不限" v-model.number="singleForm.total" class="popInputWidth"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="cancelEdit('singleForm')">取消</el-button>
				<el-button type="primary" @click="submitForm('singleEdit','singleForm')">保存</el-button>
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
				pageSize:10,
				BdialogFormVisible:false, //批量编辑表单弹出框显隐
				SdialogFormVisible:false, //单独编辑表单弹出框显隐
				channelList:[],			  //支付列表
				checkChannelList:[],      //被选择的支付列表
				_mchId:'',				  //商户ID暂存
				mchList:[],               //商户列表
				multipleSelection:[],     //批量被选择商户数组 
				_singleUserCacheData:{},  //单条商户信息暂存
				batchForm:{               //批量编辑表单
					rate: 0
				},
				singleForm:{              //单独编辑表单
					settlementInfo:{
						bank:'',
						branch:''
					},
					rate: 0,
					settlementAccount:'',
					channelList:[],
					mchName:'',
					single:'',
					daily:'',
					total:''
				},
				singleFormrules: {
					single:[{required: true,message: '请输入单笔限额',trigger: 'blur',type:'number',pattern: /.+/}],
					daily:[{required: true,message: '请输入日限额',trigger: 'blur',type:'number',pattern: /.+/}],
					total:[{required: true,message: '请输入总限额',trigger: 'blur',type:'number',pattern: /.+/}]
				}
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
						uid:0,
						mchId:scope.mchId,
						newPassword:'123456'
					}
					this.loading = true;
					this.$http.post(httpUrl.resetPassword,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.loading = false;
									this.$notify({
							          title: '通知',
							          message: '用户：'+scope.userName+'的密码已经被重置为123456',
							          type: 'success'
							        });
								}else{
									this.loading = false;
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
			addMch(){           //添加商户
				this.$router.push('/addAccount');
			},
			deleteMch(scope){   //删除商户
				this.$confirm('此操作将永久删除该用户，是否继续？','警告',{
					confirmButtonText:'确定',
					showCancelButton:false,
					type:'warning'
				}).then(() => {
					let _sendData = [];
					_sendData.push(scope);
					this.loading = true;
					this.$http.post(httpUrl.operaMchInfos_2,JSON.stringify(_sendData),{
						'headers':{
							'Content-Type':'application/json;charset=UTF-8'
						}
					})
						.then(
							response => {
								if(response.body.code == '200'){
									this.loading = false;
									this.$message.success('删除成功！');
								}else{
									this.loading = false;
									this.$message.error(response.body.result);
								}
								this.getmchList();
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
								this.getmchList();
							}
						)
				}).catch(() => {
					/*取消*/
				})
			},
			handleClick(scope){  //单独项编辑
				this._singleUserCacheData = {};
				this._singleUserCacheData = scope;
				let quota = (this._singleUserCacheData.quota == '') ? '' : JSON.parse(this._singleUserCacheData.quota);
				this.singleForm = {
					rate:this._singleUserCacheData.rate,
					settlementInfo:(this._singleUserCacheData.settlementInfo == '') ? '' : JSON.parse(this._singleUserCacheData.settlementInfo),
					channelList:this._singleUserCacheData.channelList,
					settlementAccount:this._singleUserCacheData.settlementAccount,
					mchMobile:this._singleUserCacheData.mchMobile,
					notifyNum:this._singleUserCacheData.notifyNum,
					mchName:this._singleUserCacheData.mchName,
					single:parseFloat(quota.single),
					daily:parseFloat(quota.daily),
					total:parseFloat(quota.total)
				}
				this.SdialogFormVisible = true;
			},
			submitForm(type,formName){ //批量-弹框表单提交
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let _sendData = [];
						
						if(type == 'batchEdits'){
							for(let i=0;i<this.multipleSelection.length;i++){
								this.multipleSelection[i].rate = this[formName].rate;
								this.multipleSelection[i].updateTime = new Date().getTime();
							}
							_sendData = this.multipleSelection;
						}else if(type == 'singleEdit'){
							
							let cachequota = {
								single:this[formName].single,
								daily:this[formName].daily,
								total:this[formName].total
							}
							this._singleUserCacheData.rate = this[formName].rate;
							this._singleUserCacheData.settlementAccount = this[formName].settlementAccount;
							this._singleUserCacheData.settlementInfo = {
								bank:this[formName].settlementInfo.bank,
								branch:this[formName].settlementInfo.branch,
							}
							/*这里遇见坑，分配支付方式为空的时候不能给channelRole一个空对象"",要给一个空的包含大括号的对象"[]"*/
							this._singleUserCacheData.channelRole = (this[formName].channelRole == '') ? "[]" : JSON.stringify(this[formName].channelRole);
							this._singleUserCacheData.channelList = this[formName].channelList;
							this._singleUserCacheData.mchName = this[formName].mchName
							this._singleUserCacheData.updateTime = new Date().getTime();
							this._singleUserCacheData.settlementInfo = JSON.stringify(this[formName].settlementInfo);
							this._singleUserCacheData.quota = JSON.stringify(cachequota);
							this._singleUserCacheData.mchMobile = this[formName].mchMobile;
							this._singleUserCacheData.notifyNum = this[formName].notifyNum;
							_sendData.push(this._singleUserCacheData);
						}
						/*this.loading = true;
						this.$http.post(httpUrl.operaMchInfos_1,JSON.stringify(_sendData),{
							'headers':{
								'Content-Type':'application/json;charset=UTF-8'
							}
						})
							.then(
								response => {
									if(response.body.code == '200'){
										this.loading = false;
										this.$message.success('批量修改成功！');
										this.cancelEdit(formName);
									}else{
										this.loading = false;
										this.$message.error(response.body.result);
										this.cancelEdit(formName);
									}
								},
								response => {
									this.loading = false;
									this.$message.error('服务器连接失败，请稍后重试！');
									this.cancelEdit(formName);
								}
							)*/
					}
				})
			},
			handleSelectionChange(val){ //选中项数据
				this.multipleSelection = val;
			},
			editBatch(){   //点击批量编辑按钮
				if(this.multipleSelection.length > 0){
					this.BdialogFormVisible = true;
				}else{
					this.$message.error('您没有选择任何商户，不能跨页多选！');
				}
			},
			cancelEdit(formName){  //取消批量编辑，重置表格选择，重置表单内容
				if(formName == 'cancelAllotChannel'){
					this._mchId = '';
					this.checkChannelList = [];
					this.CdialogFormVisible = false;
					return;
				}else if(formName == 'singleForm'){
					this[formName].settlementInfo = {
						bank:'',
						branch:''
					}
					this[formName].channelList = '';
					this.getmchList();
				}
				this.BdialogFormVisible = false;
				this.SdialogFormVisible = false;
				this.$refs.multipleTable.clearSelection();
				this.$refs[formName].resetFields();
				this[formName].rate = 0;
			},
			getmchList(val){  //获取商户列表
				this.loading = true;
				if(val) this.pageIndex = val;
				const form = {
					pageIndex:this.pageIndex,
					pageSize:this.pageSize
				}
				this.$http.post(httpUrl.getMchInfos,form)
					.then(
						response => {
							if(response.body.code == '200'){
								this.total = response.body.result.mchInfosList.total;
								this.mchList = response.body.result.mchInfosList.list;
								this.loading = false;
							}else{
								this.loading = false;
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			getAllChannelList(){  //获取支付列表
				const form = {
					pageIndex:1,
					pageSize:50
				}
				this.$http.post(httpUrl.getAllChannel,form)
					.then(
						response => {
							if(response.body.code == '200'){
								let allChannelList = response.body.result.thirdMchChannels.list;
								let ChannelList = [];
								for(let i=0;i<allChannelList.length;i++){
									let str = {
										bankId:allChannelList[i].bankId + "",
										bankName:allChannelList[i].bankName
									}
									ChannelList.push(str);
									this.channelList = ChannelList;
								}
							}else{
								this.$message.error('获取支付列表失败，请刷新页面重试！');
							}
						},
						response => {
							this.loading = false;
							this.$message.error('获取支付列表失败，请刷新页面重试！');
						}
					)
			},
			filterTime(row, column){  //筛选时间转换成YYYY-MM-DD
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			}
		},
		mounted(){  //页面加载默认执行获取商户列表和支付列表
			this.getmchList();
			this.getAllChannelList();
		}
	}
</script>

<style lang="scss">
	.specialDialog {
		.el-dialog {
			width:auto;
		}
	}
</style>
<style lang="scss" scoped>
	.rates {
		width:50%;
		margin-left:80px;
	}
	.popInputWidth {
		width:30%;
		display: block;
		margin-left:80px;
	}
	.cancelX {
	    position: absolute;
	    right:0;
	    top: 25px;
	}
	.timeSelect {
		width:150px;
	}
</style>