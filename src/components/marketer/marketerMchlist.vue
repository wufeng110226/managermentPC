<template>
	<section v-loading="loading">
		<!--表格列表-->
		<el-table :data="mchInfosList" border style="width: 100%" @expand="loadingTable">
			<el-table-column type="expand">
		      <template scope="props">
		        <el-form label-position="left" inline class="table-expand">
		          	<el-form-item label="开户行">
		            	<span>{{ props.row.settlementInfo.bank }}</span>
		          	</el-form-item>
		          	<el-form-item label="开户支行">
		            	<span>{{ props.row.settlementInfo.branch }}</span>
		          	</el-form-item>
		          	<el-form-item label="单笔限额">
		            	<span>{{ props.row.quota.single }}元</span>
		         	</el-form-item>
		          	<el-form-item label="日限额">
		            	<span>{{ props.row.quota.daily }}元</span>
		          	</el-form-item>
		          	<el-form-item label="总限额">
		            	<span>{{ props.row.quota.total }}元</span>
		          	</el-form-item>
		        </el-form>
		      </template>
		    </el-table-column>
			<el-table-column prop="mchId" label="商户ID" width="180"></el-table-column>
			<el-table-column prop="mchName" label="商户名称" width="200"></el-table-column>
			<el-table-column prop="mchMobile" label="联系方式"></el-table-column>
			<el-table-column prop="rate" label="费率"></el-table-column>
			<el-table-column prop="settlementAccount" label="结算账户"></el-table-column>
			<el-table-column prop="updateTime" label="更新时间" :formatter="filterTime" sortable></el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="filterTime" sortable></el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getMchList" :current-page.sync="currentPage" style="float:right;"></el-pagination>
		</el-col>
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
				uid:'',
				mchId:'',
				currentPage:1,
				mchInfosList:[]
			}
		},
		methods: {
			loadingTable(scope){
				
			},
			getMchList(val){
				this.loading = true;
				if(val) this.pageIndex = val;
				let form = {
					uid:this.uid,
					code:2
				}
				this.$http.post(httpUrl.operaViewMchList,form)
					.then(
						response => {
							if(response.body.code == '200'){
								this.total = response.body.result.mchInfosList.total;
								let mchInfosList = response.body.result.mchInfosList.list;
								for(let i=0;i<mchInfosList.length;i++){
									mchInfosList[i].settlementInfo = (mchInfosList[i].settlementInfo == '') ? '' : JSON.parse(mchInfosList[i].settlementInfo);
									mchInfosList[i].quota = (mchInfosList[i].quota == '') ? '' : JSON.parse(mchInfosList[i].quota);
								}
								this.mchInfosList = mchInfosList;
								this.loading = false;
								if(!val) this.currentPage = 1;
							}else{
								this.loading = false;
								this.mchInfosList = [];
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			filterTime(row, column){  //日期过滤器
		    	return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
		    }
		},
		mounted(){
			let _mchId = sessionStorage.getItem('user');
			if(_mchId){
				let _getMchId = JSON.parse(_mchId);
				this.uid = _getMchId.uid;
				this.mchId = _getMchId.mchId;
				this.getMchList();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.table-expand {
	   font-size: 0;
	}
	.table-expand label {
	   width: 90px;
	   color: #99a9bf;
	}
	.table-expand .el-form-item {
	   margin-right: 0;
	   margin-bottom: 0; 
	   width: 20%;
	}
</style>