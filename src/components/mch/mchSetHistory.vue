<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
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
		<el-table :data="settlementOrderHistoryList" ref="gshTable" border style="width:100%">
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
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getSettlementOrderHistoryList" style="float:right;"></el-pagination>
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
				mchId:'',
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
				condition:'',      //打款搜索选择项
				settlementOrderHistoryList:[]
			}
		},
		methods:{
			getSettlementOrderHistoryList(val){
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
			},
			searchMchId(){
				/*初始化*/
				this.total = 0;
				this.pageIndex = 1;
				this.pageSize = 20;
				this.settlementOrderHistoryList = [];
				this.getSettlementOrderHistoryList();
			},
			priceConversion(row, column){
				let columns = column.property;
				let rows = row[columns];
				let price = this.priceConversions(rows);
				return price;
			},
			filterTime(row,column){
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			}
		},
		mounted(){
			let getUserInfo = sessionStorage.getItem('user');
			if(getUserInfo){
				let _mchId = JSON.parse(getUserInfo);
				this.mchId = _mchId.mchId;
				this.getSettlementOrderHistoryList()
			}
			
		}
	}
</script>