<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入订单号" v-model="orderNo"></el-input>
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
						<el-button type="primary" @click="getExportinfo" :loading="excelLogining">导出excel</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
		<!--表格列表-->
		<el-table :data="orderList" border style="width: 100%">
			<el-table-column type="expand">
		      <template scope="props">
		        <el-form label-position="left" inline class="table-expand">
		          <el-form-item label="消费卡号：">
		            <span>{{ props.row.cardNo }}</span>
		          </el-form-item>
		          <el-form-item label="结算人姓名：">
		            <span>{{ props.row.settleCardHolder }}</span>
		          </el-form-item>
		          <el-form-item label="身份证号：">
		            <span>{{ props.row.settleCertNo }}</span>
		          </el-form-item>
		          <el-form-item label="到账类型：">
		            <el-tag v-if="props.row.arriveAccountType == '82'" type="success" close-transition>实时到账</el-tag>
		          </el-form-item>
		          <el-form-item label="通知商户状态：">
		            <span>{{ props.row.notifyMchResp }}</span>
		          </el-form-item>
		          <el-form-item label="订单创建时间：">
		            <span>{{ props.row.createTime }}</span>
		          </el-form-item>
		          <el-form-item label="订单更新时间：">
		            <span>{{ props.row.updateTime }}</span>
		          </el-form-item>
		        </el-form>
		      </template>
		    </el-table-column>
		   	<el-table-column prop="mchId" label="商户号"></el-table-column>
			<el-table-column prop="orderNo" label="商户订单号"></el-table-column>
			<el-table-column prop="mobile" label="消费卡手机号"></el-table-column>
			<el-table-column prop="amount" label="交易金额" :formatter="priceConversion"></el-table-column>
			<el-table-column prop="settleAmount" label="用户结算金额" :formatter="priceConversion"></el-table-column>
			<el-table-column prop="mchEndAmount" label="商户获得金额" :formatter="priceConversion"></el-table-column>
			<el-table-column prop="status" label="订单状态">
				<template scope="scope">
		        <el-tag v-if="scope.row.status == '0'" type="warning" close-transition>订单生成</el-tag>
		        <el-tag v-else-if="scope.row.status == '1'" type="success" close-transition>支付完成</el-tag>
		        <el-tag v-else-if="scope.row.status == '2'" type="danger" close-transition>支付失败</el-tag>
		      </template>
			</el-table-column>
			<el-table-column prop="success" label="下单状态"></el-table-column>
			<el-table-column prop="resultCodeMsg" label="下单返回信息"></el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getOrderList" style="float:right;"></el-pagination>
		</el-col>
	</section>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				excelLogining:false,   //导出excel的loading
				chouseTime:{
					startTime:'',
					endTime:''
				},
				pickerOptions:{
					disabledDate(time){
						return time.getTime() > Date.now();
					}
				},
				total:0,
				pageIndex:1,
				pageSize:20,
				mchId:'',
				orderNo:'',
				settleCertNo:'',
				currentPage:1,
				defalutDataTimeValue:[],
				_isSearch:false,
				orderList:[],
				exportExceldata:{
					exportExcel:[],
					actpaySums:'',
					settlementSums:'',
					successSums:'',
					mchName:''
				}
			}
		},
		methods: {
			searchTime(){
				if(this.outFlowId == '' && this.cardNo == '' && this.chouseTime.startTime == '' && this.chouseTime.endTime == ''){
					this._isSearch = false;
				}else{
					this._isSearch = true;
				}
				this.pageIndex = 1;
				this.pageSize = 20;
				this.getOrderList();
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
			getOrderList(val){
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
						orderNo:this.orderNo,
						settleCertNo:this.settleCertNo
					}
					this.$http.post(httpUrl.getBankOrderDetail,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.orderInfoList.total;
									let orderInfoList = response.body.result.orderInfoList.list
									for(let i=0;i<orderInfoList.length;i++){
										orderInfoList[i].createTime = new Date(parseInt(orderInfoList[i].createTime) + 3600*1000*8).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
										orderInfoList[i].updateTime = new Date(parseInt(orderInfoList[i].updateTime) + 3600*1000*8).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
									}
									this.orderList = orderInfoList;
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
					this.$http.post(httpUrl.getBankOrderDetail,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.orderInfoList.total;
									let orderInfoList = response.body.result.orderInfoList.list
									for(let i=0;i<orderInfoList.length;i++){
										orderInfoList[i].createTime = new Date(parseInt(orderInfoList[i].createTime) + 3600*1000*8).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
										orderInfoList[i].updateTime = new Date(parseInt(orderInfoList[i].updateTime) + 3600*1000*8).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
									}
									this.orderList = orderInfoList;
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
			priceConversion(row, column){
				let columns = column.property;
				let rows = row[columns];
				let price = this.priceConversions(rows);
				return price;
			},
			filterTime(row, column){  //日期过滤器
		    	return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
		    },
		    getExportinfo(){
		    	if(this.chouseTime.startTime !== '' && this.chouseTime.endTime !== ''){
		    		let form = {
		    			mchId:this.mchId,
		    			startTime:this.chouseTime.startTime,
		    			endTime:this.chouseTime.endTime
		    		}
		    		this.excelLogining = true;
		    		this.$http.post(httpUrl.getBankOrderExcel,form)
		    			.then(
		    				response => {
		    					if(response.body.code == '200'){
			    					let exportExcel = response.body.result.list;
			    					for(let i=0;i<exportExcel.length;i++){
			    						exportExcel[i].updateTime = new Date(parseInt(exportExcel[i].updateTime) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			    						exportExcel[i].createTime = new Date(parseInt(exportExcel[i].createTime) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			    						exportExcel[i].status = (exportExcel[i].status == '0') ? '订单生成' : (exportExcel[i].status == '1') ? '支付完成' : '支付失败'
			    						exportExcel[i].amount = this.priceConversions(exportExcel[i].amount);
			    						exportExcel[i].settleAmount = this.priceConversions(exportExcel[i].settleAmount);
										exportExcel[i].mchEndAmount =this.priceConversions(exportExcel[i].mchEndAmount);
			    					}
			    					this.exportExceldata.exportExcel = exportExcel;
			    					this.exportExceldata.actpaySums = this.priceConversions(response.body.result.actpaySums);
			    					this.exportExceldata.settlementSums = this.priceConversions(response.body.result.settlementSums);
			    					this.exportExceldata.successSums = this.priceConversions(response.body.result.successSums);
			    					this.exportExceldata.mchName = (response.body.result.list.length > 0) ? response.body.result.list[0].mchName : '';
			    					this.exportExcels();
		    					}else{
		    						this.excelLogining = false;
		    						this.$message.error(response.body.result);
		    					}
		    				},
		    				response => {
		    					this.excelLogining = false;
		    					this.$message.error('服务器连接失败，请稍后重试！');
		    				}
		    			)
		    	}else{
		    		this.$message.error('请输入起始时间,导出内容不包含交易流水号和支付卡号的搜索条件');
		    	}
		    },
		    exportExcels() {
		　　　	require.ensure([], () => {
		　　　		const { export_json_to_excel } = require('@/vendor/ExportExcel');
					/*新加内容*/
					let excelBT = ['交易报表查询'],
						mchName = [],
						dataArea = [],
						exportTime = [],
						total = [];
					mchName.push('商户名称：' 
						+ this.exportExceldata.mchName
					);
					dataArea.push('报表时间范围：' 
						+ this.chouseTime.startTime 
						+ ' - ' 
						+ this.chouseTime.endTime
					);
					exportTime.push('导出报表时间：' 
						+ new Date().getFullYear() 
						+ '-' 
						+ this.appendZero(new Date().getMonth() + 1) 
						+ '-' 
						+ this.appendZero(new Date().getDate()) 
						+ ' ' 
						+ this.appendZero(new Date().getHours()) 
						+ ':' 
						+ this.appendZero(new Date().getMinutes()) 
						+ ':' 
						+ this.appendZero(new Date().getSeconds())
					);
					total.push('交易总金额：' 
						+ this.exportExceldata.actpaySums 
						+ '元' 
						+ ' ' 
						+ '成功订单总金额：' 
						+ this.exportExceldata.successSums 
						+ '元'
						+ ' '
						+ '结算总金额：'
						+ this.exportExceldata.settlementSums
						+ '元'
					);
					/*新加内容*/
		　　　　　　　　	const tHeader = [
						'商户编号',
						'到账类型',
						'商户订单号',
						'消费卡号',
						'消费卡手机号',
						'身份证号',
						'交易金额',
						'用户结算金额',
						'结算持卡人姓名',
						'订单状态',
						'状态',
						'状态信息',
						'下游商户分润金额',
						'通知商户状态',
						'创建时间',
						'更新时间'
					]; //对应表格输出的title
		　　　　　　　　	const filterVal = [
						'mchId',
						'arriveAccountType',
						'orderNo',
						'cardNo',
						'mobile',
						'settleCertNo',
						'amount',
						'settleAmount',
						'settleCardHolder',
						'status',
						'success',
						'resultCodeMsg',
						'mchEndAmount',
						'notifyMchResp',
						'createTime',
						'updateTime'
					]; // 对应表格输出的数据
		　　　　　　　　	const list = this.exportExceldata.exportExcel;
		　　　　　　　　	const data = this.formatJson(filterVal, list);
					this.excelLogining = false;
		　　　　　　　　	export_json_to_excel(excelBT, mchName, dataArea, exportTime, total, tHeader, data, '商户编号：'+ this.mchId + '订单报表'); //对应下载文件的名字
		　　　　　　})
		　　　},
		　　　formatJson(filterVal, jsonData) {
　　　　　　		return jsonData.map(v => filterVal.map(j => v[j]))
		　　　}
		},
		mounted(){
			let _mchId = sessionStorage.getItem('user');
			if(_mchId){
				let _getMchId = JSON.parse(_mchId);
				this.mchId = _getMchId.mchId;
				this.getOrderList()
			}
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