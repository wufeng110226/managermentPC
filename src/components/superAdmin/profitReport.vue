<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入商户ID" v-model="mchId"></el-input>
					</el-form-item>
					</br>
					<el-form-item class="toolsItem">
						<el-date-picker v-model="defalutDataTimeValue" type="datetimerange" placeholder="选择时间范围" :picker-options="pickerOptions" @change="changeDate(defalutDataTimeValue)">
    					</el-date-picker>
					</el-form-item>
					</br>
					<el-form-item class="toolsItem">
						<el-button type="primary" @click="getExportinfo" :loading="excelLogining">导出excel</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
	</section>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				excelLogining:false,   //导出按钮loading
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
				orderNo:'',
				settleCertNo:'',
				currentPage:1,
				allChannelList:[],
				defalutDataTimeValue:[],
				_isSearch:false,
				total:0,
				pageIndex:1,
				pageSize:20,
				orderList:[],
				exportExceldata:{
					exportExcel:[],         //导出list
					actpaySums:'',          //实际用户支付总金额
					settlementSums:'',      //结算总金额
					successSums:'',         //成功订单总金额
					sucShareAmountSums:'',  //获得的总利润
					sucmchEndAmountSums:'', //成功打款给下游的总金额
					mchName:''              //商户名
				}
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
					this.getOrderList();
				}
			},*/
			searchTime(){
				if(this.mchId !== ''){
					this._isSearch = true;
				}else{
					this._isSearch = false;
				}
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
									this.orderList = response.body.result.orderInfoList.list;
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
									this.orderList = response.body.result.orderInfoList.list;
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
			getAllChannelList(){  //获取支付列表
				this.loading = true;
				const form = {
					pageIndex:1,
					pageSize:50
				}
				this.$http.post(httpUrl.getAllChannel,form)
					.then(
						response => {
							if(response.body.code == '200'){
								let obj = {
								    channelName:'所有支付',
								    channelId:0
								}
								let arr = response.body.result.thirdMchChannels.list;
								arr.unshift(obj);
								this.allChannelList = arr;
							}else{
								this.$message.error(response.body.result);
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，获取支付列表失败，请刷新页面重试！');
						}
					)
			},
			filterTime(row, column){  //日期过滤器
		    	return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
		    },
		    getExportinfo(){           //获取导出excel数据
		    	if(this.mchId !== '' && (this.chouseTime.startTime !== '' && this.chouseTime.endTime !== '')){
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
			    						exportExcel[i].serviceCharge = this.priceConversions(exportExcel[i].serviceCharge);
										exportExcel[i].shareAmount =this.priceConversions(exportExcel[i].shareAmount);
										exportExcel[i].mchEndAmount =this.priceConversions(exportExcel[i].mchEndAmount);
			    					}
			    					this.exportExceldata.exportExcel = exportExcel;
			    					this.exportExceldata.sucShareAmountSums = this.priceConversions(response.body.result.sucShareAmountSums);
			    					this.exportExceldata.sucmchEndAmountSums = this.priceConversions(response.body.result.sucmchEndAmountSums);
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
		    		this.$message.error('请输入商户ID和起始时间');
		    	}
		    },
		    exportExcels() {
		　　　	require.ensure([], () => {
		　　　		const { export_json_to_excel } = require('@/vendor/ExportExcel');
					/*新加内容*/
					let excelBT = ['公司交易报表查询'],
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
					total.push('获得的总利润' 
						+ this.exportExceldata.sucShareAmountSums 
						+ '元' 
						+ ' ' 
						+ '打款给下游的：' 
						+ this.exportExceldata.sucmchEndAmountSums 
						+ '元'
					);
					/*新加内容*/
		　　　　　　　　	const tHeader = [
						'下游商户号',
						'到账类型',
						'上游订单号',
						'商户订单号',
						'消费卡号',
						'身份证号',
						'交易金额',
						'用户结算金额',
						'结算持卡人姓名',
						'订单状态',
						'状态',
						'状态信息',
						'手续费',
						'分润金额',
						'下游商户分润金额',
						'创建时间',
						'更新时间'
					]; //对应表格输出的title
		　　　　　　　　	const filterVal = [
						'mchId',
						'arriveAccountType',
						'tradeNo',
						'orderNo',
						'cardNo',
						'settleCertNo',
						'amount',
						'settleAmount',
						'settleCardHolder',
						'status',
						'success',
						'resultCodeMsg',
						'serviceCharge',
						'shareAmount',
						'mchEndAmount',
						'createTime',
						'updateTime'
					]; // 对应表格输出的数据
		　　　　　　　　	const list = this.exportExceldata.exportExcel;
		　　　　　　　　	const data = this.formatJson(filterVal, list);
					this.excelLogining = false;
		　　　　　　　　	export_json_to_excel(excelBT, mchName, dataArea, exportTime, total, tHeader, data, '商户ID：'+ this.mchId + '订单报表'); //对应下载文件的名字
		　　　　　　})
		　　　},
		　　　formatJson(filterVal, jsonData) {
　　　　　　		return jsonData.map(v => filterVal.map(j => v[j]))
		　　　}
		},
		mounted(){
			//this.getAllChannelList();
			this.getOrderList();
		}
	}
</script>

<style lang="scss" scoped>
	.toolsItem {
		margin-bottom:10px;
	}
</style>