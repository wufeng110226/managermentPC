<template>
	<section v-loading="loading">
		<el-table :data="mchList" ref="multipleTable" border style="width: 100%">
			<el-table-column prop="mchId" label="商户ID" width="100"></el-table-column>
			<el-table-column prop="mchName" label="商户名"></el-table-column>
			<el-table-column prop="userName" label="登录名"></el-table-column>
			<el-table-column prop="channelRole" label="支付渠道"></el-table-column>
			<el-table-column prop="settlementAccount" label="结算账户"></el-table-column>
			<el-table-column prop="rate" label="费率%"></el-table-column>
		</el-table>
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" :page-size="pageSize" :total="total" @current-change="getmchList" style="float:right;"></el-pagination>
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
				pageSize:10,
				mchList:[],               //商户列表
			}
		},
		methods: {
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
								/*this.mchList = response.body.result.mchInfosList.list;*/
								let _channelRole;
								let _mchList = response.body.result.mchInfosList.list;
								for(let i=0;i<_mchList.length;i++){
									if(_mchList[i].channelRole !== ''){
										_mchList[i].channelRole = JSON.parse(_mchList[i].channelRole).join(',');
									}
								}
								this.mchList = _mchList;
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
			filterTime(row, column){  //筛选时间转换成YYYY-MM-DD
				return new Date(parseInt(row[column.property]) + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
			}
		},
		mounted(){  //页面加载默认执行获取商户列表
			this.getmchList()
		}
	}
</script>