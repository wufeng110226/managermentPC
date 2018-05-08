<template>
	<div class="loginMain" :style="{height:fullHeight + 'px'}">
		<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
		    <h3 class="title">系统登录</h3>
		    <el-form-item prop="userName">
		    	<el-input type="text" v-model="ruleForm.userName" auto-complete="off" placeholder="请输入账号"></el-input>
		    </el-form-item>
		    <el-form-item prop="password">
		    	<el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="请输入密码" @keyup.enter.native="toLogin"></el-input>
		    </el-form-item>
		    <el-form-item style="width:100%;">
		    	<el-button type="primary" style="width:100%;" @click="toLogin" :loading="logining">登录</el-button>
		    </el-form-item>
		</el-form>
  	</div>
</template>

<script>
import router from '@/router'
import store from '@/vuex/store'
import {httpUrl} from '@/api'
export default {
	name:'Login',
	data(){
		return {
			fullHeight: document.documentElement.clientHeight,
	        logining: false,
	        ruleForm: {
	          userName: '',
	          password: ''
	        },
	        rules: {
	          userName: [{required: true, message: '请输入账号', trigger: 'blur'}],
	          password: [{required: true, message: '请输入密码', trigger: 'blur'}]
	        },
	        checked: true
      	};
	},
	methods:{
        //登录按钮触发
		toLogin(){
			this.$refs.ruleForm.validate((valid) => {
				if(valid){
					//对接登录接口
					this.logining = true;
					this.$http.post(httpUrl.login,this.ruleForm)
						.then(
							response => {
								if(response.body.code == '200'){
									//设置权限和用户表储存在本地
									let userParams = {
										'name':response.body.result.userName,
										'mchId':response.body.result.mchId,
										'uid':response.body.result.uid,
										'identity':response.body.result.identity,
										'viewMchList':response.body.result.viewMchList
									}
									sessionStorage.setItem('user',JSON.stringify(userParams));
									store.commit('SET_IDENTITY',response.body.result.identity);
									let _routers = store.state.identity
									store.dispatch('GenerateRoutes',router.options[_routers]).then(() => { // 生成可访问的路由表
										router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
									}).catch(errors => {
										console.log(errors);
									})
									this.logining = false;
									this.$router.push('/index');
								}else{
									this.logining = false;
									this.$message.error(response.body.result);
								}
							},
							response => {
								this.logining = false;
								this.$message.error('服务器连接失败，请稍后重试！');
							}
						)
				}
			})
		}
	}
}
</script>

<style lang="scss">
	.loginMain {
		position: absolute;
		top:0;
		width:100%;
		background-repeat: no-repeat;
		background:url('../assets/indexBG.jpg') no-repeat;
		background-size:100% 100%;
		.login-container {
		    -webkit-border-radius: 10px;
		    border-radius: 10px;
		    -moz-border-radius: 10px;
		    background-clip: padding-box;
		    margin: 280px auto;
		    width: 350px;
		    padding: 25px 35px 15px 35px;
		    background: rgba(255,255,255,0.3);
		    border: 1px solid #eaeaea;
		    box-shadow: 0 0 25px #cac6c6;
		    .title {
		      margin: 0px auto 40px auto;
		      text-align: center;
		      color: #fff;
		    }
		    .remember {
		      margin: 0px 0px 35px 0px;
		    }
			.el-input {
		    	color:#fff;
		    	input.el-input__inner {
		    		background: rgba(0,0,0,0.35);
		    		color:#fff;
		    		border-radius:8px;
		    	}
		    	input::-webkit-input-placeholder {
		    		color:#fff;
		    	}
		    	input::-moz-placeholder {
		    		color:#fff;
		    	}
		    }
		    .el-button {
		    	border-radius:8px;
		    }
		}
	}
</style>