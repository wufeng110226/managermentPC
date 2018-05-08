<template>
	<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="ruleForm" v-loading="loading">
		<el-form-item prop="oldPwd" label="旧密码">
			<el-input v-model="ruleForm.oldPwd" type="password"></el-input>
		</el-form-item>
		
		<el-form-item prop="newPwd" label="新密码">
			<el-input v-model="ruleForm.newPwd" type="password"></el-input>
		</el-form-item>

		<el-form-item prop="checkPass" label="确认新密码">
			<el-input v-model="ruleForm.checkPass" type="password"></el-input>
		</el-form-item>
		
		<el-form-item>
			<el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	import store from '@/vuex/store'
	import {httpUrl} from '@/api'
	export default {
		data(){
			let checkPass = (rule, value, callback) => {
				if(value === ''){
					callback(new Error('请再次输入密码'));
				}else if(value !== this.ruleForm.newPwd){
					callback(new Error('两次输入密码不一样'));
				}else{
					callback();
				}
			}
			return {
				loading:false,
				ruleForm:{
					mchId:'',
					oldPwd:'',
					newPwd:'',
					checkPass:''
				},
				rules: {
					oldPwd: [{
						required: true,
						message: '请输入旧密码',
						trigger: 'blur'
					}],
					newPwd: [{
						required: true,
						message: '请输入新密码',
						trigger: 'blur'
					}],
					checkPass: [{
						required: true,
						validator: checkPass,
						trigger: 'blur'
					}],
				}
			}
		},
		methods:{
			submitForm(formName){
				this.$refs[formName].validate((valid) => {
					if(valid){
						this.loading = true;
						let	form = {
								mchId:this.ruleForm.mchId,
								oldPwd:this.ruleForm.oldPwd,
								newPwd:this.ruleForm.newPwd
						}
						this.$http.post(httpUrl.modifyPassword,form)
							.then(
								response => {
									if(response.body.code == '200'){
										this.loading = false;
										this.$message.success('修改成功！请重新登录');
										setTimeout(() => {
											this.$router.push('/login');
											location.reload();
										},2000);
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
			}
		},
		mounted(){
			let getUserInfo = sessionStorage.getItem('user');
			if(getUserInfo){
				getUserInfo = JSON.parse(getUserInfo);
				this.ruleForm.mchId = getUserInfo.mchId;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ruleForm {
		width: 40%;
	} 
</style>