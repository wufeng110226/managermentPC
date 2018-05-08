<template>
	<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="ruleForm"  v-loading="loading">

		<el-form-item prop="userName" label="用户名">
			<el-input v-model="ruleForm.userName"></el-input>
		</el-form-item>

		<el-form-item prop="userPwd" label="密码">
			<el-input v-model="ruleForm.userPwd" type="password"></el-input>
		</el-form-item>

		<el-form-item prop="checkPass" label="确认密码">
			<el-input v-model="ruleForm.checkPass" type="password"></el-input>
		</el-form-item>

		<el-form-item prop="mchName" label="渠道名称">
			<el-input v-model="ruleForm.mchName"></el-input>
		</el-form-item>
		
		<el-form-item label="开户行">
			<el-input v-model="ruleForm.settlementInfo.bank"></el-input>
		</el-form-item>
		
		<el-form-item label="开户支行">
			<el-input v-model="ruleForm.settlementInfo.branch"></el-input>
		</el-form-item>
		
		<el-form-item prop="settlementAccount" label="结算账号">
			<el-input v-model="ruleForm.settlementAccount"></el-input>
		</el-form-item>
		
		<el-form-item prop="single" label="单笔限额">
			<el-input placeholder="输入0为不限" v-model.number="ruleForm.single"></el-input>
		</el-form-item>
		
		<el-form-item prop="daily" label="日限额">
			<el-input placeholder="输入0为不限" v-model.number="ruleForm.daily"></el-input>
		</el-form-item>
		
		<el-form-item prop="total" label="总限额">
			<el-input placeholder="输入0为不限" v-model.number="ruleForm.total"></el-input>
		</el-form-item>
		
		<el-form-item prop="rate" label="费率">
			<el-input v-model="ruleForm.rate" class="popInputWidth"></el-input>
		</el-form-item>

		<el-form-item>
			<el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	import {httpUrl} from '@/api'
	export default {
		data() {
			let checkPass = (rule, value, callback) => {
				if(value === '') {
					callback(new Error('请再次输入密码'));
				} else if(value !== this.ruleForm.userPwd) {
					callback(new Error('两次输入密码不一样'));
				} else {
					callback();
				}
			};
			return {
				loading:false,
				channelRolearr:[
					{type:'zfbwap',name:'支付宝wap'},
					{type:'zfbapp',name:'支付宝app'},
					{type:'zfbscan',name:'支付宝扫码'},
					{type:'wxapp',name:'微信app'},
					{type:'wxwap',name:'微信wap'},
					{type:'wxscan',name:'微信扫码'}
				],
				ruleForm: {
					userName: '',
					userPwd: '',
					checkPass: '',
					mchName: '',
					channelRole:[],
					settlementInfo:{
						bank:'',
						branch:''
					},
					settlementAccount: '',
					rate: 0,
					single:0,
					daily:0,
					total:0
				},
				rules: { //规则筛选
					userName: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					userPwd: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}],
					checkPass: [{
						required: true,
						validator: checkPass,
						trigger: 'blur'
					}],
					mchName: [{
						required: true,
						message: '请输入渠道名称',
						trigger: 'blur'
					}],
					single:[{
						required: true,
						message: '请输入单笔限额',
						trigger: 'blur',
						pattern: /.+/,
						type: 'number'
					}],
					daily:[{
						required: true,
						message: '请输入日限额',
						trigger: 'blur',
						pattern: /.+/,
						type: 'number'
					}],
					total:[{
						required: true,
						message: '请输入总限额',
						trigger: 'blur',
						pattern: /.+/,
						type: 'number'
					}]
				}
			}
		},
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						//整理传递数据
						let quota = {
							single:this.ruleForm.single,
							daily:this.ruleForm.daily,
							total:this.ruleForm.total
						}
						const sendData = {
							userName:this.ruleForm.userName,
							userPwd:this.ruleForm.userPwd,
							mchName:this.ruleForm.mchName,
							settlementInfo:(this.ruleForm.settlementInfo == '') ? '' : JSON.stringify(this.ruleForm.settlementInfo),
							settlementAccount:this.ruleForm.settlementAccount,
							rate:this.ruleForm.rate,
							quota:JSON.stringify(quota)
						}
						this.loading = true;
						this.$http.post(httpUrl.saveMchInfos,sendData)
							.then(
								response => {
									this.loading = false;
									if(response.body.code == '200'){
										this.$message.success('添加成功，即将跳转列表页');
										this.$router.push('/mchList');
									}else{
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ruleForm {
		width: 40%;
	}
</style>