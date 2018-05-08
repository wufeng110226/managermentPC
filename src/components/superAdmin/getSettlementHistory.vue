<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
					<el-form-item class="toolsItem">
						<el-input placeholder="请输入商户ID" v-model="mchId"></el-input>
					</el-form-item>
					<el-form-item class="toolsItem">
						<el-select v-model="condition" placeholder="请选择">
						    <el-option
						      v-for="item in searchOptions"
						      :key="item.value"
						      :label="item.label"
						      :value="item.value">
						    </el-option>
						</el-select>
  					</el-form-item>
					<el-form-item class="toolsItem">
						<el-button type="primary" @click="searchMchId">查询</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
		<!--表格列表-->
		<el-table :data="settlementOrderHistoryList" ref="gshTable" border style="width:100%">
			<el-table-column prop="mchId" label="商户ID" width="100"></el-table-column>
			<el-table-column prop="sumShareAmount" label="结算利润" :formatter="priceConversion"></el-table-column>
			<el-table-column prop="sumMchEndAmount" label="商户获得利润" :formatter="priceConversion"></el-table-column>
			<el-table-column prop="settlementAccount" label="结算账户"></el-table-column>
			<el-table-column prop="settlementDate" label="结算日期"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" :formatter="filterTime"></el-table-column>
			<el-table-column prop="status" label="状态">
				<template scope="scope">
			        <el-tag v-if="scope.row.status == '0'" type="warning" close-transition>未打款</el-tag>
			        <el-tag v-else-if="scope.row.status == '1'" type="success" close-transition>打款成功</el-tag>
			    </template>
			</el-table-column>
			<el-table-column label="修改" width="230">
				<template scope="scope">
					<el-button size="small" icon="edit" type="primary" @click="changeEditsFun(scope.row)">修改</el-button>
					<el-button size="small" type="primary" @click="getExportinfo(scope.row)" :loading="excelLogining"><i class="fa fa-file-excel-o fa-fw fa-lg"></i>导出excel</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getSettlementOrderHistoryList" style="float:right;"></el-pagination>
		</el-col>
		
		
		<!--修改结算状态dialog-->
		<el-dialog title="修改结算状态" :visible.sync="dialogFormVisible" size="tiny" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-select v-model="changeStateItem" placeholder="请选择">
			    <el-option
			      v-for="item in changeState"
			      :key="item.value"
			      :label="item.label"
			      :value="item.value">
			    </el-option>
			</el-select>
			<div slot="footer">
				<el-button size="small" icon="edit" type="primary" @click="setState">保存</el-button>
				<el-button size="small" icon="delete" type="gray" @click="cancel">取消</el-button>
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
				excelLogining:false,   //导出excel的loading
				mchId:'',
				total:0,
				pageIndex:1,
				pageSize:20,
				dialogFormVisible:false,  //弹窗
				changeStateItem:'',       //弹窗后选择的状态
				_cacheId:'',
				identity:'',              //权限
				searchOptions: [{  //搜索下拉菜单
					value: '',
          			label: '全部'
				},{
					value: '0',
          			label: '未打款'
				},{
					value: '1',
          			label: '已打款'
				}],
				changeState:[{     //修改结算状态下拉菜单
					value: '0',
          			label: '未打款'
				},{
					value: '1',
          			label: '打款成功'
				}],
				condition:'',      //打款搜索选择项
				_typeSign:'',      //特殊标记，针对分页请求不同的方法
				settlementOrderHistoryList:[],
				exportExceldata:{  //报表导出
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
		methods:{
			setState(){
				const forms = {
					id:this._cacheId,
					status:this.changeStateItem
				}
				this.$http.post(httpUrl.updateSettlementHistoryStatus,forms)
					.then(
						response => {
							if(response.body.code == '200'){
								this.loading = false;
								this.dialogFormVisible = false;
								this.getSettlementOrderHistoryList();
							}
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
						}
					)
			},
			cancel(){
				this.dialogFormVisible = false;
			},
			changeEditsFun(scope){
				this._cacheId = scope.id;
				this.changeStateItem = (typeof(scope.status) == 'number') ? scope.status.toString() : scope.status;
				this.dialogFormVisible = true;
			},
			searchMchId(){
				if(this.mchId !== ''){
					this._typeSign = 'searchList';
				}else{
					this._typeSign = 'allList';
				}
				/*初始化*/
				this.total = 0;
				this.pageIndex = 1;
				this.pageSize = 20;
				this.settlementOrderHistoryList = [];
				this.getSettlementOrderHistoryList();
			},
			getSettlementOrderHistoryList(val){
				/*拿所有历史结算*/
				if(this._typeSign == 'allList'){
					this.loading = true;
					if(val) this.pageIndex = val;
					const form = {
						pageIndex:this.pageIndex,
						pageSize:this.pageSize,
						condition:this.condition
					}
					this.$http.post(httpUrl.getSettlementHistory,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.total;
									this.settlementOrderHistoryList = response.body.result.list;
									this.loading = false;
								}else{
									this.$message.error(response.body.result);
									this.loading = false;
								}
							},
							response => {
								this.loading = false;
								this.$message.error('服务器连接失败，请稍后重试！');
							}
						)
				}else if(this._typeSign == 'searchList'){
				/*根据mchId拿历史结算*/
					this.loading = true;
					if(val) this.pageIndex = val;
					const form = {
						mchId:this.mchId,
						pageIndex:this.pageIndex,
						pageSize:this.pageSize,
						condition:this.condition
					}
					this.$http.post(httpUrl.getSettlementHistoryByMchId,form)
						.then(
							response => {
								if(response.body.code == '200'){
									this.total = response.body.result.settlementOrderHistoryList.total;
									this.settlementOrderHistoryList = response.body.result.settlementOrderHistoryList.list;
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
				}
			},
			priceConversion(row, column){
				let columns = column.property;
				let rows = row[columns];
				let price = this.priceConversions(rows);
				return price;
			},
			filterTime(row,column){
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			},
			getExportinfo(scope){
				let form = {
					mchId:scope.mchId,
					startTime:new Date(parseInt(scope.createTime) + 3600*1000*8 - 3600*1000*24).toISOString().replace(/T(\S*)Z/,'') + " 00:00:00",
					endTime:new Date(parseInt(scope.createTime) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'') + " 00:00:00"
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
			    					this.exportExceldata.actpaySums = this.priceConversions(response.body.result.actpaySums);
			    					this.exportExceldata.settlementSums = this.priceConversions(response.body.result.settlementSums);
			    					this.exportExceldata.successSums = this.priceConversions(response.body.result.successSums);
			    					this.exportExceldata.sucShareAmountSums = this.priceConversions(response.body.result.sucShareAmountSums);
			    					this.exportExceldata.sucmchEndAmountSums = this.priceConversions(response.body.result.sucmchEndAmountSums);
			    					this.exportExceldata.mchName = (response.body.result.list.length > 0) ? response.body.result.list[0].mchName : '';
			    					this.exportExcels(form);
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
			},
			exportExcels(form) {
		　　　	require.ensure([], () => {
		　　　		const { export_json_to_excel } = require('@/vendor/ExportExcel');
					/*新加内容*/
					let excelBT = ['交易报表查询'],
						mchName = [],
						dataArea = [],
						exportTime = [],
						total = [];
					mchName.push('商户ID：' 
						+ form.mchId
					);
					dataArea.push('报表时间范围：' 
						+ form.startTime 
						+ ' - ' 
						+ form.endTime
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
						+ ' '
						+ '获得的总利润：'
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
		　　　　　　　　	export_json_to_excel(excelBT, mchName, dataArea, exportTime, total, tHeader, data, '商户编号：'+ form.mchId + '订单报表'); //对应下载文件的名字
		　　　　　　})
		　　　},
		　　　formatJson(filterVal, jsonData) {
　　　　　　		return jsonData.map(v => filterVal.map(j => v[j]))
		　　　}
		},
		mounted(){
			let getSH = sessionStorage.getItem('user');
			if (getSH) {
				getSH = JSON.parse(getSH);
				this.identity = getSH.identity;
			}
			this._typeSign = 'allList';
			this.getSettlementOrderHistoryList();
		}
	}
</script>

<style lang="scss" scoped>
	.toolsItem {
		margin-bottom:10px;
	}
</style>