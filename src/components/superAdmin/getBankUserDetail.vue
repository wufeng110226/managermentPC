<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入下游商户号" v-model="mchId"></el-input>
					</el-form-item>
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入银行卡号" v-model="cardNo"></el-input>
					</el-form-item>
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入身份证号" v-model="settleCertNo"></el-input>
					</el-form-item>
					<el-form-item class="toolsItem">
						<el-date-picker v-model="defalutDataTimeValue" type="datetimerange" placeholder="选择时间范围" :picker-options="pickerOptions" @change="changeDate(defalutDataTimeValue)">
    					</el-date-picker>
					</el-form-item>
					<el-form-item class="toolsItem">
						<el-button type="primary" @click="searchTime">查询</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
		<!--表格列表-->
		<el-table :data="getBankUserList" border style="width: 100%">
		   	<el-table-column prop="mchId" label="下游商户号"></el-table-column>
			<el-table-column prop="settleCardHolder" label="用户姓名"></el-table-column>
			<el-table-column prop="cardNo" label="银行卡号"></el-table-column>
			<el-table-column prop="settleCardNo" label="结算银行卡号"></el-table-column>
			<el-table-column prop="mobile" label="手机号"></el-table-column>
			<el-table-column prop="settleCertNo" label="身份证号"></el-table-column>
			<el-table-column prop="createTime" label="创建时间"></el-table-column>
			<el-table-column prop="updateTime" label="更新时间"></el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getBankUserDetail" :current-page.sync="currentPage" style="float:right;"></el-pagination>
		</el-col>
	</section>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				chouseTime:{
					startTime:'',
					endTime:''
				},
				chouseChannel:0,
				pickerOptions:{
					disabledDate(time){
						return time.getTime() > Date.now();
					}
				},
				mchId:'',
				cardNo:'',
				settleCertNo:'',
				currentPage:1,
				defalutDataTimeValue:[],
				_isSearch:false,
				total:0,
				pageIndex:1,
				pageSize:20,
				getBankUserList:[]
			}
		},
		methods: {
			/*resetList(){
				this.chouseTime = {
					startTime:'',
					endTime:''
				}
				this._isSearch = false;
				if(this.pageIndex !== 1){
					this.total = 0;
				}else{
					this.getBankUserDetail();
				}
			},*/
			searchTime(){
				if(this.mchId == '' && this.cardNo == '' && this.settleCertNo == '' && this.chouseTime.startTime == '' && this.chouseTime.endTime == ''){
					this._isSearch = false;
				}else{
					this._isSearch = true;
				}
				this.pageIndex = 1;
				this.pageSize = 20;
				this.getBankUserDetail();
			},
			changeDate(value){
				if(value[0] == null && value[1] == null){
					this.chouseTime = {
						startTime:'',
						endTime:''
					}
				}else{
					const sTime = new Date(value[0]),eTime = new Date(value[1]);
					let _sTime = sTime.getFullYear() 
						+ '-' 
						+ this.appendZero(sTime.getMonth() + 1) 
						+ '-' 
						+ this.appendZero(sTime.getDate()) 
						+ ' ' 
						+ this.appendZero(sTime.getHours()) 
						+ ':' 
						+ this.appendZero(sTime.getMinutes()) 
						+ ':' 
						+ this.appendZero(sTime.getSeconds()),
						_eTime = eTime.getFullYear() 
						+ '-' 
						+ this.appendZero(eTime.getMonth() + 1) 
						+ '-' 
						+ this.appendZero(eTime.getDate()) 
						+ ' ' 
						+ this.appendZero(eTime.getHours()) 
						+ ':' 
						+ this.appendZero(eTime.getMinutes()) 
						+ ':' 
						+ this.appendZero(eTime.getSeconds());
					this.chouseTime = {
						startTime:_sTime,
						endTime:_eTime
					}
				}
				
			},
			getBankUserDetail(val){
				this.loading = true;
				if(this._isSearch){
				/*搜索请求开始*/
					if(val) this.pageIndex = val;
					let form = {
						pageIndex:this.pageIndex,
						pageSize:this.pageSize,
						mchId:this.mchId,
						startTime:this.chouseTime.startTime,
						endTime:this.chouseTime.endTime,
						cardNo:this.cardNo,
						settleCertNo:this.settleCertNo
					}
					this.$http.post(httpUrl.getBankUserDetail,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.orderInfoList.total;
									this.getBankUserList = response.body.result.orderInfoList.list;
									this.loading = false;
									if(!val) this.currentPage = 1;
								}else{
									this.loading = false;
									this.total = 0;
									this.orderList = [];
									this.$message.error(response.body.result);
								}
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
							}
						)
				/*搜索请求结束*/
				}else{
				/*订单列表开始*/
					this.loading = true;
					if(val) this.pageIndex = val;
					let	form = {
						pageIndex:this.pageIndex,
						pageSize:this.pageSize
					}
					this.$http.post(httpUrl.getBankUserDetail,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.orderInfoList.total;
									this.getBankUserList = response.body.result.orderInfoList.list;
									this.loading = false;
									if(!val) this.currentPage = 1;
								}else{
									this.loading = false;
									this.total = 0;
									this.orderList = [];
									this.$message.error(response.body.result);
								}
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
							}
						)
				/*订单列表结束*/
				}
			},
			filterTime(row, column){  //日期过滤器
		    	return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
		    }
		},
		mounted(){
			this.getBankUserDetail();
		}
	}
</script>

<style lang="scss" scoped>
	.toolsItem {
		margin-bottom:10px;
	}
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