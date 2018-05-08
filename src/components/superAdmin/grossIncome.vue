<template>
	<section v-loading="loading">
		<!--工具条-->
		<el-row>
			<el-col :span="24" class="toolbar" style="padding-bottom:0;">
				<el-form :inline="true">
					<el-date-picker v-model="defalutDataTimeValue" type="daterange" align="left" placeholder="选择日期范围" :picker-options="pickerOptions" @change="changeDate(defalutDataTimeValue)">
	    			</el-date-picker>
					<el-form-item>
						<el-button type="primary" @click="updateValue">查询</el-button>
						<el-button type="primary" @click="getExportinfo" :loading="excelLogining">导出excel</el-button><!--暂时没加-->
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
		<!--echarts-->
		<el-row>
            <el-col :span="24">
                <div id="chartLine" style="width:100%; height:400px;"></div>
            </el-col>
        </el-row>
	</section>
</template>

<script>
	import echarts from 'echarts'
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				excelLogining:false,   //导出loading
				chouseTime:{
					startTime:'',
					endTime:''
				},
				pickerOptions:{
					disabledDate(time){
						return time.getTime() > Date.now() - 8.64e7;
					}
				},
				defalutDataTimeValue:[new Date(new Date().getTime() - 3600*1000*24*7).toISOString().replace(/T(\S*)Z/,''),new Date().toISOString().replace(/T(\S*)Z/,'')],
				chartLine: null,
				getSetOption:{  //折线图初始化数据
					title:{
						text:''
					},
					tooltip:{
						trigger:'axis'
					},
					legend:{
						data:['订单总额(元)']
					},
					grid:{
						left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
					},
					xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data:['无数据']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series:[
                    	{
	                    	name:'订单总额(元)',
	                    	type:'line',
	                    	stack:'总量',
	                    	data:['0']
                    	}
                    ]
				},
				//exportExcel:[]
			}
		},
		methods:{
			/*
			 * mounted钩子函数默认进来执行一遍updateValue方法
			 * changeDate方法改变data里的defalutDataTimeValue和chouseTime的值
			 * 初始化默认请求从今天起提前5天的数据
			 * 初始化chouseTime，保证随时不为null
			 * 普通console.log获取不到formData里的值，通过下面的循环可以拿到
			 * for (var [key, value] of form.entries()) { console.log(key, value); }
			 */
			updateValue(){
				this.loading = true;
				this.chouseTime.startTime = this.defalutDataTimeValue[0];
				this.chouseTime.endTime = this.defalutDataTimeValue[1];
				this.$http.post(httpUrl.getTotalAmountByTime,this.chouseTime)
					.then(
						response => {
							if(response.body.code == '200'){
								const _dayArr = [],_sunArr = [];
								for(let i=0;i<response.body.result.totalAmountDate.length;i++){
									_dayArr.push(response.body.result.totalAmountDate[i].days);
									_sunArr.push(response.body.result.totalAmountDate[i].sums);
								}
								this.getSetOption = {  //折线图初始化数据
									title:{
										text:'订单总额'
									},
									tooltip:{
										trigger:'axis'
									},
									legend:{
										data:['订单总额(元)']
									},
									grid:{
										left: '3%',
				                        right: '4%',
				                        bottom: '3%',
				                        containLabel: true
									},
									xAxis: {
				                        type: 'category',
				                        boundaryGap: false,
				                        data:_dayArr
				                    },
				                    yAxis: {
				                        type: 'value'
				                    },
				                    series:[
				                    	{
					                    	name:'订单总额(元)',
					                    	type:'line',
					                    	stack:'总量',
					                    	data:_sunArr
				                    	}
				                    ]
								}
								this.drawLineChart(this.getSetOption);
							}
							this.loading = false;
						},
						response => {
							this.loading = false;
							this.$message.error('服务器连接失败，请稍后重试！');
							this.drawLineChart(this.getSetOption);
						}
					)
			},
			changeDate(value){
				const sTime = value[0],eTime = value[1];
				let _sTime = new Date(sTime.getTime() + 3600*1000*8).toISOString().replace(/T(\S*)Z/,''),_eTime = new Date(eTime.getTime() + 3600*1000*8).toISOString().replace(/T(\S*)Z/,'');
				let arr = [];
				arr.push(_sTime,_eTime);
				this.defalutDataTimeValue = arr
				this.chouseTime.startTime = _sTime;
				this.chouseTime.endTime = _eTime;
			},
			drawLineChart(){
				if(this.chartLine){
					this.chartLine.dispose();
				}
				this.chartLine = echarts.init(document.getElementById('chartLine'));
				this.chartLine.setOption(this.getSetOption);
			},
			getExportinfo(){
				
			}/*,
			exportExcels() {
		　　　	require.ensure([], () => {
		　　　		const { export_json_to_excel } = require('@/vendor/ExportExcel');
		　　　　　　　　	const tHeader = []; //对应表格输出的title
		　　　　　　　　	const filterVal = []; // 对应表格输出的数据
		　　　　　　　　	const list = this.exportExcel;
		　　　　　　　　	const data = this.formatJson(filterVal, list);
					this.excelLogining = false;
		　　　　　　　　	export_json_to_excel(tHeader, data, '商户ID：'+ this.mchId + '订单报表'); //对应下载文件的名字
		　　　　　　})
		　　　},
		　　　formatJson(filterVal, jsonData) {
　　　　　　		return jsonData.map(v => filterVal.map(j => v[j]))
		　　　}*/
		},
		mounted(){
			this.updateValue()
		}
	}
</script>

<style lang="scss" scoped>
	.el-col {
        padding: 30px 20px;
    }
</style>