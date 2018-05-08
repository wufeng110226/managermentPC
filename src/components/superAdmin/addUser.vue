<template>
	<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="ruleForm"  v-loading="loading">

		<el-form-item prop="identity" label="用户权限">
			<el-select v-model="ruleForm.identity" placeholder="请选择用户权限">
				<el-option label="管理员" value="1"></el-option>
				<el-option label="财务" value="2"></el-option>
				<el-option label="业务" value="3"></el-option>
				<el-option label="市场" value="4"></el-option>
			</el-select>
		</el-form-item>

		<el-form-item prop="userName" label="用户名">
			<el-input v-model="ruleForm.userName"></el-input>
		</el-form-item>

		<el-form-item prop="userPwd" label="密码">
			<el-input v-model="ruleForm.userPwd" type="password"></el-input>
		</el-form-item>

		<el-form-item prop="checkPass" label="确认密码">
			<el-input v-model="ruleForm.checkPass" type="password"></el-input>
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
				ruleForm: {
					identity: '',
					userName: '',
					userPwd: '',
					checkPass: ''
				},
				rules: { //规则筛选
					identity: [{
						required: true,
						message: '请选择用户权限',
						trigger: 'blur'
					}],
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
					}]
				}
			}
		},
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						//整理传递数据
						const sendData = {
							identity:this.ruleForm.identity,
							userName:this.ruleForm.userName,
							userPwd:this.ruleForm.userPwd
						}
						this.loading = false;
						this.$http.post(httpUrl.saveRoles,sendData)
							.then(
								response => {
									this.loading = false;
									if(response.body.code == '200'){
										this.$message.success('添加成功!');
										this.$router.push('/getAlladmin');
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