<template>
	<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="ruleForm" v-loading="loading">
		
		<el-form-item prop="mchId" label="商户ID">
			{{ruleForm.mchId}}
		</el-form-item>
		
		<el-form-item prop="mchKey" label="商户Key">
			{{ruleForm.mchKey}}
		</el-form-item>
		
		<el-form-item prop="updateTime" label="更新时间">
			{{ruleForm.updateTime | filter}}
		</el-form-item>
		
		<el-form-item prop="createTime" label="创建时间">
			{{ruleForm.createTime | filter}}
		</el-form-item>
		
		<el-form-item prop="mchName" label="商户名称">
			{{ruleForm.mchName}}
		</el-form-item>
		
		<el-form-item prop="rate" label="费率">
			{{ruleForm.rate}}
		</el-form-item>
		
		<el-form-item v-if="checkOne.bank" label="开户行">
			<el-input style="width:250px" v-model="ruleForm.settlementInfo.bank" class="popInputWidth"></el-input>
		</el-form-item>
		
		<el-form-item v-else prop="settlementInfo.bank" label="开户行">
			{{ruleForm.settlementInfo.bank}}
		</el-form-item>
		
		<el-form-item v-if="checkOne.branch" label="开户支行">
			<el-input style="width:250px" v-model="ruleForm.settlementInfo.branch" class="popInputWidth"></el-input>
		</el-form-item>
		
		<el-form-item v-else prop="settlementInfo.branch" label="开户支行">
			{{ruleForm.settlementInfo.branch}}
		</el-form-item>
		
		<el-form-item prop="mchMobile" label="手机号">
			<el-input style="width:250px" v-model="ruleForm.mchMobile" class="popInputWidth"></el-input>
		</el-form-item>
		
		<el-form-item v-if="checkOne.settlementAccount" prop="settlementAccount" label="结算账户">
			<el-input style="width:250px" v-model="ruleForm.settlementAccount"></el-input>
		</el-form-item>
		
		<el-form-item v-else label="结算账户">
			{{ruleForm.settlementAccount}}
		</el-form-item>
		
		<el-form-item label="单笔限额">
			{{ruleForm.quota.single}}
		</el-form-item>
		
		<el-form-item label="日限额">
			{{ruleForm.quota.daily}}
		</el-form-item>
		
		<el-form-item label="总限额">
			{{ruleForm.quota.total}}
		</el-form-item>
		
		<el-form-item>
			<el-button type="primary" @click="submitForm('ruleForm')">确认保存</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data(){
			return {
				loading:false,
				mchId:'',
				ruleForm:{
					settlementInfo:{
						bank:'',
						branch:''
					},
					quota:{
						single:'',
						daily:'',
						total:''
					}
				},
				checkOne:{
					bank:true,
					branch:true,
					settlementAccount:true,
				},
				rules:{
					mchName:[{
						required: true,
						message: '请输入商户名称',
						trigger: 'blur'
					}],
					settlementAccount:[{
						required: true,
						message: '请输入结算账户',
						trigger: 'blur'
					}]
				}
			}
		},
		methods: {
			submitForm(formName){
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loading = true;
						const form = {};
						const arr = [];
						const _ruleForm = this.ruleForm;
						for(let i in _ruleForm){
							form[i] = _ruleForm[i]
						};
						form.updateTime = new Date().getTime();
						form.settlementInfo = JSON.stringify(form.settlementInfo);
						
						arr.push(form);
						this.$http.post(httpUrl.operaMchInfos_1,JSON.stringify(arr),{
							'headers':{
								'Content-Type':'application/json;charset=UTF-8'
							}
						})
							.then(
								response => {
									if(response.body.code == '200'){
										this.loading = false;
										this.$message.success('添加成功，即将跳转首页');
										this.$router.push('/index');
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
				})
			},
			getInfoBymchId(){
				this.loading = true;
				const form = {
					mchId:this.mchId
				}
				this.$http.post(httpUrl.getMchInfosByMchId,form)
					.then(
						response => {
							if(response.body.code == '200'){
								this.loading = false;
								let _cacheForm = response.body.result;
								_cacheForm.settlementInfo = (response.body.result.settlementInfo == '') ? {bank:'',branch:''} : JSON.parse(response.body.result.settlementInfo);
								_cacheForm.quota = JSON.parse(_cacheForm.quota);
								if(_cacheForm.settlementAccount !== ''){
									this.checkOne.settlementAccount = false;
								}
								if(_cacheForm.settlementInfo.bank !== ''){
									this.checkOne.bank = false;
								}
								if(_cacheForm.settlementInfo.branch !== ''){
									this.checkOne.branch = false;
								}
								this.ruleForm = _cacheForm;
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
		filters: {
			filter: function(value){
				if(value){
					return new Date(Number(value + 3600*1000*8)).toISOString().replace(/T(\S*)Z/,'')
				}
			}
		},
		mounted(){
			let getUserInfo = sessionStorage.getItem('user');
			if(getUserInfo){
				let _mchId = JSON.parse(getUserInfo);
				this.mchId = _mchId.mchId;
				this.getInfoBymchId();
			}
		}
	}
</script>
