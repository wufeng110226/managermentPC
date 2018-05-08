<template>
	<section v-loading.fullscreen.lock="loading">
		<el-table :data="allChannelList" border style="width:100%" :row-class-name="tableRowClassName">
			<el-table-column prop="agentNo" label="机构号"></el-table-column>
			<el-table-column prop="customerNo" label="上游商户号"></el-table-column>
			<el-table-column prop="bankName" label="对接上游名称">
				<template scope="scope">
			        <el-tag type="gray" close-transition>{{scope.row.bankName}}</el-tag>
			    </template>
			</el-table-column>
			<el-table-column prop="rate" label="费率"></el-table-column>
			<el-table-column prop="secretKey" label="秘钥"></el-table-column>
			<el-table-column prop="url" label="请求地址"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="filterTime"></el-table-column>
			<el-table-column prop="updateTime" label="更新时间" :formatter="filterTime"></el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" icon="edit" type="primary" @click="editChannel(scope.row)">编辑</el-button>
					<!--<el-button size="small" icon="edit" type="danger" @click="deleteChannel(scope.row)">删除</el-button>-->
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getAllChannelList" style="float:right;"></el-pagination>
		</el-col>
		
		<!--支付编辑-->
		<el-dialog title="编辑" :visible.sync="CdialogFormVisible" size="tiny" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-form :model="ChannelForm" :rules="rules" ref="ChannelForm">
				<el-form-item prop="url" label="请求URL">
					<el-input v-model="ChannelForm.url" class="popInputWidth"></el-input>
				</el-form-item>
		
				<el-form-item prop="rate" label="费率">
					<el-input v-model="ChannelForm.rate" class="popInputWidth"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="postChannel('ChannelForm')">确定</el-button>
				<el-button @click="cancelEdit">取消</el-button>
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
				allChannelList:[],
				CdialogFormVisible:false,
				code:'',
				ChannelForm:{
					id:'',
					url:'',
					rate:''
				},
				rules: { //规则筛选
					url: [{
						required: true,
						message: '请输入请求URL',
						trigger: 'blur'
					}]
				}
			}
		},
		methods: {
			tableRowClassName(row, index){   //如果权重为0时变色
				if(row.weight == '0'){
					return 'dangersRow';
				}
			},
			editChannel(scope){      //编辑支付
				this.code = '3';
				this.ChannelForm = scope;
				this.CdialogFormVisible = true;
			},
			/*deleteChannel(scope){    //删除支付
				this.$confirm('此操作将永久删除该支付方式，是否继续？','警告',{
					confirmButtonText:'确定',
					cancelButtonText:'取消',
					type:'warning'
				}).then(_ => {
						this.code = '2';
						this.ChannelForm.id = scope.id;
						this.postChannel();
				}).catch(_ => {
					
				})
			},*/
			postChannel(formName){           //提交增删改
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loading = true;
						let form = {
							id:this.ChannelForm.id,
							url:this.ChannelForm.url,
							rate:(this.ChannelForm.rate == '') ? 0 : this.ChannelForm.rate,
							code:this.code
						}
						this.$http.post(httpUrl.operaChannel,form)
							.then(
								response => {
									if(response.body.code == '200'){
										this.$message.success('操作成功！');
									}else{
										this.loading = false
										this.$message.error(response.body.result);
									}
									this.cancelEdit();
								},
								response => {
									this.cancelEdit();
									this.loading = false;
									this.$message.error('服务器连接失败，请稍后重试！');
								}
							)
					}
				})
			},
			getAllChannelList(val){  //获取支付列表
				this.loading = true;
				if(val) this.pageIndex = val;
				const form = {
					pageIndex:this.pageIndex,
					pageSize:this.pageSize
				}
				this.$http.post(httpUrl.getAllChannel,form)
					.then(
						response => {
							console.log(response);
							if(response.body.code == '200'){
								this.loading = false;
								this.total = response.body.result.thirdMchChannels.total;
								this.allChannelList = response.body.result.thirdMchChannels.list;
							}else{
								this.loading = false
								this.total = 0;
								this.allChannelList = [];
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			cancelEdit(){
				this.CdialogFormVisible = false;
				this.code = '0';
				this.ChannelForm = {
					id:'',
					url:'',
					rate:'',
					code:''
				}
				this.getAllChannelList()
			},
			filterTime(row, column){
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			}
		},
		mounted(){
			this.getAllChannelList();
		}
	}
</script>

<style lang="scss" scoped>
	.dangersRow {
		background: #ff5656 !important;
		color: #fff;
	}
	
	.popInputWidth {
		width:60%;
		display: block;
		margin-left: 125px;
	}
</style>